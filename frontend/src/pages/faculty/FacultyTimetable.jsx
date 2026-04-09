import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { getFacultyTimetable } from "../../services/timetableService";

function FacultyTimetable() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const timetable = await getFacultyTimetable();
        setEntries(timetable);
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
              <tr key={entry.id}><td>{entry.dayOfWeek}</td><td>{entry.startTime} - {entry.endTime}</td><td>{entry.roomNumber}</td><td>{entry.courseCode}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default FacultyTimetable;
