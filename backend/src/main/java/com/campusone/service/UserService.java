package com.campusone.service;

import com.campusone.dto.CreateUserRequest;
import com.campusone.dto.ResetPasswordRequest;
import com.campusone.dto.UpdateUserRequest;
import com.campusone.dto.UserResponse;
import com.campusone.exception.ResourceNotFoundException;
import com.campusone.model.Role;
import com.campusone.model.User;
import com.campusone.model.UserStatus;
import com.campusone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.StringJoiner;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JdbcTemplate jdbcTemplate;
    private static final String TEMP_PASSWORD = "Campus@123";

    /**
     * Create a new user
     */
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        validateCreateRequest(request);

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String plainPassword = blankToNull(request.getPassword());
        if (plainPassword == null) {
            plainPassword = TEMP_PASSWORD;
        }

        String registrationNumber = blankToNull(request.getRegistrationNumber());
        String facultyId = blankToNull(request.getFacultyId());

        if (request.getRole() == Role.STUDENT && registrationNumber == null) {
            registrationNumber = generateStudentId();
        }
        if (request.getRole() == Role.FACULTY && facultyId == null) {
            facultyId = generateFacultyId();
        }

        // Check if email already exists
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already exists: " + normalizedEmail);
        }

        if (registrationNumber != null && userRepository.existsByRegistrationNumber(registrationNumber)) {
            throw new IllegalArgumentException("Registration number already exists: " + registrationNumber);
        }

        if (facultyId != null && userRepository.existsByFacultyIdentifier(facultyId)) {
            throw new IllegalArgumentException("Faculty ID already exists: " + facultyId);
        }

        String normalizedAcademicYear = normalizeAcademicYear(request.getAcademicYear());

        // Create new user
        User user = User.builder()
                .fullName(request.getName())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(plainPassword))
                .role(request.getRole())
                .status(UserStatus.ACTIVE)
                .department(request.getDepartment())
                .semester(request.getSemester())
                .academicYear(normalizedAcademicYear)
                .section(blankToNull(request.getSection()))
                .age(request.getAge())
                .mobileNumber(request.getMobileNumber())
                .address(request.getAddress())
                .bloodGroup(request.getBloodGroup())
                .build();

        user.setRegistrationNumber(registrationNumber);
        user.setFacultyId(facultyId);

        User savedUser = userRepository.save(user);
        if (savedUser.getRole() == Role.FACULTY) {
            syncFacultyCourseHandling(savedUser.getEmployeeId(), request.getCourseHandling());
        }

        String userIdentifier = savedUser.getStudentId() != null
            ? savedUser.getStudentId()
            : savedUser.getEmployeeId() != null
                ? savedUser.getEmployeeId()
                : String.valueOf(savedUser.getId());

        emailService.sendAccountCreatedEmail(
            savedUser.getFullName(),
            savedUser.getEmail(),
            userIdentifier,
            plainPassword
        );

        return mapToResponse(savedUser);
    }

    /**
     * Get all users
     */
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get user by ID
     */
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToResponse(user);
    }

    /**
     * Get users by role
     */
    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update user
     */
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        String previousFacultyId = blankToNull(user.getEmployeeId());

        // Check if email is being changed and if it already exists
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
                throw new IllegalArgumentException("Email already exists: " + request.getEmail());
            }
            user.setEmail(request.getEmail().trim().toLowerCase());
        }

        // Update fields if provided
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment());
        }
        if (request.getSemester() != null) {
            user.setSemester(request.getSemester());
        }
        if (request.getAcademicYear() != null) {
            user.setAcademicYear(normalizeAcademicYear(request.getAcademicYear()));
        }
        if (request.getSection() != null) {
            user.setSection(blankToNull(request.getSection()));
        }
        if (request.getRegistrationNumber() != null) {
            if (!request.getRegistrationNumber().equals(user.getStudentId()) && userRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
                throw new IllegalArgumentException("Registration number already exists: " + request.getRegistrationNumber());
            }
            user.setRegistrationNumber(blankToNull(request.getRegistrationNumber()));
        }
        if (request.getFacultyId() != null) {
            if (!request.getFacultyId().equals(user.getEmployeeId()) && userRepository.existsByFacultyIdentifier(request.getFacultyId())) {
                throw new IllegalArgumentException("Faculty ID already exists: " + request.getFacultyId());
            }
            user.setFacultyId(blankToNull(request.getFacultyId()));
        }
        if (request.getAge() != null) {
            user.setAge(request.getAge());
        }
        if (request.getMobileNumber() != null) {
            user.setMobileNumber(request.getMobileNumber());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getBloodGroup() != null) {
            user.setBloodGroup(request.getBloodGroup());
        }

        User updatedUser = userRepository.save(user);
        if (updatedUser.getRole() == Role.FACULTY) {
            String currentFacultyId = blankToNull(updatedUser.getEmployeeId());
            if (previousFacultyId != null && currentFacultyId != null && !previousFacultyId.equals(currentFacultyId)) {
                jdbcTemplate.update("UPDATE faculty_courses SET faculty_id = ? WHERE faculty_id = ?", currentFacultyId, previousFacultyId);
            }
            if (request.getCourseHandling() != null) {
                syncFacultyCourseHandling(currentFacultyId, request.getCourseHandling());
            }
        }
        return mapToResponse(updatedUser);
    }

    /**
     * Activate user account
     */
    @Transactional
    public UserResponse activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setStatus(UserStatus.ACTIVE);
        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    /**
     * Deactivate user account
     */
    @Transactional
    public UserResponse deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setStatus(UserStatus.INACTIVE);
        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    /**
     * Reset user password
     */
    @Transactional
    public UserResponse resetPassword(Long id, ResetPasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    /**
     * Check if email exists
     */
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email == null ? null : email.trim().toLowerCase());
    }

    /**
     * Get user count by role
     */
    public long getUserCountByRole(Role role) {
        return userRepository.countByRole(role);
    }

    /**
     * Map User entity to UserResponse
     */
    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .department(user.getDepartment())
                .semester(user.getSemester())
                .academicYear(user.getAcademicYear())
                .section(user.getSection())
                .registrationNumber(user.getStudentId())
                .facultyId(user.getEmployeeId())
                .courseHandling(resolveFacultyCourseHandling(user))
                .designation(user.getDesignation())
                .age(user.getAge())
                .mobileNumber(user.getMobileNumber())
                .address(user.getAddress())
                .bloodGroup(user.getBloodGroup())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private void validateCreateRequest(CreateUserRequest request) {
        if (request.getRole() == null) {
            throw new IllegalArgumentException("Role is required");
        }

        if (request.getRole() == Role.STUDENT) {
            if (request.getSemester() == null) {
                throw new IllegalArgumentException("Semester is required for students");
            }
            if (blankToNull(request.getDepartment()) == null) {
                throw new IllegalArgumentException("Department is required for students");
            }
            if (blankToNull(request.getSection()) == null) {
                throw new IllegalArgumentException("Section is required for students");
            }
        }

        if (request.getRole() == Role.FACULTY) {
            if (blankToNull(request.getDepartment()) == null) {
                throw new IllegalArgumentException("Department is required for faculty");
            }
        }
    }

    private String generateStudentId() {
        String year = Year.now().toString();
        long suffix = userRepository.count() + 1;
        String candidate;
        do {
            candidate = String.format("STU-%s-%04d", year, suffix++);
        } while (userRepository.existsByRegistrationNumber(candidate));
        return candidate;
    }

    private String generateFacultyId() {
        long suffix = userRepository.count() + 1;
        String candidate;
        do {
            candidate = String.format("FAC-%04d", suffix++);
        } while (userRepository.existsByFacultyIdentifier(candidate));
        return candidate;
    }

    private String normalizeAcademicYear(String value) {
        String normalized = blankToNull(value);
        if (normalized == null) {
            return null;
        }

        String candidate = normalized.trim();
        if (candidate.matches("^\\d{4}$")) {
            int start = Integer.parseInt(candidate);
            return start + "-" + (start + 4);
        }

        if (candidate.matches("^\\d{4}-\\d{4}$")) {
            return candidate;
        }

        throw new IllegalArgumentException("Academic year must be 'YYYY' or 'YYYY-YYYY'");
    }

    private String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String resolveFacultyCourseHandling(User user) {
        if (user == null || user.getRole() != Role.FACULTY) {
            return null;
        }

        String facultyId = blankToNull(user.getEmployeeId());
        if (facultyId == null) {
            return null;
        }

        List<String> courseCodes = jdbcTemplate.query(
                "SELECT course_code FROM faculty_courses WHERE faculty_id = ? ORDER BY course_code",
                (rs, rowNum) -> rs.getString("course_code"),
                facultyId);

        if (courseCodes == null || courseCodes.isEmpty()) {
            return null;
        }

        StringJoiner joiner = new StringJoiner(", ");
        for (String courseCode : courseCodes) {
            if (courseCode != null && !courseCode.isBlank()) {
                joiner.add(courseCode.trim());
            }
        }
        String result = joiner.toString();
        return result.isBlank() ? null : result;
    }

    private void syncFacultyCourseHandling(String facultyId, String courseHandling) {
        String normalizedFacultyId = blankToNull(facultyId);
        if (normalizedFacultyId == null) {
            return;
        }

        jdbcTemplate.update("DELETE FROM faculty_courses WHERE faculty_id = ?", normalizedFacultyId);

        String normalizedCourseHandling = blankToNull(courseHandling);
        if (normalizedCourseHandling == null) {
            return;
        }

        for (String token : normalizedCourseHandling.split(",")) {
            String courseCode = blankToNull(token);
            if (courseCode == null) {
                continue;
            }
            jdbcTemplate.update(
                    "INSERT INTO faculty_courses (faculty_id, course_code) VALUES (?, ?)",
                    normalizedFacultyId,
                    courseCode.trim().toUpperCase()
            );
        }
    }
}
