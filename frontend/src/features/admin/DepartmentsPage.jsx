import { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import GlassCard from '../../components/ui/GlassCard';
import PageContainer from '../../components/ui/PageContainer';
import Modal from '../../components/ui/Modal';

function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/admin/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await api.put(`/admin/departments/${editingDepartment.id}`, formData);
      } else {
        await api.post('/admin/departments', formData);
      }
      fetchDepartments();
      setShowModal(false);
      setEditingDepartment(null);
      setFormData({ name: '', code: '', description: '' });
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({ name: department.name, code: department.code, description: department.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await api.delete(`/admin/departments/${id}`);
        fetchDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const openNewModal = () => {
    setEditingDepartment(null);
    setFormData({ name: '', code: '', description: '' });
    setShowModal(true);
  };

  return (
    <PageContainer title="Departments Management">
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2>Departments</h2>
          <button className="btn btn-primary" onClick={openNewModal}>
            Add Department
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
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id}>
                  <td>{dept.code}</td>
                  <td>{dept.name}</td>
                  <td>{dept.description || '-'}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => handleEdit(dept)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(dept.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingDepartment ? 'Edit Department' : 'Add Department'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Department Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              disabled={!!editingDepartment}
            />
          </div>
          <div className="form-group">
            <label>Department Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
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
            {editingDepartment ? 'Update' : 'Create'}
          </button>
        </form>
      </Modal>
    </PageContainer>
  );
}

export default DepartmentsPage;

