package com.campusone.service;

import com.campusone.dto.CourseDTO;
import com.campusone.exception.ResourceNotFoundException;
import com.campusone.model.Course;
import com.campusone.model.Department;
import com.campusone.repository.CourseRepository;
import com.campusone.repository.DepartmentRepository;
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
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;

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
        // Get courses offered by faculty through course offerings
        return courseRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseDTO createCourse(CourseDTO courseDTO) {
                validateCoursePayload(courseDTO);

        Department department = departmentRepository.findById(courseDTO.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + courseDTO.getDepartmentId()));

                if (courseRepository.existsByCourseCodeIgnoreCaseAndSemester(courseDTO.getCourseCode(), courseDTO.getSemester())) {
                        throw new IllegalArgumentException("Duplicate course not allowed for this semester: " + courseDTO.getCourseCode());
        }

        Course course = Course.builder()
                .courseCode(courseDTO.getCourseCode())
                .courseName(courseDTO.getCourseName())
                .description(courseDTO.getDescription())
                .credits(courseDTO.getCredits())
                .department(department)
                                .semester(courseDTO.getSemester())
                                .academicYear(courseDTO.getAcademicYear())
                .build();

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

                if (courseRepository.findAll().stream()
                                .anyMatch(c -> !c.getId().equals(course.getId())
                                                && c.getCourseCode().equalsIgnoreCase(course.getCourseCode())
                                                && c.getSemester().equals(course.getSemester()))) {
                        throw new IllegalArgumentException("Duplicate course not allowed for this semester: " + course.getCourseCode());
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
                                        String yearRaw = readCell(row, headerMap, "year", formatter);
                                        String departmentRaw = readCell(row, headerMap, "department", formatter);
                                        String semesterRaw = readCell(row, headerMap, "semester", formatter);
                                        String code = readCell(row, headerMap, "course code", formatter);
                                        String name = readCell(row, headerMap, "course name", formatter);
                                        String creditsRaw = readCell(row, headerMap, "credits", formatter);
                                        String desc = readCell(row, headerMap, "description", formatter);

                                        if (yearRaw.isBlank() || departmentRaw.isBlank() || semesterRaw.isBlank() || code.isBlank() || name.isBlank() || creditsRaw.isBlank()) {
                                                throw new IllegalArgumentException("Year, Department, Semester, Course Code, Course Name and Credits are required");
                                        }

                                        Integer credits = Integer.parseInt(creditsRaw.trim());
                                        if (credits <= 0) {
                                                throw new IllegalArgumentException("Credits must be a positive number");
                                        }

                                        Integer semester = Integer.parseInt(semesterRaw.trim());
                                        if (semester == null || semester < 1 || semester > 8) {
                                                throw new IllegalArgumentException("Semester must be between 1 and 8");
                                        }

                                        String academicYear = normalizeAcademicYear(yearRaw.trim());
                                        Department department = resolveDepartment(departmentRaw.trim());
                                        if (department == null) {
                                                throw new IllegalArgumentException("Department not found: " + departmentRaw.trim());
                                        }

                                        String duplicateKey = code.trim().toUpperCase() + "::" + semester;
                                        if (seenInFile.contains(duplicateKey)) {
                                                throw new IllegalArgumentException("Duplicate in file: Course Code + Semester");
                                        }

                                        if (courseRepository.existsByCourseCodeIgnoreCaseAndSemester(code.trim(), semester)) {
                                                throw new IllegalArgumentException("Duplicate in system: Course Code + Semester already exists");
                                        }

                                        Course course = Course.builder()
                                                        .courseCode(code.trim().toUpperCase())
                                                        .courseName(name.trim())
                                                        .credits(credits)
                                                        .description(desc == null || desc.isBlank() ? null : desc.trim())
                                                        .department(department)
                                                        .semester(semester)
                                                        .academicYear(academicYear)
                                                        .build();

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
        }

        private Map<String, Integer> readHeaderMap(Row headerRow) {
                Map<String, Integer> map = new HashMap<>();
                if (headerRow == null) {
                        return map;
                }

                DataFormatter formatter = new DataFormatter();
                for (Cell cell : headerRow) {
                        String key = formatter.formatCellValue(cell).trim().toLowerCase();
                        if (!key.isBlank()) {
                                map.put(key, cell.getColumnIndex());
                        }
                }
                return map;
        }

        private void validateImportHeaders(Map<String, Integer> headerMap) {
                if (!headerMap.containsKey("year")
                                || !headerMap.containsKey("department")
                                || !headerMap.containsKey("semester")
                                || !headerMap.containsKey("course code")
                                || !headerMap.containsKey("course name")
                                || !headerMap.containsKey("credits")) {
                        throw new IllegalArgumentException("Excel must contain headers: Year, Department, Semester, Course Code, Course Name, Credits");
                }
        }

        private String readCell(Row row, Map<String, Integer> headerMap, String header, DataFormatter formatter) {
                Integer idx = headerMap.get(header);
                if (idx == null) {
                        return "";
                }
                Cell cell = row.getCell(idx);
                return cell == null ? "" : formatter.formatCellValue(cell).trim();
        }

        private Department resolveDepartment(String departmentRaw) {
                return departmentRepository.findByDepartmentCode(departmentRaw)
                                .or(() -> departmentRepository.findByDepartmentName(departmentRaw))
                                .orElse(null);
        }

        private String normalizeAcademicYear(String yearRaw) {
                if (yearRaw.isBlank()) {
                        throw new IllegalArgumentException("Year is required");
                }

                if (yearRaw.contains("-")) {
                        return yearRaw;
                }

                Integer startYear = Integer.parseInt(yearRaw.trim());
                return startYear + " - " + (startYear + 4);
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
