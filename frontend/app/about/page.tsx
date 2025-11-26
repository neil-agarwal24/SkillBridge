'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, TrendingUp, Users, Heart, Zap, Shield, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-28 overflow-hidden border-b border-border">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-60" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl opacity-60" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 text-center"
            >
              <motion.div variants={itemVariants}>
                <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
                  Building Bridges,
                  <br />
                  <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                    Not Barriers
                  </span>
                </h1>
              </motion.div>
              
              <motion.p variants={itemVariants} className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                NeighborNet uses AI to intentionally connect neighbors across income levels and ages—creating meaningful exchanges that feel mutual, not charitable.
              </motion.p>

              <motion.div variants={itemVariants} className="pt-4">
                <Link href="/discover">
                  <Button size="lg" className="rounded-full px-8">
                    Start Connecting
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="w-full py-20 md:py-28 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center">
                The Hidden Gap in Your Neighborhood
              </h2>
              
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  People living on the same block rarely interact across income or age divides. A retired accountant with decades of experience might live next door to a student struggling with their taxes. A parent with childcare needs might be around the corner from a college student looking for part-time work.
                </p>
                <p className="text-lg leading-relaxed mt-4">
                  Traditional social networks connect people who are already similar. Traditional charity creates uncomfortable power dynamics. <strong className="text-foreground">NeighborNet is different.</strong>
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Bridge Connections Section */}
        <section className="w-full py-20 md:py-28 border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                  Cross-Income Bridge Connections
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Our AI actively identifies and promotes connections that bridge different backgrounds, creating mutual value for everyone.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Bridge Connection Example 1 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/30"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl">
                      👨‍💼
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Robert (Retired Accountant)</h3>
                      <p className="text-sm text-muted-foreground">Offers: Tax help, business advice</p>
                    </div>
                  </div>
                  <div className="flex justify-center my-4">
                    <div className="flex items-center gap-2 text-accent">
                      <div className="h-[2px] w-12 bg-accent animate-pulse" />
                      <Heart className="w-5 h-5" />
                      <div className="h-[2px] w-12 bg-accent animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl">
                      👩‍🌾
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Elena (New Mom)</h3>
                      <p className="text-sm text-muted-foreground">Needs: Tax help, offers cooking</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground italic">
                    Elena gets free tax advice. Robert gets home-cooked meals. Both feel valued.
                  </p>
                </motion.div>

                {/* Bridge Connection Example 2 */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl">
                      👨‍💻
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">James (Software Engineer)</h3>
                      <p className="text-sm text-muted-foreground">Offers: Coding lessons, tech setup</p>
                    </div>
                  </div>
                  <div className="flex justify-center my-4">
                    <div className="flex items-center gap-2 text-accent">
                      <div className="h-[2px] w-12 bg-accent animate-pulse" />
                      <Heart className="w-5 h-5" />
                      <div className="h-[2px] w-12 bg-accent animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl">
                      👨‍🏫
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">David (High School Teacher)</h3>
                      <p className="text-sm text-muted-foreground">Needs: Tech help, offers tutoring</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground italic">
                    David learns to code. James's kids get math tutoring. Skills flow both ways.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-20 md:py-28 bg-muted/30 border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                  How NeighborNet Works
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Users,
                    title: '1. List Offers & Needs',
                    description: 'Share what you can teach, lend, or help with. List what you\'re looking for. No offer is too small.',
                  },
                  {
                    icon: Zap,
                    title: '2. AI Matches You',
                    description: 'Our algorithm finds complementary matches nearby, prioritizing cross-income connections that feel mutual.',
                  },
                  {
                    icon: Heart,
                    title: '3. Build Relationships',
                    description: 'Use AI-suggested messages to start conversations. Exchange skills and resources. Strengthen your community.',
                  },
                ].map((step, i) => {
                  const Icon = step.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 rounded-2xl bg-card border border-border text-center"
                    >
                      <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Community Events Section */}
        <section className="w-full py-20 md:py-28 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-secondary/10 mb-4">
                  <Globe className="w-10 h-10 text-secondary" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                  AI-Suggested Community Events
                </h2>
                <p className="text-xl text-muted-foreground">
                  When multiple neighbors need the same thing, we suggest workshops and group events.
                </p>
              </div>

              <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl p-8 border border-secondary/30">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        15 neighbors need "Resume Help"
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        → AI suggests: "Weekend Resume Workshop at Community Center"
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        8 neighbors need "Childcare"
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        → AI suggests: "Parent Co-op Babysitting Exchange"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Impact Stats Section */}
        <section className="w-full py-20 md:py-28 bg-muted/30 border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                  Our Impact
                </h2>
                <p className="text-xl text-muted-foreground">
                  Building stronger communities, one connection at a time.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { value: '2,500+', label: 'Neighbors Connected' },
                  { value: '67%', label: 'Are Cross-Income Bridges' },
                  { value: '850+', label: 'Skills Exchanged' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center p-8 rounded-2xl bg-card border border-border"
                  >
                    <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-lg text-muted-foreground">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why It Matters Section */}
        <section className="w-full py-20 md:py-28 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-accent/10 mb-4">
                  <Shield className="w-10 h-10 text-accent" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                  Dignity Over Charity
                </h2>
              </div>

              <div className="space-y-6 text-lg text-muted-foreground">
                <p>
                  NeighborNet is built on the principle that <strong className="text-foreground">everyone has something to offer</strong>. We don't create "helpers" and "helped"—we create neighbors.
                </p>
                <p>
                  By emphasizing mutual exchange and using AI to find complementary skills, we ensure every connection feels balanced. A single parent teaching cooking to a software engineer who offers tech lessons isn't charity—it's community.
                </p>
                <p>
                  This approach reduces stigma, builds genuine relationships, and creates a neighborhood where everyone feels valued.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-background border border-primary/20 overflow-hidden text-center"
            >
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Bridge the Gap?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Join your neighbors in building a stronger, more connected community.
              </p>
              <Link href="/profile">
                <Button size="lg" className="rounded-full px-8">
                  Create Your Profile
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
