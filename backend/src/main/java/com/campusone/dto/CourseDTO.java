package com.campusone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDTO {
    private Long id;
    private String courseName;
    private String courseCode;
    private String description;
    private Integer credits;
    private Long departmentId;
    private String departmentName;
    private Long facultyId;
    private String facultyName;
    private Integer semester;
    private String academicYear;
    private String createdAt;
}
