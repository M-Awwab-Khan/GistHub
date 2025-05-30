import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { LogosSection } from "@/components/landing/logos-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { TechStackSection } from "@/components/landing/tech-stack-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { FAQSection } from "@/components/landing/faq-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center">
      <Header />
      <main className="flex-1 w-full flex flex-col items-center">
        <HeroSection />
        <LogosSection />
        <FeaturesSection />
        <TechStackSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
