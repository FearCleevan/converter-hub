import Hero from "@/components/home/Hero";
import DropzoneHero from "@/components/home/DropzoneHero";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturesGrid from "@/components/home/FeaturesGrid";
import BatchShowcase from "@/components/home/BatchShowcase";
import StatBar from "@/components/home/StatBar";

export default function HomePage() {
  return (
    <>
      <Hero />
      <DropzoneHero />
      <CategoryGrid />
      <FeaturesGrid />
      <BatchShowcase />
      <StatBar />
    </>
  );
}
