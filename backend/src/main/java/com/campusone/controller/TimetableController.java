package com.campusone.controller;

import com.campusone.dto.TimetableEntryDTO;
import com.campusone.dto.TimetableRequest;
import com.campusone.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    @GetMapping
    public ResponseEntity<List<TimetableEntryDTO>> getAllTimetable() {
        return ResponseEntity.ok(timetableService.getAllTimetableEntries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TimetableEntryDTO> getTimetableById(@PathVariable Long id) {
        return ResponseEntity.ok(timetableService.getTimetableEntryById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<TimetableEntryDTO>> getStudentTimetable(@PathVariable Long studentId) {
        return ResponseEntity.ok(timetableService.getStudentTimetable(studentId));
    }

    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<List<TimetableEntryDTO>> getFacultyTimetable(@PathVariable Long facultyId) {
        return ResponseEntity.ok(timetableService.getFacultyTimetable(facultyId));
    }

    @PostMapping
    public ResponseEntity<TimetableEntryDTO> createTimetable(@RequestBody TimetableRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timetableService.createTimetable(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TimetableEntryDTO> updateTimetable(@PathVariable Long id, @RequestBody TimetableRequest request) {
        return ResponseEntity.ok(timetableService.updateTimetable(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTimetable(@PathVariable Long id) {
        timetableService.deleteTimetableEntry(id);
        return ResponseEntity.noContent().build();
    }
}
