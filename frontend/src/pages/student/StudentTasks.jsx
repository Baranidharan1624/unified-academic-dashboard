import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { getCurrentUser } from "../../services/authService";
import { getStudentTasks, submitTask } from "../../services/taskService";

function StudentTasks() {
  const [tasks, setTasks] = useState([]);

  async function fetchTasks() {
    const user = getCurrentUser();
    try {
      const response = await getStudentTasks(user?.id || 3);
      setTasks(response.data || []);
    } catch {
      setTasks([]);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (taskId) => {
    const user = getCurrentUser();
    await submitTask({
      taskId,
      studentId: user?.id || 3,
      status: "SUBMITTED",
    });
    fetchTasks();
  };

  return (
    <DashboardLayout title="My Tasks">
      <div className="table-card">
        <table>
          <thead><tr><th>Task ID</th><th>Status</th><th>Submitted At</th><th>Action</th></tr></thead>
          <tbody>
            {tasks.map((item) => (
              <tr key={item.id}>
                <td>{item.taskId}</td>
                <td>{item.status}</td>
                <td>{item.submittedAt || "-"}</td>
                <td>
                  {item.status !== "SUBMITTED" && (
                    <button className="primary-btn" onClick={() => handleSubmit(item.taskId)}>Submit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default StudentTasks;
