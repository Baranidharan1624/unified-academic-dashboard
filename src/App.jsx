import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./Login";
import "./App.css";

const roleMenus = {
  admin: [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Students", path: "/admin/students" },
    { label: "Staff", path: "/admin/staff" },
    { label: "Courses", path: "/admin/courses" },
    { label: "Attendance", path: "/admin/attendance" },
    { label: "Timetable", path: "/admin/timetable" },
    { label: "Tasks", path: "/admin/tasks" },
    { label: "Reports", path: "/admin/reports" },
    { label: "Notifications", path: "/admin/notifications" },
  ],
  faculty: [
    { label: "Dashboard", path: "/faculty/dashboard" },
    { label: "My Courses", path: "/faculty/courses" },
    { label: "Attendance", path: "/faculty/attendance" },
    { label: "Timetable", path: "/faculty/timetable" },
    { label: "Create Task", path: "/faculty/create-task" },
    { label: "Task Submissions", path: "/faculty/task-submissions" },
    { label: "Notifications", path: "/faculty/notifications" },
  ],
  student: [
    { label: "Dashboard", path: "/student/dashboard" },
    { label: "My Attendance", path: "/student/attendance" },
    { label: "My Timetable", path: "/student/timetable" },
    { label: "My Tasks", path: "/student/tasks" },
    { label: "Notifications", path: "/student/notifications" },
  ],
};

function Page({ title }) {
  return (
    <section className="page-card">
      <h4>{title}</h4>
      <p>This is the {title} page.</p>
    </section>
  );
}

function ProtectedRoute({ user, allowed, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed.includes(user.role)) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return children;
}

function Shell({ user, onLogout }) {
  const location = useLocation();
  const menu = roleMenus[user.role] || roleMenus.student;

  const pageLabel = useMemo(() => {
    const active = menu.find((m) => m.path === location.pathname);
    return active?.label || "Page";
  }, [menu, location.pathname]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2 className="brand">CampusOne</h2>
        <p className="role-tag">{user.role.toUpperCase()}</p>
        <nav className="nav-list">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="content-area">
        <header className="topbar">
          <div>
            <h3>{pageLabel}</h3>
            <p className="user-line">{user.email}</p>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </header>

        <Routes>
          <Route path="/admin/dashboard" element={<Page title="Admin Dashboard" />} />
          <Route path="/admin/students" element={<Page title="Students" />} />
          <Route path="/admin/staff" element={<Page title="Staff" />} />
          <Route path="/admin/courses" element={<Page title="Courses" />} />
          <Route path="/admin/attendance" element={<Page title="Attendance" />} />
          <Route path="/admin/timetable" element={<Page title="Timetable" />} />
          <Route path="/admin/tasks" element={<Page title="Tasks" />} />
          <Route path="/admin/reports" element={<Page title="Reports" />} />
          <Route path="/admin/notifications" element={<Page title="Notifications" />} />

          <Route path="/faculty/dashboard" element={<Page title="Faculty Dashboard" />} />
          <Route path="/faculty/courses" element={<Page title="My Courses" />} />
          <Route path="/faculty/attendance" element={<Page title="Attendance" />} />
          <Route path="/faculty/timetable" element={<Page title="Timetable" />} />
          <Route path="/faculty/create-task" element={<Page title="Create Task" />} />
          <Route path="/faculty/task-submissions" element={<Page title="Task Submissions" />} />
          <Route path="/faculty/notifications" element={<Page title="Notifications" />} />

          <Route path="/student/dashboard" element={<Page title="Student Dashboard" />} />
          <Route path="/student/attendance" element={<Page title="My Attendance" />} />
          <Route path="/student/timetable" element={<Page title="My Timetable" />} />
          <Route path="/student/tasks" element={<Page title="My Tasks" />} />
          <Route path="/student/notifications" element={<Page title="Notifications" />} />

          <Route path="*" element={<Navigate to={`/${user.role}/dashboard`} replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("campus_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("campus_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("campus_user");
    }
  }, [user]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login onLogin={setUser} />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute user={user} allowed={["admin", "faculty", "student"]}>
              <Shell user={user} onLogout={() => setUser(null)} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
