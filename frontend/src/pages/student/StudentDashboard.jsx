import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import StatsCard from "../../components/StatsCard";
import { getCurrentUser } from "../../services/authService";
import { getStudentDashboard } from "../../services/attendanceService";

function StudentDashboard() {
  const [data, setData] = useState({
    attendancePercentage: 0,
    upcomingClasses: [],
    recentAnnouncements: [],
    pendingTasks: [],
  });

  useEffect(() => {
    async function load() {
      const user = getCurrentUser();
      try {
        const response = await getStudentDashboard(user?.id || 3);
        setData(response.data);
      } catch {
        setData({
          attendancePercentage: 88.5,
          upcomingClasses: [{ id: 1, dayOfWeek: "MONDAY", startTime: "09:00" }],
          recentAnnouncements: [{ id: 1, title: "Exam Notice" }],
          pendingTasks: [{ id: 2, taskId: 2 }],
        });
      }
    }

    load();
  }, []);

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="stats-container">
        <StatsCard title="Attendance" value={`${data.attendancePercentage}%`} color="#3B82F6" />
        <StatsCard title="Upcoming Classes" value={data.upcomingClasses.length} color="#10B981" />
        <StatsCard title="Announcements" value={data.recentAnnouncements.length} color="#F59E0B" />
        <StatsCard title="Pending Tasks" value={data.pendingTasks.length} color="#EF4444" />
      </div>

      <div className="module-grid">
        <div className="table-card">
          <h3>Upcoming Classes</h3>
          <ul>
            {data.upcomingClasses.map((item) => (
              <li key={item.id}>{item.dayOfWeek} - {item.startTime}</li>
            ))}
          </ul>
        </div>
        <div className="table-card">
          <h3>Recent Announcements</h3>
          <ul>
            {data.recentAnnouncements.map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default StudentDashboard;
