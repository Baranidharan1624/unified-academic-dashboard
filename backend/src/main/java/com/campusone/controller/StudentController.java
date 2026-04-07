package com.campusone.controller;

import com.campusone.dto.TimetableEntryDTO;
import com.campusone.model.Attendance;
import com.campusone.model.Notification;
import com.campusone.model.Role;
import com.campusone.model.TaskSubmission;
import com.campusone.repository.AttendanceRepository;
import com.campusone.service.NotificationService;
import com.campusone.service.TaskService;
import com.campusone.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
public class StudentController {

    private final AttendanceRepository attendanceRepository;
    private final TimetableService timetableService;
    private final NotificationService notificationService;
    private final TaskService taskService;

    @GetMapping("/attendance")
    public ResponseEntity<List<Map<String, Object>>> getStudentAttendance(@RequestParam Long studentId) {
        List<Map<String, Object>> payload = attendanceRepository.findByStudentId(studentId)
                .stream()
                .map(this::toAttendancePayload)
                .collect(Collectors.toList());
        return ResponseEntity.ok(payload);
    }

    @GetMapping("/timetable")
    public ResponseEntity<List<TimetableEntryDTO>> getStudentTimetable(@RequestParam Long studentId) {
        return ResponseEntity.ok(timetableService.getStudentTimetable(studentId));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getStudentDashboard(@RequestParam Long studentId) {
        List<Attendance> attendance = attendanceRepository.findByStudentId(studentId);
        double attendancePercentage = attendance.stream()
                .filter(a -> a.getTotalClasses() != null && a.getTotalClasses() > 0)
                .mapToDouble(a -> (a.getAttendedClasses() * 100.0) / a.getTotalClasses())
                .average()
                .orElse(0.0);

        List<TimetableEntryDTO> timetable = timetableService.getStudentTimetable(studentId);
        List<Notification> announcements = notificationService.getByRole(Role.STUDENT).stream().limit(5).toList();
        List<Map<String, Object>> submissions = taskService.getStudentSubmissions(studentId)
            .stream()
            .map(this::toSubmissionPayload)
            .toList();

        Map<String, Object> payload = new HashMap<>();
        payload.put("attendancePercentage", Math.round(attendancePercentage * 100.0) / 100.0);
        payload.put("upcomingClasses", timetable);
        payload.put("recentAnnouncements", announcements);
        payload.put("pendingTasks", submissions);

        return ResponseEntity.ok(payload);
    }

    private Map<String, Object> toAttendancePayload(Attendance attendance) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", attendance.getId());
        item.put("courseId", attendance.getCourseId());
        item.put("attendedClasses", attendance.getAttendedClasses());
        item.put("totalClasses", attendance.getTotalClasses());
        return item;
    }

    private Map<String, Object> toSubmissionPayload(TaskSubmission submission) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", submission.getId());
        item.put("taskId", submission.getTaskId());
        item.put("status", submission.getStatus());
        item.put("submittedAt", submission.getSubmittedAt());
        return item;
    }
}
