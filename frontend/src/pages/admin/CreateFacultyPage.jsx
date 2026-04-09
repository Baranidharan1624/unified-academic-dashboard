import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { userService } from "../../services/userService";
import "../../assets/css/dashboard.css";

function CreateFacultyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [meta, setMeta] = useState({ departments: [] });
  const [formData, setFormData] = useState({
    facultyId: "",
    fullName: "",
    email: "",
    department: "",
    courseHandling: "",
    age: "",
    mobileNumber: "",
    address: "",
    bloodGroup: "",
    password: "",
  });

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const response = await userService.getCreateMeta();
        setMeta({ departments: response.departments || [] });
      } catch {
        setMeta({ departments: [] });
      } finally {
        setMetaLoading(false);
      }
    };

    loadMeta();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await userService.createUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password?.trim() || null,
        role: "FACULTY",
        facultyId: formData.facultyId?.trim() || null,
        department: formData.department,
        courseHandling: formData.courseHandling?.trim() || null,
        age: formData.age ? parseInt(formData.age, 10) : null,
        mobileNumber: formData.mobileNumber || null,
        address: formData.address || null,
        bloodGroup: formData.bloodGroup || null,
      });

      setSuccess("Faculty created successfully!");
      setTimeout(() => navigate("/admin/faculty"), 700);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please login again and retry.");
        return;
      }
      setError(err.response?.data?.error || err.message || "Failed to create faculty");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create Faculty">
      <div className="page-container">
        <h2>Create Faculty Account</h2>

        {error && <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
        {success && <div className="success-message" style={{ color: "green", marginBottom: "10px" }}>{success}</div>}
        {metaLoading && <div style={{ marginBottom: "10px" }}>Loading form metadata...</div>}

        <div className="form-card" style={{ margin: "0 auto", maxWidth: "620px" }}>
          <form className="form-grid" onSubmit={handleSubmit}>
            <input
              placeholder="Faculty ID (optional - auto generated if empty)"
              name="facultyId"
              value={formData.facultyId}
              onChange={handleInputChange}
            />

            <input
              placeholder="Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />

            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
            >
              <option value="">Department</option>
              {meta.departments.map((dept) => (
                <option key={dept.id} value={dept.code || dept.name}>
                  {dept.code ? `${dept.code} - ${dept.name}` : dept.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Age"
              name="age"
              type="number"
              min="1"
              max="120"
              value={formData.age}
              onChange={handleInputChange}
            />

            <input
              placeholder="Course Handling (e.g. CS23521, CS23422)"
              name="courseHandling"
              value={formData.courseHandling}
              onChange={handleInputChange}
            />

            <input
              placeholder="Mobile"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleInputChange}
            />

            <input
              placeholder="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <input
              placeholder="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />

            <input
              placeholder="Blood Group"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleInputChange}
            />

            <input
              placeholder="Password (optional - defaults to Campus@123)"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />

            <button type="submit" className="primary-btn" disabled={loading || metaLoading}>
              {loading ? "Creating..." : "Create Account"}
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/admin/faculty")}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CreateFacultyPage;
