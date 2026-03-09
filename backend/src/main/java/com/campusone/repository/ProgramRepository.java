package com.campusone.repository;

import com.campusone.model.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgramRepository extends JpaRepository<Program, Long> {
    Optional<Program> findByProgramName(String programName);
    Optional<Program> findByProgramCode(String programCode);
    
    // Alias methods for compatibility
    default Optional<Program> findByCode(String code) {
        return findByProgramCode(code);
    }

    default boolean existsByCode(String code) {
        return findByProgramCode(code).isPresent();
    }
    
    List<Program> findByDepartmentId(Long departmentId);
    
    // Also support this alias
    default List<Program> findByDepartmentIdContaining(Long departmentId) {
        return findByDepartmentId(departmentId);
    }
    
    List<Program> findByProgramNameContainingIgnoreCase(String name);
    
    // Also support this alias
    default List<Program> findByNameContainingIgnoreCase(String name) {
        return findByProgramNameContainingIgnoreCase(name);
    }
}
