import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { getCurrentUser } from "../../services/authService";
import { getStudentAttendance } from "../../services/attendanceService";

function StudentAttendance() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    async function load() {
      const user = getCurrentUser();
      try {
        const response = await getStudentAttendance(user?.id || 3);
        setRecords(response.data || []);
      } catch {
        setRecords([]);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout title="My Attendance">
      <div className="table-card">
        <table>
          <thead><tr><th>Course</th><th>Attended</th><th>Total</th><th>%</th></tr></thead>
          <tbody>
            {records.map((item) => {
              const pct = item.totalClasses ? ((item.attendedClasses * 100) / item.totalClasses).toFixed(2) : "0.00";
              return <tr key={item.id}><td>{item.courseId}</td><td>{item.attendedClasses}</td><td>{item.totalClasses}</td><td>{pct}%</td></tr>;
            })}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default StudentAttendance;
