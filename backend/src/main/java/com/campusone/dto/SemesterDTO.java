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
public class SemesterDTO {
    private Long id;
    private String semesterName;
    private Integer semesterNumber;
    private String academicYear;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isActive;
}
