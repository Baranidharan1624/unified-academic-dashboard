import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { FaExclamationCircle, FaClock, FaCheckCircle, FaTimesCircle, FaUserGraduate, FaChalkboardTeacher, FaWrench, FaDesktop, FaBuilding } from 'react-icons/fa'

const Complaints = () => {
  const { complaints, updateComplaintStatus, showToast } = useApp()
  const [activeTab, setActiveTab] = useState('student')

  const studentComplaints = complaints.filter(c => c.type !== 'Infrastructure')
  const facultyComplaints = complaints.filter(c => c.type === 'Infrastructure' && c.facultyName)

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'medium': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Lab Equipment': return <FaDesktop className="text-blue-500" />
      case 'Certificate Issue': return <FaFileAlt className="text-purple-500" />
      case 'Portal Issue': return <FaDesktop className="text-green-500" />
      case 'Washroom': return <FaBuilding className="text-orange-500" />
      default: return <FaExclamationCircle />
    }
  }

  const tabs = [
    { id: 'student', label: 'Student Complaints', count: studentComplaints.length },
    { id: 'faculty', label: 'Faculty Complaints', count: facultyComplaints.length },
  ]

  const handleStatusChange = (complaintId, newStatus) => {
    updateComplaintStatus(complaintId, newStatus)
  }

  const renderComplaints = (complaintsList) => (
    <div className="space-y-4">
      {complaintsList.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 text-center">
          <FaExclamationCircle className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No complaints found</p>
        </div>
      ) : (
        complaintsList.map((complaint) => (
          <div key={complaint.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 card-hover">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                  {getCategoryIcon(complaint.category)}
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {complaint.studentName || complaint.facultyName}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status === 'in_progress' ? 'In Progress' : complaint.status}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority} priority
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <p><span className="font-medium">Category:</span> {complaint.category}</p>
                    <p><span className="font-medium">Type:</span> {complaint.type}</p>
                    <p><span className="font-medium">Description:</span> {complaint.description}</p>
                    <p><span className="font-medium">Date:</span> {complaint.date}</p>
                    {complaint.registerNumber && (
                      <p><span className="font-medium">Register No:</span> {complaint.registerNumber}</p>
                    )}
                    {complaint.facultyId && (
                      <p><span className="font-medium">Faculty ID:</span> {complaint.facultyId}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleStatusChange(complaint.id, 'in_progress')}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Mark In Progress"
                  >
                    <FaClock />
                  </button>
                  <button
                    onClick={() => handleStatusChange(complaint.id, 'resolved')}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    title="Mark Resolved"
                  >
                    <FaCheckCircle />
                  </button>
                  <button
                    onClick={() => handleStatusChange(complaint.id, 'pending')}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                    title="Mark Pending"
                  >
                    <FaTimesCircle />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Complaints</h2>
        <p className="text-gray-500 dark:text-gray-400">Review and manage complaints from students and faculty</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
            <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'student' 
        ? renderComplaints(studentComplaints) 
        : renderComplaints(facultyComplaints)
      }
    </div>
  )
}

export default Complaints

