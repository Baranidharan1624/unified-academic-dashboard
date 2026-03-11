import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { FaStar, FaCommentAlt, FaPaperPlane, FaThumbsUp, FaCalendarAlt, FaUser } from 'react-icons/fa'

const Feedback = () => {
  const { faculty, showToast } = useApp()
  const [activeTab, setActiveTab] = useState('faculty')
  const [selectedFaculty, setSelectedFaculty] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submittedFeedback, setSubmittedFeedback] = useState([
    { id: 1, faculty: 'Dr. M. Kavitha', rating: 5, comment: 'Excellent teaching methodology. Very patient and explains concepts clearly.', date: '2024-02-15', type: 'faculty' },
    { id: 2, faculty: 'Guest Lecture - AI Workshop', rating: 4, comment: 'Very informative session with hands-on examples.', date: '2024-02-10', type: 'event' },
  ])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedFaculty || rating === 0 || !comment) {
      showToast('Please fill all fields', 'error')
      return
    }

    const newFeedback = {
      id: Date.now(),
      faculty: selectedFaculty,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
      type: activeTab
    }

    setSubmittedFeedback([newFeedback, ...submittedFeedback])
    showToast('Feedback submitted successfully!', 'success')
    setSelectedFaculty('')
    setRating(0)
    setComment('')
  }

  const renderStars = (rating, size = 'text-xl') => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`${size} ${star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} ${star <= hoverRating ? 'text-yellow-400' : ''}`}
          />
        ))}
      </div>
    )
  }

  const tabs = [
    { id: 'faculty', label: 'Faculty Feedback' },
    { id: 'event', label: 'Event Feedback' },
  ]

  const renderFeedbackForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {activeTab === 'faculty' ? 'Select Faculty' : 'Select Event'}
        </label>
        <select
          value={selectedFaculty}
          onChange={(e) => setSelectedFaculty(e.target.value)}
          className="input"
          required
        >
          <option value="">Select...</option>
          {activeTab === 'faculty' ? (
            faculty.map(f => (
              <option key={f.id} value={f.name}>{f.name} - {f.designation}</option>
            ))
          ) : (
            <>
              <option value="Guest Lecture - AI Workshop">Guest Lecture - AI Workshop</option>
              <option value="Workshop - Python">Workshop - Python</option>
              <option value="Industrial Visit">Industrial Visit</option>
            </>
          )}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
        <div 
          className="flex gap-2"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              className="text-3xl transition-transform hover:scale-110"
            >
              <FaStar className={`${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : rating === 5 ? 'Excellent' : 'Click to rate'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comments</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="input"
          rows={4}
          placeholder="Share your feedback..."
          required
        />
      </div>

      <button type="submit" className="btn btn-primary w-full">
        <FaPaperPlane className="mr-2" />
        Submit Feedback
      </button>
    </form>
  )

  const renderPreviousFeedback = () => (
    <div className="space-y-4">
      {submittedFeedback.map((feedback) => (
        <div key={feedback.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white">{feedback.faculty}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{feedback.comment}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {renderStars(feedback.rating, 'text-sm')}
              <span className="text-xs text-gray-400">{feedback.date}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Feedback</h2>
        <p className="text-gray-500 dark:text-gray-400">Submit feedback for faculty and events</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedFaculty(''); setRating(0); setComment(''); }}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Submit {activeTab === 'faculty' ? 'Faculty' : 'Event'} Feedback</h3>
          {renderFeedbackForm()}
        </div>

        {/* Previous Feedback */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Previous Feedback</h3>
          {renderPreviousFeedback()}
        </div>
      </div>
    </div>
  )
}

export default Feedback

