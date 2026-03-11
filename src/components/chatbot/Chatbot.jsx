import React, { useState, useRef, useEffect } from 'react'
import { FaCommentAlt, FaTimes, FaPaperPlane, FaUser, FaRobot } from 'react-icons/fa'
import { chatbotFAQs } from '../../data/dummyData'

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hello! I\'m CampusOne Assistant. How can I help you today?', time: new Date() }
  ])
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!inputText.trim()) return

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      time: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    // Find matching answer
    const lowerInput = inputText.toLowerCase()
    let answer = null

    for (const faq of chatbotFAQs) {
      if (faq.keywords.some(keyword => lowerInput.includes(keyword))) {
        answer = faq.answer
        break
      }
    }

    // Add bot response after a short delay
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: answer || chatbotFAQs.find(f => f.keywords.includes('hello')).answer,
        time: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    }, 500)

    setInputText('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickQuestions = [
    'How to apply OD',
    'Attendance rules',
    'Exam schedules',
    'Course materials'
  ]

  return (
    <>
      {/* Chatbot Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full shadow-lg flex items-center justify-center text-white text-xl hover:scale-110 transition-transform z-50"
      >
        <FaCommentAlt />
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <FaRobot className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-white font-semibold">CampusOne Assistant</h3>
                <p className="text-white/80 text-xs">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-2 max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-primary-500' 
                      : 'bg-secondary-500'
                  }`}>
                    {message.type === 'user' ? (
                      <FaUser className="text-white text-xs" />
                    ) : (
                      <FaRobot className="text-white text-xs" />
                    )}
                  </div>
                  <div className={`p-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-primary-500 text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      {message.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setInputText(q); handleSend(); }}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <button
                onClick={handleSend}
                className="p-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Chatbot

