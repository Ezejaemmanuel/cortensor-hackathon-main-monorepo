"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, MessageSquare, Twitter } from "lucide-react";
// Images are now referenced directly from the public folder

const agents = [
  {
    name: "CortiTruth",
    description: "Verifiable Q&A with strict/relaxed modes and immutable proof receipts",
    icon: Shield,
    image: "/agent-truth.jpg",
    color: "primary",
    features: ["Multi-miner consensus", "Confidence scoring", "IPFS receipts", "API access"]
  },
  {
    name: "CortiChat",
    description: "Multi-miner conversational AI with per-turn verification and chat history",
    icon: MessageSquare,
    image: "/agent-chat-neon.jpg",
    color: "secondary",
    features: ["Real-time verification", "Chat continuity", "Turn-based proofs", "Context awareness"]
  },
  {
    name: "CortiTweets",
    description: "Tweet claim verification with evidence gathering and fact-checking receipts",
    icon: Twitter,
    image: "/agent-tweets-neon.jpg",
    color: "accent",
    features: ["Claim extraction", "Evidence sourcing", "Fact verification", "Citation tracking"]
  }
];

export const AgentShowcase = () => {
  return (
    <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-futura font-bold mb-4 sm:mb-6">
            The <span className="gradient-text">Multi-Agent</span> Revolution
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto font-tech px-4">
            One decentralized engine. Infinite specialized agents.
          </p>
        </div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {agents.map((agent, index) => (
            <div
              key={agent.name}
              className="group glass p-6 sm:p-8 rounded-2xl transition-all duration-slow animate-slide-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Agent Image */}
              <div className="relative mb-4 sm:mb-6 overflow-hidden rounded-xl">
                <img
                  src={agent.image}
                  alt={agent.name}
                  className="w-full h-40 sm:h-48 object-cover transition-transform duration-slow"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className={`absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-3 rounded-full glass border-${agent.color}/30`}>
                  <agent.icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${agent.color}`} />
                </div>
              </div>

              {/* Agent Info */}
              <h3 className={`text-xl sm:text-2xl font-futura font-bold mb-3 sm:mb-4 text-${agent.color}`}>
                {agent.name}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 font-tech leading-relaxed">
                {agent.description}
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-6 sm:mb-8">
                {agent.features.map((feature) => (
                  <li key={feature} className="flex items-center text-xs sm:text-sm font-tech">
                    <div className={`w-2 h-2 rounded-full bg-${agent.color} mr-3 flex-shrink-0`} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button variant="neural" className="w-full group">
                Explore {agent.name}
                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform" />
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center animate-fade-in px-4">
          <Button variant="hero" size="lg" className="w-full sm:w-auto group">
            Discover All Agents
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};