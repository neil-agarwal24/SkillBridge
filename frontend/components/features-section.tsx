'use client'

import { motion } from 'framer-motion'
import { Share2, Zap, Heart, Users } from 'lucide-react'

const features = [
  {
    icon: Share2,
    title: 'Share Skills',
    description: 'Teach guitar, plumbing, coding, or anything else. Connect with neighbors eager to learn.',
    delay: 0,
  },
  {
    icon: Zap,
    title: 'Borrow & Lend',
    description: 'Access tools, equipment, and resources from nearby neighbors. No need to buy what you can share.',
    delay: 0.1,
  },
  {
    icon: Heart,
    title: 'Build Trust',
    description: 'Community ratings and verified profiles create a safe, trustworthy neighborhood network.',
    delay: 0.2,
  },
  {
    icon: Users,
    title: 'Local Events',
    description: 'Discover skill-shares, workshops, and community gatherings happening near you.',
    delay: 0.3,
  },
]

export function FeaturesSection() {
  return (
    <section id="how-it-works" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-muted/20 via-muted/5 to-transparent -skew-y-2 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            SynapseAI makes community connection simple, safe, and rewarding
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
                className="group"
              >
                <div className="p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 h-full flex flex-col hover:shadow-lg hover:shadow-primary/10 hover:scale-105 transform active:scale-95">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-5 group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-primary/5 via-primary/2 to-transparent skew-y-2 pointer-events-none" />
    </section>
  )
}
