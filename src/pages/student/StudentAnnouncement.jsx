import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { FaBullhorn, FaClock, FaUser, FaFilter } from 'react-icons/fa'

const StudentAnnouncement = () => {
  const { announcements } = useApp()
  const [filter, setFilter] = useState('all')

  const filteredAnnouncements = announcements.filter(a => {
    if (filter === 'all') return true
    if (filter === 'department') return a.targetType === 'department'
    if (filter === 'class') return a.targetType === 'class'
    if (filter === 'group') return a.targetType === 'group'
    return true
  })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getSenderRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return '👔'
      case 'HOD': return '🎓'
      case 'Faculty': return '📚'
      default: return '📢'
    }
  }

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'department', label: 'My Department' },
    { id: 'class', label: 'My Class' },
    { id: 'group', label: 'My Group' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Announcements</h2>
        <p className="text-gray-500 dark:text-gray-400">View announcements from admin and faculty</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.id
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <FaFilter className="inline mr-2" />
            {f.label}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 text-center">
            <FaBullhorn className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No announcements found</p>
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <div 
              key={announcement.id} 
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 card-hover"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{getSenderRoleIcon(announcement.senderRole)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{announcement.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority} priority
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{announcement.message}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaUser className="text-xs" />
                      {announcement.sender} ({announcement.senderRole})
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock className="text-xs" />
                      {announcement.date}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      Target: {announcement.target}
                    </span>
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

export default StudentAnnouncement

