"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
// Hero image is now referenced directly from the public folder

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden neural-bg pt-32 lg:pt-40">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(/hero-neural-globe-neon.jpg)` }}
      />

      {/* Clean modern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/70 via-background/30 to-background/80 backdrop-blur-sm" />

      {/* Minimal particles for subtle effect */}
      <div className="particles">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
              opacity: 0.3,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-center min-h-[calc(100vh-8rem)] lg:min-h-[calc(100vh-10rem)]">
        <div className="animate-fade-in">
          {/* Main Content Area */}
          <div className="mb-8 sm:mb-12 lg:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-futura font-black mb-4 sm:mb-6 lg:mb-8 leading-tight">
              <span className="gradient-text block mb-2">One Engine.</span>
              <span className="text-white block mb-2">Many Agents.</span>
              <span className="text-primary-glow block">Verifiable AI</span>{" "}
              <span className="text-white">for Web3.</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-muted-foreground mb-8 sm:mb-10 lg:mb-12 max-w-5xl mx-auto leading-relaxed font-tech px-4">
              CortiGPT unites multiple specialized AI agents on the{" "}
              <span className="text-secondary">Cortensor protocol</span>,
              delivering trustless, verifiable intelligence with{" "}
              <span className="text-accent">receipts you can prove</span>.
            </p>
          </div>

          {/* Buttons - Better responsive layout */}
          <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center animate-slide-up px-4 mb-8 sm:mb-12 lg:mb-16">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 w-full max-w-sm sm:max-w-lg lg:max-w-xl justify-center">
              <Button variant="hero" size="default" className="w-full sm:w-auto sm:px-6 lg:px-8 group text-sm sm:text-base">
                Explore Agents
                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button variant="neural" size="default" className="w-full sm:w-auto sm:px-6 lg:px-8 group text-sm sm:text-base">
                <Play className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                View Docs
              </Button>
            </div>
          </div>

          {/* Enhanced Stats with glass morphism */}
          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto px-4">
            <div className="glass p-4 sm:p-6 rounded-xl text-center animate-float border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2 drop-shadow-lg">3</div>
              <div className="text-sm sm:text-base text-muted-foreground font-tech">Specialized Agents</div>
            </div>
            <div className="glass p-4 sm:p-6 rounded-xl text-center animate-float border border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent backdrop-blur-md" style={{ animationDelay: "0.5s" }}>
              <div className="text-2xl sm:text-3xl font-bold text-secondary mb-2 drop-shadow-lg">100%</div>
              <div className="text-sm sm:text-base text-muted-foreground font-tech">Verifiable Results</div>
            </div>
            <div className="glass p-4 sm:p-6 rounded-xl text-center animate-float border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent backdrop-blur-md" style={{ animationDelay: "1s" }}>
              <div className="text-2xl sm:text-3xl font-bold text-accent mb-2 drop-shadow-lg">∞</div>
              <div className="text-sm sm:text-base text-muted-foreground font-tech">Decentralized Miners</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-primary/50 rounded-full flex justify-center">
          <div className="w-1 h-2 sm:h-3 bg-primary rounded-full mt-1 sm:mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};