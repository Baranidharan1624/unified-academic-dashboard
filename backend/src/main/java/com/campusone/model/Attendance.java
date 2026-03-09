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
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private Integer totalClasses;

    @Column(nullable = false)
    private Integer attendedClasses;

    private LocalDateTime lastUpdated;

    // Alias methods for compatibility
    public Long getStudentId() {
        return student != null ? student.getId() : null;
    }

    public Long getCourseId() {
        return course != null ? course.getId() : null;
    }

    public String getStudentName() {
        return student != null ? student.getFullName() : null;
    }

    public String getCourseName() {
        return course != null ? course.getCourseName() : null;
    }

    public String getCourseCode() {
        return course != null ? course.getCourseCode() : null;
    }
}
