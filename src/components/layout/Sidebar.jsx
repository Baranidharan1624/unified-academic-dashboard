import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { 
  FaUniversity, FaUserGraduate, FaChalkboardTeacher, FaUserCog, 
  FaClipboardList, FaBullhorn, FaEnvelopeOpenText, FaExclamationCircle,
  FaCog, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaBook, 
  FaChartBar, FaFileAlt, FaBell, FaTasks, FaCloudUploadAlt, FaUserClock,
  FaLaptopHouse, FaCommentAlt, FaBars, FaTimes
} from 'react-icons/fa'

const Sidebar = ({ role, activeItem, setActiveItem, isOpen, setIsOpen }) => {
  const { sidebarCollapsed, toggleSidebar } = useApp()
  const location = useLocation()

  const adminMenu = [
    { id: 'faculty', label: 'Faculty Management', icon: FaChalkboardTeacher, path: '/admin/faculty' },
    { id: 'student', label: 'Student Management', icon: FaUserGraduate, path: '/admin/student' },
    { id: 'announcement', label: 'Announcement', icon: FaBullhorn, path: '/admin/announcement' },
    { id: 'requests', label: 'Requests Received', icon: FaEnvelopeOpenText, path: '/admin/requests' },
    { id: 'complaints', label: 'Complaints', icon: FaExclamationCircle, path: '/admin/complaints' },
    { id: 'settings', label: 'Settings', icon: FaCog, path: '/admin/settings' },
  ]

  const studentMenu = [
    { id: 'attendance', label: 'Attendance', icon: FaCalendarAlt, path: '/student/attendance' },
    { id: 'course', label: 'Course', icon: FaBook, path: '/student/course' },
    { id: 'announcement', label: 'Announcements', icon: FaBullhorn, path: '/student/announcement' },
    { id: 'marks', label: 'Marks', icon: FaChartBar, path: '/student/marks' },
    { id: 'lab', label: 'Lab Activity', icon: FaLaptopHouse, path: '/student/lab' },
    { id: 'feedback', label: 'Feedback', icon: FaCommentAlt, path: '/student/feedback' },
    { id: 'grievance', label: 'Grievance Redressal', icon: FaExclamationCircle, path: '/student/grievance' },
  ]

  const facultyMenu = [
    { id: 'attendance', label: 'Attendance', icon: FaUserClock, path: '/faculty/attendance' },
    { id: 'notifications', label: 'Notifications', icon: FaBell, path: '/faculty/notifications' },
    { id: 'tasks', label: 'Tasks', icon: FaTasks, path: '/faculty/tasks' },
    { id: 'marks', label: 'Marks', icon: FaChartBar, path: '/faculty/marks' },
    { id: 'materials', label: 'Materials', icon: FaCloudUploadAlt, path: '/faculty/materials' },
    { id: 'requests', label: 'Requests', icon: FaEnvelopeOpenText, path: '/faculty/requests' },
    { id: 'calendar', label: 'Academic Calendar', icon: FaCalendarAlt, path: '/faculty/calendar' },
  ]

  const menu = role === 'admin' ? adminMenu : role === 'student' ? studentMenu : facultyMenu

  const getRoleLabel = () => {
    switch (role) {
      case 'admin': return 'Admin'
      case 'student': return 'Student'
      case 'faculty': return 'Faculty'
      default: return 'Dashboard'
    }
  }

  const getRoleIcon = () => {
    switch (role) {
      case 'admin': return FaUserCog
      case 'student': return FaUserGraduate
      case 'faculty': return FaChalkboardTeacher
      default: return FaUniversity
    }
  }

  const RoleIcon = getRoleIcon()

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <FaUniversity className="text-white text-lg" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold text-gray-800 dark:text-white">CampusOne</span>
            )}
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <FaTimes />
          </button>
        </div>

        {/* Role Badge */}
        <div className="p-4">
          <div className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <RoleIcon className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{getRoleLabel()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {menu.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => setActiveItem(item.id)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive || activeItem === item.id
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${sidebarCollapsed ? 'justify-center' : ''}`
              }
            >
              <item.icon className={`text-lg ${sidebarCollapsed ? '' : 'group-hover:scale-110'} transition-transform`} />
              {!sidebarCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleSidebar}
            className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

