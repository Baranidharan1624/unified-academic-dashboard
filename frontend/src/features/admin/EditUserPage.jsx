import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import userService from "../../services/userService";
import "../../assets/css/dashboard.css";

function EditUserPage() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "STUDENT",
    department: "",
    semester: "",
    academicYear: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setFetching(true);
      const user = await userService.getUserById(id);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "STUDENT",
        department: user.department || "",
        semester: user.semester || "",
        academicYear: user.academicYear || "",
      });
    } catch (err) {
      setError("Failed to load user");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.name.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (!formData.email || !formData.email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department || null,
        semester: formData.semester ? parseInt(formData.semester) : null,
        academicYear: formData.academicYear || null,
      };

      await userService.updateUser(id, userData);
      setSuccess("User updated successfully!");
      setTimeout(() => {
        navigate("/admin/users");
      }, 1500);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update user";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout title="Edit User">
        <div className="page-container">
          <div className="loading">Loading user...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit User">
      <div className="page-container">
        <div className="form-container glass-card">
          <h2>Edit User</h2>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="STUDENT">Student</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/admin/users")}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Updating..." : "Update User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default EditUserPage;

