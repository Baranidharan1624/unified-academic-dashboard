package com.campusone.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long courseOfferingId;
    private String courseName;
    private String courseCode;
    private Integer credits;
    private String facultyName;
    private String semesterName;
    private String programName;
    private String status;
    private LocalDateTime enrolledAt;
}
