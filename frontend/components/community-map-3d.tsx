'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Sphere, Text } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Mock neighbor data
const MAP_NEIGHBORS = [
  {
    id: 1,
    name: 'Sarah Chen',
    x: 3.5,
    y: 3.0,
    z: 0,
    type: 'skill-heavy',
    offers: ['Piano Lessons', 'Gardening Tips'],
    needs: ['House Cleaning'],
    distance: 0.3,
    avatar: '👩‍🎨',
    isNew: false,
    income: 'high',
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    x: 6.8,
    y: 5.2,
    z: 0,
    type: 'skill-heavy',
    offers: ['Home Repair', 'Carpentry'],
    needs: ['Cooking Classes'],
    distance: 0.8,
    avatar: '👨‍🔧',
    isNew: false,
    income: 'high',
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    x: 2.8,
    y: 6.8,
    z: 0,
    type: 'high-need',
    offers: ['Cooking', 'Spanish Lessons'],
    needs: ['Tech Help', 'Childcare'],
    distance: 1.2,
    avatar: '👩‍🍳',
    isNew: true,
    income: 'low',
  },
  {
    id: 4,
    name: 'James Wilson',
    x: 7.2,
    y: 2.2,
    z: 0,
    type: 'skill-heavy',
    offers: ['Coding', 'Website Design'],
    needs: ['Fitness Coaching'],
    distance: 2.1,
    avatar: '👨‍💻',
    isNew: false,
    income: 'high',
  },
  {
    id: 5,
    name: 'Lisa Park',
    x: 4.8,
    y: 4.2,
    z: 0,
    type: 'balanced',
    offers: ['Art Classes', 'Design Help'],
    needs: ['Music Lessons'],
    distance: 0.5,
    avatar: '👩‍🎨',
    isNew: false,
    income: 'medium',
  },
  {
    id: 6,
    name: 'Robert Taylor',
    x: 2.2,
    y: 1.8,
    z: 0,
    type: 'skill-heavy',
    offers: ['Tax Help', 'Business Advice'],
    needs: ['Fitness Training'],
    distance: 1.5,
    avatar: '👨‍💼',
    isNew: false,
    income: 'high',
  },
  {
    id: 7,
    name: 'Priya Kapoor',
    x: 6.0,
    y: 7.2,
    z: 0,
    type: 'balanced',
    offers: ['Yoga Classes', 'Meditation'],
    needs: ['Babysitting'],
    distance: 0.9,
    avatar: '🧘‍♀️',
    isNew: false,
    income: 'medium',
  },
  {
    id: 8,
    name: 'David Chen',
    x: 4.2,
    y: 5.8,
    z: 0,
    type: 'high-need',
    offers: ['Tutoring'],
    needs: ['Handyman Services', 'Plumbing'],
    distance: 1.3,
    avatar: '👨‍🏫',
    isNew: true,
    income: 'low',
  },
]

// Cross-income bridge connections
const CONNECTIONS = [
  { from: 0, to: 4, isBridge: false },
  { from: 1, to: 4, isBridge: false },
  { from: 2, to: 3, isBridge: true }, // cross-income
  { from: 3, to: 4, isBridge: false },
  { from: 4, to: 5, isBridge: false },
  { from: 1, to: 6, isBridge: true }, // cross-income
  { from: 2, to: 7, isBridge: true }, // cross-income
  { from: 5, to: 0, isBridge: false },
]

function CurvedLine({ from, to, isBridge, isActive }) {
  const points = useMemo(() => {
    const start = new THREE.Vector3(from.x, from.y, from.z + 0.3)
    const end = new THREE.Vector3(to.x, to.y, to.z + 0.3)
    
    // Create curved path with control point
    const mid = new THREE.Vector3(
      (from.x + to.x) / 2 + (Math.random() - 0.5) * 0.8,
      (from.y + to.y) / 2 + (Math.random() - 0.5) * 0.8,
      0.8
    )
    
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
    return curve.getPoints(32)
  }, [from, to])

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(points)
    return geom
  }, [points])

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color={isBridge ? '#F59E0B' : '#459169'}
        linewidth={isActive ? 3 : 1}
        dashSize={isBridge ? 0.15 : 0}
        gapSize={isBridge ? 0.1 : 0}
        transparent
        opacity={isActive ? 0.6 : 0.15}
      />
    </line>
  )
}

function NeighborNode({ neighbor, isSelected, isHovered, onSelect, onHover, onHoverEnd }) {
  const groupRef = useRef()
  const sphereRef = useRef()
  const haloRef = useRef()
  const [isLocalHovered, setIsLocalHovered] = useState(false)

  // Animate scale on hover/selection
  useFrame(() => {
    if (!groupRef.current) return

    const targetScale = isSelected ? 1.8 : isLocalHovered ? 1.4 : 1
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)

    // Pulsing halo for new neighbors
    if (neighbor.isNew && haloRef.current) {
      haloRef.current.scale.x = 1 + Math.sin(Date.now() * 0.005) * 0.3
      haloRef.current.scale.y = 1 + Math.sin(Date.now() * 0.005) * 0.3
      haloRef.current.material.opacity = 0.3 + Math.sin(Date.now() * 0.005) * 0.2
    }

    // Gentle lift on hover
    if (isLocalHovered || isSelected) {
      groupRef.current.position.z = Math.max(groupRef.current.position.z, 0.5)
    } else {
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 0, 0.1)
    }
  })

  const getNodeColor = () => {
    switch (neighbor.type) {
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

  return (
    <group
      ref={groupRef}
      position={[neighbor.x - 4, neighbor.y - 4, neighbor.z]}
      onClick={() => onSelect(neighbor)}
      onPointerEnter={() => {
        setIsLocalHovered(true)
        onHover(neighbor.id)
      }}
      onPointerLeave={() => {
        setIsLocalHovered(false)
        onHoverEnd()
      }}
    >
      {/* Pulsing halo for new neighbors */}
      {neighbor.isNew && (
        <Sphere ref={haloRef} args={[0.8, 32, 32]} position={[0, 0, -0.1]}>
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.3}
            transparent
            opacity={0.3}
          />
        </Sphere>
      )}

      {/* Depth shadow on ground */}
      <Sphere args={[0.35, 32, 32]} position={[0, 0, -0.45]}>
        <meshStandardMaterial color="#000" transparent opacity={0.15} depthWrite={false} />
      </Sphere>

      {/* Main 3D node */}
      <Sphere ref={sphereRef} args={[0.5, 64, 64]}>
        <meshStandardMaterial
          color={getNodeColor()}
          emissive={getNodeColor()}
          emissiveIntensity={isSelected ? 0.5 : isLocalHovered ? 0.3 : 0.1}
          metalness={0.3}
          roughness={0.4}
        />
      </Sphere>

      {/* Icon text on node */}
      <Text position={[0, 0, 0.51]} fontSize={0.6} color="white" anchorX="center" anchorY="middle">
        {neighbor.avatar}
      </Text>

      {/* Selection ring */}
      {isSelected && (
        <Sphere args={[0.6, 32, 32]}>
          <meshStandardMaterial
            color="white"
            wireframe
            transparent
            opacity={0.4}
            emissive="white"
            emissiveIntensity={0.2}
          />
        </Sphere>
      )}
    </group>
  )
}

function MapScene({ selectedNeighbor, onSelectNeighbor, hoveredNode, setHoveredNode, cameraControlRef }) {
  const sceneRef = useRef()
  const gridRef = useRef()

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, -8, 10]} fov={45} />
      <OrbitControls 
        ref={cameraControlRef} 
        autoRotate 
        autoRotateSpeed={0.3}
        enableDamping
        dampingFactor={0.05}
        enablePan={false}
        minDistance={8}
        maxDistance={25}
      />

      <color attach="background" args={['#faf8f3']} />

      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2.5, 0, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial 
          color="#f5f1e8"
          side={THREE.DoubleSide}
        />
      </mesh>

      <LineGrid />

      {/* Warm, soft lighting for neighborhood feel */}
      <ambientLight intensity={0.7} color="#fff8f0" />
      <directionalLight 
        position={[8, 12, 8]} 
        intensity={0.8} 
        color="#ffe4d6" 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-6, 8, -6]} intensity={0.3} color="#e8daef" />

      {/* Connection lines */}
      {CONNECTIONS.map((conn, idx) => (
        <CurvedLine
          key={`conn-${idx}`}
          from={MAP_NEIGHBORS[conn.from]}
          to={MAP_NEIGHBORS[conn.to]}
          isBridge={conn.isBridge}
          isActive={selectedNeighbor?.id === MAP_NEIGHBORS[conn.from].id || selectedNeighbor?.id === MAP_NEIGHBORS[conn.to].id}
        />
      ))}

      {/* Neighbor nodes */}
      {MAP_NEIGHBORS.map(neighbor => (
        <NeighborNode
          key={neighbor.id}
          neighbor={neighbor}
          isSelected={selectedNeighbor?.id === neighbor.id}
          isHovered={hoveredNode === neighbor.id}
          onSelect={onSelectNeighbor}
          onHover={(id) => setHoveredNode(id)}
          onHoverEnd={() => setHoveredNode(null)}
        />
      ))}
    </>
  )
}

function LineGrid() {
  const gridSize = 16
  const divisions = 16
  const step = gridSize / divisions
  const halfSize = gridSize / 2

  const lines = []
  const color1 = new THREE.Color('#e8dcc8')
  const color2 = new THREE.Color('#ede6d8')

  for (let i = 0; i <= divisions; i++) {
    const pos = -halfSize + i * step
    
    // X-axis lines
    lines.push(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-halfSize, pos, 0),
        new THREE.Vector3(halfSize, pos, 0)
      ])
    )
    
    // Y-axis lines
    lines.push(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(pos, -halfSize, 0),
        new THREE.Vector3(pos, halfSize, 0)
      ])
    )
  }

  return (
    <group rotation={[-Math.PI / 2.5, 0, 0]} position={[0, 0.02, 0]}>
      {lines.map((geom, idx) => (
        <line key={idx} geometry={geom}>
          <lineBasicMaterial color={idx % 2 === 0 ? '#e8dcc8' : '#ede6d8'} />
        </line>
      ))}
    </group>
  )
}

export function CommunityMap3D({ selectedNeighbor, onSelectNeighbor }) {
  const [hoveredNode, setHoveredNode] = useState(null)
  const [showInfo, setShowInfo] = useState(true)
  const cameraControlRef = useRef()

  const handleReset = () => {
    if (cameraControlRef.current) {
      cameraControlRef.current.reset()
    }
    onSelectNeighbor(null)
    setHoveredNode(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-background p-4"
    >
      {/* Welcome Banner */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute top-6 left-6 right-6 z-20 pointer-events-none"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Your Community Map</h1>
            <p className="text-sm text-muted-foreground mt-1">Explore neighbors, discover skills, find connections</p>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 relative overflow-hidden rounded-3xl border border-border/40 shadow-lg bg-white">
        <Canvas>
          <MapScene
            selectedNeighbor={selectedNeighbor}
            onSelectNeighbor={onSelectNeighbor}
            hoveredNode={hoveredNode}
            setHoveredNode={setHoveredNode}
            cameraControlRef={cameraControlRef}
          />
        </Canvas>
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
            onClick={handleReset}
            className="rounded-full h-10 px-3 hover:bg-primary/10 text-xs"
            title="Reset view"
          >
            <RotateCcw size={16} className="mr-1" />
            Reset
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
          <div className="flex items-center gap-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #F59E0B 0px, #F59E0B 2px, transparent 2px, transparent 6px)' }} />
            <span className="text-muted-foreground font-medium">Cross-Income Bridge</span>
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowInfo(!showInfo)}
          className="rounded-full h-10 px-3 text-xs hover:bg-primary/10"
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
            <div className="flex items-start gap-3">
              <div className="text-3xl">{selectedNeighbor.avatar}</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-foreground">{selectedNeighbor.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: selectedNeighbor.type === 'skill-heavy' ? '#459169' : selectedNeighbor.type === 'high-need' ? '#5B9BD5' : '#F5A623' }} />
                  {selectedNeighbor.type === 'skill-heavy' && 'Skill Provider'}
                  {selectedNeighbor.type === 'high-need' && 'Seeking Help'}
                  {selectedNeighbor.type === 'balanced' && 'Balanced Member'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">📍 {selectedNeighbor.distance} km away</span>
            </div>

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

            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl h-9 text-sm">
              Connect
            </Button>
          </div>
        </motion.div>
      )}

      {/* Info Tooltip */}
      {showInfo && !selectedNeighbor && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-20 right-6 bg-card/90 backdrop-blur-lg border border-border/60 rounded-xl p-3 max-w-xs z-20 text-sm text-muted-foreground"
        >
          <p className="text-xs">Click any node to view details. Drag to rotate, scroll to zoom. Yellow dashed lines show cross-income bridges.</p>
        </motion.div>
      )}
    </motion.div>
  )
}
