package com.campusone.service;

import com.campusone.model.Attendance;
import com.campusone.model.Notification;
import com.campusone.model.TaskSubmission;
import com.campusone.model.Timetable;
import com.campusone.repository.AttendanceRepository;
import com.campusone.repository.NotificationRepository;
import com.campusone.repository.TaskSubmissionRepository;
import com.campusone.repository.TimetableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final AttendanceRepository attendanceRepository;
    private final TimetableRepository timetableRepository;
    private final TaskSubmissionRepository taskSubmissionRepository;
    private final NotificationRepository notificationRepository;

    public Map<String, Object> getDashboard(Long studentId) {
        List<Attendance> attendance = attendanceRepository.findByStudentId(studentId);
        List<Timetable> timetable = timetableRepository.findByStudentId(studentId);
        List<TaskSubmission> tasks = taskSubmissionRepository.findByStudentId(studentId);
        List<Notification> announcements = notificationRepository.findAll().stream().limit(5).toList();

        int totalClasses = attendance.stream().mapToInt(Attendance::getTotalClasses).sum();
        int attendedClasses = attendance.stream().mapToInt(Attendance::getAttendedClasses).sum();
        double attendancePct = totalClasses == 0 ? 0 : (attendedClasses * 100.0) / totalClasses;

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("attendancePercentage", Math.round(attendancePct * 100.0) / 100.0);
        dashboard.put("upcomingClasses", timetable.stream().limit(5).toList());
        dashboard.put("recentAnnouncements", announcements);
        dashboard.put("pendingTasks", tasks.stream().filter(t -> t.getStatus().name().equals("PENDING")).toList());
        return dashboard;
    }

    public List<Attendance> getAttendance(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<Timetable> getTimetable(Long studentId) {
        return timetableRepository.findByStudentId(studentId);
    }

    public List<TaskSubmission> getTasks(Long studentId) {
        return taskSubmissionRepository.findByStudentId(studentId);
    }

    public List<Notification> getNotifications() {
        return notificationRepository.findAll();
    }
}
