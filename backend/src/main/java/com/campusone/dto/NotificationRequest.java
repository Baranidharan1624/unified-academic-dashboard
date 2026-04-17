package com.campusone.dto;

import com.campusone.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters")
    private String title;

    @NotBlank(message = "Message is required")
    @Size(min = 5, message = "Message must be at least 5 characters")
    private String message;

    private TargetType targetType = TargetType.ROLE;

    private Role targetRole;

    private String targetDepartment;

    private String targetAcademicYear;

    private String targetSection;

    private Priority priority = Priority.MEDIUM;

    private Long createdBy;

    public enum TargetType {
        ROLE,
        ALL
    }

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH
    }
}
