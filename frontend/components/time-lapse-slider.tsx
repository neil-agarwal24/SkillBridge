'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface Node {
  id: string
  x: number
  y: number
  size: number
  color: string
  isNew?: boolean
  opacity?: number
}

interface Connection {
  from: string
  to: string
  opacity: number
  appearAfter: number
}

export function TimeLapseSlider() {
  const [progress, setProgress] = useState(0)

  // Before state - sparse connections
  const beforeNodes: Node[] = [
    { id: '1', x: 20, y: 25, size: 4, color: 'from-primary to-primary' },
    { id: '2', x: 80, y: 70, size: 4, color: 'from-secondary to-secondary' },
    { id: '3', x: 50, y: 80, size: 4, color: 'from-accent to-accent' },
  ]

  // After state - more nodes spread across the screen
  const afterNodes: Node[] = [
    ...beforeNodes,
    { id: '4', x: 15, y: 15, size: 4, color: 'from-primary to-secondary', isNew: true },
    { id: '5', x: 85, y: 10, size: 4, color: 'from-secondary to-accent', isNew: true },
    { id: '6', x: 90, y: 45, size: 4, color: 'from-accent to-primary', isNew: true },
    { id: '7', x: 10, y: 50, size: 4, color: 'from-primary to-accent', isNew: true },
    { id: '8', x: 65, y: 60, size: 4, color: 'from-secondary to-primary', isNew: true },
    { id: '9', x: 35, y: 75, size: 4, color: 'from-accent to-secondary', isNew: true },
    { id: '10', x: 45, y: 20, size: 4, color: 'from-primary to-primary', isNew: true },
    { id: '11', x: 72, y: 35, size: 4, color: 'from-secondary to-secondary', isNew: true },
    { id: '12', x: 25, y: 55, size: 4, color: 'from-accent to-accent', isNew: true },
    { id: '13', x: 78, y: 85, size: 4, color: 'from-primary to-secondary', isNew: true },
    { id: '14', x: 5, y: 30, size: 4, color: 'from-secondary to-accent', isNew: true },
    { id: '15', x: 60, y: 40, size: 4, color: 'from-accent to-primary', isNew: true },
  ]

  const connections: Connection[] = [
    { from: '1', to: '2', opacity: 1, appearAfter: 0 },
    { from: '2', to: '3', opacity: 1, appearAfter: 0 },
    { from: '1', to: '3', opacity: 1, appearAfter: 0 },
    { from: '1', to: '4', opacity: 1, appearAfter: 15 },
    { from: '4', to: '5', opacity: 1, appearAfter: 20 },
    { from: '5', to: '6', opacity: 1, appearAfter: 25 },
    { from: '2', to: '6', opacity: 1, appearAfter: 30 },
    { from: '7', to: '1', opacity: 1, appearAfter: 35 },
    { from: '7', to: '14', opacity: 1, appearAfter: 40 },
    { from: '3', to: '8', opacity: 1, appearAfter: 45 },
    { from: '8', to: '11', opacity: 1, appearAfter: 50 },
    { from: '11', to: '6', opacity: 1, appearAfter: 55 },
    { from: '8', to: '9', opacity: 1, appearAfter: 60 },
    { from: '9', to: '3', opacity: 1, appearAfter: 65 },
    { from: '4', to: '10', opacity: 1, appearAfter: 70 },
    { from: '10', to: '5', opacity: 1, appearAfter: 75 },
    { from: '5', to: '11', opacity: 1, appearAfter: 80 },
    { from: '12', to: '8', opacity: 1, appearAfter: 85 },
    { from: '14', to: '7', opacity: 1, appearAfter: 90 },
    { from: '13', to: '6', opacity: 1, appearAfter: 95 },
    { from: '15', to: '11', opacity: 1, appearAfter: 100 },
  ]

  // Interpolate between before and after states
  const currentNodes = afterNodes.map((node) => {
    const beforeNode = beforeNodes.find((n) => n.id === node.id)
    if (!beforeNode) {
      const threshold = node.id.charCodeAt(0) * 5 % 60
      const opacity = Math.max(0, Math.min(1, (progress - threshold) / 20))
      return { ...node, opacity }
    }
    return node
  })

  // Calculate visible connections based on progress
  const visibleConnections = connections.filter(
    (conn) => progress >= conn.appearAfter
  )

  const getNodePosition = (node: Node) => {
    const beforeNode = beforeNodes.find((n) => n.id === node.id)
    if (!beforeNode) {
      return node
    }
    const x = beforeNode.x + (node.x - beforeNode.x) * (progress / 100)
    const y = beforeNode.y + (node.y - beforeNode.y) * (progress / 100)
    return { ...node, x, y }
  }

  const findCoords = (id: string) => {
    const node = currentNodes.find((n) => n.id === id)
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 }
  }

  return (
    <div className="space-y-6">
      {/* Timeline Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative h-64 md:h-80 bg-card/50 rounded-2xl border border-border p-8 overflow-hidden"
      >
        {/* Grid background */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(90deg, currentColor 1px, transparent 1px), linear-gradient(0deg, currentColor 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* SVG for connections and nodes */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{ pointerEvents: 'none' }}>
          <defs>
            <linearGradient id="connectionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(45, 110, 76)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(15, 90, 127)" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Draw connections */}
          {visibleConnections.map((conn) => {
            const from = findCoords(conn.from)
            const to = findCoords(conn.to)
            const midX = (from.x + to.x) / 2
            const midY = (from.y + to.y) / 2

            return (
              <motion.path
                key={`${conn.from}-${conn.to}`}
                d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
                stroke="url(#connectionGrad)"
                strokeWidth="0.5"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            )
          })}

          {/* Draw nodes */}
          {currentNodes.map((node) => {
            const pos = getNodePosition(node)
            const isNew = node.isNew && progress > 0
            const nodeColor = node.color.includes('primary') ? '#2d6e4c' : node.color.includes('secondary') ? '#0f5a7f' : '#ff6b35'
            
            return (
              <motion.g
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: node.isNew ? Math.max(0, (progress - 20) / 40) : 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Glow */}
                {isNew && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={node.size + 1}
                    fill="none"
                    stroke={nodeColor}
                    opacity="0.2"
                  />
                )}
                {/* Node */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={node.size}
                  fill={nodeColor}
                  opacity={0.8}
                />
                {/* New badge */}
                {isNew && (
                  <circle
                    cx={pos.x + 3}
                    cy={pos.y - 3}
                    r={0.7}
                    fill="#ff6b35"
                  />
                )}
              </motion.g>
            )
          })}
        </svg>

        {/* Time labels */}
        <div className="absolute bottom-4 left-8 right-8 flex justify-between text-sm text-muted-foreground pointer-events-none">
          <span>Before</span>
          <span>3 Weeks Later</span>
        </div>
      </motion.div>

      {/* Slider Control */}
      <div className="space-y-4">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full h-2 bg-gradient-to-r from-muted via-primary to-accent rounded-full cursor-pointer appearance-none slider"
          style={{
            background: `linear-gradient(to right, rgb(var(--color-primary)), rgb(var(--color-secondary)), rgb(var(--color-accent))) 0%, rgb(var(--color-muted)) 0%)`
          }}
        />
        
        {/* Stats that update */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            key={`connections-${Math.floor(visibleConnections.length / 3)}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-4 rounded-xl bg-card/50 border border-border"
          >
            <div className="text-2xl font-bold text-primary">
              {visibleConnections.length}
            </div>
            <div className="text-xs text-muted-foreground">Active Connections</div>
          </motion.div>

          <motion.div
            key={`neighbors-${Math.floor(currentNodes.filter((n) => n.opacity !== undefined ? n.opacity > 0.5 : true).length / 3)}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-4 rounded-xl bg-card/50 border border-border"
          >
            <div className="text-2xl font-bold text-secondary">
              {currentNodes.filter((n) => !n.isNew || (n.opacity !== undefined ? n.opacity > 0.5 : false) || !n.isNew).length}
            </div>
            <div className="text-xs text-muted-foreground">Active Neighbors</div>
          </motion.div>

          <motion.div
            key={`matches-${Math.floor(progress / 25)}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-4 rounded-xl bg-card/50 border border-border"
          >
            <div className="text-2xl font-bold text-accent">
              {Math.floor((progress / 100) * 24)}
            </div>
            <div className="text-xs text-muted-foreground">Potential Matches</div>
          </motion.div>
        </div>

        {/* Description */}
        <motion.p
          key={`desc-${Math.floor(progress / 20)}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-muted-foreground italic"
        >
          {progress < 30
            ? 'Early days: A few neighbors starting to connect...'
            : progress < 60
            ? 'Growing momentum: New neighbors joining and making connections!'
            : progress < 90
            ? 'Community flourishing: Skills and resources flowing freely across the neighborhood.'
            : 'Full engagement: A thriving neighborhood where everyone knows someone.'}
        </motion.p>
      </div>

      {/* Slider styling */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-secondary)));
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          border: 2px solid white;
          transition: all 0.2s;
        }
        .slider::-webkit-slider-thumb:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transform: scale(1.1);
        }
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-secondary)));
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          border: 2px solid white;
          transition: all 0.2s;
        }
        .slider::-moz-range-thumb:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transform: scale(1.1);
        }
      `}</style>
    </div>
  )
}
