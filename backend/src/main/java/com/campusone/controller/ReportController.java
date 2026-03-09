package com.campusone.controller;

import com.campusone.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> users() {
        return ResponseEntity.ok(reportService.usersReport());
    }

    @GetMapping("/attendance")
    public ResponseEntity<Map<String, Object>> attendance() {
        return ResponseEntity.ok(reportService.attendanceReport());
    }

    @GetMapping("/system-activity")
    public ResponseEntity<Map<String, Object>> systemActivity() {
        return ResponseEntity.ok(reportService.systemActivity());
    }
}

