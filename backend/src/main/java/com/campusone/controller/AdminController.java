package com.campusone.controller;

import com.campusone.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        Map<String, Object> users = reportService.usersReport();
        Map<String, Object> attendance = reportService.attendanceReport();
        Map<String, Object> activity = reportService.systemActivity();

        Map<String, Object> payload = new HashMap<>();
        payload.putAll(users);
        payload.put("overallAttendancePercentage", attendance.get("overallAttendancePercentage"));
        payload.put("totalCourses", activity.get("totalCourses"));
        payload.put("status", activity.get("status"));
        return ResponseEntity.ok(payload);
    }
}

