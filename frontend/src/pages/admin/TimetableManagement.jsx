import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { getTimetableEntries, getRooms, generateAutomaticTimetable } from "../../services/timetableService";
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

function TimetableManagement() {
  const navigate = useNavigate();
  const [timetableData, setTimetableData] = useState([]);
  const [sectionGroups, setSectionGroups] = useState([]);
  const [selectedSectionKey, setSelectedSectionKey] = useState(null);
  const [roomData, setRoomData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    semester: "",
    section: "",
  });
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections] = useState(["A", "B", "C"]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [timetableEntries, rooms] = await Promise.all([getTimetableEntries(), getRooms()]);
      const uniqueDepartments = Array.from(
        new Set(timetableEntries.map((entry) => entry.department).filter(Boolean))
      ).map((code, index) => ({ id: index + 1, code, name: code }));

      setDepartments(uniqueDepartments);
      setSemesters([1, 2, 3, 4, 5, 6, 7, 8]);
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
      if (filters.department && entry.department !== filters.department)
        return false;
      if (filters.semester && entry.semester !== filters.semester.toString())
        return false;
      if (filters.section && entry.section !== filters.section)
        return false;
      return true;
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

  const renderEmptyState = () => (
    <div className="timetable-empty-state">
      <div className="empty-content">
        <div className="empty-icon">📅</div>
        <h2>No Timetable Generated Yet</h2>
        <p>Generate or create a timetable to get started</p>
        <div className="empty-actions">
          <button className="btn-create-timetable" onClick={handleGenerateTimetable} disabled={generating}>
            {generating ? "Generating..." : "Generate Timetable"}
          </button>
        </div>
      </div>
    </div>
  );

  const filteredData = getFilteredTimetable();

  const selectedSection = sectionGroups.find((group) => group.key === selectedSectionKey) || null;

  const handleGenerateTimetable = async () => {
    try {
      setGenerating(true);
      setError("");
      setSuccess("");

      await generateAutomaticTimetable();
      const [refreshedEntries, refreshedRooms] = await Promise.all([
        getTimetableEntries(),
        getRooms(),
      ]);

      const safeEntries = Array.isArray(refreshedEntries) ? refreshedEntries : [];
      const safeRooms = Array.isArray(refreshedRooms) ? refreshedRooms : [];
      setTimetableData(safeEntries);
      setRoomData(safeRooms);

      const groups = buildSectionGroups(safeEntries, safeRooms);
      setSectionGroups(groups.length > 0 ? groups : buildConfiguredSectionGroups(safeRooms));

      // Clear restrictive filters after generation so new data appears immediately.
      setFilters({ department: "", semester: "", section: "" });
      setSelectedSectionKey(null);
      setSuccess(`Timetable generated successfully. ${safeEntries.length} active entries loaded.`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to generate timetable");
    } finally {
      setGenerating(false);
    }
  };

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

  if (selectedSection) {
    return (
      <DashboardLayout title="Timetable Management">
        <div className="timetable-container full-width">
          {error && <div className="alert alert-error">{error}</div>}
          {renderSectionTimetable()}
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
                  onClick={handleGenerateTimetable}
                  disabled={generating}
                >
                  {generating ? "Generating..." : "➕ Generate Timetable"}
                </button>
              </div>
            </div>

            {sectionGroups.length > 0 && (
              <div className="section-cards-panel">
                <h4>Select a section to view full timetable</h4>
                <div className="section-cards-grid">
                  {sectionGroups.map((group) => (
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

            {sectionGroups.length === 0 && roomData.length > 0 && (
              <div className="section-cards-panel">
                <h4>Select a section to view full timetable</h4>
                <div className="section-cards-grid">
                  {buildConfiguredSectionGroups(roomData).map((group) => (
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

            {filteredData.length === 0 ? (
              <div className="no-data-message">
                No timetable entries match your filters
              </div>
            ) : (
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
                        const entry = filteredData.find(
                          (e) =>
                            e.dayOfWeek === day &&
                            (e.periodNumber === period.period ||
                              getPeriodFromStartTime(e.startTime) === period.period)
                        );
                        return (
                          <div
                            key={`${day}-${period.period}`}
                            className="timetable-cell"
                          >
                            {entry && (
                              <div className="cell-content">
                                <div className="course-name">
                                  {entry.courseCode}
                                </div>
                                <div className="faculty-name">
                                  {entry.facultyName}
                                </div>
                                <div className="room-info">
                                  {entry.roomNumber}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        className="fab-create-timetable"
        onClick={() => navigate("/admin/timetable/generate")}
        title="Create Timetable"
      >
        ➕
      </button>
    </DashboardLayout>
  );
}

export default TimetableManagement;
