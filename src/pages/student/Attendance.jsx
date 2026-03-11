import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock, FaFileAlt, FaPaperPlane, FaChartLine } from 'react-icons/fa'
import { Modal } from '../../components/ui/Modal'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const Attendance = () => {
  const { currentUser, subjects, attendance, showToast } = useApp()
  const [activeTab, setActiveTab] = useState('overall')
  const [showODModal, setShowODModal] = useState(false)
  const [odRequest, setOdRequest] = useState({
    reason: '',
    date: '',
    supportingDoc: null
  })

  // Calculate attendance stats
  const overallAttendance = currentUser?.attendance || 85

  const attendanceByStatus = {
    present: 45,
    absent: 3,
    od: 2
  }

  const subjectWiseAttendance = subjects.map(subject => ({
    name: subject.name,
    present: Math.floor(Math.random() * 10) + 40,
    total: 50,
    percentage: Math.floor(Math.random() * 20) + 75
  }))

  const overallData = {
    labels: ['Present', 'Absent', 'OD'],
    datasets: [{
      data: [attendanceByStatus.present, attendanceByStatus.absent, attendanceByStatus.od],
      backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'],
      borderWidth: 0,
    }]
  }

  const subjectData = {
    labels: subjectWiseAttendance.map(s => s.name.substring(0, 10)),
    datasets: [{
      label: 'Attendance %',
      data: subjectWiseAttendance.map(s => s.percentage),
      backgroundColor: subjectWiseAttendance.map(s => s.percentage >= 75 ? '#22c55e' : '#ef4444'),
      borderRadius: 8,
    }]
  }

  const handleODSubmit = (e) => {
    e.preventDefault()
    showToast('OD Request submitted successfully', 'success')
    setShowODModal(false)
    setOdRequest({ reason: '', date: '', supportingDoc: null })
  }

  const tabs = [
    { id: 'overall', label: 'Overall Attendance' },
    { id: 'subject', label: 'Subject Wise' },
    { id: 'od', label: 'OD Request' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Attendance</h2>
          <p className="text-gray-500 dark:text-gray-400">Track your attendance records and apply for OD</p>
        </div>
        <button
          onClick={() => setShowODModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <FaPaperPlane />
          Apply OD
        </button>
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
          </button>
        ))}
      </div>

      {/* Overall Attendance Tab */}
      {activeTab === 'overall' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Overall Attendance</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">{overallAttendance}%</p>
                </div>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${overallAttendance >= 75 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  <FaChartLine className={`text-2xl ${overallAttendance >= 75 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${overallAttendance >= 75 ? 'bg-green-500' : 'bg-red-500'}`} 
                    style={{ width: `${overallAttendance}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {overallAttendance >= 75 ? '✓ Eligible for exams' : '✗ Not eligible for exams'}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Present</p>
                  <p className="text-2xl font-bold text-green-600">{attendanceByStatus.present}</p>
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
                  <p className="text-2xl font-bold text-red-600">{attendanceByStatus.absent}</p>
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
                  <p className="text-2xl font-bold text-yellow-600">{attendanceByStatus.od}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                  <FaClock className="text-yellow-600 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Attendance Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="w-48 h-48">
                <Doughnut 
                  data={overallData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subject Wise Tab */}
      {activeTab === 'subject' && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Subject Wise Attendance</h3>
            <div className="h-64">
              <Bar 
                data={subjectData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, max: 100 } }
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
                    <th>Present</th>
                    <th>Total</th>
                    <th>Percentage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectWiseAttendance.map((subject, index) => (
                    <tr key={index}>
                      <td className="font-medium text-gray-800 dark:text-white">{subject.name}</td>
                      <td>{subject.present}</td>
                      <td>{subject.total}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${subject.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`} 
                              style={{ width: `${subject.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{subject.percentage}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          subject.percentage >= 75 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {subject.percentage >= 75 ? 'Eligible' : 'Not Eligible'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* OD Request Tab */}
      {activeTab === 'od' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Apply for On Duty (OD)</h3>
          <form onSubmit={handleODSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for OD</label>
              <textarea
                required
                value={odRequest.reason}
                onChange={(e) => setOdRequest({ ...odRequest, reason: e.target.value })}
                className="input"
                rows={3}
                placeholder="Enter the reason for your OD request..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={odRequest.date}
                onChange={(e) => setOdRequest({ ...odRequest, date: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supporting Document (Optional)</label>
              <input
                type="file"
                className="input"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <FaPaperPlane className="mr-2" />
              Submit Request
            </button>
          </form>

          {/* Previous OD Requests */}
          <div className="mt-8">
            <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">Previous OD Requests</h4>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Python Workshop at IIT Madras</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date: March 10, 2024</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                    Approved
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OD Modal */}
      {showODModal && (
        <Modal title="Apply for On Duty" onClose={() => setShowODModal(false)}>
          <form onSubmit={handleODSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for OD</label>
              <textarea
                required
                value={odRequest.reason}
                onChange={(e) => setOdRequest({ ...odRequest, reason: e.target.value })}
                className="input"
                rows={3}
                placeholder="Enter the reason for your OD request..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={odRequest.date}
                onChange={(e) => setOdRequest({ ...odRequest, date: e.target.value })}
                className="input"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowODModal(false)} className="flex-1 btn btn-outline">
                Cancel
              </button>
              <button type="submit" className="flex-1 btn btn-primary">
                Submit
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default Attendance

