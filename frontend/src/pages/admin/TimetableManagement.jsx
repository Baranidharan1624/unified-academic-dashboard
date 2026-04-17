import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { getTimetableEntries, getRooms } from "../../services/timetableService";
import "../../assets/css/dashboard.css";
import "../../assets/css/timetable.css";

const PERIODS = [
  { period: 1, start: "8:00", end: "8:50" },
  { period: 2, start: "8:50", end: "9:40" },
  { period: 3, start: "10:10", end: "11:00" },
  { period: 4, start: "11:00", end: "11:50" },
  { period: 5, start: "11:50", end: "12:40" },
  { period: 6, start: "1:30", end: "2:15" },
  { period: 7, start: "2:15", end: "3:00" },
];

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

const normalizeValue = (value) => String(value || "").trim();

const buildRoomIndex = (rooms) => {
  const index = new Map();

  rooms.forEach((room) => {
    if (room?.id != null) {
      index.set(`id:${room.id}`, room);
    }
    if (room?.roomNumber) {
      index.set(`room:${normalizeValue(room.roomNumber).toUpperCase()}`, room);
    }
  });

  return index;
};

const formatSectionTitle = (department, section) => {
  if (department && section) return `${department} ${section}`;
  if (department) return department;
  if (section) return `Section ${section}`;
  return "Unmapped Section";
};

const buildConfiguredSectionGroups = (rooms) => {
  const groups = new Map();

  rooms.forEach((room) => {
    const department = normalizeValue(room?.assignedDepartment).toUpperCase();
    const semester = normalizeValue(room?.assignedSemester);
    const section = normalizeValue(room?.assignedSection).toUpperCase();

    if (!department || !semester || !section) {
      return;
    }

    const key = `${department}|${semester}|${section}`;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        department,
        semester,
        section,
        title: formatSectionTitle(department, section),
        subtitle: `Semester ${semester}`,
        entries: [],
      });
    }
  });

  return Array.from(groups.values()).sort((a, b) => {
    const byDept = a.department.localeCompare(b.department);
    if (byDept !== 0) return byDept;
    const bySem = Number(a.semester || 0) - Number(b.semester || 0);
    if (bySem !== 0) return bySem;
    return a.section.localeCompare(b.section);
  });
};

const getPeriodFromStartTime = (startTime) => {
  if (!startTime) return null;
  const value = String(startTime).slice(0, 5);
  const map = {
    "08:00": 1,
    "08:50": 2,
    "10:10": 3,
    "11:00": 4,
    "11:50": 5,
    "13:30": 6,
    "14:15": 7,
  };
  return map[value] ?? null;
};

const buildSectionGroups = (entries, rooms = []) => {
  const roomIndex = buildRoomIndex(rooms);
  const grouped = new Map();

  entries.forEach((entry) => {
    const room = entry?.roomId != null ? roomIndex.get(`id:${entry.roomId}`) : null;
    const fallbackRoom = !room && entry?.roomNumber ? roomIndex.get(`room:${normalizeValue(entry.roomNumber).toUpperCase()}`) : null;
    const resolvedRoom = room || fallbackRoom;

    const department = normalizeValue(entry.department || resolvedRoom?.assignedDepartment).toUpperCase();
    const semester = normalizeValue(entry.semester || resolvedRoom?.assignedSemester);
    const section = normalizeValue(entry.section || resolvedRoom?.assignedSection).toUpperCase();
    const key = `${department || "NA"}|${semester || "NA"}|${section || "NA"}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        department,
        semester,
        section,
        title: formatSectionTitle(department, section),
        entries: [],
      });
    }

    grouped.get(key).entries.push(entry);
  });

  return Array.from(grouped.values())
    .map((group) => ({
      ...group,
      subtitle: [group.semester ? `Semester ${group.semester}` : null, `${group.entries.length} classes`]
        .filter(Boolean)
        .join(" • "),
    }))
    .sort((a, b) => {
      const byDept = a.department.localeCompare(b.department);
      if (byDept !== 0) return byDept;
      const bySem = Number(a.semester || 0) - Number(b.semester || 0);
      if (bySem !== 0) return bySem;
      return a.section.localeCompare(b.section);
    });
};

const matchesFilters = (group, filters) => {
  const groupDepartment = normalizeValue(group.department).toUpperCase();
  const groupSemester = normalizeValue(group.semester);
  const groupSection = normalizeValue(group.section).toUpperCase();

  const filterDepartment = normalizeValue(filters.department).toUpperCase();
  const filterSemester = normalizeValue(filters.semester);
  const filterSection = normalizeValue(filters.section).toUpperCase();

  if (filterDepartment && groupDepartment !== filterDepartment) return false;
  if (filterSemester && groupSemester !== filterSemester) return false;
  if (filterSection && groupSection !== filterSection) return false;

  return true;
};

const buildFacultyGroups = (entries) => {
  const grouped = new Map();

  entries.forEach((entry) => {
    const facultyId = entry?.facultyId ?? "NA";
    const facultyName = normalizeValue(entry?.facultyName) || "Unknown Faculty";
    const key = `${facultyId}|${facultyName}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        facultyId,
        facultyName,
        title: facultyName,
        entries: [],
      });
    }

    grouped.get(key).entries.push(entry);
  });

  return Array.from(grouped.values())
    .map((group) => {
      const activeDays = new Set(group.entries.map((item) => item.dayOfWeek).filter(Boolean)).size;
      return {
        ...group,
        subtitle: `${group.entries.length} classes • ${activeDays} active days`,
      };
    })
    .sort((a, b) => a.facultyName.localeCompare(b.facultyName));
};

function TimetableManagement() {
  const [timetableData, setTimetableData] = useState([]);
  const [sectionGroups, setSectionGroups] = useState([]);
  const [selectedSectionKey, setSelectedSectionKey] = useState(null);
  const [selectedFacultyKey, setSelectedFacultyKey] = useState(null);
  const [viewMode, setViewMode] = useState("student");
  const [roomData, setRoomData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    semester: "",
    section: "",
  });
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timer = loading ? setTimeout(() => setShowLoader(true), 1000) : null;
    return () => timer && clearTimeout(timer);
  }, [loading]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setShowLoader(false);
      const [timetableEntries, rooms] = await Promise.all([getTimetableEntries(), getRooms()]);
      const uniqueDepartments = Array.from(
        new Set(timetableEntries.map((entry) => entry.department).filter(Boolean))
      ).map((code, index) => ({ id: index + 1, code, name: code }));
      const uniqueSemesters = Array.from(
        new Set(
          timetableEntries
            .map((entry) => normalizeValue(entry.semester))
            .filter(Boolean)
        )
      )
        .map((value) => Number(value))
        .filter((value) => !Number.isNaN(value))
        .sort((a, b) => a - b);
      const uniqueSections = Array.from(
        new Set(
          timetableEntries
            .map((entry) => normalizeValue(entry.section).toUpperCase())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b));

      setDepartments(uniqueDepartments);
      setSemesters(uniqueSemesters.length > 0 ? uniqueSemesters : [1, 2, 3, 4, 5, 6, 7, 8]);
      setSections(uniqueSections.length > 0 ? uniqueSections : ["A", "B", "C"]);
      setTimetableData(timetableEntries);
      const safeRooms = Array.isArray(rooms) ? rooms : [];
      setRoomData(safeRooms);
      const groups = buildSectionGroups(timetableEntries, safeRooms);
      setSectionGroups(groups.length > 0 ? groups : buildConfiguredSectionGroups(safeRooms));
      setError("");
      setSuccess("");
    } catch {
      setError("Failed to load timetable data");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const getFilteredTimetable = () => {
    return timetableData.filter((entry) => {
      const entryDepartment = normalizeValue(entry.department).toUpperCase();
      const entrySemester = normalizeValue(entry.semester);
      const entrySection = normalizeValue(entry.section).toUpperCase();

      if (filters.department && entryDepartment !== normalizeValue(filters.department).toUpperCase())
        return false;
      if (filters.semester && entrySemester !== normalizeValue(filters.semester))
        return false;
      if (filters.section && entrySection !== normalizeValue(filters.section).toUpperCase())
        return false;
      return true;
    });
  };

  const renderEmptyState = () => (
    <div className="timetable-empty-state">
      <div className="empty-content">
        <div className="empty-icon">📅</div>
        <h2>No Timetable Generated Yet</h2>
        <p>No timetable entries found in database. Seed/import timetable data and refresh.</p>
        <div className="empty-actions">
          <button className="btn-create-timetable" onClick={fetchInitialData} disabled={loading}>
            {loading ? (
              <span className="btn-loading-content">
                <span className="btn-inline-spinner" aria-hidden="true" />
                Reloading...
              </span>
            ) : (
              "Reload Timetable"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const filteredData = getFilteredTimetable();

  const filteredFacultyEntries = useMemo(
    () =>
      timetableData.filter((entry) => {
        const entryDepartment = normalizeValue(entry.department).toUpperCase();
        const entrySemester = normalizeValue(entry.semester);

        if (filters.department && entryDepartment !== normalizeValue(filters.department).toUpperCase()) {
          return false;
        }
        if (filters.semester && entrySemester !== normalizeValue(filters.semester)) {
          return false;
        }
        return true;
      }),
    [timetableData, filters.department, filters.semester]
  );

  const filteredSectionGroups = useMemo(
    () => {
      const needle = normalizeValue(searchTerm).toUpperCase();
      return sectionGroups
        .filter((group) => matchesFilters(group, filters))
        .filter((group) => {
          if (!needle) return true;
          const facultyNames = Array.from(
            new Set(group.entries.map((entry) => normalizeValue(entry.facultyName)).filter(Boolean))
          ).join(" ");
          const courseCodes = Array.from(
            new Set(group.entries.map((entry) => normalizeValue(entry.courseCode)).filter(Boolean))
          ).join(" ");
          const haystack = [
            group.title,
            group.department,
            group.semester,
            group.section,
            group.subtitle,
            facultyNames,
            courseCodes,
          ]
            .map((value) => normalizeValue(value).toUpperCase())
            .join(" ");
          return haystack.includes(needle);
        });
    },
    [sectionGroups, filters, searchTerm]
  );

  const facultyGroups = useMemo(() => {
    const needle = normalizeValue(searchTerm).toUpperCase();
    return buildFacultyGroups(filteredFacultyEntries).filter((group) => {
      if (!needle) return true;
      const sampleCourseCodes = Array.from(
        new Set(group.entries.map((entry) => normalizeValue(entry.courseCode)).filter(Boolean))
      )
        .slice(0, 5)
        .join(" ");

      const haystack = [
        group.facultyName,
        group.facultyId,
        group.subtitle,
        sampleCourseCodes,
      ]
        .map((value) => normalizeValue(value).toUpperCase())
        .join(" ");

      return haystack.includes(needle);
    });
  }, [filteredFacultyEntries, searchTerm]);

  const selectedSection = sectionGroups.find((group) => group.key === selectedSectionKey) || null;
  const selectedFaculty = facultyGroups.find((group) => group.key === selectedFacultyKey) || null;

  useEffect(() => {
    if (!selectedSectionKey) return;
    const existsInFiltered = filteredSectionGroups.some((group) => group.key === selectedSectionKey);
    if (!existsInFiltered) {
      setSelectedSectionKey(null);
    }
  }, [filteredSectionGroups, selectedSectionKey]);

  useEffect(() => {
    if (!selectedFacultyKey) return;
    const existsInFiltered = facultyGroups.some((group) => group.key === selectedFacultyKey);
    if (!existsInFiltered) {
      setSelectedFacultyKey(null);
    }
  }, [facultyGroups, selectedFacultyKey]);

  useEffect(() => {
    setSelectedSectionKey(null);
    setSelectedFacultyKey(null);
  }, [viewMode]);

  const renderSectionTimetable = () => {
    if (!selectedSection) return null;

    return (
      <div className="section-timetable-view">
        <div className="section-view-header">
          <button type="button" className="btn-back-sections" onClick={() => setSelectedSectionKey(null)}>
            ← Back to Sections
          </button>
          <div>
            <h3>{selectedSection.title}</h3>
            <p>{selectedSection.subtitle}</p>
          </div>
        </div>

        <div className="timetable-grid-wrapper">
          <div className="timetable-grid">
            <div className="timetable-header">
              <div className="time-col">Time</div>
              {DAYS.map((day) => (
                <div key={day} className="day-col">
                  {day}
                </div>
              ))}
            </div>

            {PERIODS.map((period) => (
              <div key={period.period} className="timetable-row">
                <div className="period-time">
                  <div className="period-num">P{period.period}</div>
                  <div className="period-time-range">
                    {period.start} - {period.end}
                  </div>
                </div>
                {DAYS.map((day) => {
                  const entry = selectedSection.entries.find(
                    (item) =>
                      item.dayOfWeek === day &&
                      (item.periodNumber === period.period || getPeriodFromStartTime(item.startTime) === period.period)
                  );

                  return (
                    <div key={`${day}-${period.period}`} className="timetable-cell">
                      {entry && (
                        <div className="cell-content">
                          <div className="course-name">{entry.courseCode}</div>
                          <div className="faculty-name">{entry.facultyName}</div>
                          <div className="room-info">{entry.roomNumber}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFacultyTimetable = () => {
    if (!selectedFaculty) return null;

    return (
      <div className="section-timetable-view">
        <div className="section-view-header">
          <button type="button" className="btn-back-sections" onClick={() => setSelectedFacultyKey(null)}>
            ← Back to Faculty
          </button>
          <div>
            <h3>{selectedFaculty.title}</h3>
            <p>{selectedFaculty.subtitle}</p>
          </div>
        </div>

        <div className="timetable-grid-wrapper">
          <div className="timetable-grid">
            <div className="timetable-header">
              <div className="time-col">Time</div>
              {DAYS.map((day) => (
                <div key={day} className="day-col">
                  {day}
                </div>
              ))}
            </div>

            {PERIODS.map((period) => (
              <div key={period.period} className="timetable-row">
                <div className="period-time">
                  <div className="period-num">P{period.period}</div>
                  <div className="period-time-range">
                    {period.start} - {period.end}
                  </div>
                </div>
                {DAYS.map((day) => {
                  const entry = selectedFaculty.entries.find(
                    (item) =>
                      item.dayOfWeek === day &&
                      (item.periodNumber === period.period || getPeriodFromStartTime(item.startTime) === period.period)
                  );

                  return (
                    <div key={`${day}-${period.period}`} className="timetable-cell">
                      {entry && (
                        <div className="cell-content">
                          <div className="course-name">{entry.courseCode}</div>
                          <div className="faculty-name">
                            {entry.department} S{entry.semester} {entry.section}
                          </div>
                          <div className="room-info">{entry.roomNumber}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (selectedSection || selectedFaculty) {
    return (
      <DashboardLayout title="Timetable Management">
        <div className="timetable-container full-width">
          {error && <div className="alert alert-error">{error}</div>}
          {selectedSection ? renderSectionTimetable() : renderFacultyTimetable()}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Timetable Management">
      <div className="timetable-container">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {timetableData.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <div className="timetable-controls">
              <div className="filter-group">
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="filter-select"
                >
                  <option value="student">Student Timetable</option>
                  <option value="faculty">Faculty Timetable</option>
                </select>

                <select
                  value={filters.department}
                  onChange={(e) =>
                    handleFilterChange("department", e.target.value)
                  }
                  className="filter-select"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option
                      key={dept.id || dept.code || dept.name}
                      value={dept.code || dept.name}
                    >
                      {dept.code ? `${dept.code} - ${dept.name}` : dept.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.semester}
                  onChange={(e) =>
                    handleFilterChange("semester", e.target.value)
                  }
                  className="filter-select"
                >
                  <option value="">All Semesters</option>
                  {semesters.map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.section}
                  onChange={(e) =>
                    handleFilterChange("section", e.target.value)
                  }
                  className="filter-select"
                  disabled={viewMode === "faculty"}
                >
                  <option value="">All Sections</option>
                  {sections.map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>

                <button
                  className="btn-refresh"
                  onClick={fetchInitialData}
                >
                  🔄 Refresh
                </button>

                <button
                  className="btn-generate"
                  onClick={fetchInitialData}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="btn-loading-content">
                      <span className="btn-inline-spinner" aria-hidden="true" />
                      Reloading...
                    </span>
                  ) : (
                    "Reload from DB"
                  )}
                </button>

                <div className="search-input-wrapper">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="filter-select search-input"
                    placeholder={
                      viewMode === "student"
                        ? "Search section / dept / semester"
                        : "Search faculty / id / course"
                    }
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setSearchTerm("")}
                      aria-label="Clear search"
                      title="Clear"
                    >
                      <span className="search-clear-icon" aria-hidden="true">x</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {showLoader && loading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '12px', color: '#94a3b8' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(99, 102, 241, 0.3)',
                  borderTopColor: '#6366f1',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <span>Loading timetable...</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {viewMode === "student" && filteredSectionGroups.length > 0 && (
              <div className="section-cards-panel">
                <h4>Select a section to view full timetable</h4>
                <div className="section-cards-grid">
                  {filteredSectionGroups.map((group) => (
                    <button
                      key={group.key}
                      type="button"
                      className="section-card"
                      onClick={() => setSelectedSectionKey(group.key)}
                    >
                      <span className="section-card-title">{group.title}</span>
                      <span className="section-card-meta">{group.subtitle}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {viewMode === "student" && filteredSectionGroups.length === 0 && roomData.length > 0 && (
              <div className="section-cards-panel">
                <h4>Select a section to view full timetable</h4>
                <div className="section-cards-grid">
                  {buildConfiguredSectionGroups(roomData)
                    .filter((group) => matchesFilters(group, filters))
                    .map((group) => (
                    <button
                      key={group.key}
                      type="button"
                      className="section-card"
                      onClick={() => setSelectedSectionKey(group.key)}
                    >
                      <span className="section-card-title">{group.title}</span>
                      <span className="section-card-meta">{group.subtitle}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {viewMode === "faculty" && facultyGroups.length > 0 && (
              <div className="section-cards-panel">
                <h4>Select a faculty to view full timetable</h4>
                <div className="section-cards-grid">
                  {facultyGroups.map((group) => (
                    <button
                      key={group.key}
                      type="button"
                      className="section-card"
                      onClick={() => setSelectedFacultyKey(group.key)}
                    >
                      <span className="section-card-title">{group.title}</span>
                      <span className="section-card-meta">{group.subtitle}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!loading && ((viewMode === "student" && filteredSectionGroups.length === 0) || (viewMode === "faculty" && facultyGroups.length === 0)) && (
              <div className="no-data-message">
                No timetable entries match your filters/search
              </div>
            )}
            {!loading && ((viewMode === "student" && filteredSectionGroups.length > 0) || (viewMode === "faculty" && facultyGroups.length > 0)) && (
              <div className="no-data-message">
                Select a {viewMode === "student" ? "section" : "faculty"} card above to view the full timetable.
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default TimetableManagement;
