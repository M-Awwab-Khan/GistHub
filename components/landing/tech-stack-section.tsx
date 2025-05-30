"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Layers, Database, Shield, Users } from "lucide-react"

export function TechStackSection() {
  return (
    <section className="w-full py-20 md:py-32 bg-muted/30 flex flex-col items-center">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        >
          <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
            Powerful Tech Stack
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built with Modern Technologies</h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">
            GistHub is powered by the latest technologies to provide a fast, reliable, and secure experience.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-4">
          {[
            {
              name: "Next.js 15",
              description: "The latest version of the React framework for production-grade applications.",
              icon: <Layers className="size-8" />,
            },
            {
              name: "Convex",
              description: "Real-time database and backend for seamless state synchronization.",
              icon: <Database className="size-8" />,
            },
            {
              name: "Clerk",
              description: "Secure authentication and user management system.",
              icon: <Shield className="size-8" />,
            },
            {
              name: "Liveblocks",
              description: "Powering real-time collaborative features for simultaneous coding.",
              icon: <Users className="size-8" />,
            },
          ].map((tech, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center p-6 bg-background rounded-lg border border-border/40"
            >
              <div className="mb-4 text-primary">{tech.icon}</div>
              <h3 className="text-xl font-bold mb-2">{tech.name}</h3>
              <p className="text-muted-foreground">{tech.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}