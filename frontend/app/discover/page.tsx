'use client'

import { Footer } from '@/components/footer'
import { useState } from 'react'
import { SkillsFilterSidebar } from '@/components/skills-filter-sidebar'
import { NeighborsList } from '@/components/neighbors-list'
import { CommunityMap } from '@/components/community-map'

export default function DiscoverPage() {
  const [filters, setFilters] = useState({
    skills: [],
    items: [],
    categories: [],
    distance: 5,
    timeAvailability: [],
    showNewNeighbors: false,
  })
  
  const [selectedNeighbor, setSelectedNeighbor] = useState(null)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Removed <Navbar /> component */}
      <main className="flex-1 w-full">
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r border-border bg-card/50 overflow-y-auto hidden md:block">
            <SkillsFilterSidebar filters={filters} setFilters={setFilters} />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Neighbors List */}
            <div className="flex-1 overflow-y-auto lg:border-r border-border">
              <NeighborsList 
                filters={filters} 
                selectedNeighbor={selectedNeighbor}
                onSelectNeighbor={setSelectedNeighbor}
              />
            </div>

            {/* Map */}
            <div className="hidden lg:flex lg:w-1/2 flex-col bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
              <CommunityMap 
                filters={filters}
                selectedNeighbor={selectedNeighbor}
                onSelectNeighbor={setSelectedNeighbor}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
