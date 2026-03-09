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
    @Column(nullable = false)
    private Role targetRole;

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

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum NotificationType {
        ANNOUNCEMENT,
        ASSIGNMENT,
        ATTENDANCE,
        GRADE,
        GENERAL
    }
}
