package com.campusone.controller;

import com.campusone.model.CourseOffering;
import com.campusone.service.CourseOfferingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/course-offerings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCourseOfferingController {

    private final CourseOfferingService courseOfferingService;

    @GetMapping
    public ResponseEntity<List<CourseOffering>> getAll() {
        return ResponseEntity.ok(courseOfferingService.getAllCourseOfferings());
    }

    @PostMapping
    public ResponseEntity<CourseOffering> create(@RequestBody Map<String, Object> payload) {
        Long courseId = ((Number) payload.get("courseId")).longValue();
        Long facultyId = ((Number) payload.get("facultyId")).longValue();
        Long semesterId = ((Number) payload.get("semesterId")).longValue();
        Long programId = ((Number) payload.get("programId")).longValue();
        Integer capacity = payload.get("capacity") == null ? null : ((Number) payload.get("capacity")).intValue();

        return ResponseEntity.ok(courseOfferingService.createCourseOffering(
                courseId,
                facultyId,
                semesterId,
                programId,
                capacity
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        courseOfferingService.deleteCourseOffering(id);
        return ResponseEntity.noContent().build();
    }
}
