import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const DashboardLayout = ({ children, role, title, activeItem, setActiveItem }) => {
  const { sidebarCollapsed, toasts } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        role={role} 
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Topbar title={title} setIsOpen={setIsOpen} />
        
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-4 rounded-xl shadow-lg animate-slide-in flex items-center gap-3 ${
              toast.type === 'success' ? 'bg-green-600 text-white' :
              toast.type === 'error' ? 'bg-red-600 text-white' :
              toast.type === 'warning' ? 'bg-yellow-600 text-white' :
              'bg-blue-600 text-white'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardLayout

