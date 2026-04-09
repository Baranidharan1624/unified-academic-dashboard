import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  createTimetableEntry,
  generateAutomaticTimetable,
  getTimetableEntries,
  getRooms,
} from "../../services/timetableService";
import "../../assets/css/dashboard.css";
import "../../assets/css/timetable.css";

const PERIODS = [
  { periodNumber: 1, startTime: "08:00", endTime: "08:50" },
  { periodNumber: 2, startTime: "08:50", endTime: "09:40" },
  { periodNumber: 3, startTime: "10:10", endTime: "11:00" },
  { periodNumber: 4, startTime: "11:00", endTime: "11:50" },
  { periodNumber: 5, startTime: "11:50", endTime: "12:40" },
  { periodNumber: 6, startTime: "13:30", endTime: "14:15" },
  { periodNumber: 7, startTime: "14:15", endTime: "15:00" },
];

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

const getPeriodNumber = (entry) => {
  if (entry?.periodNumber) {
    return Number(entry.periodNumber);
  }

  const value = String(entry?.startTime || "").slice(0, 5);
  const periodMap = {
    "08:00": 1,
    "08:50": 2,
    "10:10": 3,
    "11:00": 4,
    "11:50": 5,
    "13:30": 6,
    "14:15": 7,
  };

  return periodMap[value] ?? null;
};

const buildClassKey = (entry) =>
  [entry?.department || "", entry?.semester || "", entry?.section || ""].join("|");

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

const buildConfiguredClassCards = (rooms) => {
  const groups = new Map();

  rooms.forEach((room) => {
    const department = normalizeValue(room?.assignedDepartment).toUpperCase();
    const semester = normalizeValue(room?.assignedSemester);
    const section = normalizeValue(room?.assignedSection).toUpperCase();

    if (!department || !semester || !section) {
      return;
    }

    const key = [department, semester, section].join("|");
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        department,
        semester,
        section,
        title: `${department} ${section}`,
        subtitle: `Semester ${semester}`,
        entries: [],
      });
    }
  });

  return Array.from(groups.values()).sort((left, right) => {
    if (left.department !== right.department) {
      return left.department.localeCompare(right.department);
    }

    if (Number(left.semester) !== Number(right.semester)) {
      return Number(left.semester) - Number(right.semester);
    }

    return left.section.localeCompare(right.section);
  });
};

const buildRoomAwareClassCards = (entries, rooms) => {
  const roomIndex = buildRoomIndex(rooms);
  const groups = new Map();

  entries.forEach((entry) => {
    const room = entry?.roomId != null ? roomIndex.get(`id:${entry.roomId}`) : null;
    const fallbackRoom = !room && entry?.roomNumber ? roomIndex.get(`room:${normalizeValue(entry.roomNumber).toUpperCase()}`) : null;
    const resolvedRoom = room || fallbackRoom;

    const department = normalizeValue(entry?.department || resolvedRoom?.assignedDepartment).toUpperCase();
    const semester = normalizeValue(entry?.semester || resolvedRoom?.assignedSemester);
    const section = normalizeValue(entry?.section || resolvedRoom?.assignedSection).toUpperCase();

    if (!department || !semester || !section) {
      return;
    }

    const key = [department, semester, section].join("|");
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        department,
        semester,
        section,
        title: `${department} ${section}`,
        subtitle: `Semester ${semester}`,
        entries: [],
      });
    }

    groups.get(key).entries.push(entry);
  });

  const cards = Array.from(groups.values()).sort((left, right) => {
    if (left.department !== right.department) {
      return left.department.localeCompare(right.department);
    }

    if (Number(left.semester) !== Number(right.semester)) {
      return Number(left.semester) - Number(right.semester);
    }

    return left.section.localeCompare(right.section);
  });

  return cards.length > 0 ? cards : buildConfiguredClassCards(rooms);
};

function TimetableGenerationPage() {
  const [activeTab, setActiveTab] = useState("generate");
  const [generatedData, setGeneratedData] = useState([]);
  const [roomData, setRoomData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedClassKey, setSelectedClassKey] = useState("");
  const [manualForm, setManualForm] = useState({
    courseOfferingId: "",
    facultyId: "",
    roomId: "",
    dayOfWeek: "MONDAY",
    startTime: "08:00",
    endTime: "09:00",
  });

  useEffect(() => {
    const loadExistingTimetable = async () => {
      try {
        const [entries, rooms] = await Promise.all([getTimetableEntries(), getRooms()]);
        setGeneratedData(Array.isArray(entries) ? entries : []);
        setRoomData(Array.isArray(rooms) ? rooms : []);
      } catch {
        // Ignore load failures here so generation still works.
      }
    };

    loadExistingTimetable();
  }, []);

  const classCards = useMemo(() => {
    return buildRoomAwareClassCards(generatedData, roomData);
  }, [generatedData, roomData]);

  const selectedClass = useMemo(
    () => classCards.find((classItem) => classItem.key === selectedClassKey) || null,
    [classCards, selectedClassKey]
  );

  const handleGenerateAutomatic = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const generated = await generateAutomaticTimetable();
      const entries = Array.isArray(generated) ? generated : [];
      setGeneratedData(entries);
      const rooms = await getRooms();
      setRoomData(Array.isArray(rooms) ? rooms : []);
      setSelectedClassKey("");
      setSuccess("Timetable generated successfully. Select a class card to view the full timetable.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to generate timetable"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await createTimetableEntry({
        ...manualForm,
        courseOfferingId: Number(manualForm.courseOfferingId),
        facultyId: Number(manualForm.facultyId),
        roomId: Number(manualForm.roomId),
        periodNumber:
          PERIODS.find((period) => period.startTime === manualForm.startTime)?.periodNumber ||
          null,
      });

      const refreshedEntries = await getTimetableEntries();
      setGeneratedData(Array.isArray(refreshedEntries) ? refreshedEntries : []);
      setSuccess("Timetable entry created successfully.");
      setManualForm({
        courseOfferingId: "",
        facultyId: "",
        roomId: "",
        dayOfWeek: "MONDAY",
        startTime: "08:00",
        endTime: "09:00",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to create entry"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderClassTimetable = () => {
    if (!selectedClass) {
      return null;
    }

    return (
      <div className="generation-result" style={{ marginTop: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>{selectedClass.title} Timetable</h3>
            <p style={{ margin: "6px 0 0", color: "#64748b" }}>
              Semester {selectedClass.semester} � {selectedClass.entries.length} entries
            </p>
          </div>
          <button
            type="button"
            className="btn-submit"
            onClick={() => setSelectedClassKey("")}
            style={{ width: "auto" }}
          >
            Back to Class Cards
          </button>
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
              <div key={period.periodNumber} className="timetable-row">
                <div className="period-time">
                  <div className="period-num">P{period.periodNumber}</div>
                  <div className="period-time-range">
                    {period.startTime} - {period.endTime}
                  </div>
                </div>
                {DAYS.map((day) => {
                  const entry = selectedClass.entries.find(
                    (item) =>
                      item.dayOfWeek === day &&
                      getPeriodNumber(item) === period.periodNumber
                  );

                  return (
                    <div key={`${day}-${period.periodNumber}`} className="timetable-cell">
                      {entry && (
                        <div className="cell-content">
                          <div className="course-name">
                            {entry.courseCode || entry.courseName || "Course"}
                          </div>
                          <div className="faculty-name">
                            {entry.facultyName || "Faculty not assigned"}
                          </div>
                          <div className="room-info">
                            {entry.roomNumber || "Room not assigned"}
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
      </div>
    );
  };

  return (
    <DashboardLayout title="Timetable Management">
      <div className="timetable-generation-container">
        <div className="generation-header">
          <h2>Generate / Create Timetable</h2>
        </div>

        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === "generate" ? "active" : ""}`}
            onClick={() => setActiveTab("generate")}
          >
            Auto Generate
          </button>
          <button
            className={`tab-btn ${activeTab === "manual" ? "active" : ""}`}
            onClick={() => setActiveTab("manual")}
          >
            Manual Entry
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="info-box" style={{ marginBottom: "16px" }}>
          <p>
            Automatic generation writes the shared timetable used by students and faculty.
            Manual entry still requires valid backend data.
          </p>
        </div>

        {activeTab === "generate" && (
          <div className="generation-panel">
            <div className="info-box">
              <h3>Automatic Timetable Generation</h3>
              <p>
                This will automatically generate a conflict-free timetable for all
                departments, semesters, and sections based on:
              </p>
              <ul>
                <li>Course assignments (Theory & Lab)</li>
                <li>Faculty availability</li>
                <li>Room/Lab availability</li>
                <li>Time slot constraints</li>
                <li>Lab duration (2 continuous periods)</li>
              </ul>
              <p className="warning">This will overwrite any existing timetable entries.</p>
            </div>

            <button
              className="btn-generate"
              onClick={handleGenerateAutomatic}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Timetable"}
            </button>

            {generatedData.length > 0 && (
              <div className="generation-result">
                <h4>Generation Result</h4>
                <p>Timetable is ready to browse.</p>
                <p>Total entries: {generatedData.length}</p>
                <p>Total classes: {classCards.length}</p>
              </div>
            )}

            {classCards.length > 0 && !selectedClass && (
              <div className="generation-result" style={{ marginTop: "24px" }}>
                <h4>Class Timetables</h4>
                <p>Select a class card to open the full timetable.</p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "16px",
                    marginTop: "16px",
                  }}
                >
                  {classCards.map((classItem) => (
                    <button
                      key={classItem.key}
                      type="button"
                      onClick={() => setSelectedClassKey(classItem.key)}
                      style={{
                        border: "1px solid #dbe3ef",
                        borderRadius: "16px",
                        padding: "20px",
                        background: "#fff",
                        textAlign: "left",
                        cursor: "pointer",
                        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                      }}
                    >
                      <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
                        {classItem.title}
                      </div>
                      <div style={{ marginTop: "8px", color: "#475569" }}>
                        Semester {classItem.semester}
                      </div>
                      <div style={{ marginTop: "4px", color: "#64748b", fontSize: "0.95rem" }}>
                        {classItem.entries.length} periods assigned
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {renderClassTimetable()}
          </div>
        )}

        {activeTab === "manual" && (
          <div className="manual-entry-panel">
            <form onSubmit={handleManualSubmit} className="manual-form">
              <div className="form-group">
                <label>Course Offering *</label>
                <input
                  type="number"
                  value={manualForm.courseOfferingId}
                  onChange={(e) =>
                    setManualForm({
                      ...manualForm,
                      courseOfferingId: e.target.value,
                    })
                  }
                  placeholder="Course Offering ID"
                  required
                />
              </div>

              <div className="form-group">
                <label>Faculty *</label>
                <input
                  type="number"
                  value={manualForm.facultyId}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, facultyId: e.target.value })
                  }
                  placeholder="Faculty ID"
                  required
                />
              </div>

              <div className="form-group">
                <label>Room *</label>
                <input
                  type="number"
                  value={manualForm.roomId}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, roomId: e.target.value })
                  }
                  placeholder="Room ID"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Day of Week *</label>
                  <select
                    value={manualForm.dayOfWeek}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        dayOfWeek: e.target.value,
                      })
                    }
                  >
                    <option>MONDAY</option>
                    <option>TUESDAY</option>
                    <option>WEDNESDAY</option>
                    <option>THURSDAY</option>
                    <option>FRIDAY</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    value={manualForm.startTime}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        startTime: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Time *</label>
                  <input
                    type="time"
                    value={manualForm.endTime}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, endTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Creating..." : "Create Entry"}
              </button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default TimetableGenerationPage;
