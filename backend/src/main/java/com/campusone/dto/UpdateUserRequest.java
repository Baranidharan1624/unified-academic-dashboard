package com.campusone.dto;

import com.campusone.model.Role;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    @JsonAlias("name")
    private String fullName;
    
    @Email(message = "Invalid email format")
    private String email;
    
    private Role role;
    private String department;
    private Integer semester;
    private String academicYear;
    private String section;
    
    @JsonAlias({"registration_number", "studentId", "registrationNumber"})
    private String registrationNumber;

    @JsonAlias({"faculty_id", "employeeId", "facultyIdentifier"})
    @JsonProperty("faculty_id")
    private String facultyId;

    @JsonAlias({"course_handling", "courseHandling", "course_codes", "courseCodes"})
    private String courseHandling;

    private Integer age;

    @JsonAlias({"mobile_number", "mobileNumber"})
    private String mobileNumber;

    private String address;

    @JsonAlias({"blood_group", "bloodGroup"})
    private String bloodGroup;

    public String getName() {
        return fullName;
    }
}
