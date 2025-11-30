'use client'

import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Zap, Heart, Users } from 'lucide-react'
import { TimeLapseSlider } from '@/components/time-lapse-slider'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-60" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl opacity-60" />
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8 md:space-y-10"
            >
              {/* Main Heading */}
              <motion.div variants={itemVariants} className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-balance">
                  <span className="text-foreground">Share Skills,</span>
                  <br />
                  <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                    Share Stuff
                  </span>
                </h1>
              </motion.div>

              {/* Tagline */}
              <motion.div variants={itemVariants} className="space-y-4">
                <p className="text-xl md:text-2xl text-primary font-semibold">
                  Shrink the gap.
                </p>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                  Connect with neighbors across your community to exchange skills, borrow tools, share resources, and build lasting relationships that strengthen everyone.
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Link
                  href="/discover"
                  className="px-8 py-4 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2 group"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/about"
                  className="px-8 py-4 border-2 border-primary text-primary hover:bg-primary/5 font-semibold rounded-full transition-all duration-300 hover:shadow-lg inline-flex items-center justify-center gap-2"
                >
                  Learn More
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div variants={itemVariants} className="pt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Join <span className="font-semibold text-foreground">2,500+</span> neighbors already connecting
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Time-Lapse Neighborhood Before & After Section */}
        <section className="relative w-full py-20 md:py-28 border-t border-border bg-gradient-to-b from-background via-primary/5 to-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              className="space-y-10"
            >
              {/* Section Header */}
              <div className="text-center space-y-3">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                  See the Impact
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Watch how neighborhoods transform when people connect. Drag the slider to see 3 weeks of growth.
                </p>
              </div>

              {/* Time-Lapse Slider */}
              <TimeLapseSlider />
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative w-full py-20 md:py-28 border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="space-y-16"
            >
              {/* Section Header */}
              <motion.div variants={itemVariants} className="text-center space-y-3">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                  How it works
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Connect, share, and build community in three simple steps.
                </p>
              </motion.div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Zap,
                    title: 'Discover Skills & Items',
                    description: 'Browse what your neighbors can offer—from tutoring and repairs to tools and rides.'
                  },
                  {
                    icon: Heart,
                    title: 'Make Connections',
                    description: 'Message neighbors, ask for help, or propose exchanges that work for everyone.'
                  },
                  {
                    icon: Users,
                    title: 'Build Community',
                    description: 'Share resources, strengthen relationships, and make your neighborhood stronger.'
                  },
                ].map((feature, i) => {
                  const Icon = feature.icon
                  return (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      className="p-8 rounded-2xl bg-card/50 border border-border hover:border-primary/30 hover:bg-card/80 transition-all duration-300 group cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                    >
                      <div className="mb-4 inline-flex p-3 rounded-full bg-primary/10 group-hover:bg-primary/15 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative w-full py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-background border border-primary/20 overflow-hidden"
            >
              {/* Decorative blobs */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
              </div>

              <motion.div variants={itemVariants} className="space-y-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Ready to connect with your neighborhood?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  SkillBridge makes it easy to find help, offer support, and strengthen community bonds.
                </p>
                <div className="pt-4">
                  <Link
                    href="/discover"
                    className="px-8 py-4 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2 group"
                  >
                    Explore the Neighborhood
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
