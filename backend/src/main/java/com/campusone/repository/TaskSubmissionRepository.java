package com.campusone.repository;

import com.campusone.model.TaskSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskSubmissionRepository extends JpaRepository<TaskSubmission, Long> {
    List<TaskSubmission> findByStudent_Id(Long studentId);
    List<TaskSubmission> findByTask_Id(Long taskId);
    List<TaskSubmission> findByStudent_IdAndTask_Id(Long studentId, Long taskId);

    default List<TaskSubmission> findByStudentId(Long studentId) {
        return findByStudent_Id(studentId);
    }

    default List<TaskSubmission> findByTaskId(Long taskId) {
        return findByTask_Id(taskId);
    }

    default List<TaskSubmission> findByStudentIdAndTaskId(Long studentId, Long taskId) {
        return findByStudent_IdAndTask_Id(studentId, taskId);
    }
}
