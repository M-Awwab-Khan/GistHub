"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "GistHub has revolutionized how our team shares code snippets. The collaborative features and AI suggestions have significantly improved our productivity.",
      author: "Sarah Johnson",
      role: "Lead Developer, TechCorp",
      rating: 5,
    },
    {
      quote:
        "The multi-language support and VSCode themes make GistHub feel like my local environment but with the added benefit of collaboration. It's now essential to our workflow.",
      author: "Michael Chen",
      role: "Senior Engineer, GrowthLabs",
      rating: 5,
    },
    {
      quote:
        "The AI autocompletions are surprisingly accurate and have helped me learn new coding patterns. It's like having a senior developer looking over your shoulder.",
      author: "Emily Rodriguez",
      role: "Full Stack Developer, StartupX",
      rating: 5,
    },
    {
      quote:
        "We've tried several similar solutions, but none compare to the ease of use and comprehensive features of SaaSify. It's been a game-changer.",
      author: "David Kim",
      role: "CEO, InnovateNow",
      rating: 5,
    },
    {
      quote:
        "The collaboration tools have made remote work so much easier for our team. We're more productive than ever despite being spread across different time zones.",
      author: "Lisa Patel",
      role: "HR Director, RemoteFirst",
      rating: 5,
    },
    {
      quote:
        "Implementation was seamless, and the ROI was almost immediate. We've reduced our operational costs by 30% since switching to SaaSify.",
      author: "James Wilson",
      role: "COO, ScaleUp Inc",
      rating: 5,
    },
  ]

  return (
    <section id="testimonials" className="w-full py-20 md:py-32 flex flex-col items-center">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        >
          <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
            Testimonials
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Loved by Teams Worldwide</h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">
            Don't just take our word for it. See what our customers have to say about their experience.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex mb-4">
                    {Array(testimonial.rating)
                      .fill(0)
                      .map((_, j) => (
                        <Star key={j} className="size-4 text-yellow-500 fill-yellow-500" />
                      ))}
                  </div>
                  <p className="text-lg mb-6 flex-grow">{testimonial.quote}</p>
                  <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border/40">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}