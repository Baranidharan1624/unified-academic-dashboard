package com.campusone.service;

import com.campusone.model.Role;
import com.campusone.model.User;
import com.campusone.model.UserStatus;
import com.campusone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.Year;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class BulkImportService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JdbcTemplate jdbcTemplate;

    private static final String TEMP_PASSWORD = "Campus@123";
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    @Transactional
    public BulkImportResult importUsers(MultipartFile file, String userType) throws IOException {
        List<BulkImportResult.ImportError> errors = new ArrayList<>();
        List<User> successfulUsers = new ArrayList<>();
        int totalRecords = 0;
        
        String fileName = file.getOriginalFilename();
        if (fileName == null || (!fileName.endsWith(".xlsx") && !fileName.endsWith(".csv"))) {
            throw new IllegalArgumentException("File must be .xlsx or .csv format");
        }

        Role role = determineRole(userType);
        
        try (InputStream is = file.getInputStream();
            Workbook workbook = new XSSFWorkbook(is)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            totalRecords = sheet.getLastRowNum(); // Excluding header
            DataFormatter formatter = new DataFormatter();
            Map<String, Integer> headerMap = readHeaderMap(sheet.getRow(0), formatter);
            
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                try {
                    User user = parseRow(row, role, i, headerMap, formatter);
                    if (user != null) {
                        User savedUser = userRepository.save(user);
                        if (savedUser.getRole() == Role.FACULTY) {
                            syncFacultyCourseHandling(savedUser.getFacultyId(), savedUser.getDesignation());
                        }
                        successfulUsers.add(savedUser);
                        
                        // Send email with credentials
                        String generatedId = userType.equalsIgnoreCase("student") 
                            ? savedUser.getRegistrationNumber() 
                            : savedUser.getFacultyId();
                        emailService.sendAccountCreatedEmail(
                            savedUser.getFullName(),
                            savedUser.getEmail(),
                            generatedId,
                            TEMP_PASSWORD
                        );
                    }
                } catch (Exception e) {
                    errors.add(new BulkImportResult.ImportError(
                        i + 1, 
                        resolveCell(row, headerMap, formatter, "email", "mail"),
                        e.getMessage()
                    ));
                }
            }
        }
        
        return new BulkImportResult(totalRecords, successfulUsers.size(), errors);
    }

    private User parseRow(Row row, Role role, int rowNumber, Map<String, Integer> headerMap, DataFormatter formatter) {
        String name = resolveCell(row, headerMap, formatter, "name", "full name", "student name", "faculty name");
        String email = resolveCell(row, headerMap, formatter, "email", "mail");
        
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Name is required");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new RuntimeException("Invalid email format");
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(email.trim().toLowerCase())) {
            throw new RuntimeException("Email already exists");
        }

        String department = resolveCell(row, headerMap, formatter, "department");
        String academicYear = normalizeAcademicYear(resolveCell(row, headerMap, formatter, "academic_year", "academic year", "academicyear", "year", "start_year", "start year"));
        String section = resolveCell(row, headerMap, formatter, "section");

        Integer semester = parseInteger(resolveCell(row, headerMap, formatter, "semester"));
        Integer age = parseInteger(resolveCell(row, headerMap, formatter, "age"));
        String mobileNumber = resolveCell(row, headerMap, formatter, "mobile_number", "mobile", "phone", "phone_number");
        String address = resolveCell(row, headerMap, formatter, "address");
        String bloodGroup = resolveCell(row, headerMap, formatter, "blood_group", "blood group", "bloodgroup");
        
        User user = User.builder()
            .fullName(name.trim())
            .email(email.trim().toLowerCase())
            .password(passwordEncoder.encode(TEMP_PASSWORD))
            .role(role)
            .status(UserStatus.ACTIVE)
            .department(department)
            .academicYear(academicYear)
            .semester(semester)
            .age(age)
            .mobileNumber(mobileNumber)
            .address(address)
            .bloodGroup(bloodGroup)
            .build();
        
        if (role == Role.STUDENT) {
            String registrationNumber = resolveCell(row, headerMap, formatter,
                    "registration_number", "registration number", "register_number", "register number", "regno", "reg_no", "reg no");

            if (registrationNumber == null || registrationNumber.isBlank()) {
                registrationNumber = generateStudentId();
            }
            if (semester == null) {
                throw new RuntimeException("Semester is required for student records");
            }
            if (department == null || department.isBlank()) {
                throw new RuntimeException("Department is required for student records");
            }
            if (section == null || section.isBlank()) {
                throw new RuntimeException("Section is required for student records");
            }
            if (userRepository.existsByRegistrationNumber(registrationNumber.trim())) {
                throw new RuntimeException("Duplicate registration_number: " + registrationNumber);
            }
            user.setRegistrationNumber(registrationNumber.trim());
            user.setSection(section.trim());
            
        } else if (role == Role.FACULTY) {
            String facultyId = resolveCell(row, headerMap, formatter,
                "faculty_id", "faculty id", "facultyid", "employee_id", "employee id", "employeeid");
            String designation = resolveCell(row, headerMap, formatter,
                    "course_handling", "course handling", "course_codes", "course codes", "courses", "designation", "subjects", "subject");

            if (facultyId == null || facultyId.isBlank()) {
                facultyId = generateEmployeeId();
            }
            if (department == null || department.isBlank()) {
                throw new RuntimeException("Department is required for faculty records");
            }
            if (userRepository.existsByFacultyIdentifier(facultyId.trim())) {
                throw new RuntimeException("Duplicate faculty_id: " + facultyId);
            }

            user.setFacultyId(facultyId.trim());
            user.setDesignation(designation);
        }
        
        return user;
    }

    private void syncFacultyCourseHandling(String facultyId, String courseHandling) {
        String normalizedFacultyId = facultyId == null ? null : facultyId.trim();
        if (normalizedFacultyId == null || normalizedFacultyId.isBlank()) {
            return;
        }

        jdbcTemplate.update("DELETE FROM faculty_courses WHERE faculty_id = ?", normalizedFacultyId);

        if (courseHandling == null || courseHandling.isBlank()) {
            return;
        }

        for (String token : courseHandling.split(",")) {
            String courseCode = token == null ? null : token.trim().toUpperCase();
            if (courseCode == null || courseCode.isBlank()) {
                continue;
            }
            jdbcTemplate.update(
                    "INSERT INTO faculty_courses (faculty_id, course_code) VALUES (?, ?)",
                    normalizedFacultyId,
                    courseCode
            );
        }
    }

    private Map<String, Integer> readHeaderMap(Row headerRow, DataFormatter formatter) {
        Map<String, Integer> headerMap = new HashMap<>();
        if (headerRow == null) {
            return headerMap;
        }

        for (Cell cell : headerRow) {
            String key = formatter.formatCellValue(cell);
            if (key != null && !key.isBlank()) {
                headerMap.put(normalizeHeader(key), cell.getColumnIndex());
            }
        }
        return headerMap;
    }

    private String resolveCell(Row row, Map<String, Integer> headerMap, DataFormatter formatter, String... aliases) {
        for (String alias : aliases) {
            Integer idx = headerMap.get(normalizeHeader(alias));
            if (idx == null) {
                continue;
            }
            Cell cell = row.getCell(idx);
            if (cell == null) {
                continue;
            }
            String value = formatter.formatCellValue(cell);
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    private String normalizeHeader(String value) {
        return value.toLowerCase(Locale.ROOT).trim().replace("-", "_").replace(" ", "_");
    }

    private Integer parseInteger(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException ex) {
            throw new RuntimeException("Invalid number value: " + value);
        }
    }

    private String normalizeAcademicYear(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.matches("^\\d{4}$")) {
            int start = Integer.parseInt(trimmed);
            return start + "-" + (start + 4);
        }
        if (trimmed.matches("^\\d{4}-\\d{4}$")) {
            return trimmed;
        }
        throw new RuntimeException("Academic year must be YYYY or YYYY-YYYY");
    }

    private String generateStudentId() {
        String year = Year.now().toString();
        long count = userRepository.count() + 1;
        return String.format("STU-%s-%04d", year, count);
    }

    private String generateEmployeeId() {
        long count = userRepository.count() + 1;
        return String.format("FAC-%04d", count);
    }

    private Role determineRole(String userType) {
        if (userType == null) {
            throw new IllegalArgumentException("User type must be specified (student or faculty)");
        }
        return switch (userType.toLowerCase()) {
            case "student" -> Role.STUDENT;
            case "faculty" -> Role.FACULTY;
            default -> throw new IllegalArgumentException("Invalid user type. Must be 'student' or 'faculty'");
        };
    }

    public static class BulkImportResult {
        private final int totalRecords;
        private final int successfulImports;
        private final List<ImportError> failedRecords;

        public BulkImportResult(int totalRecords, int successfulImports, List<ImportError> failedRecords) {
            this.totalRecords = totalRecords;
            this.successfulImports = successfulImports;
            this.failedRecords = failedRecords;
        }

        public int getTotalRecords() { return totalRecords; }
        public int getSuccessfulImports() { return successfulImports; }
        public int getFailedRecords() { return failedRecords.size(); }
        public List<ImportError> getFailedRecordsList() { return failedRecords; }

        public static class ImportError {
            private final int rowNumber;
            private final String email;
            private final String errorMessage;

            public ImportError(int rowNumber, String email, String errorMessage) {
                this.rowNumber = rowNumber;
                this.email = email;
                this.errorMessage = errorMessage;
            }

            public int getRowNumber() { return rowNumber; }
            public String getEmail() { return email; }
            public String getErrorMessage() { return errorMessage; }
        }
    }
}

