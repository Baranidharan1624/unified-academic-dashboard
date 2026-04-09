package com.campusone.repository;

import com.campusone.model.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {
    Optional<Semester> findBySemesterNumberAndAcademicYear(Integer semesterNumber, String academicYear);
    List<Semester> findAllBySemesterNumberAndAcademicYearOrderByIdDesc(Integer semesterNumber, String academicYear);
    List<Semester> findByAcademicYear(String academicYear);
    List<Semester> findByIsActive(Boolean isActive);
    Optional<Semester> findByIsActiveTrue();
    
    // Alias for compatibility
    default Optional<Semester> findByStatus(String status) {
        if ("ACTIVE".equalsIgnoreCase(status)) {
            return findByIsActiveTrue();
        }
        return Optional.empty();
    }
}
