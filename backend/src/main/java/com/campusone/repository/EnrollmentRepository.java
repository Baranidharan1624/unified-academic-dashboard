package com.campusone.repository;

import com.campusone.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudent_Id(Long studentId);
    List<Enrollment> findByCourseOffering_Id(Long courseOfferingId);
    Optional<Enrollment> findByStudent_IdAndCourseOffering_Id(Long studentId, Long courseOfferingId);
    boolean existsByStudent_IdAndCourseOffering_Id(Long studentId, Long courseOfferingId);

    default List<Enrollment> findByStudentId(Long studentId) {
        return findByStudent_Id(studentId);
    }

    default List<Enrollment> findByCourseOfferingId(Long courseOfferingId) {
        return findByCourseOffering_Id(courseOfferingId);
    }

    default Optional<Enrollment> findByStudentIdAndCourseOfferingId(Long studentId, Long courseOfferingId) {
        return findByStudent_IdAndCourseOffering_Id(studentId, courseOfferingId);
    }

    default boolean existsByStudentIdAndCourseOfferingId(Long studentId, Long courseOfferingId) {
        return existsByStudent_IdAndCourseOffering_Id(studentId, courseOfferingId);
    }
}
