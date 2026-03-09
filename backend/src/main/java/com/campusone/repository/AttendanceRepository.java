package com.campusone.repository;

import com.campusone.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudent_Id(Long studentId);
    List<Attendance> findByCourse_Id(Long courseId);
    Optional<Attendance> findByStudent_IdAndCourse_Id(Long studentId, Long courseId);

    default List<Attendance> findByStudentId(Long studentId) {
        return findByStudent_Id(studentId);
    }

    default List<Attendance> findByCourseId(Long courseId) {
        return findByCourse_Id(courseId);
    }

    default Optional<Attendance> findByStudentIdAndCourseId(Long studentId, Long courseId) {
        return findByStudent_IdAndCourse_Id(studentId, courseId);
    }
}
