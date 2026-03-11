import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { 
  FaBars, FaBell, FaSearch, FaMoon, FaSun, FaChevronDown, 
  FaUser, FaCog, FaSignOutAlt, FaBellSlash 
} from 'react-icons/fa'

const Topbar = ({ title, setIsOpen }) => {
  const { currentUser, darkMode, toggleDarkMode, notifications, logout } = useApp()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const profileRef = useRef(null)
  const notifRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <FaBars />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white hidden sm:block">{title}</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-2">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 w-48"
          />
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          {darkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <FaBell className="text-lg" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-fade-in">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <FaBellSlash className="text-3xl mb-2 mx-auto opacity-50" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                        !notif.read ? 'bg-primary-50/50 dark:bg-primary-900/20' : ''
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{notif.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notif.date}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
              {currentUser?.profilePic ? (
                <img src={currentUser.profilePic} alt="Profile" className="w-full h-full rounded-lg object-cover" />
              ) : (
                getInitials(currentUser?.name)
              )}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
              {currentUser?.name?.split(' ')[0]}
            </span>
            <FaChevronDown className="hidden sm:block text-xs text-gray-400" />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-fade-in">
              {/* Profile Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {currentUser?.profilePic ? (
                      <img src={currentUser.profilePic} alt="Profile" className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      getInitials(currentUser?.name)
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{currentUser?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
                  </div>
                </div>
                
                {/* Role specific info */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  {currentUser?.role === 'student' && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-400">Register No</p>
                        <p className="font-medium text-gray-700 dark:text-gray-200">{currentUser?.registerNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">CGPA</p>
                        <p className="font-medium text-gray-700 dark:text-gray-200">{currentUser?.cgpa}</p>
                      </div>
                    </div>
                  )}
                  {currentUser?.role === 'faculty' && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-400">Faculty ID</p>
                        <p className="font-medium text-gray-700 dark:text-gray-200">{currentUser?.facultyId}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Department</p>
                        <p className="font-medium text-gray-700 dark:text-gray-200">{currentUser?.department}</p>
                      </div>
                    </div>
                  )}
                  {currentUser?.role === 'admin' && (
                    <div className="text-sm">
                      <p className="text-gray-400">Department</p>
                      <p className="font-medium text-gray-700 dark:text-gray-200">{currentUser?.department}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <FaUser className="text-gray-400" />
                  <span className="text-sm font-medium">My Profile</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <FaCog className="text-gray-400" />
                  <span className="text-sm font-medium">Settings</span>
                </button>
              </div>

              {/* Logout */}
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <FaSignOutAlt />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Topbar

