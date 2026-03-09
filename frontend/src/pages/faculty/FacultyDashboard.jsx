import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import StatsCard from "../../components/StatsCard";
import api from "../../services/api";
import { getCurrentUser } from "../../services/authService";

function FacultyDashboard() {
  const [todayClasses, setTodayClasses] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(0);

  useEffect(() => {
    async function load() {
      const user = getCurrentUser();
      try {
        const [timetableRes, tasksRes] = await Promise.all([
          api.get(`/timetable/faculty/${user?.id || 2}`),
          api.get("/tasks/course/1"),
        ]);
        setTodayClasses(timetableRes.data || []);
        setPendingAssignments(tasksRes.data || []);
        setAttendanceSummary(91.2);
      } catch {
        setTodayClasses([{ id: 1, dayOfWeek: "MONDAY", startTime: "09:00", endTime: "10:00", roomNumber: "A-101" }]);
        setPendingAssignments([{ id: 1, title: "Linked List Assignment" }]);
        setAttendanceSummary(91.2);
      }
    }

    load();
  }, []);

  return (
    <DashboardLayout title="Faculty Dashboard">
      <div className="stats-container">
        <StatsCard title="Today's Classes" value={todayClasses.length} color="#3B82F6" />
        <StatsCard title="Pending Assignments" value={pendingAssignments.length} color="#F59E0B" />
        <StatsCard title="Attendance Summary" value={`${attendanceSummary}%`} color="#10B981" />
      </div>
      <div className="table-card">
        <h3>Today's Classes</h3>
        <table>
          <thead><tr><th>Day</th><th>Time</th><th>Room</th></tr></thead>
          <tbody>
            {todayClasses.map((item) => (
              <tr key={item.id}><td>{item.dayOfWeek}</td><td>{item.startTime} - {item.endTime}</td><td>{item.roomNumber}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default FacultyDashboard;
