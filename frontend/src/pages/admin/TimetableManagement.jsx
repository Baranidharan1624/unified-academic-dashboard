import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../services/api";

const initialForm = {
  courseId: "",
  facultyId: "",
  studentId: "",
  dayOfWeek: "MONDAY",
  startTime: "09:00",
  endTime: "10:00",
  roomNumber: "",
};

function TimetableManagement() {
  const [form, setForm] = useState(initialForm);
  const [entries, setEntries] = useState([]);

  async function fetchEntries() {
    try {
      const response = await api.get("/timetable/student/3");
      setEntries(response.data || []);
    } catch {
      setEntries([]);
    }
  }

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/timetable", {
      ...form,
      courseId: Number(form.courseId),
      facultyId: Number(form.facultyId),
      studentId: Number(form.studentId),
    });
    setForm(initialForm);
    fetchEntries();
  };

  return (
    <DashboardLayout title="Timetable Management">
      <div className="module-grid">
        <div className="form-card">
          <h3>Create Timetable Entry</h3>
          <form className="form-grid" onSubmit={handleSubmit}>
            <input placeholder="Course ID" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required />
            <input placeholder="Faculty ID" value={form.facultyId} onChange={(e) => setForm({ ...form, facultyId: e.target.value })} required />
            <input placeholder="Student ID" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required />
            <select value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}>
              <option>MONDAY</option><option>TUESDAY</option><option>WEDNESDAY</option><option>THURSDAY</option><option>FRIDAY</option>
            </select>
            <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
            <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
            <input placeholder="Room Number" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} required />
            <button className="primary-btn" type="submit">Save Entry</button>
          </form>
        </div>

        <div className="table-card">
          <h3>Current Entries</h3>
          <table>
            <thead><tr><th>Day</th><th>Time</th><th>Room</th><th>Course</th></tr></thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.dayOfWeek}</td>
                  <td>{entry.startTime} - {entry.endTime}</td>
                  <td>{entry.roomNumber}</td>
                  <td>{entry.courseId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default TimetableManagement;
