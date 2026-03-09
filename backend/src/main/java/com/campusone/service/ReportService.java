package com.campusone.service;

import com.campusone.model.Attendance;
import com.campusone.model.Role;
import com.campusone.repository.AttendanceRepository;
import com.campusone.repository.CourseRepository;
import com.campusone.repository.TaskSubmissionRepository;
import com.campusone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final TaskSubmissionRepository taskSubmissionRepository;

    public Map<String, Object> attendanceReport() {
        List<Attendance> records = attendanceRepository.findAll();
        int totalClasses = records.stream().mapToInt(Attendance::getTotalClasses).sum();
        int attendedClasses = records.stream().mapToInt(Attendance::getAttendedClasses).sum();
        double pct = totalClasses == 0 ? 0 : (attendedClasses * 100.0) / totalClasses;

        return Map.of(
                "overallAttendancePercentage", Math.round(pct * 100.0) / 100.0,
                "records", records
        );
    }

    public Map<String, Object> usersReport() {
        return Map.of(
                "totalUsers", userRepository.count(),
                "totalStudents", userRepository.countByRole(Role.STUDENT),
                "totalFaculty", userRepository.countByRole(Role.FACULTY),
                "totalAdmins", userRepository.countByRole(Role.ADMIN)
        );
    }

    public Map<String, Object> systemActivity() {
        return Map.of(
                "totalCourses", courseRepository.count(),
                "totalTaskSubmissions", taskSubmissionRepository.count(),
                "status", "healthy"
        );
    }
}
