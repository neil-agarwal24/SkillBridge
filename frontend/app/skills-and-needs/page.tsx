'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { SkillsFilterSidebar } from '@/components/skills-filter-sidebar'
import { NeighborsList } from '@/components/neighbors-list'
import { CommunityMap } from '@/components/community-map'
import { useState } from 'react'

export default function SkillsAndNeedsPage() {
  const [filters, setFilters] = useState({
    skills: [],
    items: [],
    categories: [],
    distance: 5,
    timeAvailability: [],
    showNewNeighbors: false,
  })
  
  const [selectedNeighbor, setSelectedNeighbor] = useState(null)
  const [mapFocused, setMapFocused] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="w-full">
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          <div className="w-80 border-r border-border bg-card/50 overflow-y-auto">
            <SkillsFilterSidebar filters={filters} setFilters={setFilters} />
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <div className="flex-1 overflow-y-auto lg:border-r border-border">
              <NeighborsList 
                filters={filters} 
                selectedNeighbor={selectedNeighbor}
                onSelectNeighbor={setSelectedNeighbor}
              />
            </div>

            <div className="hidden lg:flex lg:w-1/2 flex-col bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
              <CommunityMap 
                filters={filters}
                selectedNeighbor={selectedNeighbor}
                onSelectNeighbor={setSelectedNeighbor}
                mapFocused={mapFocused}
                setMapFocused={setMapFocused}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
