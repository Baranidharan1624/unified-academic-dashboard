import { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import GlassCard from '../../components/ui/GlassCard';
import PageContainer from '../../components/ui/PageContainer';
import Modal from '../../components/ui/Modal';

function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', departmentId: '', durationYears: 4, description: '' });

  useEffect(() => {
    fetchPrograms();
    fetchDepartments();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/admin/programs');
      setPrograms(response.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/admin/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProgram) {
        await api.put(`/admin/programs/${editingProgram.id}`, formData);
      } else {
        await api.post(`/admin/programs?departmentId=${formData.departmentId}`, formData);
      }
      fetchPrograms();
      setShowModal(false);
      setEditingProgram(null);
      setFormData({ name: '', code: '', departmentId: '', durationYears: 4, description: '' });
    } catch (error) {
      console.error('Error saving program:', error);
    }
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      code: program.code,
      departmentId: program.department?.id || '',
      durationYears: program.durationYears,
      description: program.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await api.delete(`/admin/programs/${id}`);
        fetchPrograms();
      } catch (error) {
        console.error('Error deleting program:', error);
      }
    }
  };

  const openNewModal = () => {
    setEditingProgram(null);
    setFormData({ name: '', code: '', departmentId: '', durationYears: 4, description: '' });
    setShowModal(true);
  };

  return (
    <PageContainer title="Programs Management">
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2>Degree Programs</h2>
          <button className="btn btn-primary" onClick={openNewModal}>
            Add Program
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="glass-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Duration (Years)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((prog) => (
                <tr key={prog.id}>
                  <td>{prog.code}</td>
                  <td>{prog.name}</td>
                  <td>{prog.department?.name || '-'}</td>
                  <td>{prog.durationYears}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => handleEdit(prog)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(prog.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingProgram ? 'Edit Program' : 'Add Program'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Program Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              disabled={!!editingProgram}
            />
          </div>
          <div className="form-group">
            <label>Program Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Department</label>
            <select
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              required
              disabled={!!editingProgram}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Duration (Years)</label>
            <input
              type="number"
              value={formData.durationYears}
              onChange={(e) => setFormData({ ...formData, durationYears: parseInt(e.target.value) })}
              required
              min="1"
              max="10"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            {editingProgram ? 'Update' : 'Create'}
          </button>
        </form>
      </Modal>
    </PageContainer>
  );
}

export default ProgramsPage;
