package com.campusone.controller;

import com.campusone.dto.CreateUserRequest;
import com.campusone.dto.ResetPasswordRequest;
import com.campusone.dto.UpdateUserRequest;
import com.campusone.dto.UserResponse;
import com.campusone.model.Department;
import com.campusone.model.Role;
import com.campusone.service.DepartmentService;
import com.campusone.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;
    private final DepartmentService departmentService;

    @GetMapping("/meta")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, Object>> getManualCreateMeta() {
        List<Map<String, Object>> departments = departmentService.getAllDepartments().stream()
                .map(this::toDepartmentPayload)
                .toList();

        List<Integer> semesters = java.util.stream.IntStream.rangeClosed(1, 8).boxed().toList();

        Map<String, Object> payload = new HashMap<>();
        payload.put("departments", departments);
        payload.put("semesters", semesters);
        payload.put("roles", List.of(Role.ADMIN.name(), Role.FACULTY.name(), Role.STUDENT.name()));
        return ResponseEntity.ok(payload);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getUsers(@RequestParam(required = false) Role role) {
        if (role != null) {
            return ResponseEntity.ok(userService.getUsersByRole(role));
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> activateUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.activateUser(id));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.deactivateUser(id));
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String newPassword = payload.get("newPassword");
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .email("admin")
                .currentPassword("admin")
                .newPassword(newPassword)
                .build();
        return ResponseEntity.ok(userService.resetPassword(id, request));
    }

    @GetMapping("/check-email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> checkEmailExists(@RequestParam String email) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", userService.emailExists(email));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getUserCountByRole(@RequestParam Role role) {
        Map<String, Long> response = new HashMap<>();
        response.put("count", userService.getUserCountByRole(role));
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> toDepartmentPayload(Department department) {
        return Map.of(
                "id", department.getId(),
                "name", department.getName(),
                "code", department.getCode() == null ? "" : department.getCode()
        );
    }
}
