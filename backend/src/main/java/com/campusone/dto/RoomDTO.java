package com.campusone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomDTO {
    private Long id;

    @NotBlank(message = "Room number is required")
    @Size(max = 20, message = "Room number cannot exceed 20 characters")
    private String roomNumber;

    @NotBlank(message = "Building is required")
    @Size(max = 100, message = "Building name cannot exceed 100 characters")
    private String building;

    private Integer capacity;
    private String roomType;
    private Boolean isAvailable;
    private String createdAt;

    public String getRoomName() {
        return roomNumber;
    }

    public void setRoomName(String roomName) {
        this.roomNumber = roomName;
    }

    public Boolean getIsActive() {
        return isAvailable;
    }

    public void setIsActive(Boolean isActive) {
        this.isAvailable = isActive;
    }
}
