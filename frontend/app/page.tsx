"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import { HeroSection } from "@/components/landing/sections/hero-section";
import { FeaturesSection } from "@/components/landing/sections/features-section";
import { HowItWorksSection } from "@/components/landing/sections/how-it-works-section";
import { PropertyShowcaseSection } from "@/components/landing/sections/property-showcase-section";
import { ExploreDestinationsSection } from "@/components/landing/sections/explore-destinations-section";
import { FeaturedPropertiesSection } from "@/components/landing/sections/featured-properties-section";
import { TestimonialsSection } from "@/components/landing/sections/testimonials-section";
import { CallToActionSection } from "@/components/landing/sections/call-to-action-section";
import { TrustedByThousandsSection } from "@/components/landing/sections/trusted-by-thousands-section";
import { NewsletterSection } from "@/components/landing/sections/newsletter-section";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <Header />

      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PropertyShowcaseSection />
        <ExploreDestinationsSection />
        <FeaturedPropertiesSection />
        <TestimonialsSection />
        <CallToActionSection />
        <TrustedByThousandsSection />
        <NewsletterSection />
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
