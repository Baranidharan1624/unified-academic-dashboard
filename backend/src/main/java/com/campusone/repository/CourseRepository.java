package com.campusone.repository;

import com.campusone.model.Course;
import com.campusone.model.CourseType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByFaculty_Id(Long facultyId);
    List<Course> findByDepartment_Id(Long departmentId);
    boolean existsByCourseCodeIgnoreCaseAndSemesterAndDepartment_Id(String courseCode, Integer semester, Long departmentId);
    List<Course> findBySemester(Integer semester);
    List<Course> findByDepartment_DepartmentNameIgnoreCaseAndSemester(String departmentName, Integer semester);
    List<Course> findByDepartment_DepartmentCodeIgnoreCaseAndSemester(String departmentCode, Integer semester);
    List<Course> findByDepartment_DepartmentNameIgnoreCaseAndSemesterAndType(String departmentName, Integer semester, CourseType type);

    default List<Course> findByFacultyId(Long facultyId) {
        return findByFaculty_Id(facultyId);
    }

    default List<Course> findByDepartmentId(Long departmentId) {
        return findByDepartment_Id(departmentId);
    }
}
