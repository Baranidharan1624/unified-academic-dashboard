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
@Table(name = "semesters")
public class Semester {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String semesterName;

    @Column(nullable = false)
    private Integer semesterNumber;

    @Column(nullable = false)
    private String academicYear;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isActive;

    private LocalDateTime createdAt;

    // Alias for compatibility
    public String getName() {
        return semesterName;
    }

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = false;
        }
    }
}
