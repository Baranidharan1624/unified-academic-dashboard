import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { userService } from "../../services/userService";
import "../../assets/css/dashboard.css";

function CreateStudentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [meta, setMeta] = useState({ departments: [], semesters: [1, 2, 3, 4, 5, 6, 7, 8] });
  const [formData, setFormData] = useState({
    registrationNumber: "",
    fullName: "",
    department: "",
    semester: "",
    section: "",
    startYear: "",
    age: "",
    mobileNumber: "",
    email: "",
    address: "",
    bloodGroup: "",
    password: "",
  });

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const response = await userService.getCreateMeta();
        setMeta({
          departments: response.departments || [],
          semesters: response.semesters || [1, 2, 3, 4, 5, 6, 7, 8],
        });
      } catch {
        setMeta({ departments: [], semesters: [1, 2, 3, 4, 5, 6, 7, 8] });
      } finally {
        setMetaLoading(false);
      }
    };

    loadMeta();
  }, []);

  const computedAcademicYear = useMemo(() => {
    if (!/^\d{4}$/.test(formData.startYear || "")) {
      return "";
    }
    const start = Number(formData.startYear);
    return `${start}-${start + 4}`;
  }, [formData.startYear]);

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
        role: "STUDENT",
        registrationNumber: formData.registrationNumber?.trim() || null,
        department: formData.department,
        semester: parseInt(formData.semester, 10) || null,
        section: formData.section,
        academicYear: computedAcademicYear,
        age: formData.age ? parseInt(formData.age, 10) : null,
        mobileNumber: formData.mobileNumber || null,
        address: formData.address || null,
        bloodGroup: formData.bloodGroup || null,
      });

      setSuccess("Student created successfully!");
      setTimeout(() => navigate("/admin/students"), 700);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please login again and retry.");
        return;
      }
      setError(err.response?.data?.error || err.message || "Failed to create student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create Student">
      <div className="page-container">
        <h2>Create Student Account</h2>

        {error && <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
        {success && <div className="success-message" style={{ color: "green", marginBottom: "10px" }}>{success}</div>}
        {metaLoading && <div style={{ marginBottom: "10px" }}>Loading form metadata...</div>}

        <div className="form-card" style={{ margin: "0 auto", maxWidth: "620px" }}>
          <form className="form-grid" onSubmit={handleSubmit}>
            <input
              placeholder="RegNo (optional - auto generated if empty)"
              name="registrationNumber"
              value={formData.registrationNumber}
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

            <select
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              required
            >
              <option value="">Semester</option>
              {meta.semesters.map((value) => (
                <option key={value} value={value}>Semester {value}</option>
              ))}
            </select>

            <input
              placeholder="Section"
              name="section"
              value={formData.section}
              onChange={handleInputChange}
              required
            />

            <input
              placeholder="Academic Year Start (e.g., 2026)"
              name="startYear"
              type="number"
              min="2000"
              max="2100"
              value={formData.startYear}
              onChange={handleInputChange}
              required
            />

            <input
              placeholder="Academic Year"
              name="academicYear"
              value={computedAcademicYear}
              readOnly
            />

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
              onClick={() => navigate("/admin/students")}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CreateStudentPage;
