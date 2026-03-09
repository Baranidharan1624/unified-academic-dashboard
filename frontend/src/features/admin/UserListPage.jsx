import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import userService from "../../services/userService";
import "../../assets/css/dashboard.css";

/**
 * UserListPage - Admin user management list view
 */
function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = roleFilter
        ? await userService.getUsersByRole(roleFilter)
        : await userService.getUsers();
      setUsers(data);
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (userId) => {
    try {
      await userService.activateUser(userId);
      loadUsers();
    } catch (err) {
      setError("Failed to activate user");
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      await userService.deactivateUser(userId);
      loadUsers();
    } catch (err) {
      setError("Failed to deactivate user");
    }
  };

  const openResetModal = (user) => {
    setSelectedUser(user);
    setShowResetModal(true);
    setNewPassword("");
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setResetLoading(true);
      await userService.resetPassword(selectedUser.id, newPassword);
      setShowResetModal(false);
      setSelectedUser(null);
      setNewPassword("");
      alert("Password reset successfully");
    } catch (err) {
      setError("Failed to reset password");
    } finally {
      setResetLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower) ||
      user.department?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status) => {
    const statusClass = status === "ACTIVE" ? "status-active" : "status-inactive";
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  const getRoleBadge = (role) => {
    const safeRole = role || "UNKNOWN";
    const roleClass = `role-${safeRole.toLowerCase()}`;
    return <span className={`role-badge ${roleClass}`}>{safeRole}</span>;
  };

  return (
    <DashboardLayout title="User Management">
      <div className="page-container">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="glass-card stat-card">
            <h3>Total Users</h3>
            <p className="stat-value">{users.length}</p>
          </div>
          <div className="glass-card stat-card">
            <h3>Active Users</h3>
            <p className="stat-value">
              {users.filter((u) => u.status === "ACTIVE").length}
            </p>
          </div>
          <div className="glass-card stat-card">
            <h3>Faculty</h3>
            <p className="stat-value">
              {users.filter((u) => u.role === "FACULTY").length}
            </p>
          </div>
          <div className="glass-card stat-card">
            <h3>Students</h3>
            <p className="stat-value">
              {users.filter((u) => u.role === "STUDENT").length}
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="actions-bar glass-card">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-box">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="FACULTY">Faculty</option>
              <option value="STUDENT">Student</option>
            </select>
          </div>
          <Link to="/admin/import" className="btn btn-secondary">
            Import Excel
          </Link>
          <Link to="/admin/users/create" className="btn btn-primary">
            + Create User
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Users Table */}
        <div className="glass-card table-card">
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>{getStatusBadge(user.status)}</td>
                      <td>{user.department || "-"}</td>
                      <td className="actions-cell">
                        <button
                          className="btn-icon btn-view"
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                          title="View"
                        >
                          View
                        </button>
                        <button
                          className="btn-icon btn-edit"
                          onClick={() =>
                            navigate(`/admin/users/edit/${user.id}`)
                          }
                          title="Edit"
                        >
                          Edit
                        </button>
                        {user.status === "ACTIVE" ? (
                          <button
                            className="btn-icon btn-deactivate"
                            onClick={() => handleDeactivate(user.id)}
                            title="Deactivate"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            className="btn-icon btn-activate"
                            onClick={() => handleActivate(user.id)}
                            title="Activate"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          className="btn-icon btn-reset"
                          onClick={() => openResetModal(user)}
                          title="Reset Password"
                        >
                          Reset
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Reset Password Modal */}
        {showResetModal && (
          <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
            <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
              <h2>Reset Password</h2>
              <p>
                Resetting password for: <strong>{selectedUser?.name}</strong>
              </p>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 8 characters)"
                  className="form-input"
                />
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowResetModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleResetPassword}
                  disabled={resetLoading}
                >
                  {resetLoading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default UserListPage;
