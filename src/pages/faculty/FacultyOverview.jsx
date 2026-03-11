import React from 'react'
import { useApp } from '../../context/AppContext'
import { FaUsers, FaCalendarAlt, FaChartBar, FaClipboardList, FaBell, FaTasks, FaBook } from 'react-icons/fa'

const FacultyOverview = () => {
  const { currentUser, notifications, tasks, students } = useApp()

  const pendingTasks = tasks.filter(t => t.status === 'pending').length
  const unreadNotifications = notifications.filter(n => !n.read).length

  const stats = [
    { label: 'Total Students', value: students.length, icon: FaUsers, color: 'from-blue-500 to-cyan-500' },
    { label: 'Pending Tasks', value: pendingTasks, icon: FaTasks, color: 'from-orange-500 to-red-500' },
    { label: 'Notifications', value: unreadNotifications, icon: FaBell, color: 'from-purple-500 to-pink-500' },
    { label: 'Subjects', value: 4, icon: FaBook, color: 'from-green-500 to-teal-500' },
  ]

  const upcomingTasks = tasks.filter(t => t.status !== 'completed').slice(0, 3)

  const recentNotifications = notifications.slice(0, 4)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {currentUser?.name?.split(' ')[0]}! 👋</h1>
            <p className="opacity-90 mt-1">Here's your teaching overview for today.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{currentUser?.designation}</p>
              <p className="text-sm opacity-80">Designation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <stat.icon className="text-white text-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Pending Tasks</h3>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{task.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{task.subject} - {task.class}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Due: {task.dueDate}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Notifications</h3>
          <div className="space-y-3">
            {recentNotifications.map((notif) => (
              <div key={notif.id} className={`p-4 rounded-xl ${notif.read ? 'bg-gray-50 dark:bg-gray-700' : 'bg-primary-50 dark:bg-primary-900/20'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{notif.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{notif.message}</p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">{notif.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Your Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">Faculty ID</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{currentUser?.facultyId}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{currentUser?.department}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">Specialization</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{currentUser?.specialization}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FacultyOverview

