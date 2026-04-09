import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { userService } from "../../services/userService";
import "../../assets/css/dashboard.css";

function FacultyManagement() {
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [meta, setMeta] = useState({ departments: [], semesters: [1, 2, 3, 4, 5, 6, 7, 8] });
  const [faculty, setFaculty] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyIdSortDirection, setFacultyIdSortDirection] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const actionMenuRef = useRef(null);
  const [statusUpdating, setStatusUpdating] = useState(null);
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
      }
    };

    loadMeta();
    fetchFaculty();
  }, []);

  useEffect(() => {
    const onOutsideClick = (event) => {
      if (!showActionMenu) return;
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setShowActionMenu(false);
      }
    };

    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [showActionMenu]);

  const fetchFaculty = async () => {
    try {
      setTableLoading(true);
      const facultyData = await userService.getUsersByRole("FACULTY");
      setFaculty(Array.isArray(facultyData) ? facultyData : []);
    } catch {
      setFaculty([]);
      setError("Failed to load faculty");
    } finally {
      setTableLoading(false);
    }
  };

  const handleStatusChange = async (facultyId, newStatus) => {
    // Find the faculty and store original status for rollback
    const fac = faculty.find(f => f.id === facultyId);
    const originalStatus = fac?.status || "INACTIVE";

    // Update local state immediately (no flash)
    setFaculty(prev => prev.map(f => f.id === facultyId ? { ...f, status: newStatus } : f));
    setStatusUpdating(facultyId);
    
    try {
      await userService.updateUser(facultyId, { status: newStatus });
      setSuccess("Status updated successfully!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      // Rollback on error
      setFaculty(prev => prev.map(f => f.id === facultyId ? { ...f, status: originalStatus } : f));
      setError(err.response?.data?.error || "Failed to update status");
      setTimeout(() => setError(""), 2000);
    } finally {
      setStatusUpdating(null);
    }
  };

  const filteredFaculty = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return faculty
      .filter((f) => {
        const facultyId = (f.facultyId || f.faculty_id || f.id || "").toString();
        const name = (f.fullName || f.name || "").toString();
        const department = (f.department || "").toString();
        const matchesDepartment = !departmentFilter || department === departmentFilter;
        const matchesSearch =
          !query ||
          facultyId.toLowerCase().includes(query) ||
          name.toLowerCase().includes(query);

        return matchesDepartment && matchesSearch;
      })
      .sort((a, b) => {
        if (facultyIdSortDirection) {
          const leftId = (a.facultyId || a.faculty_id || a.id || "").toString();
          const rightId = (b.facultyId || b.faculty_id || b.id || "").toString();
          const idCompare = leftId.localeCompare(rightId, undefined, {
            numeric: true,
            sensitivity: "base",
          });
          return facultyIdSortDirection === "asc" ? idCompare : -idCompare;
        }

        const deptCompare = (a.department || "").localeCompare(b.department || "", undefined, {
          numeric: true,
          sensitivity: "base",
        });
        if (deptCompare !== 0) return deptCompare;

        return (a.fullName || a.name || "").localeCompare(b.fullName || b.name || "", undefined, {
          numeric: true,
          sensitivity: "base",
        });
      });
  }, [faculty, departmentFilter, searchTerm, facultyIdSortDirection]);

  return (
    <DashboardLayout title="Faculty Management">
      <div className="page-container">
        <h2>Faculty Management</h2>

        {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        {success && <div className="success-message" style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}

        <div className="table-card" style={{ marginTop: "0.8rem" }}>
          <h3>Faculty</h3>

          <div className="page-actions course-sort-controls" style={{ gap: "0.6rem", marginBottom: "0.8rem", flexWrap: "wrap" }}>
            <select className="course-sort-select" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              <option value="">Department</option>
              {meta.departments.map((dept) => (
                <option key={dept.id} value={dept.code || dept.name}>
                  {dept.code || dept.name}
                </option>
              ))}
            </select>

            <input
              className="course-sort-select"
              placeholder="Search name or faculty id"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <table>
            <thead>
              <tr>
                <th
                  onClick={() => setFacultyIdSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  Faculty ID {facultyIdSortDirection === "asc" ? "▲" : facultyIdSortDirection === "desc" ? "▼" : ""}
                </th>
                <th>Faculty Name</th>
                <th>Department</th>
                  <th>Course Handling</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tableLoading ? (
                <tr>
                    <td colSpan="5">Loading faculty...</td>
                </tr>
              ) : filteredFaculty.length === 0 ? (
                <tr>
                    <td colSpan="5">No faculty found</td>
                </tr>
              ) : (
                filteredFaculty.map((f) => (
                  <tr key={f.id}>
                    <td>{f.facultyId || f.faculty_id || f.id || "-"}</td>
                    <td>{f.fullName || f.name || "-"}</td>
                    <td>{f.department || "-"}</td>
                      <td>{f.courseHandling || f.designation || "-"}</td>
                    <td>
                      {(() => {
                        const currentStatus = f.status || "INACTIVE";
                        return (
                          <button
                            onClick={() => handleStatusChange(f.id, currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                            disabled={statusUpdating === f.id}
                            style={{
                              padding: "0.35rem 1rem",
                              borderRadius: "0.25rem",
                              border: "none",
                              backgroundColor: currentStatus === "ACTIVE" ? "#4CAF50" : "#ff6b6b",
                              color: "white",
                              cursor: statusUpdating === f.id ? "not-allowed" : "pointer",
                              fontWeight: 600,
                              fontSize: "0.85rem",
                              opacity: statusUpdating === f.id ? 0.6 : 1,
                              transition: "background-color 0.3s ease"
                            }}
                          >
                            {statusUpdating === f.id ? "..." : currentStatus}
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          ref={actionMenuRef}
          className="course-floating-add"
          style={{
            position: "fixed",
            bottom: "18px",
            zIndex: 2000,
          }}
        >
          <button
            type="button"
            className="primary-btn"
            onClick={() => setShowActionMenu((prev) => !prev)}
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "999px",
              padding: 0,
              fontSize: "30px",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            +
          </button>

          {showActionMenu && (
            <div
              className="glass-card course-floating-menu"
              style={{
                position: "absolute",
                bottom: "62px",
                minWidth: "190px",
                padding: "0.55rem",
                zIndex: 2100,
                display: "grid",
                gap: "0.45rem",
              }}
            >
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  navigate("/admin/faculty/create");
                  setShowActionMenu(false);
                }}
              >
                Create Faculty
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  navigate("/admin/faculty/import");
                  setShowActionMenu(false);
                }}
                disabled={loading}
              >
                Import Excel
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default FacultyManagement;
