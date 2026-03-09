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
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String roomNumber;

    @Column(nullable = false)
    private String building;

    private Integer capacity;
    private String roomType;
    private Boolean isAvailable;

    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        if (isAvailable == null) isAvailable = true;
    }

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
