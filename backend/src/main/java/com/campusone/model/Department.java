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
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String departmentName;

    @Column(unique = true)
    private String departmentCode;

    private String description;
    private String headOfDepartment;

    private LocalDateTime createdAt;

    // Aliases for compatibility
    public String getName() {
        return departmentName;
    }

    public String getCode() {
        return departmentCode;
    }

    public void setName(String name) {
        this.departmentName = name;
    }

    public void setCode(String code) {
        this.departmentCode = code;
    }

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
