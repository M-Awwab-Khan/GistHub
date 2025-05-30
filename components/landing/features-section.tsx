"use client"

import { motion } from "framer-motion"
import { Code, Zap, Users, Palette, Share2, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    title: "Online IDE",
    description: "Powerful editor with support for 10 programming languages and real-time execution.",
    icon: <Code className="size-5" />,
  },
  {
    title: "AI Autocompletion",
    description: "Smart code suggestions powered by AI to boost your productivity and coding speed.",
    icon: <Zap className="size-5" />,
  },
  {
    title: "Collaborative Coding",
    description: "Work together in real-time with multiple developers on the same code snippet.",
    icon: <Users className="size-5" />,
  },
  {
    title: "Custom Themes",
    description: "Choose from 5 VSCode themes to personalize your coding experience.",
    icon: <Palette className="size-5" />,
  },
  {
    title: "Community Sharing",
    description: "Share your code snippets with the community and discover solutions from others.",
    icon: <Share2 className="size-5" />,
  },
  {
    title: "Advanced Search",
    description: "Find exactly what you need with powerful filtering and search capabilities.",
    icon: <Search className="size-5" />,
  },
]

export function FeaturesSection() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section id="features" className="w-full py-20 md:py-32 flex flex-col items-center">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        >
          <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
            Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything You Need to Succeed</h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">
            Our comprehensive platform provides all the tools you need to streamline your workflow, boost
            productivity, and achieve your goals.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={item}>
              <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="size-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}