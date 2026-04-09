package com.campusone.dto;

import com.campusone.model.Role;
import com.campusone.model.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private String department;
    private Integer semester;
    private String academicYear;
    private String section;
    private String registrationNumber;
    private String facultyId;
    private String courseHandling;
    private String designation;
    private Integer age;
    private String mobileNumber;
    private String address;
    private String bloodGroup;
    private UserStatus status;
    private LocalDateTime createdAt;

    public String getName() {
        return fullName;
    }
}
