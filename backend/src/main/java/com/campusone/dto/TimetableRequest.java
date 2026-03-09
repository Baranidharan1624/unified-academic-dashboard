package com.campusone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableRequest {

    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotNull(message = "Faculty ID is required")
    private Long facultyId;

    private Long studentId;

    @NotBlank(message = "Day of week is required")
    @Size(max = 20, message = "Day of week cannot exceed 20 characters")
    private String dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Room number is required")
    @Size(max = 30, message = "Room number cannot exceed 30 characters")
    private String roomNumber;

    private String academicYear;
}
