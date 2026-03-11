import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Chatbot from '../../components/chatbot/Chatbot'
import StudentOverview from './StudentOverview'
import Attendance from './Attendance'
import Course from './Course'
import StudentAnnouncement from './StudentAnnouncement'
import Marks from './Marks'
import LabActivity from './LabActivity'
import Feedback from './Feedback'
import GrievanceRedressal from './GrievanceRedressal'

const StudentDashboard = () => {
  const [activeItem, setActiveItem] = useState('overview')

  const getPageTitle = () => {
    switch (activeItem) {
      case 'attendance': return 'Attendance'
      case 'course': return 'Course Materials'
      case 'announcement': return 'Announcements'
      case 'marks': return 'Marks'
      case 'lab': return 'Lab Activity'
      case 'feedback': return 'Feedback'
      case 'grievance': return 'Grievance Redressal'
      default: return 'Dashboard'
    }
  }

  return (
    <DashboardLayout role="student" title={getPageTitle()} activeItem={activeItem} setActiveItem={setActiveItem}>
      <Routes>
        <Route path="/" element={<StudentOverview />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/course" element={<Course />} />
        <Route path="/announcement" element={<StudentAnnouncement />} />
        <Route path="/marks" element={<Marks />} />
        <Route path="/lab" element={<LabActivity />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/grievance" element={<GrievanceRedressal />} />
      </Routes>
      <Chatbot />
    </DashboardLayout>
  )
}

export default StudentDashboard

