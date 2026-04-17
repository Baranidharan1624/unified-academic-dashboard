import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import GlassCard from '../../components/ui/GlassCard';
import { getStudentTimetable } from '../../services/timetableService';
import { peekCached } from '../../services/apiClient';
import '../../assets/css/timetable.css';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const DAY_LABELS = { MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday', THURSDAY: 'Thursday', FRIDAY: 'Friday' };
const PERIODS = [
  { period: 1, start: '08:00', end: '08:50' },
  { period: 2, start: '08:50', end: '09:40' },
  { period: 3, start: '10:10', end: '11:00' },
  { period: 4, start: '11:00', end: '11:50' },
  { period: 5, start: '11:50', end: '12:40' },
  { period: 6, start: '13:30', end: '14:15' },
  { period: 7, start: '14:15', end: '15:00' },
];

const PERIOD_FROM_TIME = {
  '08:00': 1,
  '08:50': 2,
  '10:10': 3,
  '11:00': 4,
  '11:50': 5,
  '13:30': 6,
  '14:15': 7,
};

const resolvePeriodNumber = (entry) => {
  const fromPeriod = Number(entry?.periodNumber);
  if (!Number.isNaN(fromPeriod) && fromPeriod >= 1 && fromPeriod <= 7) {
    return fromPeriod;
  }

  const start = String(entry?.startTime || '').slice(0, 5);
  return PERIOD_FROM_TIME[start] ?? null;
};

const getCurrentUserId = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.id ?? null;
  } catch {
    return null;
  }
};

function StudentTimetablePage() {
  const initialCachedEntries = (() => {
    const userId = getCurrentUserId();
    const cached = peekCached(`/timetable/student/${userId || 0}`);
    return cached === null ? null : Array.isArray(cached) ? cached : [];
  })();

  const [entries, setEntries] = useState(initialCachedEntries ?? []);
  const [loading, setLoading] = useState(initialCachedEntries === null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) {
      loadTimetable();
    }
  }, []);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const data = await getStudentTimetable();
      setEntries(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Failed to load timetable');
    }
    finally { setLoading(false); }
  };

  const timetableBySlot = useMemo(() => {
    const grid = {};
    DAYS.forEach((day) => {
      grid[day] = {};
    });

    entries.forEach((entry) => {
      const day = entry?.dayOfWeek;
      const period = resolvePeriodNumber(entry);
      if (!day || !grid[day] || !period) {
        return;
      }

      // Keep the first row per day/period to avoid duplicate stacked cards.
      if (!grid[day][period]) {
        grid[day][period] = entry;
      }
    });

    return grid;
  }, [entries]);

  const totalEntries = useMemo(
    () => DAYS.reduce((count, day) => count + Object.keys(timetableBySlot[day] || {}).length, 0),
    [timetableBySlot]
  );

  if (loading) return <DashboardLayout title="My Timetable"><div className="loading">Loading timetable...</div></DashboardLayout>;

  return (
    <DashboardLayout title="My Class Timetable">
      <div className="timetable-page student-timetable-page">
        {error && <div className="alert alert-error">{error}</div>}
        {!error && totalEntries === 0 && (
          <div className="alert alert-info">
            No timetable has been generated for your class yet.
          </div>
        )}
        <GlassCard className="timetable-container">
          <h2>My Weekly Schedule</h2>
          <div className="student-table-wrapper">
            <table className="student-timetable-table">
              <thead>
                <tr>
                  <th className="student-time-header">Time</th>
                  {DAYS.map((day) => (
                    <th key={day}>{DAY_LABELS[day]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period) => (
                  <tr key={period.period}>
                    <td className="student-time-cell">
                      <div className="student-period-label">P{period.period}</div>
                      <div className="student-period-range">{period.start} - {period.end}</div>
                    </td>
                    {DAYS.map((day) => {
                      const entry = timetableBySlot[day]?.[period.period];
                      return (
                        <td key={`${day}-${period.period}`} className="student-period-cell">
                          {entry && (
                            <div className="student-entry-card">
                              <div className="student-entry-course">{entry.courseName || entry.courseCode || 'Course'}</div>
                              <div className="student-entry-faculty">{entry.facultyName || 'Faculty'}</div>
                              <div className="student-entry-room">{entry.roomNumber || entry.roomName || `Room ${entry.roomId || '-'}`}</div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
        
        <GlassCard className="schedule-summary">
          <h3>Weekly Summary</h3>
          <div className="summary-grid">
            {DAYS.map(day => (
              <div key={day} className="summary-day">
                <div className="day-name">{DAY_LABELS[day]}</div>
                <div className="class-count">{Object.keys(timetableBySlot[day] || {}).length} periods</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}

export default StudentTimetablePage;

