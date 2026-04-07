package com.campusone.controller;

import com.campusone.dto.CourseDTO;
import com.campusone.model.Department;
import com.campusone.service.CourseService;
import com.campusone.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/courses")
@RequiredArgsConstructor
public class AdminCourseController {

    private final CourseService courseService;
    private final DepartmentService departmentService;

    @GetMapping("/departments")
    public ResponseEntity<List<Map<String, Object>>> getDepartments() {
        List<Map<String, Object>> payload = departmentService.getAllDepartments().stream()
                .map(this::toDepartmentPayload)
                .toList();
        return ResponseEntity.ok(payload);
    }

    @GetMapping("/semesters")
    public ResponseEntity<List<Integer>> getSemesters() {
        return ResponseEntity.ok(java.util.stream.IntStream.rangeClosed(1, 8).boxed().toList());
    }

    @PostMapping
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CourseDTO payload) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.createCourse(payload));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable Long id, @RequestBody CourseDTO payload) {
        return ResponseEntity.ok(courseService.updateCourse(id, payload));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import")
    public ResponseEntity<CourseService.CourseImportResult> importCourses(
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(courseService.importCourses(file));
    }

    private Map<String, Object> toDepartmentPayload(Department department) {
        return Map.of(
                "id", department.getId(),
                "name", department.getName(),
                "code", department.getCode() == null ? "" : department.getCode()
        );
    }
}
