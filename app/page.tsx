"use client"

import React from "react"

import { useState } from 'react'
import { Plus, Zap } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { GravityCard } from '@/components/gravity-card'

interface Task {
  id: string
  title: string
  description: string
  glow: 'pink' | 'blue' | 'purple'
  timestamp: Date
}

const glowTypes = ['pink', 'blue', 'purple'] as const

function getRandomGlow() {
  return glowTypes[Math.floor(Math.random() * glowTypes.length)]
}

export default function GravityBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [input, setInput] = useState('')
  const [isPhysicsActive, setIsPhysicsActive] = useState(false)

  const handleAddTask = () => {
    if (input.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: input,
        description: `Added on ${new Date().toLocaleDateString()}`,
        glow: getRandomGlow(),
        timestamp: new Date(),
      }
      setTasks([...tasks, newTask])
      setInput('')
    }
  }

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const handleClearBoard = () => {
    if (window.confirm('Are you sure you want to clear the board?')) {
      setTasks([])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask()
    }
  }

  return (
    <div className="min-h-screen w-full bg-background overflow-hidden">
      {/* Header Section */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-white">Gravity Board</h1>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`
                  text-sm
                  font-medium
                  px-3
                  py-1
                  rounded-full
                  ${isPhysicsActive ? 'bg-green-500/20 text-green-300' : 'bg-gray-700/50 text-gray-400'}
                  transition-all
                  duration-300
                `}
              >
                <span className="inline-block w-2 h-2 rounded-full mr-2 bg-current animate-pulse" />
                Physics {isPhysicsActive ? 'Active' : 'Idle'}
              </span>
            </div>
          </div>

          {/* Input Bar */}
          <div className="flex gap-3">
            <div className="flex-1 glassmorphic rounded-lg flex items-center px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-200">
              <input
                type="text"
                placeholder="Drop an idea..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="
                  bg-transparent
                  text-white
                  placeholder-gray-500
                  outline-none
                  w-full
                  text-sm
                "
              />
            </div>
            <button
              onClick={handleAddTask}
              className="
                glassmorphic
                rounded-lg
                px-6
                py-3
                text-white
                font-medium
                hover:bg-white/10
                transition-all
                duration-200
                flex
                items-center
                gap-2
                group
              "
            >
              <Plus
                size={20}
                className="group-hover:scale-110 transition-transform duration-200"
              />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-40 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-96">
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto">
                    <Zap className="text-gray-500" size={32} />
                  </div>
                </div>
                <p className="text-gray-400 text-lg font-medium mb-2">
                  Your board is empty
                </p>
                <p className="text-gray-500 text-sm">
                  Drop your first idea to get started
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {tasks.map((task) => (
                  <GravityCard
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    glow={task.glow}
                    isZeroGravity={isPhysicsActive}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {tasks.length} {tasks.length === 1 ? 'idea' : 'ideas'} on board
          </div>

          <div className="flex items-center gap-4">
            {/* Zero Gravity Toggle */}
            <button
              onClick={() => setIsPhysicsActive(!isPhysicsActive)}
              className={`
                glassmorphic
                rounded-full
                px-4
                py-2
                text-sm
                font-medium
                flex
                items-center
                gap-2
                transition-all
                duration-300
                group
                ${isPhysicsActive ? 'ring-2 ring-blue-500/50 bg-white/10' : ''}
              `}
            >
              <span
                className={`
                  w-3
                  h-3
                  rounded-full
                  transition-all
                  duration-300
                  ${isPhysicsActive ? 'bg-blue-400' : 'bg-gray-600'}
                `}
              />
              Zero Gravity
            </button>

            {/* Clear Board Button */}
            <button
              onClick={handleClearBoard}
              disabled={tasks.length === 0}
              className={`
                glassmorphic
                rounded-full
                px-4
                py-2
                text-sm
                font-medium
                transition-all
                duration-200
                ${
                  tasks.length === 0
                    ? 'opacity-50 cursor-not-allowed text-gray-600'
                    : 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                }
              `}
            >
              Clear Board
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
