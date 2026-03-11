import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { FaPlus, FaBullhorn, FaPaperPlane, FaFilter, FaTrash, FaEdit, FaClock, FaExclamationTriangle } from 'react-icons/fa'
import { Modal } from '../../components/ui/Modal'

const Announcement = () => {
  const { announcements, addAnnouncement, showToast } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    targetType: 'department',
    target: 'CSE',
    priority: 'medium',
    sender: 'Admin',
    senderRole: 'Admin'
  })

  const filteredAnnouncements = announcements.filter(a => {
    if (filter === 'all') return true
    return a.targetType === filter
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    addAnnouncement(newAnnouncement)
    setShowModal(false)
    setNewAnnouncement({
      title: '',
      message: '',
      targetType: 'department',
      target: 'CSE',
      priority: 'medium',
      sender: 'Admin',
      senderRole: 'Admin'
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTargetTypeLabel = (targetType) => {
    switch (targetType) {
      case 'department': return 'Department'
      case 'class': return 'Class'
      case 'faculty': return 'Faculty'
      case 'group': return 'Group'
      case 'all': return 'All'
      default: return targetType
    }
  }

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'department', label: 'Department' },
    { id: 'class', label: 'Class' },
    { id: 'faculty', label: 'Faculty' },
    { id: 'group', label: 'Group' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Announcements</h2>
          <p className="text-gray-500 dark:text-gray-400">Create and manage announcements for students and faculty</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <FaPaperPlane />
          Create Announcement
        </button>
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
            {f.label}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <div 
            key={announcement.id} 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 card-hover"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaBullhorn className="text-white text-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{announcement.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">{announcement.message}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaClock className="text-xs" />
                      {announcement.date}
                    </span>
                    <span>From: {announcement.sender} ({announcement.senderRole})</span>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      {getTargetTypeLabel(announcement.targetType)}: {announcement.target}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                  <FaEdit />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Announcement Modal */}
      {showModal && (
        <Modal title="Create New Announcement" onClose={() => setShowModal(false)} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                required
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                className="input"
                placeholder="Enter announcement title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <textarea
                required
                value={newAnnouncement.message}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                className="input"
                rows={4}
                placeholder="Enter announcement message"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Type</label>
                <select
                  value={newAnnouncement.targetType}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetType: e.target.value })}
                  className="input"
                >
                  <option value="department">Department</option>
                  <option value="class">Class</option>
                  <option value="faculty">Faculty</option>
                  <option value="group">Group</option>
                  <option value="all">All</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target</label>
                <select
                  value={newAnnouncement.target}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target: e.target.value })}
                  className="input"
                >
                  {newAnnouncement.targetType === 'department' && (
                    <>
                      <option value="CSE">CSE</option>
                      <option value="IT">IT</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="MECH">MECH</option>
                    </>
                  )}
                  {newAnnouncement.targetType === 'class' && (
                    <>
                      <option value="III Year CSE">III Year CSE</option>
                      <option value="II Year CSE">II Year CSE</option>
                      <option value="I Year CSE">I Year CSE</option>
                    </>
                  )}
                  {newAnnouncement.targetType === 'group' && (
                    <>
                      <option value="III Year A">III Year A</option>
                      <option value="III Year B">III Year B</option>
                    </>
                  )}
                  <option value="All">All</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <div className="flex gap-3">
                {['low', 'medium', 'high'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewAnnouncement({ ...newAnnouncement, priority: p })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                      newAnnouncement.priority === p
                        ? p === 'high' ? 'bg-red-600 text-white' :
                          p === 'medium' ? 'bg-yellow-600 text-white' :
                          'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {p === 'high' && <FaExclamationTriangle className="inline mr-1" />}
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn btn-primary"
              >
                <FaPaperPlane className="mr-2" />
                Post Announcement
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default Announcement

