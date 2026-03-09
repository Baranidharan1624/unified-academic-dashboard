import { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import GlassCard from '../../components/ui/GlassCard';
import PageContainer from '../../components/ui/PageContainer';
import Modal from '../../components/ui/Modal';

function AcademicYearsPage() {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [formData, setFormData] = useState({ yearLabel: '', startDate: '', endDate: '', status: 'INACTIVE' });

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const response = await api.get('/admin/academic-years');
      setAcademicYears(response.data);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingYear) {
        await api.put(`/admin/academic-years/${editingYear.id}`, formData);
      } else {
        await api.post('/admin/academic-years', formData);
      }
      fetchAcademicYears();
      setShowModal(false);
      setEditingYear(null);
      setFormData({ yearLabel: '', startDate: '', endDate: '', status: 'INACTIVE' });
    } catch (error) {
      console.error('Error saving academic year:', error);
    }
  };

  const handleActivate = async (id) => {
    try {
      await api.put(`/admin/academic-years/${id}/activate`);
      fetchAcademicYears();
    } catch (error) {
      console.error('Error activating academic year:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this academic year?')) {
      try {
        await api.delete(`/admin/academic-years/${id}`);
        fetchAcademicYears();
      } catch (error) {
        console.error('Error deleting academic year:', error);
      }
    }
  };

  const openNewModal = () => {
    setEditingYear(null);
    setFormData({ yearLabel: '', startDate: '', endDate: '', status: 'INACTIVE' });
    setShowModal(true);
  };

  return (
    <PageContainer title="Academic Years Management">
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2>Academic Years</h2>
          <button className="btn btn-primary" onClick={openNewModal}>
            Add Academic Year
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="glass-table">
            <thead>
              <tr>
                <th>Year Label</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {academicYears.map((year) => (
                <tr key={year.id}>
                  <td>{year.yearLabel}</td>
                  <td>{year.startDate || '-'}</td>
                  <td>{year.endDate || '-'}</td>
                  <td>
                    <span className={`badge badge-${year.status === 'ACTIVE' ? 'success' : 'secondary'}`}>
                      {year.status}
                    </span>
                  </td>
                  <td>
                    {year.status !== 'ACTIVE' && (
                      <button className="btn btn-sm" onClick={() => handleActivate(year.id)}>Activate</button>
                    )}
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(year.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingYear ? 'Edit Academic Year' : 'Add Academic Year'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Year Label</label>
            <input
              type="text"
              value={formData.yearLabel}
              onChange={(e) => setFormData({ ...formData, yearLabel: e.target.value })}
              placeholder="e.g., 2024-2025"
              required
              disabled={!!editingYear}
            />
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            {editingYear ? 'Update' : 'Create'}
          </button>
        </form>
      </Modal>
    </PageContainer>
  );
}

export default AcademicYearsPage;

