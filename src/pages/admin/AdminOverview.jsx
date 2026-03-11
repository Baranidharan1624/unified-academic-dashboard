import React from 'react'
import { useApp } from '../../context/AppContext'
import { 
  FaUserGraduate, FaChalkboardTeacher, FaBullhorn, 
  FaEnvelopeOpenText, FaExclamationCircle, FaChartLine,
  FaCheckCircle, FaClock, FaTimesCircle
} from 'react-icons/fa'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement)

const AdminOverview = () => {
  const { students, faculty, announcements, requests, complaints } = useApp()

  const pendingRequests = requests.filter(r => r.status === 'pending').length
  const pendingComplaints = complaints.filter(c => c.status === 'pending').length

  const statsCards = [
    { title: 'Total Students', value: students.length, icon: FaUserGraduate, color: 'from-blue-500 to-blue-600', change: '+5%' },
    { title: 'Total Faculty', value: faculty.length, icon: FaChalkboardTeacher, color: 'from-green-500 to-green-600', change: '+2%' },
    { title: 'Announcements', value: announcements.length, icon: FaBullhorn, color: 'from-purple-500 to-purple-600', change: '+3' },
    { title: 'Pending Requests', value: pendingRequests, icon: FaEnvelopeOpenText, color: 'from-yellow-500 to-yellow-600', change: '' },
    { title: 'Complaints', value: pendingComplaints, icon: FaExclamationCircle, color: 'from-red-500 to-red-600', change: '' },
  ]

  const pieData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [
          requests.filter(r => r.status === 'pending').length,
          requests.filter(r => r.status === 'approved').length,
          requests.filter(r => r.status === 'rejected').length
        ],
        backgroundColor: ['#fbbf24', '#22c55e', '#ef4444'],
        borderWidth: 0,
      },
    ],
  }

  const barData = {
    labels: ['CSE', 'IT', 'ECE', 'EEE', 'MECH'],
    datasets: [
      {
        label: 'Students',
        data: [120, 100, 90, 80, 70],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8,
      },
      {
        label: 'Faculty',
        data: [15, 12, 10, 8, 8],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 8,
      },
    ],
  }

  const recentActivities = [
    { id: 1, action: 'New student registered', name: 'Arun Kumar', time: '2 mins ago', type: 'student' },
    { id: 2, action: 'OD Request submitted', name: 'Priya Sharma', time: '15 mins ago', type: 'request' },
    { id: 3, action: 'Complaint received', name: 'Mohammad Rizwan', time: '1 hour ago', type: 'complaint' },
    { id: 4, action: 'Announcement posted', name: 'Dr. Suresh Kumar', time: '2 hours ago', type: 'announcement' },
    { id: 5, action: 'Leave request', name: 'Ms. Divya', time: '3 hours ago', type: 'leave' },
  ]

  const getActivityIcon = (type) => {
    switch (type) {
      case 'student': return <FaUserGraduate className="text-blue-500" />
      case 'request': return <FaEnvelopeOpenText className="text-yellow-500" />
      case 'complaint': return <FaExclamationCircle className="text-red-500" />
      case 'announcement': return <FaBullhorn className="text-purple-500" />
      case 'leave': return <FaClock className="text-orange-500" />
      default: return <FaChartLine />
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stat.value}</p>
                {stat.change && (
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <FaChartLine className="text-xs" />
                    {stat.change} this month
                  </p>
                )}
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <stat.icon className="text-white text-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Department Distribution</h3>
          <div className="h-64">
            <Bar 
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }}
            />
          </div>
        </div>

        {/* Request Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Request Status</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="w-48 h-48">
              <Pie 
                data={pieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Activities</h3>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-white">{activity.action}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{activity.name}</p>
              </div>
              <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminOverview

