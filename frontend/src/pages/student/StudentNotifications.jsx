import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../services/api";

function StudentNotifications() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get("/notifications/STUDENT");
        setItems(response.data || []);
      } catch {
        setItems([]);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout title="Notifications">
      <div className="table-card">
        {items.map((item) => (
          <div key={item.id} className="notification-item-card">
            <h4>{item.title}</h4>
            <p>{item.message}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default StudentNotifications;
