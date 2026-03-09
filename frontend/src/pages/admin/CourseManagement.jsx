import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { createCourse, deleteCourse, getCourses, updateCourse } from "../../services/courseService";

const initialForm = {
  courseName: "",
  courseCode: "",
  facultyId: "",
  semester: "",
  academicYear: "",
};

function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  async function fetchCourses() {
    try {
      const response = await getCourses();
      setCourses(response.data || []);
    } catch {
      setCourses([]);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      facultyId: Number(form.facultyId),
      semester: Number(form.semester),
    };

    if (editId) {
      await updateCourse(editId, payload);
    } else {
      await createCourse(payload);
    }

    setForm(initialForm);
    setEditId(null);
    fetchCourses();
  };

  const handleEdit = (course) => {
    setEditId(course.id);
    setForm({
      courseName: course.courseName,
      courseCode: course.courseCode,
      facultyId: String(course.facultyId),
      semester: String(course.semester),
      academicYear: course.academicYear,
    });
  };

  const handleDelete = async (id) => {
    await deleteCourse(id);
    fetchCourses();
  };

  return (
    <DashboardLayout title="Course Management">
      <div className="module-grid">
        <div className="form-card">
          <h3>{editId ? "Update Course" : "Create Course"}</h3>
          <form className="form-grid" onSubmit={handleSubmit}>
            <input value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} placeholder="Course Name" required />
            <input value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} placeholder="Course Code" required />
            <input value={form.facultyId} onChange={(e) => setForm({ ...form, facultyId: e.target.value })} placeholder="Faculty ID" required />
            <input value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} placeholder="Semester" required />
            <input value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} placeholder="Academic Year" required />
            <button className="primary-btn" type="submit">{editId ? "Update" : "Create"}</button>
          </form>
        </div>

        <div className="table-card">
          <h3>Courses</h3>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Faculty</th>
                <th>Semester</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.courseCode}</td>
                  <td>{course.courseName}</td>
                  <td>{course.facultyId}</td>
                  <td>{course.semester}</td>
                  <td>
                    <button className="secondary-btn" onClick={() => handleEdit(course)}>Edit</button>
                    <button className="danger-btn" onClick={() => handleDelete(course.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CourseManagement;
