import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { FaCloudUploadAlt, FaFilePdf, FaFileAlt, FaVideo, FaTrash, FaDownload } from 'react-icons/fa'
import { Modal } from '../../components/ui/Modal'

const FacultyMaterials = () => {
  const { subjects, showToast } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [uploadType, setUploadType] = useState('notes')
  const [materialTitle, setMaterialTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const [materials, setMaterials] = useState([
    { id: 1, subject: 'Machine Learning', title: 'Introduction to ML', type: 'pdf', date: '2024-01-15', downloads: 45 },
    { id: 2, subject: 'Machine Learning', title: 'Linear Regression Notes', type: 'pdf', date: '2024-01-20', downloads: 38 },
    { id: 3, subject: 'Database Systems', title: 'ER Model Basics', type: 'pdf', date: '2024-01-15', downloads: 52 },
  ])

  const handleUpload = (e) => {
    e.preventDefault()
    if (!selectedSubject || !materialTitle || !selectedFile) {
      showToast('Please fill all fields', 'error')
      return
    }

    const newMaterial = {
      id: Date.now(),
      subject: subjects.find(s => s.id === parseInt(selectedSubject))?.name,
      title: materialTitle,
      type: uploadType,
      date: new Date().toISOString().split('T')[0],
      downloads: 0
    }

    setMaterials([newMaterial, ...materials])
    showToast('Material uploaded successfully!', 'success')
    setShowModal(false)
    setMaterialTitle('')
    setSelectedFile(null)
    setSelectedSubject('')
  }

  const handleDelete = (id) => {
    setMaterials(materials.filter(m => m.id !== id))
    showToast('Material deleted', 'success')
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf': return <FaFilePdf className="text-red-500" />
      case 'slide': return <FaFileAlt className="text-blue-500" />
      case 'video': return <FaVideo className="text-purple-500" />
      default: return <FaFileAlt />
    }
  }

  const filteredMaterials = selectedSubject 
    ? materials.filter(m => m.subject === subjects.find(s => s.id === parseInt(selectedSubject))?.name)
    : materials

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Materials</h2>
          <p className="text-gray-500 dark:text-gray-400">Upload and manage study materials</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <FaCloudUploadAlt />
          Upload Material
        </button>
      </div>

      {/* Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by Subject</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="input w-full sm:w-64"
        >
          <option value="">All Subjects</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Materials List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Title</th>
                <th>Type</th>
                <th>Date</th>
                <th>Downloads</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No materials found
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((material) => (
                  <tr key={material.id}>
                    <td className="font-medium text-gray-800 dark:text-white">{material.subject}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(material.type)}
                        <span>{material.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs capitalize">
                        {material.type}
                      </span>
                    </td>
                    <td>{material.date}</td>
                    <td>{material.downloads}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                          <FaDownload />
                        </button>
                        <button 
                          onClick={() => handleDelete(material.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <Modal title="Upload Material" onClose={() => setShowModal(false)}>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="input"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Material Title</label>
              <input
                type="text"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                className="input"
                placeholder="Enter material title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {['notes', 'pdf', 'slide', 'video'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUploadType(type)}
                    className={`p-3 rounded-xl border-2 capitalize transition-all ${
                      uploadType === type
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File</label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="input"
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn btn-outline">
                Cancel
              </button>
              <button type="submit" className="flex-1 btn btn-primary">
                <FaCloudUploadAlt className="mr-2" />
                Upload
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default FacultyMaterials

