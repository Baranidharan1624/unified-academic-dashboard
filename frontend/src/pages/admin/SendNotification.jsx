import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../services/api";
import { getCurrentUser } from "../../services/authService";

function SendNotification() {
  const [form, setForm] = useState({ title: "", message: "", targetRole: "STUDENT" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    await api.post("/notifications", {
      ...form,
      createdBy: user?.id || 1,
    });
    setForm({ title: "", message: "", targetRole: "STUDENT" });
  };

  return (
    <DashboardLayout title="Send Notification">
      <div className="form-card">
        <h3>Create Notification</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" required />
          <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Message" rows={5} required />
          <select value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
            <option value="STUDENT">STUDENT</option>
            <option value="FACULTY">FACULTY</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <button className="primary-btn" type="submit">Send</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default SendNotification;
