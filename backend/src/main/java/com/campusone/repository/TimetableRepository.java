package com.campusone.repository;

import com.campusone.model.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findByFaculty_Id(Long facultyId);
    List<Timetable> findByStudent_Id(Long studentId);
    List<Timetable> findByCourse_Id(Long courseId);
    List<Timetable> findByDayOfWeek(String dayOfWeek);

    default List<Timetable> findByFacultyId(Long facultyId) {
        return findByFaculty_Id(facultyId);
    }

    default List<Timetable> findByStudentId(Long studentId) {
        return findByStudent_Id(studentId);
    }

    default List<Timetable> findByCourseId(Long courseId) {
        return findByCourse_Id(courseId);
    }
}
