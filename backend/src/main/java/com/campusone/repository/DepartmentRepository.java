package com.campusone.repository;

import com.campusone.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByDepartmentName(String departmentName);
    Optional<Department> findByDepartmentCode(String departmentCode);
    
    // Alias methods for compatibility
    default Optional<Department> findByCode(String code) {
        return findByDepartmentCode(code);
    }

    default boolean existsByCode(String code) {
        return findByDepartmentCode(code).isPresent();
    }
    
    List<Department> findByDepartmentNameContainingIgnoreCase(String name);
    
    // Also support the name-based search with this alias
    default List<Department> findByNameContainingIgnoreCase(String name) {
        return findByDepartmentNameContainingIgnoreCase(name);
    }
}
