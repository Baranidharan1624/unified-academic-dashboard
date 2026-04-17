import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { getFacultyTimetable } from "../../services/timetableService";

function MyCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const timetable = await getFacultyTimetable();
        const uniqueCourses = Array.from(
          new Map(
            (Array.isArray(timetable) ? timetable : []).map((entry) => {
              const code = (entry?.courseCode || "").toString().trim();
              const name = (entry?.courseName || "").toString().trim();
              const semester = entry?.semester ?? "-";
              const year = entry?.academicYear ?? "-";
              const key = `${code}|${name}|${semester}|${year}`;
              return [
                key,
                {
                  id: entry?.id || key,
                  courseCode: code || "-",
                  courseName: name || "-",
                  semester,
                  academicYear: year,
                },
              ];
            })
          ).values()
        ).sort((a, b) => {
          const byCode = a.courseCode.localeCompare(b.courseCode, undefined, {
            numeric: true,
            sensitivity: "base",
          });
          if (byCode !== 0) return byCode;
          return a.courseName.localeCompare(b.courseName, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        });

        setCourses(uniqueCourses);
      } catch {
        setCourses([]);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout title="My Courses">
      <div className="table-card">
        <h3>Assigned Courses</h3>
        <table>
          <thead><tr><th>Code</th><th>Name</th><th>Semester</th><th>Year</th></tr></thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.courseCode}</td>
                <td>{course.courseName}</td>
                <td>{course.semester}</td>
                <td>{course.academicYear}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default MyCourses;
