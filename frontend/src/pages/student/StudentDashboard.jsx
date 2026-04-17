import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import StatsCard from "../../components/StatsCard";
import { getStudentTimetable } from "../../services/timetableService";

const PERIOD_FROM_TIME = {
  "08:00": 1,
  "08:50": 2,
  "10:10": 3,
  "11:00": 4,
  "11:50": 5,
  "13:30": 6,
  "14:15": 7,
};

const resolvePeriodNumber = (entry) => {
  const period = Number(entry?.periodNumber);
  if (!Number.isNaN(period) && period >= 1 && period <= 7) {
    return period;
  }

  const start = String(entry?.startTime || "").slice(0, 5);
  return PERIOD_FROM_TIME[start] ?? 999;
};

const getUniqueTodayClasses = (entries, today) => {
  const seen = new Set();

  return entries
    .filter((item) => item.dayOfWeek === today)
    .sort((a, b) => resolvePeriodNumber(a) - resolvePeriodNumber(b))
    .filter((item) => {
      const period = resolvePeriodNumber(item);
      const key = `${item.dayOfWeek}|${period}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
};

function StudentDashboard() {
  const [data, setData] = useState({
    attendancePercentage: 0,
    upcomingClasses: [],
    recentAnnouncements: [],
    pendingTasks: [],
  });

  useEffect(() => {
    async function load() {
      try {
        const timetable = await getStudentTimetable();
        const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
        const todayClasses = getUniqueTodayClasses(timetable, today);

        setData({
          attendancePercentage: 0,
          upcomingClasses: todayClasses,
          recentAnnouncements: [],
          pendingTasks: [],
        });
      } catch {
        setData({
          attendancePercentage: 0,
          upcomingClasses: [],
          recentAnnouncements: [],
          pendingTasks: [],
        });
      }
    }

    load();

    const handleFocus = () => {
      load();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="stats-container">
        <StatsCard title="Attendance" value={`${data.attendancePercentage}%`} color="#3B82F6" />
        <StatsCard title="Upcoming Classes" value={data.upcomingClasses.length} color="#10B981" />
        <StatsCard title="Announcements" value={data.recentAnnouncements.length} color="#F59E0B" />
        <StatsCard title="Pending Tasks" value={data.pendingTasks.length} color="#EF4444" />
      </div>

      <div className="module-grid">
        <div className="table-card">
          <h3>Upcoming Classes</h3>
          {data.upcomingClasses.length > 0 ? (
            <ul>
              {data.upcomingClasses.map((item) => (
                <li key={`${item.dayOfWeek}-${resolvePeriodNumber(item)}-${item.courseCode}`}>
                  {item.dayOfWeek} - {String(item.startTime || "").slice(0, 5)} - {item.courseCode}
                </li>
              ))}
            </ul>
          ) : (
            <p>No classes found for today.</p>
          )}
        </div>
        <div className="table-card">
          <h3>Recent Announcements</h3>
          <ul>
            {data.recentAnnouncements.map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default StudentDashboard;
