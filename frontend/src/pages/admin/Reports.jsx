import { useEffect, useMemo, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import DashboardLayout from "../../components/DashboardLayout";
import { getCached, peekCached } from "../../services/apiClient";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function Reports() {
  const [users, setUsers] = useState(() => peekCached("/reports/users") || { totalStudents: 0, totalFaculty: 0, totalAdmins: 0 });
  const [attendance, setAttendance] = useState(() => peekCached("/reports/attendance") || { overallAttendancePercentage: 0 });
  const [system, setSystem] = useState(() => peekCached("/reports/system-activity") || { totalCourses: 0, totalTaskSubmissions: 0 });

  useEffect(() => {
    if (peekCached("/reports/users") && peekCached("/reports/attendance") && peekCached("/reports/system-activity")) {
      return;
    }

    async function load() {
      try {
        const [usersRes, attendanceRes, systemRes] = await Promise.all([
          getCached("/reports/users"),
          getCached("/reports/attendance"),
          getCached("/reports/system-activity"),
        ]);
        setUsers(usersRes);
        setAttendance(attendanceRes);
        setSystem(systemRes);
      } catch {
        setUsers({ totalStudents: 0, totalFaculty: 0, totalAdmins: 0 });
        setAttendance({ overallAttendancePercentage: 0 });
        setSystem({ totalCourses: 0, totalTaskSubmissions: 0, status: "unavailable" });
      }
    }
    load();
  }, []);

  const usersData = useMemo(() => ({
    labels: ["Students", "Faculty", "Admins"],
    datasets: [{ label: "Users", data: [users.totalStudents, users.totalFaculty, users.totalAdmins], backgroundColor: ["#4f46e5", "#0ea5e9", "#22c55e"] }],
  }), [users]);

  const attendanceData = useMemo(() => ({
    labels: ["Present", "Absent"],
    datasets: [{ data: [attendance.overallAttendancePercentage, 100 - attendance.overallAttendancePercentage], backgroundColor: ["#10b981", "#ef4444"] }],
  }), [attendance]);

  return (
    <DashboardLayout title="Reports">
      <div className="module-grid reports-grid">
        <div className="table-card chart-card">
          <h3>User Statistics</h3>
          <Bar data={usersData} />
        </div>
        <div className="table-card chart-card">
          <h3>Attendance Overview</h3>
          <Doughnut data={attendanceData} />
        </div>
        <div className="table-card">
          <h3>System Activity</h3>
          <p>Total Courses: {system.totalCourses}</p>
          <p>Total Task Submissions: {system.totalTaskSubmissions}</p>
          <p>System Status: {system.status || "healthy"}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Reports;
