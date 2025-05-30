"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "What programming languages are supported?",
      answer:
        "GistHub supports 10 programming languages including JavaScript, TypeScript, Python, Java, C++, Ruby, Go, PHP, Rust, and C#. Each language comes with syntax highlighting and execution capabilities.",
    },
    {
      question: "How does the collaborative coding feature work?",
      answer:
        "GistHub uses Liveblocks to enable real-time collaboration. You can invite others to your snippet by sharing a link, and they can edit the code simultaneously with you. Changes are synced in real-time, and you can see who's currently viewing or editing the snippet.",
    },
    {
      question: "What are the differences between Free and Pro plans?",
      answer:
        "The Free plan allows unlimited public snippets with basic IDE features and 5 supported languages. The Pro plan adds unlimited private snippets, all 10 programming languages, AI autocompletions, real-time collaboration features, all 5 VSCode themes, and webhook integration support.",
    },
    {
      question: "How does the AI autocompletion work?",
      answer:
        "Our AI autocompletion feature analyzes your code as you type and suggests completions based on context. It's trained on millions of code repositories and can help you write code faster and with fewer errors. The suggestions appear inline and can be accepted with a single keystroke.",
    },
    {
      question: "Do you offer discounts for nonprofits or educational institutions?",
      answer:
        "Yes, we offer special pricing for nonprofits, educational institutions, and open-source projects. Please contact our sales team for more information.",
    },
    {
      question: "What kind of support do you offer?",
      answer:
        "Support varies by plan. All plans include email support, with the Professional plan offering priority email support. The Enterprise plan includes 24/7 phone and email support. We also have an extensive knowledge base and community forum available to all users.",
    },
  ]

  return (
    <section id="faq" className="w-full py-20 md:py-32 flex flex-col items-center">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        >
          <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">
            Find answers to common questions about our platform.
          </p>
        </motion.div>

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <AccordionItem value={`item-${i}`} className="border-b border-border/40 py-2">
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}