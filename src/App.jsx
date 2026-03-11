import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import StudentDashboard from './pages/student/StudentDashboard'
import FacultyDashboard from './pages/faculty/FacultyDashboard'

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/student/*" element={<StudentDashboard />} />
          <Route path="/faculty/*" element={<FacultyDashboard />} />
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App

