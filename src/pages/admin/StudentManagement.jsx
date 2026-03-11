import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { 
  FaPlus, FaSearch, FaEdit, FaTrash, FaUserPlus, 
  FaClipboardList, FaCheckCircle, FaTimesCircle, FaFilter,
  FaChartLine, FaUserClock
} from 'react-icons/fa'
import { Modal } from '../../components/ui/Modal'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const StudentManagement = () => {
  const { students, attendance, marks, addStudent, showToast } = useApp()
  const [activeTab, setActiveTab] = useState('students')
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    registerNumber: '',
    department: 'CSE',
    year: 'III',
    section: 'A',
    mobile: '',
    dob: '',
    address: ''
  })

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.registerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    addStudent(newStudent)
    setShowModal(false)
    setNewStudent({
      name: '',
      email: '',
      registerNumber: '',
      department: 'CSE',
      year: 'III',
      section: 'A',
      mobile: '',
      dob: '',
      address: ''
    })
  }

  // Calculate attendance stats
  const attendanceStats = {
    above75: students.filter(s => s.attendance >= 75).length,
    below75: students.filter(s => s.attendance < 75).length,
  }

  // Marks analytics
  const gradeDistribution = {
    S: marks.filter(m => m.grade === 'S').length,
    A: marks.filter(m => m.grade === 'A').length,
    B: marks.filter(m => m.grade === 'B').length,
    C: marks.filter(m => m.grade === 'C').length,
    D: marks.filter(m => m.grade === 'D').length,
  }

  const attendancePieData = {
    labels: ['Above 75%', 'Below 75%'],
    datasets: [{
      data: [attendanceStats.above75, attendanceStats.below75],
      backgroundColor: ['#22c55e', '#ef4444'],
      borderWidth: 0,
    }]
  }

  const marksBarData = {
    labels: ['S', 'A', 'B', 'C', 'D'],
    datasets: [{
      label: 'Number of Students',
      data: [gradeDistribution.S, gradeDistribution.A, gradeDistribution.B, gradeDistribution.C, gradeDistribution.D],
      backgroundColor: ['#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'],
      borderRadius: 8,
    }]
  }

  const tabs = [
    { id: 'students', label: 'Student List', count: students.length },
    { id: 'attendance', label: 'Attendance', count: null },
    { id: 'analytics', label: 'Marks Analytics', count: null },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Student Management</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage students, attendance, and performance</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <FaUserPlus />
          Add Student
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

      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search students by name, register number, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>

      {/* Student List Tab */}
      {activeTab === 'students' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {student.profilePic ? (
                      <img src={student.profilePic} alt={student.name} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      student.name.split(' ').map(n => n[0]).join('')
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{student.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{student.registerNumber}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Department</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{student.department}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Year & Sec</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{student.year} - {student.section}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">CGPA</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{student.cgpa}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Attendance</p>
                    <p className={`font-medium ${student.attendance >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                      {student.attendance}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 py-2 px-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                  <FaEdit /> Edit
                </button>
                <button className="py-2 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Above 75%</p>
                  <p className="text-2xl font-bold text-green-600">{attendanceStats.above75}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <FaCheckCircle className="text-green-600 text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Below 75%</p>
                  <p className="text-2xl font-bold text-red-600">{attendanceStats.below75}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <FaTimesCircle className="text-red-600 text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Average</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / students.length)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <FaUserClock className="text-primary-600 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white">Class-Wise Attendance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Register No</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Year</th>
                    <th>Attendance %</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="font-medium text-gray-800 dark:text-white">{student.registerNumber}</td>
                      <td>{student.name}</td>
                      <td>{student.department}</td>
                      <td>{student.year}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${student.attendance >= 75 ? 'bg-green-500' : 'bg-red-500'}`} 
                              style={{ width: `${student.attendance}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{student.attendance}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          student.attendance >= 75 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {student.attendance >= 75 ? 'Eligible' : 'Not Eligible'}
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

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grade Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Grade Distribution</h3>
            <div className="h-64">
              <Bar 
                data={marksBarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } }
                }}
              />
            </div>
          </div>

          {/* Attendance Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Attendance Overview</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="w-48 h-48">
                <Pie 
                  data={attendancePieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Top Performers</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Register No</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>CGPA</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {students.sort((a, b) => b.cgpa - a.cgpa).map((student, index) => (
                    <tr key={student.id}>
                      <td>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-50 text-gray-500'
                        }`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="font-medium text-gray-800 dark:text-white">{student.registerNumber}</td>
                      <td>{student.name}</td>
                      <td>{student.department}</td>
                      <td className="text-green-600 font-bold">{student.cgpa}</td>
                      <td className={student.attendance >= 75 ? 'text-green-600' : 'text-red-600'}>
                        {student.attendance}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showModal && (
        <Modal title="Add New Student" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="input"
                placeholder="Enter full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Register Number</label>
                <input
                  type="text"
                  required
                  value={newStudent.registerNumber}
                  onChange={(e) => setNewStudent({ ...newStudent, registerNumber: e.target.value })}
                  className="input"
                  placeholder="22CSR001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                <select
                  value={newStudent.year}
                  onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })}
                  className="input"
                >
                  <option value="I">I Year</option>
                  <option value="II">II Year</option>
                  <option value="III">III Year</option>
                  <option value="IV">IV Year</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                <select
                  value={newStudent.department}
                  onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                  className="input"
                >
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                <select
                  value={newStudent.section}
                  onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                  className="input"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                className="input"
                placeholder="student@campusone.edu"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile</label>
                <input
                  type="tel"
                  value={newStudent.mobile}
                  onChange={(e) => setNewStudent({ ...newStudent, mobile: e.target.value })}
                  className="input"
                  placeholder="9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={newStudent.dob}
                  onChange={(e) => setNewStudent({ ...newStudent, dob: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <textarea
                value={newStudent.address}
                onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                className="input"
                rows={2}
                placeholder="Enter address"
              />
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
                Add Student
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default StudentManagement

