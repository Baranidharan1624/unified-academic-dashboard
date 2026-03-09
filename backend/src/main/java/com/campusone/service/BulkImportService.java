package com.campusone.service;

import com.campusone.model.Role;
import com.campusone.model.User;
import com.campusone.model.UserStatus;
import com.campusone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class BulkImportService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

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
            
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                try {
                    User user = parseRow(row, role, userType, i);
                    if (user != null) {
                        User savedUser = userRepository.save(user);
                        successfulUsers.add(savedUser);
                        
                        // Send email with credentials
                        String generatedId = userType.equalsIgnoreCase("student") 
                            ? savedUser.getStudentId() 
                            : savedUser.getEmployeeId();
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
                        getCellValue(row, 1), // Email column
                        e.getMessage()
                    ));
                }
            }
        }
        
        return new BulkImportResult(totalRecords, successfulUsers.size(), errors);
    }

    private User parseRow(Row row, Role role, String userType, int rowNumber) {
        String name = getCellValue(row, 0);
        String email = getCellValue(row, 1);
        
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
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = User.builder()
            .fullName(name.trim())
            .email(email.trim().toLowerCase())
            .password(passwordEncoder.encode(TEMP_PASSWORD))
            .role(role)
            .status(UserStatus.ACTIVE)
            .build();
        
        if (role == Role.STUDENT) {
            // Student: Name, Email, Department, Program, Semester
            String department = getCellValue(row, 2);
            String program = getCellValue(row, 3);
            String semesterStr = getCellValue(row, 4);
            
            user.setDepartment(department);
            user.setProgram(program);
            if (semesterStr != null && !semesterStr.isEmpty()) {
                try {
                    user.setSemester(Integer.parseInt(semesterStr));
                } catch (NumberFormatException e) {
                    log.warn("Invalid semester format at row {}", rowNumber);
                }
            }
            
            // Generate student ID: STU-YYYY-XXXX
            user.setStudentId(generateStudentId());
            
        } else if (role == Role.FACULTY) {
            // Faculty: Name, Email, Department, Designation
            String department = getCellValue(row, 2);
            String designation = getCellValue(row, 3);
            
            user.setDepartment(department);
            user.setDesignation(designation);
            
            // Generate employee ID: FAC-XXXX
            user.setEmployeeId(generateEmployeeId());
        }
        
        return user;
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

    private String getCellValue(Row row, int cellIndex) {
        Cell cell = row.getCell(cellIndex);
        if (cell == null) return null;
        
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getDateCellValue().toString();
                }
                double numericValue = cell.getNumericCellValue();
                if (numericValue == Math.floor(numericValue)) {
                    yield String.valueOf((int) numericValue);
                }
                yield String.valueOf(numericValue);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> null;
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

