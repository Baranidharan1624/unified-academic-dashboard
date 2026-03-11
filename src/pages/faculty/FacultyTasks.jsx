import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { FaTasks, FaPlus, FaCheckCircle, FaClock, FaTrash } from 'react-icons/fa'
import { Modal } from '../../components/ui/Modal'

const FacultyTasks = () => {
  const { tasks, subjects, addTask, showToast } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    subject: '',
    class: '',
    dueDate: '',
    priority: 'medium'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    addTask(newTask)
    setShowModal(false)
    setNewTask({
      title: '',
      description: '',
      subject: '',
      class: '',
      dueDate: '',
      priority: 'medium'
    })
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending')
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
  const completedTasks = tasks.filter(t => t.status === 'completed')

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const renderTasks = (taskList, title) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title} ({taskList.length})</h3>
      {taskList.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-500">No tasks</p>
        </div>
      ) : (
        taskList.map((task) => (
          <div key={task.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 card-hover">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="font-semibold text-gray-800 dark:text-white">{task.title}</h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{task.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>{task.subject}</span>
                  <span>{task.class}</span>
                  <span className="flex items-center gap-1">
                    <FaClock /> Due: {task.dueDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Tasks</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage your teaching tasks and deadlines</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <FaPlus />
          Add Task
        </button>
      </div>

      {/* Task Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderTasks(pendingTasks, 'Pending')}
        {renderTasks(inProgressTasks, 'In Progress')}
        {renderTasks(completedTasks, 'Completed')}
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <Modal title="Add New Task" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                required
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="input"
                placeholder="Task title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="input"
                rows={2}
                placeholder="Task description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <select
                  value={newTask.subject}
                  onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                  className="input"
                >
                  <option value="">Select</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
                <select
                  value={newTask.class}
                  onChange={(e) => setNewTask({ ...newTask, class: e.target.value })}
                  className="input"
                >
                  <option value="">Select</option>
                  <option value="III Year CSE A">III Year CSE A</option>
                  <option value="III Year CSE B">III Year CSE B</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn btn-outline">
                Cancel
              </button>
              <button type="submit" className="flex-1 btn btn-primary">
                Add Task
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default FacultyTasks

