package com.campusone.repository;

import com.campusone.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByFaculty_Id(Long facultyId);
    List<Course> findByDepartment_Id(Long departmentId);
    boolean existsByCourseCodeIgnoreCaseAndSemester(String courseCode, Integer semester);

    default List<Course> findByFacultyId(Long facultyId) {
        return findByFaculty_Id(facultyId);
    }

    default List<Course> findByDepartmentId(Long departmentId) {
        return findByDepartment_Id(departmentId);
    }
}
