package com.campusone.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableEntryDTO {
    private Long id;
    private Long courseOfferingId;
    private String courseName;
    private String courseCode;
    private Long facultyId;
    private String facultyName;
    private Long studentId;
    private String studentName;
    private Long roomId;
    private String roomNumber;
    private String building;
    
    @NotNull(message = "Day of week is required")
    private String dayOfWeek;
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    private Integer periodNumber;
    private String department;
    private String semester;
    private String section;
    private String sessionType;
    private Boolean isActive;
    private String createdAt;

    public String getRoomName() {
        return roomNumber;
    }

    public void setRoomName(String roomName) {
        this.roomNumber = roomName;
    }
}
