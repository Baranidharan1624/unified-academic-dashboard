import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import GlassCard from '../../components/ui/GlassCard';
import { getStudentTimetable, organizeTimetableByDay } from '../../services/timetableService';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const DAY_LABELS = { MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday', THURSDAY: 'Thursday', FRIDAY: 'Friday' };

function StudentTimetablePage() {
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadTimetable(); }, []);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const data = await getStudentTimetable();
      setTimetable(organizeTimetableByDay(data));
    } catch (err) { setError('Failed to load timetable'); }
    finally { setLoading(false); }
  };

  const renderTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) slots.push(`${hour.toString().padStart(2, '0')}:00`);
    return slots;
  };

  const getEntryAtTime = (day, time) => {
    const entries = timetable[day] || [];
    return entries.find(entry => {
      const start = parseInt(entry.startTime.split(':')[0]);
      const end = parseInt(entry.endTime.split(':')[0]);
      const current = parseInt(time.split(':')[0]);
      return current >= start && current < end;
    });
  };

  if (loading) return <DashboardLayout title="My Timetable"><div className="loading">Loading timetable...</div></DashboardLayout>;

  const totalEntries = DAYS.reduce((count, day) => count + (timetable[day]?.length || 0), 0);

  return (
    <DashboardLayout title="My Class Timetable">
      <div className="timetable-page">
        {error && <div className="alert alert-error">{error}</div>}
        {!error && totalEntries === 0 && (
          <div className="alert alert-info">
            No timetable has been generated for your class yet.
          </div>
        )}
        <GlassCard className="timetable-container">
          <h2>My Weekly Schedule</h2>
          <div className="timetable-grid">
            <div className="timetable-header">
              <div className="time-column">Time</div>
              {DAYS.map(day => <div key={day} className="day-column">{DAY_LABELS[day]}</div>)}
            </div>
            {renderTimeSlots().map(time => (
              <div key={time} className="timetable-row">
                <div className="time-cell">{time}</div>
                {DAYS.map(day => {
                  const entry = getEntryAtTime(day, time);
                  return (
                    <div key={`${day}-${time}`} className="timetable-cell">
                      {entry && parseInt(entry.startTime.split(':')[0]) === parseInt(time.split(':')[0]) && (
                        <div className="timetable-entry">
                          <div className="entry-course">{entry.courseName}</div>
                          <div className="entry-code">{entry.courseCode}</div>
                          <div className="entry-room">{entry.roomNumber || entry.roomName || entry.roomId}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </GlassCard>
        
        <GlassCard className="schedule-summary">
          <h3>Weekly Summary</h3>
          <div className="summary-grid">
            {DAYS.map(day => (
              <div key={day} className="summary-day">
                <div className="day-name">{DAY_LABELS[day]}</div>
                <div className="class-count">{timetable[day]?.length || 0} classes</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
      <style>{`
        .timetable-page { padding: 20px; }
        .timetable-container { overflow-x: auto; margin-bottom: 20px; }
        .timetable-container h2 { margin-bottom: 20px; color: var(--primary-color); }
        .timetable-grid { display: flex; flex-direction: column; min-width: 800px; }
        .timetable-header { display: grid; grid-template-columns: 80px repeat(5, 1fr); background: var(--primary-color); color: white; font-weight: bold; }
        .timetable-header .time-column, .timetable-header .day-column { padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.2); }
        .timetable-row { display: grid; grid-template-columns: 80px repeat(5, 1fr); min-height: 50px; }
        .time-cell { padding: 8px; text-align: center; background: var(--bg-secondary); border: 1px solid var(--border-color); font-size: 0.85rem; color: var(--text-secondary); }
        .timetable-cell { border: 1px solid var(--border-color); min-height: 50px; position: relative; }
        .timetable-entry { position: absolute; top: 2px; left: 2px; right: 2px; bottom: 2px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 8px; border-radius: 6px; font-size: 0.8rem; display: flex; flex-direction: column; justify-content: center; }
        .entry-course { font-weight: bold; font-size: 0.85rem; }
        .entry-code { opacity: 0.9; font-size: 0.75rem; }
        .entry-room { opacity: 0.8; font-size: 0.7rem; margin-top: 2px; }
        .schedule-summary h3 { margin-bottom: 15px; color: var(--primary-color); }
        .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; }
        .summary-day { text-align: center; padding: 15px; background: var(--bg-secondary); border-radius: 8px; }
        .day-name { font-weight: bold; margin-bottom: 5px; }
        .class-count { color: var(--text-secondary); font-size: 0.9rem; }
        .alert { padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; }
        .alert-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
        .alert-info { background: rgba(59, 130, 246, 0.1); color: #2563eb; border: 1px solid rgba(59, 130, 246, 0.25); }
        .loading { text-align: center; padding: 40px; color: var(--text-secondary); }
      `}</style>
    </DashboardLayout>
  );
}

export default StudentTimetablePage;

