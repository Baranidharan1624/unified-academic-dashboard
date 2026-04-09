import { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  createCourse,
  deleteCourse,
  getCourseDepartments,
  getCourseSemesters,
  getCourses,
  importCourses,
  updateCourse,
} from "../../services/courseService";
import "../../assets/css/dashboard.css";

const initialManualForm = {
  courseName: "",
  courseCode: "",
  departmentId: "",
  semester: "",
  startYear: new Date().getFullYear().toString(),
  credits: "3",
  type: "THEORY",
};

function SearchableSortBox({ value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuFilter, setMenuFilter] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const onOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!menuFilter.trim()) return options;
    const normalized = menuFilter.trim().toLowerCase();
    return options.filter((option) => option.toLowerCase().includes(normalized));
  }, [menuFilter, options]);

  const openMenu = () => {
    // Re-open with full list each time the user taps/clicks the sort box.
    setMenuFilter("");
    setIsOpen(true);
  };

  return (
    <div className="searchable-dropdown" ref={containerRef}>
      <div className="searchable-input-wrap">
        <input
          className="course-sort-select"
          value={value}
          placeholder={placeholder}
          onFocus={openMenu}
          onClick={openMenu}
          onChange={(e) => {
            const nextValue = e.target.value;
            setMenuFilter(nextValue);
            onChange(nextValue);
            setIsOpen(true);
          }}
        />
      </div>

      {isOpen && (
        <div className="searchable-menu">
          <button
            type="button"
            className="searchable-option"
            onClick={() => {
              onChange("");
              setMenuFilter("");
              setIsOpen(false);
            }}
          >
            --
          </button>

          {filteredOptions.map((option) => (
            <button
              key={option}
              type="button"
              className="searchable-option"
              onClick={() => {
                onChange(option);
                setMenuFilter("");
                setIsOpen(false);
              }}
            >
              {option}
            </button>
          ))}

          {filteredOptions.length === 0 && <div className="searchable-empty">No matches found</div>}
        </div>
      )}
    </div>
  );
}

function CourseManagement() {
  const [activeView, setActiveView] = useState("table");
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [manualForm, setManualForm] = useState(initialManualForm);
  const [excelFile, setExcelFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [courseNameFilter, setCourseNameFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");

  const actionMenuRef = useRef(null);

  async function fetchCourses() {
    try {
      const response = await getCourses();
      setCourses(response.data || []);
    } catch {
      setCourses([]);
    }
  }

  useEffect(() => {
    async function loadMeta() {
      try {
        const [deptResponse, semResponse] = await Promise.all([
          getCourseDepartments(),
          getCourseSemesters(),
        ]);
        setDepartments(deptResponse.data || []);
        setSemesters(semResponse.data || [1, 2, 3, 4, 5, 6, 7, 8]);
      } catch {
        setDepartments([]);
        setSemesters([1, 2, 3, 4, 5, 6, 7, 8]);
      }
    }

    loadMeta();
    fetchCourses();
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

  const departmentLabel = (dept) => dept.code || dept.name || "";

  const courseNameOptions = useMemo(
    () => Array.from(new Set(courses.map((course) => course.courseName).filter(Boolean))).sort((left, right) =>
      left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" })
    ),
    [courses]
  );

  const filteredAndSortedCourses = useMemo(() => {
    const normalizedCourseFilter = courseNameFilter.trim().toLowerCase();
    const normalizedDepartmentFilter = departmentFilter.trim().toLowerCase();
    const normalizedSemesterFilter = semesterFilter.trim().toLowerCase();

    const filtered = courses.filter((course) => {
      const courseText = (course.courseName || "").toLowerCase();
      const departmentText = (course.departmentCode || course.departmentName || "").toLowerCase();
      const semesterText = String(course.semester || "");
      const semesterSearchText = `semester ${semesterText}`.toLowerCase();

      const matchesCourse = !normalizedCourseFilter || courseText.includes(normalizedCourseFilter);
      const matchesDept = !normalizedDepartmentFilter || departmentText.includes(normalizedDepartmentFilter);
      const matchesSemester =
        !normalizedSemesterFilter ||
        semesterText.includes(normalizedSemesterFilter) ||
        semesterSearchText.includes(normalizedSemesterFilter);
      return matchesCourse && matchesDept && matchesSemester;
    });

    return filtered.sort((left, right) => {
      const leftDepartment = left.departmentCode || left.departmentName || "";
      const rightDepartment = right.departmentCode || right.departmentName || "";
      const departmentCompare = leftDepartment.localeCompare(rightDepartment, undefined, {
        numeric: true,
        sensitivity: "base",
      });
      if (departmentCompare !== 0) return departmentCompare;

      const courseNameCompare = (left.courseName || "").localeCompare(right.courseName || "", undefined, {
        numeric: true,
        sensitivity: "base",
      });
      if (courseNameCompare !== 0) return courseNameCompare;

      return Number(left.semester || 0) - Number(right.semester || 0);
    });
  }, [courses, courseNameFilter, departmentFilter, semesterFilter]);

  const resetCreateForm = () => {
    setEditId(null);
    setManualForm(initialManualForm);
  };

  const openCreatePage = () => {
    resetCreateForm();
    setShowActionMenu(false);
    setActiveView("create");
  };

  const openImportPage = () => {
    setExcelFile(null);
    setShowActionMenu(false);
    setActiveView("import");
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();

    if (
      !manualForm.courseCode ||
      !manualForm.courseName ||
      !manualForm.departmentId ||
      !manualForm.semester ||
      !manualForm.startYear
    ) {
      setError("Start Year, Department, Semester, Course Code and Course Name are required");
      return;
    }

    const startYear = Number(manualForm.startYear);
    if (!startYear || startYear < 2000) {
      setError("Please enter a valid start year");
      return;
    }

    const academicYear = `${startYear} - ${startYear + 4}`;

    const payload = {
      courseName: manualForm.courseName,
      courseCode: manualForm.courseCode.trim().toUpperCase(),
      credits: Number(manualForm.credits || 3),
      type: manualForm.type || "THEORY",
      departmentId: Number(manualForm.departmentId),
      semester: Number(manualForm.semester),
      academicYear,
      description: null,
    };

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (editId) {
        await updateCourse(editId, payload);
        setSuccess("Course updated successfully");
      } else {
        await createCourse(payload);
        setSuccess("Course created successfully");
      }

      setActiveView("table");
      resetCreateForm();
      await fetchCourses();
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "Failed to save course";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async () => {
    if (!excelFile) {
      setError("Please choose an Excel file (.xlsx)");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("file", excelFile);

      await importCourses(formData);
      setSuccess("");
      setExcelFile(null);
      setActiveView("table");
      await fetchCourses();
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "Bulk import failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      setExcelFile(file);
      setError("");
      return;
    }
    setError("Please select a valid Excel file (.xlsx or .xls)");
  };

  const handleEdit = (course) => {
    setActiveView("create");
    setEditId(course.id);

    const [startYearRaw] = (course.academicYear || "").split("-");
    const parsedStartYear = startYearRaw ? startYearRaw.trim() : String(new Date().getFullYear());

    setManualForm({
      courseName: course.courseName,
      courseCode: course.courseCode,
      departmentId: String(course.departmentId ?? ""),
      semester: String(course.semester ?? ""),
      startYear: parsedStartYear,
      credits: String(course.credits ?? 3),
      type: course.type || "THEORY",
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteCourse(id);
      setSuccess("Course deleted successfully");
      await fetchCourses();
    } catch {
      setError("Failed to delete course");
    }
  };

  return (
    <DashboardLayout title="Course Management">
      <div className="page-container" style={{ position: "relative", paddingBottom: "84px" }}>
        <h2>Course Management</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {activeView === "create" && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "65vh" }}>
            <div className="form-card" style={{ marginBottom: "1rem", width: "100%", maxWidth: "560px" }}>
              <div className="page-actions" style={{ marginBottom: "0.7rem" }}>
                <button type="button" className="secondary-btn" onClick={() => setActiveView("table")}>Back to Courses</button>
              </div>
              <h3>{editId ? "Edit Course" : "Create Course"}</h3>
              <form className="form-grid" onSubmit={handleManualSubmit}>
              <input
                type="number"
                min="2000"
                max="2100"
                value={manualForm.startYear}
                onChange={(e) => setManualForm((prev) => ({ ...prev, startYear: e.target.value }))}
                placeholder="Start Year"
                required
              />
              <select
                value={manualForm.departmentId}
                onChange={(e) => setManualForm((prev) => ({ ...prev, departmentId: e.target.value }))}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {departmentLabel(dept)}
                  </option>
                ))}
              </select>
              <select
                value={manualForm.semester}
                onChange={(e) => setManualForm((prev) => ({ ...prev, semester: e.target.value }))}
                required
              >
                <option value="">Select Semester</option>
                {semesters.map((value) => (
                  <option key={value} value={value}>
                    Semester {value}
                  </option>
                ))}
              </select>
              <input
                value={manualForm.courseCode}
                onChange={(e) => setManualForm((prev) => ({ ...prev, courseCode: e.target.value }))}
                placeholder="Course Code"
                required
              />
              <input
                value={manualForm.courseName}
                onChange={(e) => setManualForm((prev) => ({ ...prev, courseName: e.target.value }))}
                placeholder="Course Name"
                required
              />
              <input
                type="number"
                min="0"
                value={manualForm.credits}
                onChange={(e) => setManualForm((prev) => ({ ...prev, credits: e.target.value }))}
                placeholder="Credits"
                required
              />
              <select
                value={manualForm.type}
                onChange={(e) => setManualForm((prev) => ({ ...prev, type: e.target.value }))}
                required
              >
                <option value="THEORY">Theory</option>
                <option value="LAB">Lab</option>
              </select>
              <button className="primary-btn" type="submit" disabled={loading}>
                {loading ? "Saving..." : editId ? "Update Course" : "Create Course"}
              </button>
              </form>
            </div>
          </div>
        )}

        {activeView === "import" && (
          <div className="glass-card" style={{ marginBottom: "1rem", padding: "1rem" }}>
            <div className="page-actions" style={{ marginBottom: "0.7rem" }}>
              <button type="button" className="secondary-btn" onClick={() => setActiveView("table")}>Back to Courses</button>
            </div>
            <h3>Import Courses from Excel</h3>
            <p style={{ marginTop: "0.5rem", marginBottom: "0.7rem", color: "#6b7280" }}>
              Required columns: Year, Department, Semester, CourseCode, CourseName, Credits, CourseType.
              CourseType must be THEORY or LAB.
            </p>
            <div style={{ marginTop: "0.9rem", display: "inline-flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="excel-upload-course"
              />
              <label htmlFor="excel-upload-course" className="secondary-btn" style={{ cursor: "pointer", margin: 0 }}>
                {excelFile ? excelFile.name : "Upload Excel"}
              </label>
              {excelFile && (
                <button onClick={handleExcelUpload} className="primary-btn" disabled={loading}>
                  {loading ? "Importing..." : "Import"}
                </button>
              )}
            </div>
          </div>
        )}

        {activeView === "table" && (
          <>
          <div className="table-card" style={{ position: "relative", marginTop: "0.5rem" }}>
            <h3>Existing Courses</h3>

            <div className="page-actions course-sort-controls" style={{ gap: "0.6rem", marginBottom: "0.8rem", flexWrap: "wrap" }}>
              <SearchableSortBox
                value={courseNameFilter}
                onChange={setCourseNameFilter}
                options={courseNameOptions}
                placeholder="Course Name"
              />

              <SearchableSortBox
                value={departmentFilter}
                onChange={setDepartmentFilter}
                options={departments.map((dept) => departmentLabel(dept)).filter(Boolean)}
                placeholder="Department"
              />

              <SearchableSortBox
                value={semesterFilter}
                onChange={setSemesterFilter}
                options={semesters.map((value) => `Semester ${value}`)}
                placeholder="Semester"
              />
            </div>

            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Academic Year</th>
                  <th>Credits</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedCourses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.courseCode}</td>
                    <td>{course.courseName}</td>
                    <td>{course.departmentCode || course.departmentName || course.departmentId}</td>
                    <td>{course.semester || "-"}</td>
                    <td>{course.academicYear || "-"}</td>
                    <td>{course.credits}</td>
                    <td>
                      <button className="secondary-btn" onClick={() => handleEdit(course)}>Edit</button>
                      <button className="danger-btn" onClick={() => handleDelete(course.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
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
                  minWidth: "180px",
                  padding: "0.55rem",
                  zIndex: 2100,
                  display: "grid",
                  gap: "0.45rem",
                }}
              >
                <button type="button" className="secondary-btn" onClick={openCreatePage}>
                  Create Course
                </button>
                <button type="button" className="secondary-btn" onClick={openImportPage}>
                  Import Excel
                </button>
              </div>
            )}
          </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CourseManagement;
