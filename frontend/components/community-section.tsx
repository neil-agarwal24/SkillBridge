'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Graphic Designer',
    content: 'I shared design skills with neighbors and borrowed tools for my home project. This platform brings real community together.',
    initials: 'SC',
  },
  {
    name: 'Marcus Johnson',
    role: 'Electrician',
    content: 'Being able to help neighbors while building meaningful connections is exactly why I joined. NeighborNet feels genuine.',
    initials: 'MJ',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Teacher',
    content: 'My kids learned coding from a neighbor, and we hosted a cooking workshop. This is real neighborhood magic.',
    initials: 'ER',
  },
]

export function CommunitySection() {
  return (
    <section id="community" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-20 right-0 w-96 h-96 bg-secondary/6 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/6 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
            Loved by Neighbors
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Real stories from real community members
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="p-6 bg-card rounded-2xl border border-border hover:border-secondary/30 transition-all duration-300 h-full flex flex-col hover:shadow-lg hover:shadow-secondary/10 hover:scale-105 transform active:scale-95">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-accent text-accent"
                    />
                  ))}
                </div>
                <p className="text-foreground leading-relaxed mb-6 flex-grow text-sm">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-xs shadow-md">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
