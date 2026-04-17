import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import notificationService from "../../services/notificationService";
import { getCurrentUser } from "../../services/authService";
import { userService } from "../../services/userService";

function SendNotification() {
  const [form, setForm] = useState({
    title: "",
    message: "",
    targetType: "ROLE",
    targetRole: "STUDENT",
    targetDepartment: "",
    targetAcademicYear: "",
    targetSection: "",
    priority: "MEDIUM",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [meta, students] = await Promise.all([
          userService.getCreateMeta(),
          userService.getUsersByRole("STUDENT"),
        ]);

        const departmentOptions = Array.from(
          new Set((meta?.departments || []).map((item) => item.code || item.name).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

        const yearsFromStudents = Array.from(
          new Set((students || []).map((item) => (item.academicYear || "").toString().trim()).filter(Boolean))
        );

        const sectionsFromStudents = Array.from(
          new Set((students || []).map((item) => (item.section || "").toString().trim().toUpperCase()).filter(Boolean))
        );

        setDepartments(departmentOptions);
        setAcademicYears(yearsFromStudents.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })));
        setSections(sectionsFromStudents.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })));
      } catch {
        setDepartments([]);
        setAcademicYears([]);
        setSections([]);
      }
    };

    loadOptions();
  }, []);

  const filteredAcademicYears = useMemo(() => {
    if (!form.targetDepartment && !form.targetSection) {
      return academicYears;
    }
    return academicYears;
  }, [academicYears, form.targetDepartment, form.targetSection]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const user = getCurrentUser();

    if (form.targetType === "ROLE" && !form.targetRole) {
      setError("Please select a target role.");
      return;
    }

    try {
      setSending(true);
      await notificationService.createAnnouncement({
        ...form,
        targetRole: form.targetType === "ALL" ? null : form.targetRole,
        createdBy: user?.id || 1,
      });
      setSuccess("Announcement sent successfully.");
      setForm({
        title: "",
        message: "",
        targetType: "ROLE",
        targetRole: "STUDENT",
        targetDepartment: "",
        targetAcademicYear: "",
        targetSection: "",
        priority: "MEDIUM",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send announcement.");
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout title="Send Notification">
      <div style={{ minHeight: "calc(100vh - 180px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div className="form-card" style={{ width: "100%", maxWidth: "760px", margin: 0 }}>
        <h3>Create Announcement</h3>
        {success && <div className="success-message" style={{ marginBottom: "10px" }}>{success}</div>}
        {error && <div className="error-message" style={{ marginBottom: "10px" }}>{error}</div>}
        <form className="form-grid" onSubmit={handleSubmit}>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" required />
          <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Message" rows={5} required />
          <select value={form.targetType} onChange={(e) => setForm({ ...form, targetType: e.target.value })}>
            <option value="ROLE">Send by Role</option>
            <option value="ALL">Send to All Users</option>
          </select>

          {form.targetType === "ROLE" && (
            <select value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
              <option value="STUDENT">STUDENT</option>
              <option value="FACULTY">FACULTY</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <select
              value={form.targetDepartment}
              onChange={(e) => setForm({ ...form, targetDepartment: e.target.value })}
            >
              <option value="">All Departments</option>
              {departments.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>

            <select
              value={form.targetAcademicYear}
              onChange={(e) => setForm({ ...form, targetAcademicYear: e.target.value })}
            >
              <option value="">All Academic Years</option>
              {filteredAcademicYears.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>

          <select
            value={form.targetSection}
            onChange={(e) => setForm({ ...form, targetSection: e.target.value })}
          >
            <option value="">All Sections</option>
            {sections.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>

          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="HIGH">HIGH Priority</option>
            <option value="MEDIUM">MEDIUM Priority</option>
            <option value="LOW">LOW Priority</option>
          </select>
          <button className="primary-btn" type="submit" disabled={sending}>{sending ? "Sending..." : "Send Announcement"}</button>
        </form>
      </div>
      </div>
    </DashboardLayout>
  );
}

export default SendNotification;
