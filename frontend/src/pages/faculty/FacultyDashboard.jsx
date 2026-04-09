import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import StatsCard from "../../components/StatsCard";
import api from "../../services/api";
import { getFacultyTimetable } from "../../services/timetableService";

function FacultyDashboard() {
  const [todayClasses, setTodayClasses] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const timetable = await getFacultyTimetable();
        const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
        const classesToday = timetable.filter((item) => item.dayOfWeek === today);
        const [tasksRes] = await Promise.all([
          api.get("/tasks/course/1"),
        ]);
        setTodayClasses(classesToday);
        setPendingAssignments(tasksRes.data || []);
        setAttendanceSummary(91.2);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setTodayClasses([]);
        setPendingAssignments([]);
        setAttendanceSummary(0);
      }
    }

    load();

    const handleFocus = () => {
      load();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
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
