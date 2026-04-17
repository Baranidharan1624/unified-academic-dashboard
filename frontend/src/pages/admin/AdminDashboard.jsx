import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import StatsCard from "../../components/StatsCard";
import ActivityTable from "../../components/ActivityTable";
import { peekCached, getCached } from "../../services/apiClient";

const initialDashboard = peekCached("/admin/dashboard") || {};
const initialUsersReport = peekCached("/reports/users") || {};
const initialAttendanceReport = peekCached("/reports/attendance") || {};
const initialActivityReport = peekCached("/reports/system-activity") || {};

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: initialUsersReport.totalStudents ?? initialDashboard.totalStudents ?? 0,
    totalFaculty: initialUsersReport.totalFaculty ?? initialDashboard.totalFaculty ?? 0,
    totalCourses: initialActivityReport.totalCourses ?? 0,
    attendancePercentage: initialAttendanceReport.overallAttendancePercentage ?? 0,
  });

  useEffect(() => {
    if (peekCached("/admin/dashboard") && peekCached("/reports/users") && peekCached("/reports/attendance") && peekCached("/reports/system-activity")) {
      return;
    }

    async function loadStats() {
      try {
        const [dashboardRes, usersReportRes, attendanceRes, activityRes] = await Promise.all([
          getCached("/admin/dashboard"),
          getCached("/reports/users"),
          getCached("/reports/attendance"),
          getCached("/reports/system-activity"),
        ]);

        setStats({
          totalStudents: usersReportRes.totalStudents ?? dashboardRes.totalStudents ?? 0,
          totalFaculty: usersReportRes.totalFaculty ?? dashboardRes.totalFaculty ?? 0,
          totalCourses: activityRes.totalCourses ?? 0,
          attendancePercentage: attendanceRes.overallAttendancePercentage ?? 0,
        });
      } catch {
        setStats({ totalStudents: 0, totalFaculty: 0, totalCourses: 0, attendancePercentage: 0 });
      }
    }

    loadStats();
  }, []);

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="stats-container">
        <StatsCard title="Total Students" value={stats.totalStudents} color="#3B82F6" />
        <StatsCard title="Total Faculty" value={stats.totalFaculty} color="#10B981" />
        <StatsCard title="Total Courses" value={stats.totalCourses} color="#F59E0B" />
        <StatsCard title="Attendance %" value={`${stats.attendancePercentage}%`} color="#EF4444" />
      </div>
      <ActivityTable />
    </DashboardLayout>
  );
}

export default AdminDashboard;
