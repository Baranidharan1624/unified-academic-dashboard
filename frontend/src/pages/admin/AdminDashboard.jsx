import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import StatsCard from "../../components/StatsCard";
import ActivityTable from "../../components/ActivityTable";
import api from "../../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    attendancePercentage: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [dashboardRes, usersReportRes, attendanceRes, activityRes] = await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/reports/users"),
          api.get("/reports/attendance"),
          api.get("/reports/system-activity"),
        ]);

        setStats({
          totalStudents: usersReportRes.data.totalStudents ?? dashboardRes.data.totalStudents ?? 0,
          totalFaculty: usersReportRes.data.totalFaculty ?? dashboardRes.data.totalFaculty ?? 0,
          totalCourses: activityRes.data.totalCourses ?? 0,
          attendancePercentage: attendanceRes.data.overallAttendancePercentage ?? 0,
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
