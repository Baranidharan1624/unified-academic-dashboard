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
@Table(name = "programs")
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String programName;

    @Column(unique = true)
    private String programCode;

    private String description;
    private Integer durationYears;
    private String degreeType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    private LocalDateTime createdAt;

    // Aliases for compatibility
    public String getName() {
        return programName;
    }

    public String getCode() {
        return programCode;
    }

    public void setName(String name) {
        this.programName = name;
    }

    public void setCode(String code) {
        this.programCode = code;
    }

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
