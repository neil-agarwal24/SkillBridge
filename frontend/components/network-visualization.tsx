'use client'

import { motion } from 'framer-motion'
import { Book, Wrench, Laptop, Car, Baby } from 'lucide-react'
import { useState } from 'react'

interface Node {
  id: number
  x: number
  y: number
  radius: number
  color: string
  initials: string
  icon?: React.ReactNode
}

interface Connection {
  from: number
  to: number
}

export function NetworkVisualization() {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null)

  const nodes: Node[] = [
    { id: 1, x: 25, y: 30, radius: 12, color: 'from-primary', initials: 'JA' },
    { id: 2, x: 50, y: 15, radius: 10, color: 'from-secondary', initials: 'MK' },
    { id: 3, x: 75, y: 35, radius: 11, color: 'from-accent', initials: 'LS' },
    { id: 4, x: 35, y: 60, radius: 10, color: 'from-primary/70', initials: 'DR' },
    { id: 5, x: 65, y: 65, radius: 12, color: 'from-secondary/70', initials: 'PR' },
    { id: 6, x: 50, y: 50, radius: 9, color: 'from-primary/80', initials: 'TC' },
  ]

  const connections: Connection[] = [
    { from: 1, to: 2 },
    { from: 1, to: 4 },
    { from: 1, to: 6 },
    { from: 2, to: 3 },
    { from: 2, to: 5 },
    { from: 3, to: 5 },
    { from: 4, to: 6 },
    { from: 5, to: 6 },
  ]

  const floatingIcons = [
    { icon: Book, x: 10, y: 20, delay: 0 },
    { icon: Wrench, x: 85, y: 25, delay: 0.2 },
    { icon: Laptop, x: 15, y: 70, delay: 0.4 },
    { icon: Car, x: 80, y: 65, delay: 0.6 },
    { icon: Baby, x: 50, y: 5, delay: 0.8 },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const nodeVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  const iconVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  return (
    <motion.div
      className="relative w-full h-full min-h-96 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-3xl border border-border/50 overflow-hidden shadow-lg"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {connections.map((conn, idx) => {
          const fromNode = nodes.find(n => n.id === conn.from)!
          const toNode = nodes.find(n => n.id === conn.to)!

          return (
            <motion.line
              key={`line-${idx}`}
              x1={`${fromNode.x}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x}%`}
              y2={`${toNode.y}%`}
              stroke="url(#lineGradient)"
              strokeWidth="2"
              strokeOpacity={hoveredNode === null || hoveredNode === conn.from || hoveredNode === conn.to ? 0.35 : 0.12}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeInOut' }}
              className="transition-all duration-300"
            />
          )
        })}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>

      {nodes.map((node, idx) => (
        <motion.div
          key={`node-${node.id}`}
          className={`absolute bg-gradient-to-br ${node.color} to-transparent rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm cursor-pointer shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none`}
          style={{
            width: `${node.radius * 2}%`,
            aspectRatio: '1',
            left: `${node.x - node.radius}%`,
            top: `${node.y - node.radius}%`,
          }}
          variants={nodeVariants}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
          whileHover={{ scale: 1.15 }}
          role="button"
          tabIndex={0}
        >
          {node.initials}
        </motion.div>
      ))}

      {floatingIcons.map((item, idx) => {
        const Icon = item.icon
        return (
          <motion.div
            key={`icon-${idx}`}
            className="absolute w-10 h-10 rounded-full bg-white/85 backdrop-blur-sm shadow-md flex items-center justify-center text-primary transition-all duration-300 hover:scale-125 hover:shadow-lg"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            variants={iconVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: item.delay }}
            whileHover={{ scale: 1.2, rotate: 10 }}
          >
            <Icon size={20} strokeWidth={1.5} />
          </motion.div>
        )
      })}
    </motion.div>
  )
}
