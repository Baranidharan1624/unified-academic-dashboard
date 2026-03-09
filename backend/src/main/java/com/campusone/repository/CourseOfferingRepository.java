package com.campusone.repository;

import com.campusone.model.CourseOffering;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseOfferingRepository extends JpaRepository<CourseOffering, Long> {
    List<CourseOffering> findBySemester_Id(Long semesterId);
    List<CourseOffering> findByFaculty_Id(Long facultyId);
    List<CourseOffering> findByCourse_Id(Long courseId);
    List<CourseOffering> findByIsActiveTrue();

    default List<CourseOffering> findBySemesterId(Long semesterId) {
        return findBySemester_Id(semesterId);
    }

    default List<CourseOffering> findByFacultyId(Long facultyId) {
        return findByFaculty_Id(facultyId);
    }

    default List<CourseOffering> findByCourseId(Long courseId) {
        return findByCourse_Id(courseId);
    }

    default List<CourseOffering> findByProgramId(Long programId) {
        return findAll().stream()
                .filter(o -> o.getProgram() != null && programId.equals(o.getProgram().getId()))
                .toList();
    }

    default List<CourseOffering> findBySemesterAndProgram(Long semesterId, Long programId) {
        return findAll().stream()
                .filter(o -> o.getSemester() != null && semesterId.equals(o.getSemester().getId()))
                .filter(o -> o.getProgram() != null && programId.equals(o.getProgram().getId()))
                .toList();
    }

    default List<CourseOffering> findByCourseAndSemester(Long courseId, Long semesterId) {
        return findAll().stream()
                .filter(o -> o.getCourse() != null && courseId.equals(o.getCourse().getId()))
                .filter(o -> o.getSemester() != null && semesterId.equals(o.getSemester().getId()))
                .toList();
    }
}
