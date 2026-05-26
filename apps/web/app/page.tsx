import { Hero } from "@/components/landing/hero";
import { Marquee } from "@/components/landing/marquee";
import { AICollection } from "@/components/landing/ai-collection";
import { KineticNumbers } from "@/components/landing/kinetic-numbers";
import { HowItWorks } from "@/components/landing/how-it-works";
import { WhyAppCN } from "@/components/landing/why";
import { CatalogGrid } from "@/components/landing/catalog-grid";
import { FooterCTA } from "@/components/landing/footer-cta";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Marquee />
      <AICollection />
      <KineticNumbers />
      <HowItWorks />
      <WhyAppCN />
      <CatalogGrid />
      <FooterCTA />
    </main>
  );
}
