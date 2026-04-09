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
@Table(name = "courses", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"course_code", "semester", "department_id"})
})
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String courseName;

    @Column(nullable = false)
    private String courseCode;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer credits;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id")
    private User faculty;

    @Enumerated(EnumType.STRING)
    private CourseType type;

    @Column(nullable = false)
    private Integer semester;

    @Column(nullable = false)
    private String academicYear;

    private LocalDateTime createdAt;

    // Alias for compatibility
    public Long getFacultyId() {
        return faculty != null ? faculty.getId() : null;
    }

    public String getFacultyName() {
        return faculty != null ? faculty.getFullName() : null;
    }

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        if (type == null) {
            type = CourseType.THEORY;
        }
    }
}
