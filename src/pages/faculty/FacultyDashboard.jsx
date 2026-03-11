import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import FacultyOverview from './FacultyOverview'
import FacultyAttendance from './FacultyAttendance'
import FacultyNotifications from './FacultyNotifications'
import FacultyTasks from './FacultyTasks'
import FacultyMarks from './FacultyMarks'
import FacultyMaterials from './FacultyMaterials'
import FacultyRequests from './FacultyRequests'
import FacultyCalendar from './FacultyCalendar'

const FacultyDashboard = () => {
  const [activeItem, setActiveItem] = useState('overview')

  const getPageTitle = () => {
    switch (activeItem) {
      case 'attendance': return 'Attendance'
      case 'notifications': return 'Notifications'
      case 'tasks': return 'Tasks'
      case 'marks': return 'Marks'
      case 'materials': return 'Materials'
      case 'requests': return 'Requests'
      case 'calendar': return 'Academic Calendar'
      default: return 'Dashboard'
    }
  }

  return (
    <DashboardLayout role="faculty" title={getPageTitle()} activeItem={activeItem} setActiveItem={setActiveItem}>
      <Routes>
        <Route path="/" element={<FacultyOverview />} />
        <Route path="/attendance" element={<FacultyAttendance />} />
        <Route path="/notifications" element={<FacultyNotifications />} />
        <Route path="/tasks" element={<FacultyTasks />} />
        <Route path="/marks" element={<FacultyMarks />} />
        <Route path="/materials" element={<FacultyMaterials />} />
        <Route path="/requests" element={<FacultyRequests />} />
        <Route path="/calendar" element={<FacultyCalendar />} />
      </Routes>
    </DashboardLayout>
  )
}

export default FacultyDashboard

