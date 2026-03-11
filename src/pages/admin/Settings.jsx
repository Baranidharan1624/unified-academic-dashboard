import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { FaUserShield, FaBell, FaPalette, FaLock, FaCog, FaMoon, FaSun, FaGlobe, FaCheck, FaTimes } from 'react-icons/fa'

const Settings = () => {
  const { darkMode, toggleDarkMode, showToast } = useApp()
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: false,
    attendanceAlerts: true,
    marksUpdates: true,
    announcementAlerts: true,
    requestAlerts: true,
    language: 'English',
    timezone: 'IST'
  })

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] })
    showToast('Setting updated successfully', 'success')
  }

  const tabs = [
    { id: 'general', label: 'General', icon: FaCog },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'permissions', label: 'Permissions', icon: FaLock },
    { id: 'appearance', label: 'Appearance', icon: FaPalette },
    { id: 'roles', label: 'Role Management', icon: FaUserShield },
  ]

  const roles = [
    { id: 'admin', name: 'Administrator', description: 'Full access to all features', permissions: 100 },
    { id: 'faculty', name: 'Faculty', description: 'Can manage attendance, marks, materials', permissions: 75 },
    { id: 'student', name: 'Student', description: 'Can view attendance, marks, submit requests', permissions: 40 },
  ]

  const permissions = [
    { id: 'manage_students', name: 'Manage Students', description: 'Add, edit, delete student records' },
    { id: 'manage_faculty', name: 'Manage Faculty', description: 'Add, edit, delete faculty records' },
    { id: 'view_attendance', name: 'View Attendance', description: 'Access attendance records' },
    { id: 'manage_marks', name: 'Manage Marks', description: 'Enter and update student marks' },
    { id: 'create_announcements', name: 'Create Announcements', description: 'Post announcements' },
    { id: 'manage_requests', name: 'Manage Requests', description: 'Approve/reject requests' },
    { id: 'view_reports', name: 'View Reports', description: 'Access analytics and reports' },
  ]

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">General Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Language</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred language</p>
            </div>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-white"
            >
              <option value="English">English</option>
              <option value="Tamil">Tamil</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Timezone</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select your timezone</p>
            </div>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-white"
            >
              <option value="IST">IST (UTC+5:30)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">System Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">Version</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">1.0.0</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">Build</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">2024.02.28</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Notification Preferences</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-800 dark:text-white">Email Notifications</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
          </div>
          <button
            onClick={() => handleToggle('emailNotifications')}
            className={`relative w-12 h-6 rounded-full transition-colors ${settings.emailNotifications ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.emailNotifications ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-800 dark:text-white">Push Notifications</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications</p>
          </div>
          <button
            onClick={() => handleToggle('pushNotifications')}
            className={`relative w-12 h-6 rounded-full transition-colors ${settings.pushNotifications ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.pushNotifications ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-800 dark:text-white">Attendance Alerts</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Alert when attendance is low</p>
          </div>
          <button
            onClick={() => handleToggle('attendanceAlerts')}
            className={`relative w-12 h-6 rounded-full transition-colors ${settings.attendanceAlerts ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.attendanceAlerts ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-800 dark:text-white">Marks Updates</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Notify when marks are updated</p>
          </div>
          <button
            onClick={() => handleToggle('marksUpdates')}
            className={`relative w-12 h-6 rounded-full transition-colors ${settings.marksUpdates ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.marksUpdates ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-gray-800 dark:text-white">Announcement Alerts</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Notify for new announcements</p>
          </div>
          <button
            onClick={() => handleToggle('announcementAlerts')}
            className={`relative w-12 h-6 rounded-full transition-colors ${settings.announcementAlerts ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.announcementAlerts ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>
    </div>
  )

  const renderPermissionsSettings = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Permission Management</h3>
      <div className="space-y-3">
        {permissions.map((perm) => (
          <div key={perm.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">{perm.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{perm.description}</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg text-sm">Admin</button>
              <button className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm">Faculty</button>
              <button className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-lg text-sm">Student</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Theme</h3>
        <div className="flex gap-4">
          <button
            onClick={() => !darkMode && toggleDarkMode()}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${!darkMode ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'}`}
          >
            <FaSun className="text-2xl mx-auto mb-2 text-yellow-500" />
            <p className="font-medium text-gray-800 dark:text-white">Light</p>
          </button>
          <button
            onClick={() => darkMode && toggleDarkMode()}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${darkMode ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'}`}
          >
            <FaMoon className="text-2xl mx-auto mb-2 text-purple-500" />
            <p className="font-medium text-gray-800 dark:text-white">Dark</p>
          </button>
        </div>
      </div>
    </div>
  )

  const renderRoleSettings = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Role Management</h3>
      <div className="space-y-4">
        {roles.map((role) => (
          <div key={role.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">{role.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Access Level</p>
              <p className="text-lg font-bold text-primary-600">{role.permissions}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">Manage your dashboard preferences and configurations</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'permissions' && renderPermissionsSettings()}
          {activeTab === 'appearance' && renderAppearanceSettings()}
          {activeTab === 'roles' && renderRoleSettings()}
        </div>
      </div>
    </div>
  )
}

export default Settings

