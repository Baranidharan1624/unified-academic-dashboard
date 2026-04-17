import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import notificationService from "../../services/notificationService";

const PRIORITY_COLORS = {
  HIGH: { bg: "rgba(239, 68, 68, 0.16)", color: "#fecaca", border: "rgba(248, 113, 113, 0.35)" },
  MEDIUM: { bg: "rgba(245, 158, 11, 0.15)", color: "#fde68a", border: "rgba(251, 191, 36, 0.35)" },
  LOW: { bg: "rgba(16, 185, 129, 0.16)", color: "#bbf7d0", border: "rgba(52, 211, 153, 0.35)" },
};

function StudentNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const response = await notificationService.getUserNotifications();
        setItems(Array.isArray(response) ? response : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true, isRead: true } : item)));
    } catch {
      // Ignore inline read failures to avoid interrupting user.
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setItems((prev) => prev.map((item) => ({ ...item, read: true, isRead: true })));
    } catch {
      // Ignore read-all failures silently.
    }
  };

  const formatTarget = (item) => {
    const parts = [];
    if (item.targetType === "ALL") parts.push("All Users");
    else if (item.targetRole) parts.push(item.targetRole);
    if (item.targetDepartment) parts.push(`Dept: ${item.targetDepartment}`);
    if (item.targetAcademicYear) parts.push(`Year: ${item.targetAcademicYear}`);
    if (item.targetSection) parts.push(`Sec: ${item.targetSection}`);
    return parts;
  };

  return (
    <DashboardLayout title="Notifications">
      <div className="table-card" style={{ padding: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "10px", flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>My Notifications</h3>
          <button className="primary-btn" type="button" onClick={markAllAsRead}>Mark All as Read</button>
        </div>

        {loading && <div style={{ padding: "18px", color: "#94a3b8" }}>Loading notifications...</div>}
        {!loading && items.length === 0 && <div style={{ padding: "18px", color: "#94a3b8" }}>No notifications available.</div>}

        <div style={{ display: "grid", gap: "12px" }}>
          {items.map((item) => {
            const priority = (item.priority || "MEDIUM").toUpperCase();
            const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM;
            const targets = formatTarget(item);
            return (
              <div
                key={item.id}
                className="notification-item-card"
                style={{
                  border: `1px solid ${item.isRead ? "rgba(148,163,184,0.22)" : colors.border}`,
                  borderRadius: "12px",
                  padding: "14px",
                  background: item.isRead ? "rgba(15,23,42,0.45)" : "rgba(15,23,42,0.65)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <h4 style={{ margin: 0 }}>{item.title}</h4>
                  <span
                    style={{
                      background: colors.bg,
                      color: colors.color,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "999px",
                      padding: "2px 10px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {priority}
                  </span>
                </div>

                <p style={{ margin: "10px 0", color: "#e2e8f0", lineHeight: 1.45 }}>{item.message}</p>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                  {targets.map((tag) => (
                    <span
                      key={`${item.id}-${tag}`}
                      style={{
                        fontSize: "11px",
                        color: "#cbd5e1",
                        border: "1px solid rgba(148,163,184,0.28)",
                        borderRadius: "999px",
                        padding: "2px 8px",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <small style={{ color: "#94a3b8" }}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</small>
                  {!item.isRead && (
                    <button className="btn btn-secondary" type="button" onClick={() => markAsRead(item.id)}>
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default StudentNotifications;
