package com.campusone.dto;

import com.campusone.model.Role;
import com.fasterxml.jackson.annotation.JsonAlias;
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

    public String getName() {
        return fullName;
    }
}
