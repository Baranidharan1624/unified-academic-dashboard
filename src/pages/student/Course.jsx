import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { FaBook, FaFilePdf, FaDownload, FaVideo, FaLink, FaFolderOpen, FaFileAlt, FaLaptop, FaChevronRight } from 'react-icons/fa'

const Course = () => {
  const { subjects, dummyCourses, showToast } = useApp()
  const [selectedSubject, setSelectedSubject] = useState(null)

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf': return <FaFilePdf className="text-red-500" />
      case 'slide': return <FaFileAlt className="text-blue-500" />
      case 'assignment': return <FaLaptop className="text-green-500" />
      case 'video': return <FaVideo className="text-purple-500" />
      default: return <FaFileAlt />
    }
  }

  const handleDownload = (material) => {
    showToast(`Downloading ${material.title}...`, 'info')
  }

  const theorySubjects = subjects.filter(s => s.type === 'theory')
  const labSubjects = subjects.filter(s => s.type === 'lab')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Course Materials</h2>
        <p className="text-gray-500 dark:text-gray-400">Access study materials, lecture notes, and assignments</p>
      </div>

      {/* Subject Cards */}
      {!selectedSubject ? (
        <div className="space-y-6">
          {/* Theory Subjects */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <FaBook className="text-primary-500" />
              Theory Subjects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {theorySubjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject)}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 text-left card-hover transition-all hover:border-primary-500"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">{subject.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subject.code}</p>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Faculty:</span> {subject.faculty}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Credits:</span> {subject.credits}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Lab Subjects */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <FaLaptop className="text-green-500" />
              Lab Subjects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {labSubjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject)}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 text-left card-hover transition-all hover:border-green-500"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">{subject.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subject.code}</p>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Faculty:</span> {subject.faculty}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Credits:</span> {subject.credits}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Subject Materials */
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={() => setSelectedSubject(null)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            ← Back to Subjects
          </button>

          {/* Subject Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{selectedSubject.name}</h3>
            <p className="text-gray-500 dark:text-gray-400">{selectedSubject.code} | {selectedSubject.faculty}</p>
          </div>

          {/* Materials */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-800 dark:text-white">Available Materials</h4>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {dummyCourses.find(c => c.subject === selectedSubject.name)?.materials.map((material) => (
                <div key={material.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                      {getTypeIcon(material.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{material.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {material.type} | {material.uploadedDate} | {material.faculty}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(material)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                  >
                    <FaDownload />
                  </button>
                </div>
              )) || (
                <div className="p-8 text-center text-gray-500">
                  <FaFolderOpen className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>No materials available yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Course

