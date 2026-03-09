import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { getCurrentUser } from "../../services/authService";
import { getStudentTimetable } from "../../services/attendanceService";

function StudentTimetable() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    async function load() {
      const user = getCurrentUser();
      try {
        const response = await getStudentTimetable(user?.id || 3);
        setEntries(response.data || []);
      } catch {
        setEntries([]);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout title="My Timetable">
      <div className="table-card">
        <table>
          <thead><tr><th>Day</th><th>Time</th><th>Course</th><th>Room</th></tr></thead>
          <tbody>
            {entries.map((item) => (
              <tr key={item.id}><td>{item.dayOfWeek}</td><td>{item.startTime} - {item.endTime}</td><td>{item.courseId}</td><td>{item.roomNumber}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default StudentTimetable;
