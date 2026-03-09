import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../services/api";

function TaskSubmissions() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get("/tasks/student/3");
        setSubmissions(response.data || []);
      } catch {
        setSubmissions([]);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout title="Task Submissions">
      <div className="table-card">
        <table>
          <thead><tr><th>Task ID</th><th>Student ID</th><th>Status</th><th>Submitted At</th></tr></thead>
          <tbody>
            {submissions.map((item) => (
              <tr key={item.id}><td>{item.taskId}</td><td>{item.studentId}</td><td>{item.status}</td><td>{item.submittedAt || "-"}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default TaskSubmissions;
