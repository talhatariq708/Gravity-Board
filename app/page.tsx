'use client'

import React from "react"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Zap, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { GravityCard } from '@/components/gravity-card'
import { usePhysicsEngine } from '@/hooks/usePhysicsEngine'

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

const CARD_WIDTH = 288
const CARD_HEIGHT = 180

export default function GravityBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [input, setInput] = useState('')
  const [isPhysicsActive, setIsPhysicsActive] = useState(true)
  const [bodyPositions, setBodyPositions] = useState<Map<string, { x: number; y: number; rotation: number }>>(new Map())
  const [containerDims, setContainerDims] = useState({ width: 1200, height: 800 })
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameIdRef = useRef<number | null>(null)

  // Initialize physics engine
  const { addCardBody, removeCardBody, getBodyPositions } = usePhysicsEngine(
    containerDims.width,
    containerDims.height,
    isPhysicsActive,
    containerRef.current,
  )

  // Update container dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerDims({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Animation loop to sync physics positions with React state
  useEffect(() => {
    const animate = () => {
      const positions = getBodyPositions()
      setBodyPositions(positions)
      animationFrameIdRef.current = requestAnimationFrame(animate)
    }

    if (tasks.length > 0) {
      animationFrameIdRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
    }
  }, [tasks.length, getBodyPositions])

  // Add task with physics body
  const handleAddTask = useCallback(() => {
    if (input.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: input,
        description: `Added on ${new Date().toLocaleDateString()}`,
        glow: getRandomGlow(),
        timestamp: new Date(),
      }

      setTasks((prevTasks) => [...prevTasks, newTask])

      // Add physics body to new card with random starting position
      setTimeout(() => {
        const randomX = Math.random() * (containerDims.width - CARD_WIDTH) + CARD_WIDTH / 2
        const randomY = Math.random() * (containerDims.height / 3) + 100
        addCardBody(newTask.id, randomX, randomY, CARD_WIDTH, CARD_HEIGHT)
      }, 0)

      setInput('')
    }
  }, [input, addCardBody, containerDims])

  // Delete task with animation
  const handleDeleteTask = useCallback((id: string) => {
    setDeletingIds((prev) => new Set(prev).add(id))

    setTimeout(() => {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))
      removeCardBody(id)
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 1000)
  }, [removeCardBody])

  // Clear board with animations
  const handleClearBoard = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the board?')) {
      const allIds = new Set(tasks.map((task) => task.id))
      setDeletingIds(allIds)

      setTimeout(() => {
        setTasks([])
        tasks.forEach((task) => removeCardBody(task.id))
        setDeletingIds(new Set())
      }, 1000)
    }
  }, [tasks, removeCardBody])

  // Toggle physics
  const handleTogglePhysics = () => {
    setIsPhysicsActive((prev) => !prev)
  }

  // Handle keyboard input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask()
    }
  }

  // Track dragging for z-index
  const handleMouseDown = (id: string) => {
    setDraggingId(id)
  }

  const handleMouseUp = () => {
    setDraggingId(null)
  }

  // Add mouse listeners to container
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('mouseleave', handleMouseUp)

    return () => {
      container.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('mouseleave', handleMouseUp)
    }
  }, [])

  return (
    <div className="w-full h-screen bg-background flex flex-col overflow-hidden">
      {/* Fixed Header with Input */}
      <div className="relative z-50 px-6 py-6 border-b border-border bg-background/50 backdrop-blur">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Drop an idea..."
                className="flex-1 bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={handleAddTask}
                className="bg-accent text-accent-foreground hover:opacity-90 rounded-lg px-4 py-3 font-medium transition-opacity"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="text-sm text-muted-foreground">
              Physics: <span className={isPhysicsActive ? 'text-green-400' : 'text-yellow-400'}>{isPhysicsActive ? 'Active' : 'Idle'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Physics Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-background"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      >
        {/* Empty State */}
        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center">
              <Zap className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-muted-foreground/50 mb-2">Gravity Board</h2>
              <p className="text-muted-foreground/40">Add ideas to get started</p>
            </div>
          </motion.div>
        )}

        {/* Physics Cards */}
        <AnimatePresence mode="popLayout">
          {tasks.map((task, index) => {
            const isDragging = draggingId === task.id
            const zIndex = isDragging ? 1000 : index
            return (
              <motion.div
                key={task.id}
                className="absolute top-0 left-0 will-change-transform"
                style={{ zIndex }}
                onMouseDown={() => handleMouseDown(task.id)}
              >
                <GravityCard
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  glow={task.glow}
                  isZeroGravity={isPhysicsActive}
                  physicsPosition={bodyPositions.get(task.id)}
                  isDeleting={deletingIds.has(task.id)}
                  isDragging={isDragging}
                  onDelete={handleDeleteTask}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Fixed Footer with Controls */}
      <div className="relative z-50 px-6 py-6 border-t border-border bg-background/50 backdrop-blur flex items-center justify-between">
        <button
          onClick={handleTogglePhysics}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isPhysicsActive
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-muted text-muted-foreground border border-border hover:bg-accent/10'
          }`}
        >
          <Zap className="w-4 h-4" />
          Zero Gravity {isPhysicsActive ? 'ON' : 'OFF'}
        </button>

        <button
          onClick={handleClearBoard}
          disabled={tasks.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          Clear Board
        </button>

        <div className="text-sm text-muted-foreground">{tasks.length} ideas</div>
      </div>
    </div>
  )
}
