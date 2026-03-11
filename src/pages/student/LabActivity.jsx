import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { FaLaptop, FaCode, FaClock, FaCheckCircle, FaTimesCircle, FaUpload, FaCalendarAlt } from 'react-icons/fa'

const LabActivity = () => {
  const { subjects } = useApp()
  const [selectedLab, setSelectedLab] = useState(null)

  const labSubjects = subjects.filter(s => s.type === 'lab')

  const labActivities = {
    5: [
      { id: 1, title: 'Linear Regression Implementation', deadline: '2024-03-05', status: 'open', submitted: false, description: 'Implement linear regression using Python and scikit-learn' },
      { id: 2, title: 'Classification Algorithm', deadline: '2024-03-10', status: 'open', submitted: true, description: 'Build a decision tree classifier' },
      { id: 3, title: 'Neural Network Basics', deadline: '2024-02-28', status: 'closed', submitted: true, description: 'Create a basic neural network using TensorFlow' },
    ],
    6: [
      { id: 1, title: 'SQL Queries Practice', deadline: '2024-03-08', status: 'open', submitted: false, description: 'Write complex SQL queries for the given database' },
      { id: 2, title: 'Database Normalization', deadline: '2024-03-12', status: 'open', submitted: false, description: 'Normalize the given database to 3NF' },
      { id: 3, title: 'PL/SQL Procedures', deadline: '2024-02-25', status: 'closed', submitted: true, description: 'Create stored procedures and triggers' },
    ]
  }

  const handleSubmit = (activityId) => {
    alert('Submission feature will be available soon!')
  }

  const getStatusBadge = (activity) => {
    if (activity.status === 'closed') {
      return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">Closed</span>
    }
    if (activity.submitted) {
      return <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">Submitted</span>
    }
    return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">Open</span>
  }

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Lab Activity</h2>
        <p className="text-gray-500 dark:text-gray-400">Track your lab submissions and deadlines</p>
      </div>

      {!selectedLab ? (
        /* Lab Subject Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {labSubjects.map((lab) => (
            <button
              key={lab.id}
              onClick={() => setSelectedLab(lab)}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 text-left card-hover transition-all hover:border-green-500"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <FaLaptop className="text-green-600 dark:text-green-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{lab.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{lab.code}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Faculty:</span> {lab.faculty}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Lab Activities */
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={() => setSelectedLab(null)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            ← Back to Labs
          </button>

          {/* Lab Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{selectedLab.name}</h3>
            <p className="text-gray-500 dark:text-gray-400">{selectedLab.code} | {selectedLab.faculty}</p>
          </div>

          {/* Activities */}
          <div className="space-y-4">
            {labActivities[selectedLab.id]?.map((activity) => (
              <div 
                key={activity.id} 
                className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border ${
                  isDeadlinePassed(activity.deadline) && !activity.submitted 
                    ? 'border-red-300 dark:border-red-800' 
                    : 'border-gray-200 dark:border-gray-700'
                } card-hover`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      activity.status === 'closed' 
                        ? 'bg-gray-100 dark:bg-gray-700' 
                        : activity.submitted 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <FaCode className={`${
                        activity.status === 'closed' 
                          ? 'text-gray-400' 
                          : activity.submitted 
                            ? 'text-green-600' 
                            : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">{activity.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activity.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className={`flex items-center gap-1 ${
                          isDeadlinePassed(activity.deadline) ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          <FaClock className="text-xs" />
                          Due: {activity.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(activity)}
                    {activity.status === 'open' && !activity.submitted && !isDeadlinePassed(activity.deadline) && (
                      <button
                        onClick={() => handleSubmit(activity.id)}
                        className="mt-2 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                      >
                        <FaUpload /> Submit
                      </button>
                    )}
                    {isDeadlinePassed(activity.deadline) && !activity.submitted && (
                      <span className="mt-2 px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium">
                        Missed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )) || (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 text-center">
                <FaLaptop className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No lab activities available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LabActivity

