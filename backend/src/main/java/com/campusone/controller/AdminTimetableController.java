package com.campusone.controller;

import com.campusone.dto.RoomDTO;
import com.campusone.dto.TimetableEntryDTO;
import com.campusone.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminTimetableController {

    private final TimetableService timetableService;

    @GetMapping("/rooms")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RoomDTO>> getRooms() {
        return ResponseEntity.ok(timetableService.getAllRooms());
    }

    @GetMapping("/rooms/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomDTO> getRoom(@PathVariable Long id) {
        return ResponseEntity.ok(timetableService.getRoomById(id));
    }

    @PostMapping("/rooms")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomDTO> createRoom(@RequestBody RoomDTO payload) {
        return ResponseEntity.ok(timetableService.createRoom(payload));
    }

    @PostMapping("/rooms/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TimetableService.RoomImportResult> importRooms(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(timetableService.importRooms(file));
    }

    @DeleteMapping("/rooms/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        timetableService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/timetable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TimetableEntryDTO>> getTimetable() {
        return ResponseEntity.ok(timetableService.getAllTimetableEntries());
    }

    @GetMapping("/timetable/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TimetableEntryDTO> getTimetableById(@PathVariable Long id) {
        return ResponseEntity.ok(timetableService.getTimetableEntryById(id));
    }

    @PostMapping("/timetable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TimetableEntryDTO> createTimetable(@RequestBody TimetableEntryDTO payload) {
        return ResponseEntity.ok(timetableService.createTimetableEntry(payload));
    }

    @PutMapping("/timetable/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TimetableEntryDTO> updateTimetable(@PathVariable Long id, @RequestBody TimetableEntryDTO payload) {
        return ResponseEntity.ok(timetableService.updateTimetableEntry(id, payload));
    }

    @DeleteMapping("/timetable/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTimetable(@PathVariable Long id) {
        timetableService.deleteTimetableEntry(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/timetable/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TimetableEntryDTO>> generateTimetable() {
        return ResponseEntity.ok(timetableService.generateAutomaticTimetable());
    }
}
