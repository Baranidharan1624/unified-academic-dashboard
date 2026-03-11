import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { FaCheckCircle, FaTimesCircle, FaClock, FaUserGraduate } from 'react-icons/fa'

const FacultyRequests = () => {
  const { requests, showToast } = useApp()
  const [activeTab, setActiveTab] = useState('od')

  const studentRequests = requests.filter(r => r.type === 'OD' || r.type === 'Bonafide' || r.type === 'Mass OD')
  
  const handleApprove = (requestId) => {
    showToast('Request approved successfully!', 'success')
  }

  const handleReject = (requestId) => {
    showToast('Request rejected', 'error')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const tabs = [
    { id: 'od', label: 'OD Requests', count: studentRequests.filter(r => r.type === 'OD').length },
    { id: 'bonafide', label: 'Bonafide', count: studentRequests.filter(r => r.type === 'Bonafide').length },
    { id: 'mass', label: 'Mass OD', count: studentRequests.filter(r => r.type === 'Mass OD').length },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Requests</h2>
        <p className="text-gray-500 dark:text-gray-400">Review and manage student requests</p>
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
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {studentRequests.filter(r => activeTab === 'od' ? r.type === 'OD' : activeTab === 'bonafide' ? r.type === 'Bonafide' : r.type === 'Mass OD').length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 text-center">
            <FaUserGraduate className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No requests found</p>
          </div>
        ) : (
          studentRequests
            .filter(r => activeTab === 'od' ? r.type === 'OD' : activeTab === 'bonafide' ? r.type === 'Bonafide' : r.type === 'Mass OD')
            .map((request) => (
              <div key={request.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 card-hover">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                      <FaUserGraduate className="text-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-gray-800 dark:text-white">{request.studentName}</h3>
                        <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                          {request.type}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <p><span className="font-medium">Register No:</span> {request.registerNumber}</p>
                        <p><span className="font-medium">Reason:</span> {request.reason}</p>
                        <p><span className="font-medium">Date:</span> {request.date}</p>
                        {request.count && <p><span className="font-medium">Count:</span> {request.count} students</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {request.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          <FaCheckCircle /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          <FaTimesCircle /> Reject
                        </button>
                      </>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}

export default FacultyRequests

