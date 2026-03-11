import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import FacultyManagement from './FacultyManagement'
import StudentManagement from './StudentManagement'
import Announcement from './Announcement'
import RequestsReceived from './RequestsReceived'
import Complaints from './Complaints'
import Settings from './Settings'
import AdminOverview from './AdminOverview'

const AdminDashboard = () => {
  const [activeItem, setActiveItem] = useState('overview')

  const getPageTitle = () => {
    switch (activeItem) {
      case 'faculty': return 'Faculty Management'
      case 'student': return 'Student Management'
      case 'announcement': return 'Announcements'
      case 'requests': return 'Requests Received'
      case 'complaints': return 'Complaints'
      case 'settings': return 'Settings'
      default: return 'Admin Dashboard'
    }
  }

  return (
    <DashboardLayout role="admin" title={getPageTitle()} activeItem={activeItem} setActiveItem={setActiveItem}>
      <Routes>
        <Route path="/" element={<AdminOverview />} />
        <Route path="/faculty" element={<FacultyManagement />} />
        <Route path="/student" element={<StudentManagement />} />
        <Route path="/announcement" element={<Announcement />} />
        <Route path="/requests" element={<RequestsReceived />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </DashboardLayout>
  )
}
export default AdminDashboard