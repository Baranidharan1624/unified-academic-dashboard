import React from 'react'
import { useApp } from '../../context/AppContext'
import { FaBell, FaCheck, FaEnvelope, FaUserGraduate, FaBullhorn, FaExclamationCircle } from 'react-icons/fa'

const FacultyNotifications = () => {
  const { notifications, students } = useApp()

  const getTypeIcon = (type) => {
    switch (type) {
      case 'request': return <FaUserGraduate className="text-blue-500" />
      case 'announcement': return <FaBullhorn className="text-purple-500" />
      case 'complaint': return <FaExclamationCircle className="text-red-500" />
      default: return <FaBell />
    }
  }

  const markAsRead = (id) => {
    // Mark notification as read
  }

  const markAllAsRead = () => {
    // Mark all as read
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Notifications</h2>
          <p className="text-gray-500 dark:text-gray-400">View all your notifications</p>
        </div>
        <button
          onClick={markAllAsRead}
          className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
        >
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 text-center">
            <FaBell className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No notifications</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border card-hover ${
                notif.read 
                  ? 'border-gray-200 dark:border-gray-700' 
                  : 'border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-900/10'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  {getTypeIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 dark:text-white">{notif.title}</h3>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{notif.date}</span>
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default FacultyNotifications

