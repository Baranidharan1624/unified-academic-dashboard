import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { FaChartBar, FaFileAlt, FaClipboardList, FaStar, FaSortAmountDown } from 'react-icons/fa'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement)

const Marks = () => {
  const { marks, subjects, currentUser } = useApp()
  const [activeTab, setActiveTab] = useState('cat')

  const catMarks = [
    { subject: 'Machine Learning', cat1: 25, cat2: 28, total: 53 },
    { subject: 'Database Systems', cat1: 26, cat2: 27, total: 53 },
    { subject: 'Computer Networks', cat1: 22, cat2: 24, total: 46 },
    { subject: 'Operating Systems', cat1: 20, cat2: 22, total: 42 },
  ]

  const labMarks = [
    { subject: 'Machine Learning Lab', lab1: 45, lab2: 48, assignment: 10, total: 103 },
    { subject: 'Database Lab', lab1: 44, lab2: 46, assignment: 9, total: 99 },
  ]

  const gradeBook = [
    { subject: 'Machine Learning', credits: 4, grade: 'S', points: 10, gradePoint: 40 },
    { subject: 'Database Systems', credits: 4, grade: 'S', points: 10, gradePoint: 40 },
    { subject: 'Computer Networks', credits: 3, grade: 'A', points: 9, gradePoint: 27 },
    { subject: 'Operating Systems', credits: 3, grade: 'A', points: 9, gradePoint: 27 },
    { subject: 'Machine Learning Lab', credits: 2, grade: 'S', points: 10, gradePoint: 20 },
    { subject: 'Database Lab', credits: 2, grade: 'S', points: 10, gradePoint: 20 },
  ]

  const assignmentMarks = [
    { subject: 'Machine Learning', a1: 10, a2: 10, a3: 9, a4: 10, total: 39 },
    { subject: 'Database Systems', a1: 9, a2: 10, a3: 8, a4: 9, total: 36 },
    { subject: 'Computer Networks', a1: 8, a2: 9, a3: 10, a4: 8, total: 35 },
  ]

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'S': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'A': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'B': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'C': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Chart data
  const catChartData = {
    labels: catMarks.map(m => m.subject.substring(0, 10)),
    datasets: [
      {
        label: 'CAT-1',
        data: catMarks.map(m => m.cat1),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8,
      },
      {
        label: 'CAT-2',
        data: catMarks.map(m => m.cat2),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderRadius: 8,
      },
    ],
  }

  const progressChartData = {
    labels: ['ML', 'DBMS', 'CN', 'OS', 'ML Lab', 'DB Lab'],
    datasets: [{
      label: 'Performance',
      data: [90, 88, 76, 70, 95, 92],
      backgroundColor: [
        'rgba(139, 92, 246, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderRadius: 8,
    }],
  }

  const tabs = [
    { id: 'cat', label: 'CAT Marks', icon: FaFileAlt },
    { id: 'lab', label: 'Lab Marks', icon: FaClipboardList },
    { id: 'grade', label: 'Grade Book', icon: FaStar },
    { id: 'assignment', label: 'Assignment', icon: FaClipboardList },
  ]

  const renderCatMarks = () => (
    <div className="space-y-6">
      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">CAT Performance</h3>
        <div className="h-64">
          <Bar 
            data={catChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom' } },
              scales: { y: { beginAtZero: true, max: 30 } }
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th>Subject</th>
                <th>CAT-1</th>
                <th>CAT-2</th>
                <th>Total</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {catMarks.map((mark, index) => (
                <tr key={index}>
                  <td className="font-medium text-gray-800 dark:text-white">{mark.subject}</td>
                  <td>{mark.cat1}</td>
                  <td>{mark.cat2}</td>
                  <td className="font-semibold">{mark.total}</td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getGradeColor(mark.total >= 50 ? 'A' : 'B')}`}>
                      {mark.total >= 50 ? 'A' : 'B'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderLabMarks = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Lab Exam-1</th>
              <th>Lab Exam-2</th>
              <th>Assignment</th>
              <th>Total</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {labMarks.map((mark, index) => (
              <tr key={index}>
                <td className="font-medium text-gray-800 dark:text-white">{mark.subject}</td>
                <td>{mark.lab1}</td>
                <td>{mark.lab2}</td>
                <td>{mark.assignment}</td>
                <td className="font-semibold">{mark.total}</td>
                <td>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getGradeColor('S')}`}>
                    S
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderGradeBook = () => (
    <div className="space-y-6">
      {/* GPA Card */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="opacity-90">Current CGPA</p>
            <p className="text-4xl font-bold">{currentUser?.cgpa || 8.7}</p>
          </div>
          <div className="text-right">
            <p className="opacity-90">Total Credits</p>
            <p className="text-2xl font-bold">18</p>
          </div>
        </div>
      </div>

      {/* Grade Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Credits</th>
                <th>Grade</th>
                <th>Grade Points</th>
                <th>Credit Points</th>
              </tr>
            </thead>
            <tbody>
              {gradeBook.map((record, index) => (
                <tr key={index}>
                  <td className="font-medium text-gray-800 dark:text-white">{record.subject}</td>
                  <td>{record.credits}</td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getGradeColor(record.grade)}`}>
                      {record.grade}
                    </span>
                  </td>
                  <td>{record.points}</td>
                  <td className="font-semibold">{record.gradePoint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderAssignmentMarks = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Assignment 1</th>
              <th>Assignment 2</th>
              <th>Assignment 3</th>
              <th>Assignment 4</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {assignmentMarks.map((mark, index) => (
              <tr key={index}>
                <td className="font-medium text-gray-800 dark:text-white">{mark.subject}</td>
                <td>{mark.a1}/10</td>
                <td>{mark.a2}/10</td>
                <td>{mark.a3}/10</td>
                <td>{mark.a4}/10</td>
                <td className="font-semibold">{mark.total}/40</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Marks</h2>
        <p className="text-gray-500 dark:text-gray-400">View your CAT marks, lab marks, and grade book</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'cat' && renderCatMarks()}
      {activeTab === 'lab' && renderLabMarks()}
      {activeTab === 'grade' && renderGradeBook()}
      {activeTab === 'assignment' && renderAssignmentMarks()}
    </div>
  )
}

export default Marks

