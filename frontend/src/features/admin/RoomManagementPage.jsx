import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import GlassCard from '../../components/ui/GlassCard';
import Modal from '../../components/ui/Modal';
import { getRooms, createRoom, deleteRoom } from '../../services/timetableService';

function RoomManagementPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    roomName: '',
    building: '',
    capacity: 30
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await getRooms();
      setRooms(data);
    } catch (err) {
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await createRoom(formData);
      setSuccess('Room created successfully');
      setShowModal(false);
      setFormData({ roomName: '', building: '', capacity: 30 });
      loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    
    try {
      await deleteRoom(id);
      setSuccess('Room deleted successfully');
      loadRooms();
    } catch (err) {
      setError('Failed to delete room');
    }
  };

  return (
    <DashboardLayout title="Room Management">
      <div className="page-content">
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Room
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="rooms-grid">
            {rooms.map(room => (
              <GlassCard key={room.id} className="room-card">
                <h3>{room.roomName}</h3>
                <p><strong>Building:</strong> {room.building}</p>
                <p><strong>Capacity:</strong> {room.capacity} students</p>
                <div className="card-actions">
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(room.id)}
                  >
                    Delete
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {rooms.length === 0 && !loading && (
          <div className="empty-state">
            <p>No rooms found. Add your first room to get started.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title="Add New Room"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Room Name</label>
            <input
              type="text"
              value={formData.roomName}
              onChange={(e) => setFormData({...formData, roomName: e.target.value})}
              placeholder="e.g., Room 101"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Building</label>
            <input
              type="text"
              value={formData.building}
              onChange={(e) => setFormData({...formData, building: e.target.value})}
              placeholder="e.g., Main Building"
              required
            />
          </div>

          <div className="form-group">
            <label>Capacity</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
              min="1"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Room
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .header-actions { margin-bottom: 20px; }
        .rooms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .room-card h3 { margin: 0 0 10px; color: var(--primary-color); }
        .room-card p { margin: 5px 0; color: var(--text-secondary); }
        .card-actions { margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-color); }
        .alert { padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; }
        .alert-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
        .alert-success { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
        .form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); }
        .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
        .btn { padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; }
        .btn-primary { background: var(--primary-color); color: white; }
        .btn-secondary { background: var(--bg-secondary); color: var(--text-primary); }
        .btn-danger { background: #ef4444; color: white; }
        .btn-sm { padding: 6px 12px; font-size: 0.875rem; }
        .empty-state { text-align: center; padding: 40px; color: var(--text-secondary); }
      `}</style>
    </DashboardLayout>
  );
}

export default RoomManagementPage;

