import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";

import AdminDashboard from "../pages/admin/AdminDashboard";
import StudentManagement from "../pages/admin/StudentManagement";
import FacultyManagement from "../pages/admin/FacultyManagement";
import CreateStudentPage from "../pages/admin/CreateStudentPage";
import CreateFacultyPage from "../pages/admin/CreateFacultyPage";
import ImportStudentsPage from "../pages/admin/ImportStudentsPage";
import ImportFacultyPage from "../pages/admin/ImportFacultyPage";
import CourseManagement from "../pages/admin/CourseManagement";
import TimetableManagement from "../pages/admin/TimetableManagement";
import TimetableGenerationPage from "../pages/admin/TimetableGenerationPage";
import SendNotification from "../pages/admin/SendNotification";
import Reports from "../pages/admin/Reports";

import FacultyDashboard from "../pages/faculty/FacultyDashboard";
import Attendance from "../pages/faculty/Attendance";
import MyCourses from "../pages/faculty/MyCourses";
import FacultyTimetable from "../pages/faculty/FacultyTimetable";
import CreateTask from "../pages/faculty/CreateTask";
import TaskSubmissions from "../pages/faculty/TaskSubmissions";

import StudentDashboard from "../pages/student/StudentDashboard";
import StudentAttendance from "../pages/student/StudentAttendance";
import StudentTimetablePage from "../features/student/StudentTimetablePage";
import StudentTasks from "../pages/student/StudentTasks";
import StudentNotifications from "../pages/student/StudentNotifications";

// Admin Feature Pages
import RoomManagementPage from "../features/admin/RoomManagementPage";
import TimetableManagementPage from "../features/admin/TimetableManagementPage";
import BulkUserImportPage from "../features/admin/BulkUserImportPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute allowedRoles={["ADMIN"]}><StudentManagement /></ProtectedRoute>} />
        <Route path="/admin/students/create" element={<ProtectedRoute allowedRoles={["ADMIN"]}><CreateStudentPage /></ProtectedRoute>} />
        <Route path="/admin/students/import" element={<ProtectedRoute allowedRoles={["ADMIN"]}><ImportStudentsPage /></ProtectedRoute>} />
        <Route path="/admin/faculty" element={<ProtectedRoute allowedRoles={["ADMIN"]}><FacultyManagement /></ProtectedRoute>} />
        <Route path="/admin/faculty/create" element={<ProtectedRoute allowedRoles={["ADMIN"]}><CreateFacultyPage /></ProtectedRoute>} />
        <Route path="/admin/faculty/import" element={<ProtectedRoute allowedRoles={["ADMIN"]}><ImportFacultyPage /></ProtectedRoute>} />
        <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={["ADMIN"]}><CourseManagement /></ProtectedRoute>} />
        <Route path="/admin/timetable" element={<ProtectedRoute allowedRoles={["ADMIN"]}><TimetableManagement /></ProtectedRoute>} />
        <Route path="/admin/timetable/generate" element={<ProtectedRoute allowedRoles={["ADMIN"]}><TimetableGenerationPage /></ProtectedRoute>} />
        <Route path="/admin/timetable-new" element={<ProtectedRoute allowedRoles={["ADMIN"]}><TimetableManagementPage /></ProtectedRoute>} />
        <Route path="/admin/rooms" element={<ProtectedRoute allowedRoles={["ADMIN"]}><RoomManagementPage /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={["ADMIN"]}><SendNotification /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["ADMIN"]}><Reports /></ProtectedRoute>} />
        <Route path="/admin/import" element={<ProtectedRoute allowedRoles={["ADMIN"]}><BulkUserImportPage /></ProtectedRoute>} />

        {/* Faculty Routes */}
        <Route path="/faculty/dashboard" element={<ProtectedRoute allowedRoles={["FACULTY", "ADMIN"]}><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/faculty/attendance" element={<ProtectedRoute allowedRoles={["FACULTY", "ADMIN"]}><Attendance /></ProtectedRoute>} />
        <Route path="/faculty/courses" element={<ProtectedRoute allowedRoles={["FACULTY", "ADMIN"]}><MyCourses /></ProtectedRoute>} />
        <Route path="/faculty/timetable" element={<ProtectedRoute allowedRoles={["FACULTY", "ADMIN"]}><FacultyTimetable /></ProtectedRoute>} />
        <Route path="/faculty/tasks" element={<ProtectedRoute allowedRoles={["FACULTY", "ADMIN"]}><CreateTask /></ProtectedRoute>} />
        <Route path="/faculty/task-submissions" element={<ProtectedRoute allowedRoles={["FACULTY", "ADMIN"]}><TaskSubmissions /></ProtectedRoute>} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]}><StudentAttendance /></ProtectedRoute>} />
        <Route path="/student/timetable" element={<ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]}><StudentTimetablePage /></ProtectedRoute>} />
        <Route path="/student/tasks" element={<ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]}><StudentTasks /></ProtectedRoute>} />
        <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]}><StudentNotifications /></ProtectedRoute>} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
