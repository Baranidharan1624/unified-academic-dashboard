import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { FaSave, FaEdit, FaChartBar } from 'react-icons/fa'

const FacultyMarks = () => {
  const { students, subjects, showToast } = useApp()
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedExam, setSelectedExam] = useState('cat1')
  const [isEditing, setIsEditing] = useState(false)
  const [marks, setMarks] = useState(
    students.reduce((acc, student) => ({
      ...acc,
      [student.id]: { cat1: 0, cat2: 0, lab: 0, assignment: 0 }
    }), {})
  )

  const handleMarkChange = (studentId, exam, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [exam]: parseInt(value) || 0 }
    }))
  }

  const handleSave = () => {
    setIsEditing(false)
    showToast('Marks saved successfully!', 'success')
  }

  const exams = [
    { id: 'cat1', label: 'CAT-1' },
    { id: 'cat2', label: 'CAT-2' },
    { id: 'lab', label: 'Lab Exam' },
    { id: 'assignment', label: 'Assignment' },
  ]

  const getGrade = (total) => {
    if (total >= 90) return 'S'
    if (total >= 80) return 'A'
    if (total >= 70) return 'B'
    if (total >= 60) return 'C'
    if (total >= 50) return 'D'
    return 'F'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Marks</h2>
          <p className="text-gray-500 dark:text-gray-400">Enter and manage student marks</p>
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Type</label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="input w-48"
          >
            {exams.map(exam => (
              <option key={exam.id} value={exam.id}>{exam.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th>Register No</th>
                <th>Name</th>
                <th>{exams.find(e => e.id === selectedExam)?.label}</th>
                <th>Total</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const mark = marks[student.id]?.[selectedExam] || 0
                return (
                  <tr key={student.id}>
                    <td className="font-medium text-gray-800 dark:text-white">{student.registerNumber}</td>
                    <td>{student.name}</td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={mark}
                          onChange={(e) => handleMarkChange(student.id, selectedExam, e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        />
                      ) : (
                        mark
                      )}
                    </td>
                    <td className="font-semibold">{mark}</td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        getGrade(mark * (selectedExam === 'lab' ? 4 : 3.3)) === 'S' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        getGrade(mark * (selectedExam === 'lab' ? 4 : 3.3)) === 'A' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        getGrade(mark * (selectedExam === 'lab' ? 4 : 3.3)) === 'F' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {getGrade(mark * (selectedExam === 'lab' ? 4 : 3.3))}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FacultyMarks

