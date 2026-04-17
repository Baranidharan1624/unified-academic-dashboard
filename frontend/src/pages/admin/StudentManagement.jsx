import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { userService } from "../../services/userService";
import { peekCached } from "../../services/apiClient";
import "../../assets/css/dashboard.css";

const initialStudentRows = peekCached("/admin/users?role=STUDENT");
const initialStudentMeta = peekCached("/admin/users/meta");

function StudentManagement() {
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(!Array.isArray(initialStudentRows));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [meta, setMeta] = useState(() => {
    if (initialStudentMeta && typeof initialStudentMeta === "object") {
      return {
        departments: initialStudentMeta.departments || [],
        semesters: initialStudentMeta.semesters || [1, 2, 3, 4, 5, 6, 7, 8],
      };
    }
    return { departments: [], semesters: [1, 2, 3, 4, 5, 6, 7, 8] };
  });
  const [students, setStudents] = useState(() => (Array.isArray(initialStudentRows) ? initialStudentRows : []));
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [registerSortDirection, setRegisterSortDirection] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const actionMenuRef = useRef(null);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMeta = async () => {
      if (initialStudentMeta) {
        return;
      }
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
    if (!Array.isArray(initialStudentRows)) {
      fetchStudents();
    }
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

  const fetchStudents = async () => {
    try {
      setTableLoading(true);
      const data = await userService.getUsersByRole("STUDENT");
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      setStudents([]);
      setError("Failed to load students");
    } finally {
      setTableLoading(false);
    }
  };

  const handleStatusChange = async (studentId, newStatus) => {
    // Find the student and store original status for rollback
    const student = students.find(s => s.id === studentId);
    const originalStatus = student?.status || "INACTIVE";

    // Update local state immediately (no flash)
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus } : s));
    setStatusUpdating(studentId);
    
    try {
      await userService.updateUser(studentId, { status: newStatus });
      setSuccess("Status updated successfully!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      // Rollback on error
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: originalStatus } : s));
      setError(err.response?.data?.error || "Failed to update status");
      setTimeout(() => setError(""), 2000);
    } finally {
      setStatusUpdating(null);
    }
  };

  const classOptions = useMemo(() => {
    return Array.from(
      new Set(students.map((student) => (student.academicYear || "").trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
  }, [students]);

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return students
      .filter((student) => {
        const regNo = (student.registrationNumber || student.studentId || "").toString();
        const name = (student.fullName || student.name || "").toString();
        const department = (student.department || "").toString();
        const classYear = (student.academicYear || "").toString();

        const matchesDepartment = !departmentFilter || department === departmentFilter;
        const matchesClass = !classFilter || classYear === classFilter;
        const matchesSearch =
          !query ||
          regNo.toLowerCase().includes(query) ||
          name.toLowerCase().includes(query);

        return matchesDepartment && matchesClass && matchesSearch;
      })
      .sort((a, b) => {
        if (registerSortDirection) {
          const leftReg = (a.registrationNumber || a.studentId || "").toString();
          const rightReg = (b.registrationNumber || b.studentId || "").toString();
          const regCompare = leftReg.localeCompare(rightReg, undefined, {
            numeric: true,
            sensitivity: "base",
          });
          return registerSortDirection === "asc" ? regCompare : -regCompare;
        }

        const deptCompare = (a.department || "").localeCompare(b.department || "", undefined, {
          numeric: true,
          sensitivity: "base",
        });
        if (deptCompare !== 0) return deptCompare;

        const classCompare = (a.academicYear || "").localeCompare(b.academicYear || "", undefined, {
          numeric: true,
          sensitivity: "base",
        });
        if (classCompare !== 0) return classCompare;

        return (a.fullName || a.name || "").localeCompare(b.fullName || b.name || "", undefined, {
          numeric: true,
          sensitivity: "base",
        });
      });
  }, [students, departmentFilter, classFilter, searchTerm, registerSortDirection]);

  return (
    <DashboardLayout title="Student Management">
      <div className="page-container">
        <h2>Student Management</h2>

        {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        {success && <div className="success-message" style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}

        <div className="table-card" style={{ marginTop: "0.8rem" }}>
          <h3>Students</h3>

          <div className="page-actions course-sort-controls" style={{ gap: "0.6rem", marginBottom: "0.8rem", flexWrap: "wrap" }}>
            <select className="course-sort-select" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              <option value="">Department</option>
              {meta.departments.map((dept) => (
                <option key={dept.id} value={dept.code || dept.name}>
                  {dept.code || dept.name}
                </option>
              ))}
            </select>

            <select className="course-sort-select" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="">Class</option>
              {classOptions.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>

            <input
              className="course-sort-select"
              placeholder="Search name or register number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <table>
            <thead>
              <tr>
                <th
                  onClick={() => setRegisterSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  Register Number {registerSortDirection === "asc" ? "▲" : registerSortDirection === "desc" ? "▼" : ""}
                </th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Section</th>
                <th>Academic Year</th>
                <th>Semester</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tableLoading ? (
                <tr>
                  <td colSpan="7">Loading students...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7">No students found</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.registrationNumber || student.studentId || "-"}</td>
                    <td>{student.fullName || student.name || "-"}</td>
                    <td>{student.department || "-"}</td>
                    <td>{student.section || "-"}</td>
                    <td>{student.academicYear || "-"}</td>
                    <td>{student.semester || "-"}</td>
                    <td>
                      {(() => {
                        const currentStatus = student.status || "INACTIVE";
                        return (
                          <button
                            onClick={() => handleStatusChange(student.id, currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                            disabled={statusUpdating === student.id}
                            style={{
                              padding: "0.35rem 1rem",
                              borderRadius: "0.25rem",
                              border: "none",
                              backgroundColor: currentStatus === "ACTIVE" ? "#4CAF50" : "#ff6b6b",
                              color: "white",
                              cursor: statusUpdating === student.id ? "not-allowed" : "pointer",
                              fontWeight: 600,
                              fontSize: "0.85rem",
                              opacity: statusUpdating === student.id ? 0.6 : 1,
                              transition: "background-color 0.3s ease"
                            }}
                          >
                            {statusUpdating === student.id ? "..." : currentStatus}
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
                  navigate("/admin/students/create");
                  setShowActionMenu(false);
                }}
              >
                Create Student
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  navigate("/admin/students/import");
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

export default StudentManagement;

