import React, { createContext, useContext, useState } from 'react'
import { dummyStudents, dummyFaculty, dummyAnnouncements, dummyRequests, dummyComplaints, dummyAttendance, dummyMarks, dummySubjects, dummyTasks, dummyNotifications, dummyCourses } from '../data/dummyData'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [notifications, setNotifications] = useState(dummyNotifications)
  const [students, setStudents] = useState(dummyStudents)
  const [faculty, setFaculty] = useState(dummyFaculty)
  const [announcements, setAnnouncements] = useState(dummyAnnouncements)
  const [requests, setRequests] = useState(dummyRequests)
  const [complaints, setComplaints] = useState(dummyComplaints)
  const [attendance, setAttendance] = useState(dummyAttendance)
  const [marks, setMarks] = useState(dummyMarks)
  const [subjects, setSubjects] = useState(dummySubjects)
  const [tasks, setTasks] = useState(dummyTasks)
  const [toasts, setToasts] = useState([])

  // Dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Sidebar toggle
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Login
  const login = (role, credentials) => {
    if (role === 'admin') {
      setCurrentUser({
        id: 1,
        name: 'Dr. Rajesh Kumar',
        role: 'admin',
        email: 'admin@campusone.edu',
        department: 'Administration'
      })
    } else if (role === 'student') {
      const student = dummyStudents.find(s => s.registerNumber === credentials.registerNumber)
      if (student) {
        setCurrentUser({ ...student, role: 'student' })
      }
    } else if (role === 'faculty') {
      const fac = dummyFaculty.find(f => f.facultyId === credentials.facultyId)
      if (fac) {
        setCurrentUser({ ...fac, role: 'faculty' })
      }
    }
  }

  // Logout
  const logout = () => {
    setCurrentUser(null)
  }

  // Toast notifications
  const showToast = (message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  // Add announcement
  const addAnnouncement = (announcement) => {
    const newAnnouncement = {
      id: Date.now(),
      ...announcement,
      date: new Date().toISOString()
    }
    setAnnouncements(prev => [newAnnouncement, ...prev])
    showToast('Announcement created successfully', 'success')
  }

  // Update request status
  const updateRequestStatus = (requestId, status) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status } : req
    ))
    showToast(`Request ${status} successfully`, 'success')
  }

  // Update complaint status
  const updateComplaintStatus = (complaintId, status) => {
    setComplaints(prev => prev.map(comp => 
      comp.id === complaintId ? { ...comp, status } : comp
    ))
    showToast(`Complaint status updated to ${status}`, 'success')
  }

  // Add student
  const addStudent = (student) => {
    const newStudent = {
      id: Date.now(),
      ...student,
      attendance: 85,
      cgpa: 8.5
    }
    setStudents(prev => [...prev, newStudent])
    showToast('Student added successfully', 'success')
  }

  // Add faculty
  const addFacultyMember = (facultyMember) => {
    const newFaculty = {
      id: Date.now(),
      ...facultyMember,
      status: 'active'
    }
    setFaculty(prev => [...prev, newFaculty])
    showToast('Faculty member added successfully', 'success')
  }

  // Update attendance
  const updateAttendance = (studentId, subjectId, status) => {
    setAttendance(prev => prev.map(rec => 
      rec.studentId === studentId && rec.subjectId === subjectId 
        ? { ...rec, status } 
        : rec
    ))
  }

  // Add task
  const addTask = (task) => {
    const newTask = {
      id: Date.now(),
      ...task,
      createdAt: new Date().toISOString()
    }
    setTasks(prev => [...prev, newTask])
    showToast('Task created successfully', 'success')
  }

  // Add notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      date: new Date().toISOString(),
      read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const value = {
    darkMode,
    toggleDarkMode,
    sidebarCollapsed,
    toggleSidebar,
    currentUser,
    login,
    logout,
    notifications,
    students,
    faculty,
    announcements,
    requests,
    complaints,
    attendance,
    marks,
    subjects,
    tasks,
    toasts,
    showToast,
    addAnnouncement,
    updateRequestStatus,
    updateComplaintStatus,
    addStudent,
    addFacultyMember,
    updateAttendance,
    addTask,
    addNotification,
    dummyCourses
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

