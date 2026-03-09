import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { userService } from "../../services/userService";
import { api } from "../../services/apiClient";
import "../../assets/css/dashboard.css";

function StudentManagement() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [excelFile, setExcelFile] = useState(null);

  const [formData, setFormData] = useState({
    studentId: "",
    fullName: "",
    email: "",
    department: "",
    semester: "",
    password: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        password: formData.password,
        role: "STUDENT",
        department: formData.department,
        semester: parseInt(formData.semester) || null,
        academicYear: new Date().getFullYear().toString()
      });
      
      setSuccess("Student created successfully! An email has been sent with login credentials.");
      setFormData({
        studentId: "",
        fullName: "",
        email: "",
        department: "",
        semester: "",
        password: ""
      });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to create student");
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async () => {
    if (!excelFile) {
      setError("Please select an Excel file first");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", excelFile);
      formData.append("userType", "student");

      const response = await api.post("/admin/import/users", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setSuccess(`Successfully imported ${response.data.successfulImports} students!`);
      setExcelFile(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload Excel file");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setExcelFile(file);
        setError("");
      } else {
        setError("Please select a valid Excel file (.xlsx or .xls)");
      }
    }
  };

  return (
    <DashboardLayout title="Student Management">
      <div className="page-container">
        <h2>Student Management</h2>

        {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        {success && <div className="success-message" style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}

        <div className="page-actions">
          <button onClick={() => setShowForm(true)} className="primary-btn">
            Create Student
          </button>

          <button className="secondary-btn">
            Upload CSV
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="excel-upload-student"
            />
            <label htmlFor="excel-upload-student" className="secondary-btn" style={{ cursor: 'pointer', margin: 0 }}>
              {excelFile ? excelFile.name : "Upload Excel"}
            </label>
            {excelFile && (
              <button 
                onClick={handleExcelUpload} 
                className="primary-btn"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Import"}
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <div className="form-card">
            <h3>Create Student Account</h3>
            <form className="form-grid" onSubmit={handleSubmit}>
              <input 
                placeholder="Full Name" 
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
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
                placeholder="Department" 
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
              />

              <input 
                placeholder="Year/Semester" 
                name="semester"
                type="number"
                value={formData.semester}
                onChange={handleInputChange}
                required
              />

              <input 
                placeholder="Password" 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </button>
              
              <button 
                type="button" 
                className="secondary-btn" 
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default StudentManagement;

