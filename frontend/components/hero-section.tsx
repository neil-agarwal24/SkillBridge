'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { NetworkVisualization } from './network-visualization'

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  return (
    <section className="relative overflow-hidden pt-16 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-secondary/8 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-accent/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Content */}
          <motion.div
            className="flex flex-col space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="self-start">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full border border-primary/20 w-fit text-xs font-semibold hover:bg-primary/15 transition-colors">
                ✨ Launching Spring 2025
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-3">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-foreground">
                Share Skills,{' '}
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  Share Stuff
                </span>
              </h1>
              <h2 className="text-2xl sm:text-3xl font-semibold text-primary">
                Shrink the Gap
              </h2>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg"
            >
              Connect with neighbors across your community to exchange skills, borrow tools, and build lasting relationships. NeighborNet breaks down barriers and brings people together.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <Link
                href="/signup"
                className="px-8 py-4 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-accent/25 inline-flex items-center justify-center gap-2 group w-fit active:scale-95"
              >
                Get Started
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                href="/skills-and-needs"
                className="px-8 py-4 bg-muted hover:bg-muted/70 text-foreground font-semibold rounded-full transition-all duration-300 border border-border hover:border-primary/30 inline-flex items-center justify-center gap-2 group w-fit active:scale-95"
              >
                Explore the Map
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-4 text-sm text-muted-foreground pt-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 border-2 border-background shadow-sm" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-secondary/70 border-2 border-background shadow-sm" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent/70 border-2 border-background shadow-sm" />
              </div>
              <span>Join thousands building their neighborhood</span>
            </motion.div>
          </motion.div>

          {/* Right Column: Network Visualization */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block"
          >
            <NetworkVisualization />
          </motion.div>
        </div>

        {/* Mobile Network Visualization */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8, delay: 0.6 }}
          className="lg:hidden mt-16"
        >
          <NetworkVisualization />
        </motion.div>
      </div>
    </section>
  )
}
