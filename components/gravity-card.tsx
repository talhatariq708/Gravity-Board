"use client"

import { X } from 'lucide-react'
import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface GravityCardProps {
  id: string
  title: string
  description?: string
  glow: 'pink' | 'blue' | 'purple'
  onDelete: (id: string) => void
  isZeroGravity: boolean
  physicsPosition?: { x: number; y: number; rotation: number }
  isDeleting?: boolean
  isDragging?: boolean
  children?: ReactNode
}

export function GravityCard({
  id,
  title,
  description,
  glow,
  onDelete,
  isZeroGravity,
  physicsPosition,
  isDeleting = false,
  isDragging = false,
  children,
}: GravityCardProps) {
  const glowClasses = {
    pink: 'glow-pink',
    blue: 'glow-blue',
    purple: 'glow-purple',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: -40 }}
      animate={
        isDeleting
          ? { opacity: 0, scale: 0, filter: 'blur(12px)' }
          : physicsPosition
            ? {
                opacity: isDragging ? 0.95 : 1,
                y: physicsPosition.y - 90,
                x: physicsPosition.x - 144,
                rotate: physicsPosition.rotation * (180 / Math.PI),
                scale: isDragging ? 1.05 : 1,
              }
            : { opacity: 1, y: 0, scale: 1 }
      }
      exit={{ opacity: 0, scale: 0, filter: 'blur(12px)' }}
      transition={
        isDeleting
          ? { duration: 0.8, ease: 'easeOut' }
          : {
              default: {
                type: 'spring',
                stiffness: 350,
                damping: 25,
                mass: 1,
              },
            }
      }
      className={`
        glassmorphic
        rounded-xl
        p-6
        w-72
        card-shadow
        group
        cursor-grab
        active:cursor-grabbing
        transition-all
        duration-200
        ${isDragging ? 'cursor-grabbing shadow-2xl' : 'hover:shadow-lg'}
        ${glowClasses[glow]}
      `}
      style={{
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate leading-tight">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>
        <button
          onClick={() => onDelete(id)}
          className="
            flex-shrink-0
            text-gray-500
            hover:text-red-400
            transition-colors
            duration-200
            opacity-0
            group-hover:opacity-100
          "
          aria-label="Delete card"
        >
          <X size={18} />
        </button>
      </div>

      {children && <div className="mt-4 text-sm text-gray-300">{children}</div>}

      {/* Accent dot for visual interest */}
      <div
        className={`
          absolute
          top-3
          right-3
          w-2
          h-2
          rounded-full
          pulse-glow
          opacity-60
        `}
        style={{
          background:
            glow === 'pink'
              ? '#ff6b9d'
              : glow === 'blue'
                ? '#4d9fff'
                : '#b366ff',
        }}
      />
    </motion.div>
  )
}
