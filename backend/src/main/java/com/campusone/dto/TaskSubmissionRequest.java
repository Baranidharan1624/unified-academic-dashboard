package com.campusone.dto;

import com.campusone.model.TaskSubmissionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskSubmissionRequest {

    @NotNull(message = "Task ID is required")
    private Long taskId;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    // Add status for compatibility
    private TaskSubmissionStatus status;
}
