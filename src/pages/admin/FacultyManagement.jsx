import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { 
  FaPlus, FaSearch, FaEdit, FaTrash, FaUserPlus, 
  FaClipboardList, FaCheckCircle, FaTimesCircle, FaFilter
} from 'react-icons/fa'
import { Modal } from '../../components/ui/Modal'
import { Table } from '../../components/ui/Table'

const FacultyManagement = () => {
  const { faculty, requests, addFacultyMember, showToast } = useApp()
  const [activeTab, setActiveTab] = useState('faculty')
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    email: '',
    facultyId: '',
    department: 'CSE',
    designation: '',
    mobile: '',
    specialization: ''
  })

  const filteredFaculty = faculty.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.facultyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const facultyRequests = requests.filter(r => r.type === 'Leave')

  const handleSubmit = (e) => {
    e.preventDefault()
    addFacultyMember(newFaculty)
    setShowModal(false)
    setNewFaculty({
      name: '',
      email: '',
      facultyId: '',
      department: 'CSE',
      designation: '',
      mobile: '',
      specialization: ''
    })
  }

  const tabs = [
    { id: 'faculty', label: 'Faculty List', count: faculty.length },
    { id: 'attendance', label: 'Attendance', count: null },
    { id: 'requests', label: 'Requests', count: facultyRequests.filter(r => r.status === 'pending').length },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Faculty Management</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage faculty members, attendance, and requests</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <FaUserPlus />
          Add Faculty
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search faculty by name, ID, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>

      {/* Faculty List Tab */}
      {activeTab === 'faculty' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFaculty.map((member) => (
            <div key={member.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {member.profilePic ? (
                      <img src={member.profilePic} alt={member.name} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      member.name.split(' ').map(n => n[0]).join('')
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{member.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.facultyId}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  member.status === 'active' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {member.status}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Designation</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{member.designation}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Department</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{member.department}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Specialization</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{member.specialization}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Experience</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{member.experience}</p>
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white">Faculty Attendance Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Faculty Name</th>
                  <th>Department</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Leave</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {faculty.map((member) => (
                  <tr key={member.id}>
                    <td className="font-medium text-gray-800 dark:text-white">{member.name}</td>
                    <td>{member.department}</td>
                    <td className="text-green-600 font-medium">22</td>
                    <td className="text-red-600 font-medium">1</td>
                    <td className="text-yellow-600 font-medium">2</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '88%' }}></div>
                        </div>
                        <span className="text-sm font-medium">88%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white">Faculty Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {facultyRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="font-medium text-gray-800 dark:text-white">{request.facultyName}</td>
                    <td>
                      <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                        {request.category}
                      </span>
                    </td>
                    <td className="max-w-xs truncate">{request.reason}</td>
                    <td>{request.date}</td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        request.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
                          <FaCheckCircle />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                          <FaTimesCircle />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Faculty Modal */}
      {showModal && (
        <Modal title="Add New Faculty" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newFaculty.name}
                onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                className="input"
                placeholder="Enter full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Faculty ID</label>
                <input
                  type="text"
                  required
                  value={newFaculty.facultyId}
                  onChange={(e) => setNewFaculty({ ...newFaculty, facultyId: e.target.value })}
                  className="input"
                  placeholder="FACXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Designation</label>
                <select
                  value={newFaculty.designation}
                  onChange={(e) => setNewFaculty({ ...newFaculty, designation: e.target.value })}
                  className="input"
                >
                  <option value="">Select</option>
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={newFaculty.email}
                onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                className="input"
                placeholder="faculty@campusone.edu"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                <select
                  value={newFaculty.department}
                  onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile</label>
                <input
                  type="tel"
                  value={newFaculty.mobile}
                  onChange={(e) => setNewFaculty({ ...newFaculty, mobile: e.target.value })}
                  className="input"
                  placeholder="9876543210"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization</label>
              <input
                type="text"
                value={newFaculty.specialization}
                onChange={(e) => setNewFaculty({ ...newFaculty, specialization: e.target.value })}
                className="input"
                placeholder="e.g., Artificial Intelligence"
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
                Add Faculty
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default FacultyManagement

