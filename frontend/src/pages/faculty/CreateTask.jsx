import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { createTask } from "../../services/taskService";
import { getCurrentUser } from "../../services/authService";

function CreateTask() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    courseId: "",
    deadline: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    await createTask({
      ...form,
      courseId: Number(form.courseId),
      createdBy: user?.id || 2,
      deadline: new Date(form.deadline).toISOString(),
    });
    setForm({ title: "", description: "", courseId: "", deadline: "" });
  };

  return (
    <DashboardLayout title="Create Task">
      <div className="form-card">
        <h3>Create Assignment</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" required />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={5} />
          <input value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} placeholder="Course ID" required />
          <input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
          <button className="primary-btn" type="submit">Create Task</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default CreateTask;
