'use client'

import Link from 'next/link'
import { Mail, MapPin, Github, Twitter, Linkedin } from 'lucide-react'
import { motion } from 'framer-motion'

export function Footer() {
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
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-4 gap-12 mb-12"
        >
          {/* Brand */}
          <motion.div variants={itemVariants} className="col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold group-hover:shadow-lg group-hover:shadow-primary/20 transition-all">
                N
              </div>
              <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                SynapseAI
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Share skills, share stuff, shrink the gap. Building stronger neighborhoods together.
            </p>
          </motion.div>

          {/* Product */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'Security'].map(item => (
                <li key={item}>
                  <Link 
                    href="#" 
                    className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all inline-block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              {['About', 'Blog', 'Community'].map(item => (
                <li key={item}>
                  <Link 
                    href="#" 
                    className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all inline-block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Connect */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-foreground mb-4">Get In Touch</h4>
            <div className="space-y-3">
              <a 
                href="mailto:hello@bridgeai.app" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all"
              >
                <Mail size={16} className="flex-shrink-0" />
                hello@synapseai.app
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={16} className="flex-shrink-0" />
                Everywhere, USA
              </div>
              <div className="flex gap-3 pt-2">
                {[Github, Twitter, Linkedin].map((Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Icon size={18} />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SkillBridge. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy', 'Terms'].map(item => (
              <Link 
                key={item}
                href="#" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
