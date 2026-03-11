import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { FaUniversity, FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaEye, FaEyeSlash } from 'react-icons/fa'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useApp()
  const [role, setRole] = useState('student')
  const [showPassword, setShowPassword] = useState(false)
  const [credentials, setCredentials] = useState({
    registerNumber: '',
    facultyId: '',
    password: ''
  })
  const [error, setError] = useState('')

  const roles = [
    { id: 'admin', label: 'Admin', icon: FaUserShield, color: 'from-purple-600 to-indigo-600' },
    { id: 'student', label: 'Student', icon: FaUserGraduate, color: 'from-blue-600 to-cyan-600' },
    { id: 'faculty', label: 'Faculty', icon: FaChalkboardTeacher, color: 'from-green-600 to-teal-600' }
  ]

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')

    if (role === 'student') {
      if (!credentials.registerNumber) {
        setError('Please enter your register number')
        return
      }
      // For demo, accept any valid student ID from dummy data
      login('student', { registerNumber: credentials.registerNumber })
      navigate('/student')
    } else if (role === 'faculty') {
      if (!credentials.facultyId) {
        setError('Please enter your faculty ID')
        return
      }
      login('faculty', { facultyId: credentials.facultyId })
      navigate('/faculty')
    } else {
      login('admin', {})
      navigate('/admin')
    }
  }

  const quickLogin = (roleType) => {
    if (roleType === 'student') {
      login('student', { registerNumber: '22CSR001' })
      navigate('/student')
    } else if (roleType === 'faculty') {
      login('faculty', { facultyId: 'FAC001' })
      navigate('/faculty')
    } else {
      login('admin', {})
      navigate('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
            <FaUniversity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">CampusOne</h1>
          <p className="text-purple-200">Role Based Academic Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h2>

          {/* Role Selection */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                  role === r.id
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <r.icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{r.label}</span>
              </button>
            ))}
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Register Number</label>
                <input
                  type="text"
                  value={credentials.registerNumber}
                  onChange={(e) => setCredentials({ ...credentials, registerNumber: e.target.value })}
                  placeholder="Enter your register number"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}

            {role === 'faculty' && (
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Faculty ID</label>
                <input
                  type="text"
                  value={credentials.facultyId}
                  onChange={(e) => setCredentials({ ...credentials, facultyId: e.target.value })}
                  placeholder="Enter your faculty ID"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}

            {role === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Admin Key</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    placeholder="Enter admin key"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>
          </form>

          {/* Quick Login Demo */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-center text-purple-200 text-sm mb-3">Quick Login (Demo)</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => quickLogin('admin')}
                className="py-2 px-3 bg-purple-600/50 hover:bg-purple-600 text-white text-xs rounded-lg transition-colors"
              >
                Admin
              </button>
              <button
                onClick={() => quickLogin('student')}
                className="py-2 px-3 bg-blue-600/50 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
              >
                Student
              </button>
              <button
                onClick={() => quickLogin('faculty')}
                className="py-2 px-3 bg-green-600/50 hover:bg-green-600 text-white text-xs rounded-lg transition-colors"
              >
                Faculty
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-purple-300/60 text-sm mt-6">
          © 2024 CampusOne. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default LoginPage

