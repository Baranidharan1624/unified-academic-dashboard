const TIMETABLE_STORAGE_KEY = "campusone.generated.timetable";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const PERIODS = [
  { periodNumber: 1, startTime: "08:00", endTime: "08:50" },
  { periodNumber: 2, startTime: "08:50", endTime: "09:40" },
  { periodNumber: 3, startTime: "10:10", endTime: "11:00" },
  { periodNumber: 4, startTime: "11:00", endTime: "11:50" },
  { periodNumber: 5, startTime: "11:50", endTime: "12:40" },
  { periodNumber: 6, startTime: "13:30", endTime: "14:15" },
  { periodNumber: 7, startTime: "14:15", endTime: "15:00" },
];

const CLASS_GROUPS = [
  { department: "CSE", semester: "1", section: "A" },
  { department: "CSE", semester: "1", section: "B" },
  { department: "CSE", semester: "3", section: "A" },
  { department: "ECE", semester: "3", section: "A" },
  { department: "EEE", semester: "5", section: "A" },
  { department: "MECH", semester: "5", section: "A" },
];

const FACULTIES = [
  { id: 1, name: "Dr. Kumar" },
  { id: 2, name: "Dr. Meena" },
  { id: 3, name: "Dr. Arjun" },
  { id: 4, name: "Dr. Priya" },
  { id: 5, name: "Dr. Vivek" },
  { id: 6, name: "Dr. Nisha" },
  { id: 7, name: "Dr. Anand" },
  { id: 8, name: "Dr. Divya" },
];

const SUBJECTS_BY_DEPARTMENT = {
  CSE: ["CS101", "CS102", "MA101", "PH101", "CSL11"],
  ECE: ["EC201", "EC202", "MA201", "ECL21", "HS201"],
  EEE: ["EE301", "EE302", "MA301", "EEL31", "HS301"],
  MECH: ["ME301", "ME302", "MA301", "MEL31", "HS301"],
};

const getStored = () => {
  const raw = localStorage.getItem(TIMETABLE_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveStored = (entries) => {
  localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(entries));
};

const weekdayName = () => {
  const day = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  return DAYS.includes(day) ? day : "MONDAY";
};

const resolveStudentClass = (user) => {
  const department = user?.department ? String(user.department).toUpperCase() : null;
  const semester = user?.semester ? String(user.semester) : null;
  const section = user?.section ? String(user.section).toUpperCase() : null;

  const explicit = CLASS_GROUPS.find(
    (g) => (!department || g.department === department) && (!semester || g.semester === semester) && (!section || g.section === section)
  );

  if (explicit) return explicit;

  const id = Number(user?.id || 1);
  return CLASS_GROUPS[(Math.abs(id) - 1) % CLASS_GROUPS.length];
};

const resolveFacultyId = (user) => {
  if (Number.isFinite(Number(user?.facultyId))) return Number(user.facultyId);
  if (Number.isFinite(Number(user?.id))) return Math.max(1, (Number(user.id) % FACULTIES.length) || FACULTIES.length);
  return 1;
};

const buildGeneratedTimetable = () => {
  let seed = Date.now();
  const entries = [];

  CLASS_GROUPS.forEach((group, groupIdx) => {
    const subjects = SUBJECTS_BY_DEPARTMENT[group.department] || ["GEN101", "GEN102", "GEN103", "GENL11", "GEN201"];

    DAYS.forEach((day, dayIdx) => {
      PERIODS.forEach((period, periodIdx) => {
        const subject = subjects[(periodIdx + dayIdx) % subjects.length];
        const faculty = FACULTIES[(groupIdx + periodIdx + dayIdx) % FACULTIES.length];
        const roomBase = group.department === "CSE" ? "R" : group.department === "ECE" ? "E" : group.department === "EEE" ? "P" : "M";
        seed += 1;

        entries.push({
          id: seed,
          dayOfWeek: day,
          periodNumber: period.periodNumber,
          startTime: period.startTime,
          endTime: period.endTime,
          courseCode: subject,
          facultyId: faculty.id,
          facultyName: faculty.name,
          roomNumber: `${roomBase}${100 + period.periodNumber}`,
          department: group.department,
          semester: group.semester,
          section: group.section,
        });
      });
    });
  });

  return entries;
};

export const generateAndStoreClassFacultyTimetable = () => {
  const generated = buildGeneratedTimetable();
  saveStored(generated);
  return generated;
};

export const getAllLocalTimetableEntries = () => getStored();

export const addLocalTimetableEntry = (entry) => {
  const current = getStored();
  const next = [...current, { ...entry, id: Date.now() + current.length }];
  saveStored(next);
  return next;
};

export const getTimetableForStudent = (user) => {
  const cls = resolveStudentClass(user);
  return getStored()
    .filter((entry) => entry.department === cls.department && entry.semester === cls.semester && entry.section === cls.section)
    .sort((a, b) => {
      const dayDiff = DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek);
      if (dayDiff !== 0) return dayDiff;
      return (a.periodNumber || 0) - (b.periodNumber || 0);
    });
};

export const getTimetableForFaculty = (user) => {
  const facultyId = resolveFacultyId(user);
  return getStored()
    .filter((entry) => Number(entry.facultyId) === facultyId)
    .sort((a, b) => {
      const dayDiff = DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek);
      if (dayDiff !== 0) return dayDiff;
      return (a.periodNumber || 0) - (b.periodNumber || 0);
    });
};

export const getTodayStudentClasses = (user) => {
  const today = weekdayName();
  return getTimetableForStudent(user).filter((entry) => entry.dayOfWeek === today);
};

export const getTodayFacultyClasses = (user) => {
  const today = weekdayName();
  return getTimetableForFaculty(user).filter((entry) => entry.dayOfWeek === today);
};

export const getResolvedStudentClass = (user) => resolveStudentClass(user);

export default {
  generateAndStoreClassFacultyTimetable,
  getAllLocalTimetableEntries,
  addLocalTimetableEntry,
  getTimetableForStudent,
  getTimetableForFaculty,
  getTodayStudentClasses,
  getTodayFacultyClasses,
  getResolvedStudentClass,
};
