import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { FaExclamationCircle, FaPaperPlane, FaClock, FaCheckCircle, FaWrench, FaDesktop, FaBuilding } from 'react-icons/fa'
import { Modal } from '../../components/ui/Modal'

const GrievanceRedressal = () => {
  const { currentUser, showToast } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [complaint, setComplaint] = useState({
    category: '',
    type: '',
    description: ''
  })

  const [submittedComplaints, setSubmittedComplaints] = useState([
    { id: 1, category: 'Technical', type: 'Portal Issue', description: 'Unable to download marksheet from student portal', status: 'resolved', date: '2024-02-20' },
    { id: 2, category: 'Infrastructure', type: 'Lab Equipment', description: 'Some computers in AI Lab are not working properly', status: 'pending', date: '2024-02-28' },
  ])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!complaint.category || !complaint.type || !complaint.description) {
      showToast('Please fill all fields', 'error')
      return
    }

    const newComplaint = {
      id: Date.now(),
      ...complaint,
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    }

    setSubmittedComplaints([newComplaint, ...submittedComplaints])
    showToast('Complaint submitted successfully!', 'success')
    setShowModal(false)
    setComplaint({ category: '', type: '', description: '' })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Technical': return <FaDesktop className="text-blue-500" />
      case 'Administrative': return <FaExclamationCircle className="text-purple-500" />
      case 'Infrastructure': return <FaBuilding className="text-orange-500" />
      default: return <FaExclamationCircle />
    }
  }

  const categories = [
    { id: 'Technical', label: 'Technical', icon: FaDesktop },
    { id: 'Administrative', label: 'Administrative', icon: FaExclamationCircle },
    { id: 'Infrastructure', label: 'Infrastructure', icon: FaBuilding },
  ]

  const types = {
    Technical: ['Portal Issue', 'App Bug', 'Login Issue', 'Email Issue'],
    Administrative: ['Certificate Issue', 'Fee Issue', 'Admission Issue'],
    Infrastructure: ['Lab Equipment', 'Washroom', 'Classroom', 'Canteen'],
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Grievance Redressal</h2>
          <p className="text-gray-500 dark:text-gray-400">Submit and track your complaints</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <FaPaperPlane />
          Raise Complaint
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Complaints</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{submittedComplaints.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <FaExclamationCircle className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{submittedComplaints.filter(c => c.status === 'pending').length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <FaClock className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{submittedComplaints.filter(c => c.status === 'resolved').length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {submittedComplaints.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 text-center">
            <FaExclamationCircle className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No complaints submitted yet</p>
          </div>
        ) : (
          submittedComplaints.map((comp) => (
            <div key={comp.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                    {getCategoryIcon(comp.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-gray-800 dark:text-white">{comp.type}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(comp.status)}`}>
                        {comp.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{comp.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>Category: {comp.category}</span>
                      <span>Date: {comp.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Raise Complaint Modal */}
      {showModal && (
        <Modal title="Raise a Complaint" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setComplaint({ ...complaint, category: cat.id, type: '' })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      complaint.category === cat.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <cat.icon className="text-xl mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                    <p className="text-xs font-medium">{cat.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {complaint.category && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Type</label>
                <select
                  value={complaint.type}
                  onChange={(e) => setComplaint({ ...complaint, type: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select...</option>
                  {types[complaint.category]?.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={complaint.description}
                onChange={(e) => setComplaint({ ...complaint, description: e.target.value })}
                className="input"
                rows={4}
                placeholder="Describe your issue in detail..."
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn btn-outline">
                Cancel
              </button>
              <button type="submit" className="flex-1 btn btn-primary">
                <FaPaperPlane className="mr-2" />
                Submit
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default GrievanceRedressal

