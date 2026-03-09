package com.campusone.service;

import com.campusone.dto.TaskRequest;
import com.campusone.dto.TaskSubmissionRequest;
import com.campusone.exception.ResourceNotFoundException;
import com.campusone.model.TaskSubmissionStatus;
import com.campusone.model.Task;
import com.campusone.model.TaskSubmission;
import com.campusone.model.User;
import com.campusone.model.Course;
import com.campusone.repository.CourseRepository;
import com.campusone.repository.TaskRepository;
import com.campusone.repository.TaskSubmissionRepository;
import com.campusone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskSubmissionRepository taskSubmissionRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public Task createTask(TaskRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));
        User creator = userRepository.findById(request.getCreatedBy())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getCreatedBy()));

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .course(course)
                .deadline(request.getDeadline())
                .createdBy(creator)
                .build();
        return taskRepository.save(task);
    }

    public List<Task> getTasksByCourse(Long courseId) {
        return taskRepository.findByCourseId(courseId);
    }

    public TaskSubmission submitTask(TaskSubmissionRequest request) {
        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + request.getTaskId()));
        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + request.getStudentId()));

        TaskSubmission submission = TaskSubmission.builder()
                .task(task)
                .student(student)
                .status(request.getStatus() != null ? request.getStatus() : TaskSubmissionStatus.SUBMITTED)
                .submittedAt(LocalDateTime.now())
                .build();
        return taskSubmissionRepository.save(submission);
    }

    public List<TaskSubmission> getStudentSubmissions(Long studentId) {
        return taskSubmissionRepository.findByStudentId(studentId);
    }
}
