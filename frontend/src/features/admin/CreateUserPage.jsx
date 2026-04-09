import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import userService from "../../services/userService";
import "../../assets/css/dashboard.css";

/**
 * CreateUserPage - Admin create new user page
 */
function CreateUserPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
    department: "",
    semester: "",
    startYear: "",
    academicYear: "",
    registrationNumber: "",
    facultyId: "",
    age: "",
    mobileNumber: "",
    address: "",
    bloodGroup: "",
  });
  const [meta, setMeta] = useState({ departments: [], semesters: [1, 2, 3, 4, 5, 6, 7, 8] });
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "role") {
      setFormData((prev) => ({
        ...prev,
        role: value,
        semester: value === "STUDENT" ? prev.semester : "",
        registrationNumber: value === "STUDENT" ? prev.registrationNumber : "",
        facultyId: value === "FACULTY" ? prev.facultyId : "",
      }));
    }

    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (!formData.fullName || formData.fullName.length < 2) {
      setError("Name must be at least 2 characters");
      return false;
    }
    if (!formData.email || !formData.email.includes("@")) {
      setError("Please enter a valid email");
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.department) {
      setError("Department is required");
      return false;
    }
    if (formData.role === "STUDENT" && !formData.registrationNumber) {
      setError("Registration number is required for students");
      return false;
    }
    if (formData.role === "STUDENT" && !formData.semester) {
      setError("Semester is required for students");
      return false;
    }
    if (formData.role === "FACULTY" && !formData.facultyId) {
      setError("Faculty ID is required for faculty");
      return false;
    }
    if (!computedAcademicYear) {
      setError("Enter a valid 4-digit start year to generate academic year");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department || null,
        semester: formData.semester ? parseInt(formData.semester) : null,
        academicYear: computedAcademicYear || null,
        registrationNumber: formData.registrationNumber || null,
        facultyId: formData.facultyId || null,
        age: formData.age ? parseInt(formData.age, 10) : null,
        mobileNumber: formData.mobileNumber || null,
        address: formData.address || null,
        bloodGroup: formData.bloodGroup || null,
      };

      await userService.createUser(userData);
      setSuccess("User created successfully!");
      setTimeout(() => {
        navigate("/admin/users");
      }, 1500);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create user";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create User">
      <div className="page-container">
        <div className="form-container glass-card">
          <h2>Create New User</h2>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {metaLoading && <div className="loading">Loading form metadata...</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="STUDENT">Student</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select department</option>
                  {meta.departments.map((dept) => (
                    <option key={dept.id} value={dept.code || dept.name}>
                      {dept.code ? `${dept.code} - ${dept.name}` : dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startYear">Academic Start Year *</label>
                <input
                  type="number"
                  id="startYear"
                  name="startYear"
                  value={formData.startYear}
                  onChange={handleChange}
                  placeholder="e.g., 2026"
                  className="form-input"
                  min="2000"
                  max="2100"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="academicYear">Academic Year</label>
                <input
                  type="text"
                  id="academicYear"
                  name="academicYear"
                  value={computedAcademicYear}
                  readOnly
                  placeholder="Auto generated"
                  className="form-input"
                />
              </div>
            </div>

            {formData.role === "STUDENT" && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="registrationNumber">Registration Number *</label>
                  <input
                    type="text"
                    id="registrationNumber"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="Enter registration number"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="semester">Semester *</label>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select semester</option>
                    {meta.semesters.map((value) => (
                      <option key={value} value={value}>Semester {value}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {formData.role === "FACULTY" && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="facultyId">Faculty ID *</label>
                  <input
                    type="text"
                    id="facultyId"
                    name="facultyId"
                    value={formData.facultyId}
                    onChange={handleChange}
                    placeholder="Enter faculty ID"
                    className="form-input"
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="form-input"
                  min="1"
                  max="120"
                />
              </div>

              <div className="form-group">
                <label htmlFor="mobileNumber">Mobile Number</label>
                <input
                  type="text"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bloodGroup">Blood Group</label>
                <input
                  type="text"
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  placeholder="e.g., O+"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
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
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CreateUserPage;

