import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../services/api";
import { getCurrentUser } from "../../services/authService";

function MyCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    async function load() {
      const user = getCurrentUser();
      try {
        const response = await api.get("/courses", { params: { facultyId: user?.id || 2 } });
        setCourses(response.data || []);
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
