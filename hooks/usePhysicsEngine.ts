'use client'

import { useEffect, useRef, useCallback } from 'react'
import Matter from 'matter-js'

interface CardBody {
  id: string
  body: Matter.Body
  width: number
  height: number
}

export function usePhysicsEngine(
  containerWidth: number,
  containerHeight: number,
  isPhysicsActive: boolean,
  containerElement?: HTMLElement | null,
) {
  const engineRef = useRef<Matter.Engine | null>(null)
  const worldRef = useRef<Matter.World | null>(null)
  const bodiesToRenderRef = useRef<Map<string, CardBody>>(new Map())
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null)

  // Initialize Matter.js engine
  const initializePhysics = useCallback(() => {
    const Engine = Matter.Engine
    const World = Matter.World
    const Bodies = Matter.Bodies
    const Body = Matter.Body
    const Events = Matter.Events
    const MouseConstraint = Matter.MouseConstraint
    const Mouse = Matter.Mouse

    const engine = Engine.create()
    const world = engine.world

    // Set initial gravity - will be updated in useEffect
    world.gravity.y = 0
    world.gravity.x = 0

    engineRef.current = engine
    worldRef.current = world

    // Create static boundaries (thick invisible walls)
    const wallThickness = 100
    const padding = 50

    // Floor
    World.add(
      world,
      Bodies.rectangle(
        containerWidth / 2,
        containerHeight - wallThickness / 2 + padding,
        containerWidth + wallThickness,
        wallThickness,
        { isStatic: true },
      ),
    )

    // Ceiling
    World.add(
      world,
      Bodies.rectangle(
        containerWidth / 2,
        -wallThickness / 2 - padding,
        containerWidth + wallThickness,
        wallThickness,
        { isStatic: true },
      ),
    )

    // Left wall
    World.add(
      world,
      Bodies.rectangle(
        -wallThickness / 2 - padding,
        containerHeight / 2,
        wallThickness,
        containerHeight,
        { isStatic: true },
      ),
    )

    // Right wall
    World.add(
      world,
      Bodies.rectangle(
        containerWidth + wallThickness / 2 + padding,
        containerHeight / 2,
        wallThickness,
        containerHeight,
        { isStatic: true },
      ),
    )

    // Create mouse constraint for dragging
    const mouse = Mouse.create(containerElement || undefined)
    const constraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        damping: 0.1,
        render: { visible: false },
      },
    })

    World.add(world, constraint)
    mouseConstraintRef.current = constraint

    // Animation loop
    const animationFrameId = setInterval(() => {
      Engine.update(engine)
    }, 1000 / 60) // 60 FPS

    return animationFrameId
  }, [containerWidth, containerHeight, isPhysicsActive])

  // Add a card body to the physics world
  const addCardBody = useCallback(
    (id: string, x: number, y: number, width: number, height: number) => {
      if (!worldRef.current || !engineRef.current) return

      const Bodies = Matter.Bodies
      const Body = Matter.Body

      const body = Bodies.rectangle(x, y, width, height, {
        friction: 0.4,
        frictionAir: 0.02,
        restitution: 0.6,
        density: 0.001,
        label: `card-${id}`,
      })

      // Add initial velocity to separate cards
      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 2,
      })

      Matter.World.add(worldRef.current, body)
      bodiesToRenderRef.current.set(id, {
        id,
        body,
        width,
        height,
      })
    },
    [],
  )

  // Remove a card body from the physics world
  const removeCardBody = useCallback((id: string) => {
    if (!worldRef.current) return

    const cardBody = bodiesToRenderRef.current.get(id)
    if (cardBody) {
      Matter.World.remove(worldRef.current, cardBody.body)
      bodiesToRenderRef.current.delete(id)
    }
  }, [])

  // Get current positions of all bodies
  const getBodyPositions = useCallback(
    (): Map<string, { x: number; y: number; rotation: number }> => {
      const positions = new Map<string, { x: number; y: number; rotation: number }>()

      bodiesToRenderRef.current.forEach((cardBody) => {
        positions.set(cardBody.id, {
          x: cardBody.body.position.x,
          y: cardBody.body.position.y,
          rotation: cardBody.body.angle,
        })
      })

      return positions
    },
    [],
  )

  // Update gravity based on physics active state
  const updateGravity = useCallback((active: boolean) => {
    if (worldRef.current) {
      worldRef.current.gravity.y = active ? 1 : 0
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    const animationFrameId = initializePhysics()

    return () => {
      clearInterval(animationFrameId)
      if (engineRef.current && worldRef.current) {
        Matter.World.clear(worldRef.current, false)
        Matter.Engine.clear(engineRef.current)
      }
    }
  }, [initializePhysics])

  // Update gravity when physics active state changes
  useEffect(() => {
    updateGravity(isPhysicsActive)
  }, [isPhysicsActive, updateGravity])

  return {
    addCardBody,
    removeCardBody,
    getBodyPositions,
    engine: engineRef.current,
    world: worldRef.current,
  }
}
