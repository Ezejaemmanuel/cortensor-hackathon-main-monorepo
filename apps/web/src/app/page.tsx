import { NeuralBackground } from "@/components/ui/neural-background";
import { Hero } from "@/components/sections/Hero";
import { AgentShowcase } from "@/components/sections/AgentShowcase";
import { HowItWorksNew } from "@/components/sections/HowItWorksNew";
import { UseCases } from "@/components/sections/UseCases";
import { Footer } from "@/components/sections/Footer";
import Navbar from "@/components/layout/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <NeuralBackground />
      <Navbar />
      <Hero />
      <AgentShowcase />
      <HowItWorksNew />
      <UseCases />
      <Footer />
    </div>
  );
};

export default Index;