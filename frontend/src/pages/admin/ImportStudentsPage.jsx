import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { api } from "../../services/apiClient";
import "../../assets/css/dashboard.css";

function ImportStudentsPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.endsWith(".xlsx") && !selected.name.endsWith(".xls")) {
      setError("Please select a valid Excel file (.xlsx or .xls)");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setError("");
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an Excel file first");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userType", "student");

      const response = await api.post("/admin/import/users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(`Successfully imported ${response.data.successfulImports} students!`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => navigate("/admin/students"), 800);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload Excel file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Import Students">
      <div className="page-container">
        <h2>Import Students</h2>
        <div className="form-card" style={{ margin: "0 auto", maxWidth: "560px" }}>
          {error && <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
          {success && <div className="success-message" style={{ color: "green", marginBottom: "10px" }}>{success}</div>}

          <div className="form-grid">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="excel-upload-students"
            />
            <label htmlFor="excel-upload-students" className="secondary-btn" style={{ cursor: "pointer", margin: 0 }}>
              {file ? file.name : "Choose Excel File"}
            </label>
            <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              Expected columns: RegNo, Name, Department, Semester, Section, AcademicYear, Age, Mobile, Email, Address, BloodGroup
            </div>
            {file && (
              <button type="button" className="primary-btn" onClick={handleUpload} disabled={loading}>
                {loading ? "Uploading..." : "Upload Excel"}
              </button>
            )}
            <button type="button" className="secondary-btn" onClick={() => navigate("/admin/students")}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ImportStudentsPage;
