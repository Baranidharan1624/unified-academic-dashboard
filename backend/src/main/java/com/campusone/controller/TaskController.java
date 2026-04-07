package com.campusone.controller;

import com.campusone.dto.TaskRequest;
import com.campusone.dto.TaskSubmissionRequest;
import com.campusone.model.Task;
import com.campusone.model.TaskSubmission;
import com.campusone.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody TaskRequest payload) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(payload));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Task>> getTasksByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(taskService.getTasksByCourse(courseId));
    }

    @PostMapping("/submit")
    public ResponseEntity<TaskSubmission> submitTask(@RequestBody TaskSubmissionRequest payload) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.submitTask(payload));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<TaskSubmission>> getStudentTasks(@PathVariable Long studentId) {
        return ResponseEntity.ok(taskService.getStudentSubmissions(studentId));
    }
}
