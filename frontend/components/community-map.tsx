'use client'

import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

// Mock neighbor data for map - matching our 8 dummy accounts
const MAP_NEIGHBORS = [
  {
    id: 1,
    name: 'Sarah Chen',
    x: 35,
    y: 30,
    type: 'skill-heavy',
    offers: ['Piano Lessons', 'Gardening Tips'],
    needs: ['Pet Sitting'],
    distance: 0.3,
    avatar: '👩‍🎨',
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    x: 68,
    y: 52,
    type: 'skill-heavy',
    offers: ['Home Repairs', 'Furniture Assembly', 'Power Drill'],
    needs: ['Cooking Classes', 'Lawn Mower'],
    distance: 0.8,
    avatar: '👨‍🔧',
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    x: 28,
    y: 68,
    type: 'high-need',
    offers: ['Babysitting', 'Meal Prep Help'],
    needs: ['Baby Clothes', 'Stroller'],
    distance: 1.2,
    avatar: '👩‍🍳',
  },
  {
    id: 4,
    name: 'David Kim',
    x: 72,
    y: 22,
    type: 'skill-heavy',
    offers: ['Web Development', 'Photography'],
    needs: ['Spanish Tutoring'],
    distance: 2.1,
    avatar: '👨‍💻',
  },
  {
    id: 5,
    name: 'Aisha Patel',
    x: 48,
    y: 42,
    type: 'skill-heavy',
    offers: ['Yoga Classes', 'Meditation Coaching'],
    needs: ['Sound System'],
    distance: 0.5,
    avatar: '🧘‍♀️',
  },
  {
    id: 6,
    name: 'Tom Anderson',
    x: 22,
    y: 18,
    type: 'balanced',
    offers: ['Math Tutoring', 'Reading Help'],
    needs: ['Tech Support'],
    distance: 1.5,
    avatar: '👨‍🏫',
  },
  {
    id: 7,
    name: 'Maria Santos',
    x: 60,
    y: 72,
    type: 'skill-heavy',
    offers: ['Sewing & Alterations', 'Knitting Lessons'],
    needs: ['Car Maintenance'],
    distance: 0.9,
    avatar: '👩‍🎨',
  },
  {
    id: 8,
    name: 'James Wilson',
    x: 42,
    y: 58,
    type: 'high-need',
    offers: ['Dog Walking'],
    needs: ['Resume Review', 'Interview Prep', 'Desk', 'Desk Chair'],
    distance: 1.3,
    avatar: '👨‍💼',
  },
]

// Connection map based on skill/need matches
const CONNECTIONS = [
  [0, 4],
  [1, 4],
  [2, 3],
  [3, 4],
  [4, 5],
  [1, 6],
  [2, 7],
  [5, 0],
]

export function CommunityMap({ filters, selectedNeighbor, onSelectNeighbor, mapFocused, setMapFocused }) {
  const [zoom, setZoom] = useState(1)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [perspective, setPerspective] = useState({ x: 0, y: 0 })
  const [showInfo, setShowInfo] = useState(true)
  const svgRef = useRef(null)
  const containerRef = useRef(null)

  // Enhanced 3D perspective tracking
  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    
    setPerspective({
      x: (x - 0.5) * 25,
      y: (y - 0.5) * 25,
    })
  }

  const handleMouseLeave = () => {
    setPerspective({ x: 0, y: 0 })
  }

  const handleZoom = (direction) => {
    setZoom(prev => {
      const newZoom = direction === 'in' ? prev + 0.2 : prev - 0.2
      return Math.max(0.6, Math.min(2.5, newZoom))
    })
  }

  const handleReset = () => {
    setZoom(1)
    setPerspective({ x: 0, y: 0 })
    onSelectNeighbor(null)
  }

  const getNodeColor = (type) => {
    switch (type) {
      case 'skill-heavy':
        return '#459169'
      case 'high-need':
        return '#5B9BD5'
      case 'balanced':
        return '#F5A623'
      default:
        return '#999'
    }
  }

  const getNodeIcon = (type) => {
    switch (type) {
      case 'skill-heavy':
        return '⚡'
      case 'high-need':
        return '❤️'
      case 'balanced':
        return '🏠'
      default:
        return '👤'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-gradient-to-br from-background via-primary/3 to-background"
    >
      {/* Welcome Banner */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute top-4 left-4 right-4 z-20 pointer-events-none"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Your Community Map</h1>
            <p className="text-sm text-muted-foreground mt-1">Explore neighbors, discover skills, find connections</p>
          </div>
        </div>
      </motion.div>

      {/* Main Map Container */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="flex-1 relative overflow-hidden m-4 rounded-3xl border border-border/60 shadow-2xl"
        style={{
          perspective: '1200px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* 3D Transform wrapper for mouse tracking */}
        <div
          style={{
            transform: `rotateX(${perspective.y * 0.4}deg) rotateY(${perspective.x * 0.4}deg)`,
            transformOrigin: 'center',
            transition: 'transform 0.15s ease-out',
            transformStyle: 'preserve-3d',
            width: '100%',
            height: '100%',
          }}
          className="w-full h-full"
        >
          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{ 
              cursor: 'grab',
              filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.1))',
            }}
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Defs for gradients and filters */}
            <defs>
              <radialGradient id="skill-heavy-glow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#459169" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#459169" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="high-need-glow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#5B9BD5" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#5B9BD5" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="balanced-glow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#F5A623" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
              </radialGradient>
              <filter id="node-shadow">
                <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.25" />
              </filter>
              <filter id="glow-blur">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              </filter>
            </defs>

            {/* Subtle animated background grid */}
            <g opacity="0.04" className="pointer-events-none">
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(x => (
                <line key={`v${x}`} x1={x} y1="0" x2={x} y2="100" stroke="currentColor" strokeWidth="0.5" />
              ))}
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(y => (
                <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" strokeWidth="0.5" />
              ))}
            </g>

            {/* Connection lines with smooth animations */}
            <g opacity="0.5" className="pointer-events-none">
              {CONNECTIONS.map((conn, idx) => {
                const node1 = MAP_NEIGHBORS[conn[0]]
                const node2 = MAP_NEIGHBORS[conn[1]]
                const isActive = selectedNeighbor?.id === node1.id || selectedNeighbor?.id === node2.id
                const isNearHovered = hoveredNode === node1.id || hoveredNode === node2.id
                
                return (
                  <motion.line
                    key={`conn-${idx}`}
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ 
                      opacity: isActive ? 0.5 : isNearHovered ? 0.3 : 0.12,
                      pathLength: 1,
                      strokeWidth: isActive ? 1.2 : isNearHovered ? 0.9 : 0.6,
                    }}
                    transition={{ delay: 0.4 + idx * 0.06, duration: 0.8 }}
                    x1={node1.x}
                    y1={node1.y}
                    x2={node2.x}
                    y2={node2.y}
                    stroke={getNodeColor(node1.type)}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                )
              })}
            </g>

            {/* Nodes with enhanced 3D appearance */}
            {MAP_NEIGHBORS.map((neighbor, idx) => {
              const isSelected = selectedNeighbor?.id === neighbor.id
              const isHovered = hoveredNode === neighbor.id
              const nodeScale = isSelected ? 1.6 : isHovered ? 1.3 : 1
              const color = getNodeColor(neighbor.type)
              
              return (
                <g key={neighbor.id} className="cursor-pointer">
                  {/* Large outer glow effect */}
                  <motion.circle
                    initial={{ r: 3, opacity: 0 }}
                    animate={{ 
                      r: isSelected ? 5.5 : isHovered ? 4 : 3,
                      opacity: isSelected ? 0.4 : isHovered ? 0.25 : 0.08,
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                    cx={neighbor.x}
                    cy={neighbor.y}
                    fill={color}
                    style={{
                      filter: `url(#glow-blur)`,
                    }}
                  />

                  {/* Middle glow layer */}
                  <motion.circle
                    initial={{ r: 2.2, opacity: 0 }}
                    animate={{ 
                      r: isSelected ? 3.2 : isHovered ? 2.4 : 1.8,
                      opacity: isSelected ? 0.25 : isHovered ? 0.15 : 0.05,
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                    cx={neighbor.x}
                    cy={neighbor.y}
                    fill={color}
                  />

                  {/* Main node circle */}
                  <motion.circle
                    initial={{ opacity: 0, r: 0 }}
                    animate={{ opacity: 1, r: 1.2 * nodeScale }}
                    transition={{ delay: 0.5 + idx * 0.08, duration: 0.6 }}
                    cx={neighbor.x}
                    cy={neighbor.y}
                    fill={color}
                    className="transition-all duration-300"
                    onMouseEnter={() => setHoveredNode(neighbor.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => onSelectNeighbor(neighbor)}
                    filter="url(#node-shadow)"
                    style={{
                      stroke: isSelected ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
                      strokeWidth: '0.2',
                      filter: isSelected 
                        ? 'drop-shadow(0 0 2px rgba(255,255,255,0.4)) drop-shadow(0 4px 12px rgba(0,0,0,0.2))' 
                        : 'drop-shadow(0 3px 8px rgba(0,0,0,0.15))',
                    }}
                  />

                  {/* Icon inside node */}
                  <motion.text
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + idx * 0.08 }}
                    x={neighbor.x}
                    y={neighbor.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={0.8 * nodeScale}
                    className="pointer-events-none select-none font-bold transition-all duration-300"
                  >
                    {getNodeIcon(neighbor.type)}
                  </motion.text>

                  {/* Name label on hover */}
                  {(isHovered || isSelected) && (
                    <motion.g
                      initial={{ opacity: 0, y: -2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -2 }}
                      className="pointer-events-none"
                    >
                      <rect
                        x={neighbor.x - 3.5}
                        y={neighbor.y - 4.5}
                        width="7"
                        height="1.8"
                        rx="0.6"
                        fill={color}
                        opacity="0.95"
                      />
                      <text
                        x={neighbor.x}
                        y={neighbor.y - 3.6}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="0.7"
                        fill="white"
                        fontWeight="600"
                        className="font-semibold pointer-events-none"
                      >
                        {neighbor.name.split(' ')[0]}
                      </text>
                    </motion.g>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-between px-6 py-4 bg-card/80 backdrop-blur-sm border-t border-border/50"
      >
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleZoom('in')}
            className="rounded-full h-10 w-10 p-0 hover:bg-primary/10"
            title="Zoom in"
          >
            <ZoomIn size={18} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleZoom('out')}
            className="rounded-full h-10 w-10 p-0 hover:bg-primary/10"
            title="Zoom out"
          >
            <ZoomOut size={18} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="rounded-full h-10 w-10 p-0 hover:bg-primary/10"
            title="Reset view"
          >
            <RotateCcw size={18} />
          </Button>
        </div>

        {/* Legend */}
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-[#459169]" />
            <span className="text-muted-foreground font-medium">Skill-Heavy</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-[#5B9BD5]" />
            <span className="text-muted-foreground font-medium">High-Need</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-[#F5A623]" />
            <span className="text-muted-foreground font-medium">Balanced</span>
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowInfo(!showInfo)}
          className="rounded-full h-10 px-3 text-xs hover:bg-primary/10"
          title="Toggle info"
        >
          <Info size={16} className="mr-1" />
          Info
        </Button>
      </motion.div>

      {/* Selected Node Detail Card */}
      {selectedNeighbor && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="absolute bottom-6 left-6 z-20 max-w-xs"
        >
          <div className="bg-card/95 backdrop-blur-lg border border-border/80 rounded-2xl p-5 shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="text-3xl">{selectedNeighbor.avatar}</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-foreground">{selectedNeighbor.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: getNodeColor(selectedNeighbor.type) }} />
                  {selectedNeighbor.type === 'skill-heavy' && 'Skill Provider'}
                  {selectedNeighbor.type === 'high-need' && 'Seeking Help'}
                  {selectedNeighbor.type === 'balanced' && 'Balanced Member'}
                </div>
              </div>
            </div>

            {/* Distance */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">📍 {selectedNeighbor.distance} km away</span>
            </div>

            {/* Offers */}
            <div>
              <p className="text-xs font-semibold text-primary mb-2">Things I Can Offer:</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedNeighbor.offers?.slice(0, 3).map(offer => (
                  <span key={offer} className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full font-medium">
                    {offer}
                  </span>
                ))}
              </div>
            </div>

            {/* Needs */}
            <div>
              <p className="text-xs font-semibold text-secondary mb-2">Things I Need:</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedNeighbor.needs?.slice(0, 2).map(need => (
                  <span key={need} className="text-xs bg-secondary/15 text-secondary px-2.5 py-1 rounded-full font-medium">
                    {need}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl h-9 text-sm"
              onClick={() => {
                console.log('[v0] Connecting with', selectedNeighbor.name)
              }}
            >
              Connect
            </Button>
          </div>
        </motion.div>
      )}

      {/* Floating Info Tooltip */}
      {showInfo && !selectedNeighbor && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-20 right-6 bg-card/90 backdrop-blur-lg border border-border/60 rounded-xl p-3 max-w-xs z-20 text-sm text-muted-foreground"
        >
          <p className="text-xs">Hover over or click any node to see neighbor details. Use zoom controls to explore further.</p>
        </motion.div>
      )}
    </motion.div>
  )
}
