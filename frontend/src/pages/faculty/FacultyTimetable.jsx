import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../services/api";
import { getCurrentUser } from "../../services/authService";

function FacultyTimetable() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    async function load() {
      const user = getCurrentUser();
      try {
        const response = await api.get(`/timetable/faculty/${user?.id || 2}`);
        setEntries(response.data || []);
      } catch {
        setEntries([]);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout title="Faculty Timetable">
      <div className="table-card">
        <table>
          <thead><tr><th>Day</th><th>Time</th><th>Room</th><th>Course</th></tr></thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}><td>{entry.dayOfWeek}</td><td>{entry.startTime} - {entry.endTime}</td><td>{entry.roomNumber}</td><td>{entry.courseId}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default FacultyTimetable;
