import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { FaUserClock, FaCheckCircle, FaTimesCircle, FaEdit, FaSave } from 'react-icons/fa'

const FacultyAttendance = () => {
  const { students, subjects } = useApp()
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isEditing, setIsEditing] = useState(false)
  const [attendance, setAttendance] = useState(
    students.reduce((acc, student) => ({
      ...acc,
      [student.id]: 'present'
    }), {})
  )

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  const handleSave = () => {
    setIsEditing(false)
    alert('Attendance saved successfully!')
  }

  const presentCount = Object.values(attendance).filter(s => s === 'present').length
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length
  const odCount = Object.values(attendance).filter(s => s === 'od').length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Attendance</h2>
          <p className="text-gray-500 dark:text-gray-400">Mark and manage student attendance</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${
              isEditing 
                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            <FaEdit />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          {isEditing && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              <FaSave />
              Save
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="input w-48"
          >
            <option value="">Select Subject</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input w-48"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Present</p>
              <p className="text-2xl font-bold text-green-600">{presentCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Absent</p>
              <p className="text-2xl font-bold text-red-600">{absentCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <FaTimesCircle className="text-red-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">On Duty</p>
              <p className="text-2xl font-bold text-yellow-600">{odCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <FaUserClock className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th>Register No</th>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="font-medium text-gray-800 dark:text-white">{student.registerNumber}</td>
                  <td>{student.name}</td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      attendance[student.id] === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      attendance[student.id] === 'absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {attendance[student.id]}
                    </span>
                  </td>
                  <td>
                    {isEditing && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStatusChange(student.id, 'present')}
                          className={`p-2 rounded-lg transition-colors ${
                            attendance[student.id] === 'present'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                              : 'text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                        >
                          <FaCheckCircle />
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, 'absent')}
                          className={`p-2 rounded-lg transition-colors ${
                            attendance[student.id] === 'absent'
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                              : 'text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                        >
                          <FaTimesCircle />
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, 'od')}
                          className={`p-2 rounded-lg transition-colors ${
                            attendance[student.id] === 'od'
                              ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30'
                              : 'text-gray-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                          }`}
                        >
                          <FaUserClock />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FacultyAttendance

