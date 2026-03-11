import React from 'react'
import { useApp } from '../../context/AppContext'
import { FaCalendarAlt, FaBook, FaChartLine, FaClipboardList, FaBell, FaGraduationCap, FaLaptopHouse } from 'react-icons/fa'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const StudentOverview = () => {
  const { currentUser, announcements, attendance, marks, subjects } = useApp()

  // Calculate attendance
  const presentDays = 45
  const totalDays = 50
  const attendancePercentage = (presentDays / totalDays) * 100

  const attendanceData = {
    labels: ['Present', 'Absent', 'OD'],
    datasets: [{
      data: [45, 3, 2],
      backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'],
      borderWidth: 0,
    }]
  }

  const marksData = {
    labels: subjects.filter(s => s.type === 'theory').map(s => s.name.substring(0, 10)),
    datasets: [{
      label: 'CAT Marks',
      data: [25, 28, 22, 20],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderRadius: 8,
    }]
  }

  const quickActions = [
    { id: 'attendance', label: 'Attendance', icon: FaCalendarAlt, path: '/student/attendance', color: 'from-blue-500 to-cyan-500' },
    { id: 'marks', label: 'Marks', icon: FaChartLine, path: '/student/marks', color: 'from-purple-500 to-pink-500' },
    { id: 'course', label: 'Course', icon: FaBook, path: '/student/course', color: 'from-green-500 to-teal-500' },
    { id: 'lab', label: 'Lab', icon: FaLaptopHouse, path: '/student/lab', color: 'from-orange-500 to-red-500' },
  ]

  const upcomingEvents = [
    { id: 1, title: 'Machine Learning CAT-2', date: 'March 5, 2024', type: 'exam' },
    { id: 2, title: 'Database Lab Exam', date: 'March 8, 2024', type: 'exam' },
    { id: 3, title: 'Guest Lecture on AI', date: 'March 10, 2024', type: 'event' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {currentUser?.name?.split(' ')[0]}! 👋</h1>
            <p className="opacity-90 mt-1">Here's what's happening with your academics today.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{currentUser?.cgpa}</p>
              <p className="text-sm opacity-80">CGPA</p>
            </div>
            <div className="w-px h-12 bg-white/30"></div>
            <div className="text-center">
              <p className="text-3xl font-bold">{attendancePercentage.toFixed(0)}%</p>
              <p className="text-sm opacity-80">Attendance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <a
            key={action.id}
            href={action.path}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 card-hover"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-3`}>
              <action.icon className="text-white text-xl" />
            </div>
            <p className="font-semibold text-gray-800 dark:text-white">{action.label}</p>
          </a>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Register Number</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{currentUser?.registerNumber}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <FaGraduationCap className="text-blue-600 dark:text-blue-400 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{currentUser?.department}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <FaBook className="text-green-600 dark:text-green-400 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Year & Section</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{currentUser?.year} - {currentUser?.section}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <FaClipboardList className="text-purple-600 dark:text-purple-400 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Mobile</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{currentUser?.mobile}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <FaBell className="text-orange-600 dark:text-orange-400 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Attendance Overview</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="w-48 h-48">
              <Doughnut 
                data={attendanceData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } }
                }}
              />
            </div>
          </div>
        </div>

        {/* Marks Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Subject Performance</h3>
          <div className="h-64">
            <Bar 
              data={marksData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, max: 30 } }
              }}
            />
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  event.type === 'exam' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  <FaCalendarAlt className={`${
                    event.type === 'exam' ? 'text-red-600' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{event.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{event.date}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                event.type === 'exam' 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {event.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Announcements</h3>
        <div className="space-y-3">
          {announcements.slice(0, 3).map((announcement) => (
            <div key={announcement.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{announcement.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{announcement.message.substring(0, 80)}...</p>
                </div>
                <span className="text-xs text-gray-400">{announcement.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StudentOverview

