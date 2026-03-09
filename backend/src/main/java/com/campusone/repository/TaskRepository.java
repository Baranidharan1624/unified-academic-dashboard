package com.campusone.repository;

import com.campusone.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByCourse_Id(Long courseId);
    List<Task> findByCreatedBy_Id(Long userId);

    default List<Task> findByCourseId(Long courseId) {
        return findByCourse_Id(courseId);
    }

    default List<Task> findByCreatedById(Long userId) {
        return findByCreatedBy_Id(userId);
    }
}
