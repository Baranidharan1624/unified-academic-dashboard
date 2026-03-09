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
@Table(name = "course_offerings")
public class CourseOffering {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    private User faculty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id")
    private Program program;

    private Integer capacity;
    private Integer enrolledCount;
    private Boolean isActive;

    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        if (isActive == null) isActive = true;
        if (enrolledCount == null) enrolledCount = 0;
    }

    public String getStatus() {
        return Boolean.TRUE.equals(isActive) ? "ACTIVE" : "INACTIVE";
    }

    public boolean hasCapacity() {
        if (capacity == null) return true;
        return (enrolledCount == null ? 0 : enrolledCount) < capacity;
    }

    public void incrementEnrollment() {
        this.enrolledCount = (this.enrolledCount == null ? 0 : this.enrolledCount) + 1;
    }

    public void decrementEnrollment() {
        int count = this.enrolledCount == null ? 0 : this.enrolledCount;
        this.enrolledCount = Math.max(0, count - 1);
    }
}
