package com.campusone.service;

import com.campusone.dto.CourseDTO;
import com.campusone.exception.ResourceNotFoundException;
import com.campusone.model.Course;
import com.campusone.model.CourseType;
import com.campusone.model.Department;
import com.campusone.model.Role;
import com.campusone.model.User;
import com.campusone.repository.CourseRepository;
import com.campusone.repository.DepartmentRepository;
import com.campusone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.Comparator;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;
        private final UserRepository userRepository;

    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

        public List<CourseDTO> getCoursesByDepartment(Long departmentId) {
                return courseRepository.findByDepartmentId(departmentId).stream()
                                .map(this::mapToDTO)
                                .collect(Collectors.toList());
        }

    public CourseDTO getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        return mapToDTO(course);
    }

    public List<CourseDTO> getFacultyCourses(Long facultyId) {
                return courseRepository.findByFacultyId(facultyId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseDTO createCourse(CourseDTO courseDTO) {
                validateCoursePayload(courseDTO);

        Department department = departmentRepository.findById(courseDTO.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + courseDTO.getDepartmentId()));

                if (courseRepository.existsByCourseCodeIgnoreCaseAndSemesterAndDepartment_Id(
                        courseDTO.getCourseCode(), courseDTO.getSemester(), courseDTO.getDepartmentId())) {
                        throw new IllegalArgumentException("This course code already exists for this semester in this department");
        }

        Course course = Course.builder()
                .courseCode(courseDTO.getCourseCode())
                .courseName(courseDTO.getCourseName())
                .description(courseDTO.getDescription())
                .credits(courseDTO.getCredits())
                .department(department)
                                .faculty(resolveFaculty(courseDTO.getFacultyId()))
                                .type(resolveCourseType(courseDTO.getType()))
                                .semester(courseDTO.getSemester())
                                .academicYear(courseDTO.getAcademicYear())
                .build();

        if (course.getFaculty() == null) {
                User autoFaculty = autoAssignFaculty(department, courseDTO.getSemester());
                if (autoFaculty != null) {
                        course.setFaculty(autoFaculty);
                }
        }

        Course saved = courseRepository.save(course);
        return mapToDTO(saved);
    }

    @Transactional
    public CourseDTO updateCourse(Long id, CourseDTO courseDTO) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        course.setCourseName(courseDTO.getCourseName());
        course.setDescription(courseDTO.getDescription());
        course.setCredits(courseDTO.getCredits());
                if (courseDTO.getSemester() != null) {
                        course.setSemester(courseDTO.getSemester());
                }
                if (courseDTO.getAcademicYear() != null && !courseDTO.getAcademicYear().isBlank()) {
                        course.setAcademicYear(courseDTO.getAcademicYear());
                }

        if (courseDTO.getDepartmentId() != null && !courseDTO.getDepartmentId().equals(
                course.getDepartment() != null ? course.getDepartment().getId() : null)) {
            Department department = departmentRepository.findById(courseDTO.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + courseDTO.getDepartmentId()));
            course.setDepartment(department);
        }

                if (courseDTO.getFacultyId() != null) {
                        course.setFaculty(resolveFaculty(courseDTO.getFacultyId()));
                }

                if (courseDTO.getType() != null && !courseDTO.getType().isBlank()) {
                        course.setType(resolveCourseType(courseDTO.getType()));
                }

                if (courseRepository.findAll().stream()
                                .anyMatch(c -> !c.getId().equals(course.getId())
                                                && c.getCourseCode().equalsIgnoreCase(course.getCourseCode())
                                                && c.getSemester().equals(course.getSemester())
                                                && c.getDepartment().getId().equals(course.getDepartment().getId()))) {
                        throw new IllegalArgumentException("This course code already exists for this semester in this department");
                }

        Course updated = courseRepository.save(course);
        return mapToDTO(updated);
    }

        public CourseImportResult importCourses(MultipartFile file) throws IOException {
                if (file == null || file.isEmpty()) {
                        throw new IllegalArgumentException("Excel file is required");
                }

                List<CourseImportResult.ImportError> errors = new java.util.ArrayList<>();
                int totalRows = 0;
                int successCount = 0;
                Set<String> seenInFile = new HashSet<>();

                try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
                        Sheet sheet = workbook.getSheetAt(0);
                        if (sheet == null || sheet.getPhysicalNumberOfRows() <= 1) {
                                throw new IllegalArgumentException("Excel sheet is empty or missing data rows");
                        }

                        Map<String, Integer> headerMap = readHeaderMap(sheet.getRow(0));
                        validateImportHeaders(headerMap);

                        DataFormatter formatter = new DataFormatter();
                        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                                Row row = sheet.getRow(i);
                                if (row == null) {
                                        continue;
                                }

                                totalRows++;
                                try {
                                        String yearRaw = readCell(row, headerMap, formatter,
                                                        "year");
                                        String departmentRaw = readCell(row, headerMap, formatter,
                                                        "department");
                                        String semesterRaw = readCell(row, headerMap, formatter,
                                                        "semester");
                                        String code = readCell(row, headerMap, formatter,
                                                        "coursecode", "course_code", "course code");
                                        String name = readCell(row, headerMap, formatter,
                                                        "coursename", "course_name", "course name");
                                        String creditsRaw = readCell(row, headerMap, formatter,
                                                        "credits");
                                        String typeRaw = readCell(row, headerMap, formatter,
                                                        "coursetype", "course_type", "course type");
                                        String desc = readCell(row, headerMap, formatter,
                                                        "description", "desc");

                                        if (yearRaw.isBlank() || departmentRaw.isBlank() || semesterRaw.isBlank() || code.isBlank()
                                                        || name.isBlank() || creditsRaw.isBlank() || typeRaw.isBlank()) {
                                                throw new IllegalArgumentException("Required fields: Year, Department, Semester, CourseCode, CourseName, Credits, CourseType");
                                        }

                                        Integer credits = parseImportInteger(creditsRaw, "Credits");
                                        if (credits < 0) {
                                                throw new IllegalArgumentException("Credits cannot be negative");
                                        }

                                        Integer semester = parseImportInteger(semesterRaw, "Semester");
                                        if (semester < 1 || semester > 8) {
                                                throw new IllegalArgumentException("Semester must be between 1 and 8");
                                        }

                                        String academicYear = normalizeAcademicYear(yearRaw.trim());
                                        Department department = resolveDepartment(departmentRaw.trim());
                                        if (department == null) {
                                                throw new IllegalArgumentException("Department not found: " + departmentRaw.trim());
                                        }

                                        String duplicateKey = code.trim().toUpperCase() + "::" + semester + "::" + department.getId();
                                        if (seenInFile.contains(duplicateKey)) {
                                                throw new IllegalArgumentException("Duplicate in file: Course Code + Semester + Department");
                                        }

                                        if (courseRepository.existsByCourseCodeIgnoreCaseAndSemesterAndDepartment_Id(code.trim(), semester, department.getId())) {
                                                throw new IllegalArgumentException("Duplicate in system: This course already exists for this semester in this department");
                                        }

                                        Course course = Course.builder()
                                                        .courseCode(code.trim().toUpperCase())
                                                        .courseName(name.trim())
                                                        .credits(credits)
                                                        .description(desc == null || desc.isBlank() ? null : desc.trim())
                                                        .department(department)
                                                        .type(resolveImportCourseType(typeRaw))
                                                        .semester(semester)
                                                        .academicYear(academicYear)
                                                        .build();

                                        User autoFaculty = autoAssignFaculty(department, semester);
                                        if (autoFaculty != null) {
                                                course.setFaculty(autoFaculty);
                                        }

                                        courseRepository.save(course);
                                        seenInFile.add(duplicateKey);
                                        successCount++;
                                } catch (Exception ex) {
                                        errors.add(new CourseImportResult.ImportError(i + 1, ex.getMessage()));
                                }
                        }
                }

                return new CourseImportResult(totalRows, successCount, errors);
        }

    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        courseRepository.delete(course);
    }

        @Transactional
        public Map<String, Object> autoAssignMissingFaculty() {
                List<Course> allCourses = courseRepository.findAll();
                int updated = 0;
                List<String> unresolved = new java.util.ArrayList<>();

                for (Course course : allCourses) {
                        if (course.getFaculty() != null) {
                                continue;
                        }

                        User autoFaculty = autoAssignFaculty(course.getDepartment(), course.getSemester());
                        if (autoFaculty == null) {
                                unresolved.add(course.getCourseCode());
                                continue;
                        }

                        course.setFaculty(autoFaculty);
                        courseRepository.save(course);
                        updated++;
                }

                Map<String, Object> response = new HashMap<>();
                response.put("updatedCourses", updated);
                response.put("unresolvedCount", unresolved.size());
                response.put("unresolvedCourseCodes", unresolved);
                return response;
        }

    private CourseDTO mapToDTO(Course course) {
        return CourseDTO.builder()
                .id(course.getId())
                .courseCode(course.getCourseCode())
                .courseName(course.getCourseName())
                .description(course.getDescription())
                .credits(course.getCredits())
                .departmentId(course.getDepartment() != null ? course.getDepartment().getId() : null)
                .departmentName(course.getDepartment() != null ? course.getDepartment().getName() : null)
                .departmentCode(course.getDepartment() != null ? course.getDepartment().getCode() : null)
                                .facultyId(course.getFaculty() != null ? course.getFaculty().getId() : null)
                                .facultyName(course.getFaculty() != null ? course.getFaculty().getFullName() : null)
                                .semester(course.getSemester())
                                .academicYear(course.getAcademicYear())
                .type(course.getType() != null ? course.getType().name() : CourseType.THEORY.name())
                .createdAt(course.getCreatedAt() != null ? course.getCreatedAt().toString() : null)
                .build();
    }

        private void validateCoursePayload(CourseDTO courseDTO) {
                if (courseDTO.getCourseCode() == null || courseDTO.getCourseCode().isBlank()) {
                        throw new IllegalArgumentException("Course code is required");
                }
                if (courseDTO.getCourseName() == null || courseDTO.getCourseName().isBlank()) {
                        throw new IllegalArgumentException("Course name is required");
                }
                if (courseDTO.getCredits() == null || courseDTO.getCredits() <= 0) {
                        throw new IllegalArgumentException("Credits must be a positive number");
                }
                if (courseDTO.getDepartmentId() == null) {
                        throw new IllegalArgumentException("Department is required");
                }
                if (courseDTO.getSemester() == null || courseDTO.getSemester() < 1 || courseDTO.getSemester() > 8) {
                        throw new IllegalArgumentException("Semester must be between 1 and 8");
                }
                if (courseDTO.getAcademicYear() == null || courseDTO.getAcademicYear().isBlank()) {
                        throw new IllegalArgumentException("Academic year is required");
                }

                if (courseDTO.getType() != null && !courseDTO.getType().isBlank()) {
                        resolveCourseType(courseDTO.getType());
                }
        }

        private User resolveFaculty(Long facultyId) {
                if (facultyId == null) {
                        return null;
                }
                User faculty = userRepository.findById(facultyId)
                                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + facultyId));
                if (faculty.getRole() != com.campusone.model.Role.FACULTY) {
                        throw new IllegalArgumentException("Assigned faculty_id must belong to FACULTY role");
                }
                return faculty;
        }

        private CourseType resolveCourseType(String type) {
                if (type == null || type.isBlank()) {
                        return CourseType.THEORY;
                }
                try {
                        return CourseType.valueOf(type.trim().toUpperCase());
                } catch (IllegalArgumentException ex) {
                        throw new IllegalArgumentException("Course type must be THEORY or LAB");
                }
        }

        private User autoAssignFaculty(Department department, Integer semester) {
                List<User> facultyUsers = userRepository.findByRole(Role.FACULTY);
                if (facultyUsers.isEmpty()) {
                        return null;
                }

                List<User> pool = facultyUsers.stream()
                                .filter(faculty -> matchesDepartment(faculty.getDepartment(), department))
                                .toList();
                if (pool.isEmpty()) {
                        pool = facultyUsers;
                }

                Map<Long, Long> semesterLoad = courseRepository.findAll().stream()
                                .filter(c -> c.getFaculty() != null)
                                .filter(c -> Objects.equals(c.getSemester(), semester))
                                .collect(Collectors.groupingBy(c -> c.getFaculty().getId(), Collectors.counting()));

                return pool.stream()
                                .min(Comparator
                                                .comparingLong((User faculty) -> semesterLoad.getOrDefault(faculty.getId(), 0L))
                                                .thenComparing(User::getId))
                                .orElse(null);
        }

        private boolean matchesDepartment(String facultyDepartment, Department department) {
                if (department == null) {
                        return true;
                }
                if (facultyDepartment == null || facultyDepartment.isBlank()) {
                        return false;
                }

                String facultyDept = facultyDepartment.trim().toLowerCase();
                String deptCode = department.getCode() == null ? "" : department.getCode().trim().toLowerCase();
                String deptName = department.getName() == null ? "" : department.getName().trim().toLowerCase();

                return facultyDept.equals(deptCode)
                                || facultyDept.equals(deptName)
                                || (!deptCode.isBlank() && facultyDept.contains(deptCode))
                                || (!deptName.isBlank() && facultyDept.contains(deptName));
        }

        private Map<String, Integer> readHeaderMap(Row headerRow) {
                Map<String, Integer> map = new HashMap<>();
                if (headerRow == null) {
                        return map;
                }

                DataFormatter formatter = new DataFormatter();
                for (Cell cell : headerRow) {
                        String key = normalizeHeader(formatter.formatCellValue(cell));
                        if (!key.isBlank()) {
                                map.put(key, cell.getColumnIndex());
                        }
                }
                return map;
        }

        private void validateImportHeaders(Map<String, Integer> headerMap) {
                List<String> missing = new java.util.ArrayList<>();
                if (!hasAnyHeader(headerMap, "year")) {
                        missing.add("Year");
                }
                if (!hasAnyHeader(headerMap, "department")) {
                        missing.add("Department");
                }
                if (!hasAnyHeader(headerMap, "semester")) {
                        missing.add("Semester");
                }
                if (!hasAnyHeader(headerMap, "coursecode", "course_code", "course code")) {
                        missing.add("CourseCode");
                }
                if (!hasAnyHeader(headerMap, "coursename", "course_name", "course name")) {
                        missing.add("CourseName");
                }
                if (!hasAnyHeader(headerMap, "credits")) {
                        missing.add("Credits");
                }
                if (!hasAnyHeader(headerMap, "coursetype", "course_type", "course type")) {
                        missing.add("CourseType");
                }

                if (!missing.isEmpty()) {
                        throw new IllegalArgumentException(
                                        "Invalid Excel headers. Required columns: Year, Department, Semester, CourseCode, CourseName, Credits, CourseType. Missing: "
                                                        + String.join(", ", missing));
                }
        }

        private String readCell(Row row, Map<String, Integer> headerMap, DataFormatter formatter, String... aliases) {
                for (String alias : aliases) {
                        Integer idx = headerMap.get(normalizeHeader(alias));
                        if (idx == null) {
                                continue;
                        }
                        Cell cell = row.getCell(idx);
                        if (cell == null) {
                                continue;
                        }
                        String value = formatter.formatCellValue(cell).trim();
                        if (!value.isBlank()) {
                                return value;
                        }
                }
                return "";
        }

        private boolean hasAnyHeader(Map<String, Integer> headerMap, String... aliases) {
                for (String alias : aliases) {
                        if (headerMap.containsKey(normalizeHeader(alias))) {
                                return true;
                        }
                }
                return false;
        }

        private String normalizeHeader(String value) {
                return value == null ? "" : value.trim().toLowerCase().replace("-", "_").replace(" ", "_");
        }

        private Department resolveDepartment(String departmentRaw) {
                String normalized = departmentRaw == null ? "" : departmentRaw.trim();
                String baseCode = normalized.contains("-") ? normalized.substring(0, normalized.indexOf('-')).trim() : normalized;

                if ("BIOTECH".equalsIgnoreCase(normalized) || "BIOTECHNOLOGY".equalsIgnoreCase(normalized)
                                || "BIOTECH".equalsIgnoreCase(baseCode) || "BIOTECHNOLOGY".equalsIgnoreCase(baseCode)) {
                        return departmentRepository.findByDepartmentCode("BIO")
                                        .or(() -> departmentRepository.findByDepartmentName("BIO"))
                                        .orElse(null);
                }

                return departmentRepository.findByDepartmentCode(normalized)
                                .or(() -> departmentRepository.findByDepartmentName(normalized))
                                .or(() -> departmentRepository.findByDepartmentCode(baseCode))
                                .or(() -> departmentRepository.findByDepartmentName(baseCode))
                                .orElse(null);
        }

        private String normalizeAcademicYear(String yearRaw) {
                if (yearRaw.isBlank()) {
                        throw new IllegalArgumentException("Year is required");
                }

                String trimmed = yearRaw.trim();
                if (trimmed.matches("^\\d{4}$")) {
                        int startYear = Integer.parseInt(trimmed);
                        return startYear + " - " + (startYear + 4);
                }

                if (trimmed.matches("^\\d{4}\\s*-\\s*\\d{4}$")) {
                        String[] parts = trimmed.split("-");
                        int startYear = Integer.parseInt(parts[0].trim());
                        int endYear = Integer.parseInt(parts[1].trim());
                        if (endYear <= startYear) {
                                throw new IllegalArgumentException("Year range is invalid. End year must be greater than start year");
                        }
                        return startYear + " - " + endYear;
                }

                throw new IllegalArgumentException("Year must be in YYYY or YYYY-YYYY format");
        }

        private Integer parseImportInteger(String value, String fieldName) {
                try {
                        return Integer.parseInt(value.trim());
                } catch (NumberFormatException ex) {
                        throw new IllegalArgumentException(fieldName + " must be a valid number");
                }
        }

        private CourseType resolveImportCourseType(String typeRaw) {
                if (typeRaw == null || typeRaw.isBlank()) {
                        throw new IllegalArgumentException("CourseType is required and must be THEORY or LAB");
                }

                String normalized = typeRaw.trim().toUpperCase();
                if ("THEORY".equals(normalized) || "CLASS".equals(normalized)) {
                        return CourseType.THEORY;
                }
                if ("LAB".equals(normalized)) {
                        return CourseType.LAB;
                }
                throw new IllegalArgumentException("Invalid CourseType '" + typeRaw + "'. Allowed values: THEORY, LAB");
        }

        public static class CourseImportResult {
                private final int totalRows;
                private final int successCount;
                private final List<ImportError> errors;

                public CourseImportResult(int totalRows, int successCount, List<ImportError> errors) {
                        this.totalRows = totalRows;
                        this.successCount = successCount;
                        this.errors = errors;
                }

                public int getTotalRows() {
                        return totalRows;
                }

                public int getSuccessCount() {
                        return successCount;
                }

                public int getFailureCount() {
                        return errors.size();
                }

                public List<ImportError> getErrors() {
                        return errors;
                }

                public static class ImportError {
                        private final int rowNumber;
                        private final String message;

                        public ImportError(int rowNumber, String message) {
                                this.rowNumber = rowNumber;
                                this.message = message;
                        }

                        public int getRowNumber() {
                                return rowNumber;
                        }

                        public String getMessage() {
                                return message;
                        }
                }
        }
}
