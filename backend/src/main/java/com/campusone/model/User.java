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
@Table(name = "accounts")
@SecondaryTables({
    @SecondaryTable(name = "students", pkJoinColumns = @PrimaryKeyJoinColumn(name = "account_id", referencedColumnName = "id")),
    @SecondaryTable(name = "faculty", pkJoinColumns = @PrimaryKeyJoinColumn(name = "account_id", referencedColumnName = "id"))
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    // Alias for fullName compatibility
    public String getName() {
        return fullName;
    }

    public void setName(String name) {
        this.fullName = name;
    }

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    @Column(name = "department")
    private String department;

    @Column(name = "semester")
    private Integer semester;

    @Column(name = "academic_year")
    private String academicYear;

    // Extended identity fields
    @Column(name = "registration_number", table = "students", unique = true)
    private String registrationNumber;

    @Column(name = "section", table = "students")
    private String section;

    @Column(name = "faculty_id", table = "faculty", unique = true)
    private String facultyIdentifier;

    // Additional fields for bulk import backward compatibility
    @Transient
    private String employeeId;

    @Transient
    private String studentId;

    private Long departmentId;
    private String program;
    @Column(name = "designation")
    private String designation;

    // Personal details
    @Column(name = "age")
    private Integer age;

    @Column(name = "mobile_number")
    private String mobileNumber;

    @Column(name = "address")
    private String address;

    @Column(name = "blood_group")
    private String bloodGroup;

    public String getFacultyId() {
        return facultyIdentifier;
    }

    public void setFacultyId(String facultyId) {
        this.facultyIdentifier = facultyId;
    }

    public String getEmployeeId() {
        return facultyIdentifier;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getStudentId() {
        return registrationNumber;
    }

    public void setStudentId(String studentId) {
        this.registrationNumber = studentId;
    }

    public void setEmployeeId(String employeeId) {
        this.facultyIdentifier = employeeId;
    }

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = UserStatus.ACTIVE;
        }
    }
}
