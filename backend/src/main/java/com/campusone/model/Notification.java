package com.campusone.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private Role targetRole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TargetType targetType;

    @Column(name = "target_department")
    private String targetDepartment;

    @Column(name = "target_academic_year")
    private String targetAcademicYear;

    @Column(name = "target_section")
    private String targetSection;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationPriority priority;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    // Alias methods for compatibility
    public Long getCreatedById() {
        return createdBy != null ? createdBy.getId() : null;
    }

    public String getCreatedByName() {
        return createdBy != null ? createdBy.getFullName() : null;
    }

    public String getTargetRoleName() {
        return targetRole != null ? targetRole.name() : null;
    }

    public String getTargetTypeName() {
        return targetType != null ? targetType.name() : null;
    }

    public String getPriorityName() {
        return priority != null ? priority.name() : null;
    }

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        if (targetType == null) {
            targetType = TargetType.ROLE;
        }
        if (priority == null) {
            priority = NotificationPriority.MEDIUM;
        }
    }

    public enum NotificationType {
        ANNOUNCEMENT,
        ASSIGNMENT,
        ATTENDANCE,
        GRADE,
        GENERAL
    }

    public enum TargetType {
        ROLE,
        ALL
    }

    public enum NotificationPriority {
        LOW,
        MEDIUM,
        HIGH
    }
}
