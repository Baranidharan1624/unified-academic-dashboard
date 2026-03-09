import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/ui/Modal';
import GlassTable from '../../components/ui/GlassTable';
import {
  getTimetableEntries, 
  createTimetableEntry, 
  updateTimetableEntry,
  deleteTimetableEntry,
  getRooms 
} from '../../services/timetableService';
import { getCourseOfferings } from '../../services/courseService';
import { getFacultyUsers } from '../../services/userService';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

function TimetableManagementPage() {
  const [entries, setEntries] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    courseOfferingId: '',
    facultyId: '',
    roomId: '',
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '10:00'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entriesData, roomsData, offeringsData, facultyData] = await Promise.all([
        getTimetableEntries(),
        getRooms(),
        getCourseOfferings(),
        getFacultyUsers()
      ]);
      setEntries(entriesData);
      setRooms(roomsData);
      setCourseOfferings(offeringsData);
      setFaculty(facultyData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await updateTimetableEntry(editingId, formData);
        setSuccess('Timetable entry updated successfully');
      } else {
        await createTimetableEntry(formData);
        setSuccess('Timetable entry created successfully');
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save timetable entry');
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setFormData({
      courseOfferingId: entry.courseOfferingId,
      facultyId: entry.facultyId,
      roomId: entry.roomId,
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await deleteTimetableEntry(id);
      setSuccess('Entry deleted successfully');
      loadData();
    } catch (err) {
      setError('Failed to delete entry');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      courseOfferingId: '',
      facultyId: '',
      roomId: '',
      dayOfWeek: 'MONDAY',
      startTime: '09:00',
      endTime: '10:00'
    });
  };

  const columns = [
    { key: 'courseName', header: 'Course' },
    { key: 'courseCode', header: 'Code' },
    { key: 'facultyName', header: 'Faculty' },
    { key: 'roomName', header: 'Room' },
    { key: 'dayOfWeek', header: 'Day' },
    { key: 'time', header: 'Time' },
    { 
      key: 'actions', 
      header: 'Actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="btn btn-sm btn-primary" onClick={() => handleEdit(row)}>Edit</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row.id)}>Delete</button>
        </div>
      )
    }
  ];

  const tableData = entries.map(entry => ({
    ...entry,
    time: `${entry.startTime} - ${entry.endTime}`
  }));

  return (
    <DashboardLayout title="Timetable Management">
      <div className="page-content">
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            + Add Timetable Entry
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <GlassTable columns={columns} data={tableData} />
        )}

        {entries.length === 0 && !loading && (
          <div className="empty-state">
            <p>No timetable entries found. Create your first entry.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={showModal} 
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingId ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Course</label>
            <select
              value={formData.courseOfferingId}
              onChange={(e) => setFormData({...formData, courseOfferingId: parseInt(e.target.value)})}
              required
            >
              <option value="">Select Course</option>
              {courseOfferings.map(o => (
                <option key={o.id} value={o.id}>
                  {o.courseName} ({o.courseCode})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Faculty</label>
            <select
              value={formData.facultyId}
              onChange={(e) => setFormData({...formData, facultyId: parseInt(e.target.value)})}
              required
            >
              <option value="">Select Faculty</option>
              {faculty.map(f => (
                <option key={f.id} value={f.id}>{f.fullName}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Room</label>
            <select
              value={formData.roomId}
              onChange={(e) => setFormData({...formData, roomId: parseInt(e.target.value)})}
              required
            >
              <option value="">Select Room</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.roomName} - {r.building}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Day</label>
            <select
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({...formData, dayOfWeek: e.target.value})}
              required
            >
              {DAYS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <select
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                required
              >
                {TIME_SLOTS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>End Time</label>
              <select
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                required
              >
                {TIME_SLOTS.filter(t => t > formData.startTime).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .header-actions { margin-bottom: 20px; }
        .alert { padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; }
        .alert-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
        .alert-success { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
        .form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
        .btn { padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; }
        .btn-primary { background: var(--primary-color); color: white; }
        .btn-secondary { background: var(--bg-secondary); color: var(--text-primary); }
        .btn-danger { background: #ef4444; color: white; }
        .btn-sm { padding: 6px 12px; font-size: 0.875rem; }
        .action-buttons { display: flex; gap: 8px; }
        .empty-state { text-align: center; padding: 40px; color: var(--text-secondary); }
      `}</style>
    </DashboardLayout>
  );
}

export default TimetableManagementPage;

