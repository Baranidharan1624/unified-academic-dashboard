import React, { useState } from 'react'
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaClock, FaBook } from 'react-icons/fa'

const FacultyCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())

  const events = [
    { id: 1, title: 'Machine Learning CAT-2', date: '2024-03-05', type: 'exam', time: '9:00 AM - 11:00 AM' },
    { id: 2, title: 'Database Lab Exam', date: '2024-03-08', type: 'exam', time: '2:00 PM - 4:00 PM' },
    { id: 3, title: 'Guest Lecture on AI', date: '2024-03-10', type: 'event', time: '10:00 AM - 12:00 PM' },
    { id: 4, title: 'Internal Assessment Submission', date: '2024-03-15', type: 'deadline', time: '5:00 PM' },
    { id: 5, title: 'Department Meeting', date: '2024-03-12', type: 'meeting', time: '3:00 PM' },
    { id: 6, title: 'Sports Day', date: '2024-03-20', type: 'event', time: 'All Day' },
  ]

  const getMonthName = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' })
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days = []
    
    // Previous month days
    for (let i = 0; i < startingDay; i++) {
      days.push({ day: '', isCurrentMonth: false })
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, date: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}` })
    }
    
    return days
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getEventForDate = (dateStr) => {
    return events.find(e => e.date === dateStr)
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'exam': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'event': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'deadline': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'meeting': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const days = getDaysInMonth(currentDate)
  const today = new Date().toISOString().split('T')[0]

  const upcomingEvents = events
    .filter(e => e.date >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Academic Calendar</h2>
        <p className="text-gray-500 dark:text-gray-400">View academic events, exams, and schedules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {getMonthName(currentDate)}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
            {days.map((day, index) => {
              const event = getEventForDate(day.date)
              const isToday = day.date === today
              return (
                <div
                  key={index}
                  className={`min-h-[80px] p-2 border border-gray-100 dark:border-gray-700 rounded-lg ${
                    day.isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                  }`}
                >
                  {day.day && (
                    <>
                      <div className={`text-sm font-medium ${isToday ? 'text-primary-600 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                        {day.day}
                      </div>
                      {event && (
                        <div className={`mt-1 px-1.5 py-0.5 rounded text-xs truncate ${getTypeColor(event.type)}`}>
                          {event.title}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">{event.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <FaCalendarAlt />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <FaClock />
                      <span>{event.time}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-4 justify-center">
          {[
            { type: 'exam', label: 'Exam' },
            { type: 'event', label: 'Event' },
            { type: 'deadline', label: 'Deadline' },
            { type: 'meeting', label: 'Meeting' },
          ].map(item => (
            <div key={item.type} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${getTypeColor(item.type).split(' ')[0].replace('bg-', 'bg-').replace('text-', '')}`}></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FacultyCalendar

