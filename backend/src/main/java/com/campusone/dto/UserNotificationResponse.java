package com.campusone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserNotificationResponse {
    private Long id;
    private Long notificationId;
    private String title;
    private String message;
    private String type;
    private String priority;
    private String targetType;
    private String targetRole;
    private String targetDepartment;
    private String targetAcademicYear;
    private String targetSection;
    private boolean isRead;
    private LocalDateTime createdAt;
}