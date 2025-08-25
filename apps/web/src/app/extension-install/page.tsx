"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Download, Chrome, CheckCircle, ExternalLink, ArrowLeft, Zap, Shield, Eye } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

const ExtensionInstallPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const installSteps = [
    {
      step: 1,
      title: "Download the Extension",
      description: "Click the download button to get the latest CortiGPT Chrome extension",
      icon: Download
    },
    {
      step: 2,
      title: "Install in Chrome",
      description: "Open Chrome Extensions (chrome://extensions/) and drag the downloaded file",
      icon: Chrome
    },
    {
      step: 3,
      title: "Enable Developer Mode",
      description: "Toggle 'Developer mode' in the top-right corner of the Extensions page",
      icon: CheckCircle
    },
    {
      step: 4,
      title: "Start Using CortiGPT",
      description: "Click the CortiGPT icon in your browser toolbar to open the sidepanel",
      icon: Zap
    }
  ];

  const features = [
    {
      icon: Eye,
      title: "Context-Aware AI",
      description: "Understands the webpage you're viewing for relevant responses"
    },
    {
      icon: Shield,
      title: "Highlight to Explain",
      description: "Select any text on any website to get instant AI explanations"
    },
    {
      icon: Zap,
      title: "Decentralized Power",
      description: "Powered by blockchain consensus for verified, trustless AI"
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/choose-mode">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Mode Selection
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/20 border border-primary/30">
              <Chrome className="w-12 h-12 text-primary" />
            </div>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-futura font-bold mb-6"
          >
            Install <span className="gradient-text">CortiGPT</span> Extension
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto font-tech mb-8"
          >
            Get the full power of decentralized AI with context awareness and highlight-to-explain features
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2">
              🚀 Latest Version 1.0.0
            </Badge>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2">
              ✅ Chrome Compatible
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-4 py-2">
              🔒 Privacy First
            </Badge>
          </motion.div>

          {/* Download Button */}
          <motion.div variants={itemVariants}>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold group"
              onClick={() => {
                // In a real implementation, this would trigger the download
                alert('Extension download would start here. Currently in development.');
              }}
            >
              <Download className="w-5 h-5 mr-3" />
              Download CortiGPT Extension
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Installation Steps */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-16"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-3xl font-futura font-bold text-center mb-12"
          >
            Installation Steps
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {installSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div key={step.step} variants={itemVariants}>
                  <Card className="h-full glass border-accent/30 bg-gradient-to-br from-accent/5 to-transparent backdrop-blur-xl hover:shadow-glow-accent transition-all duration-slow">
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <div className="p-3 rounded-full bg-accent/20 border border-accent/30">
                            <IconComponent className="w-6 h-6 text-accent" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                            {step.step}
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-lg font-futura text-accent">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center font-tech">
                        {step.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-16"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-3xl font-futura font-bold text-center mb-12"
          >
            What You'll Get
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="h-full glass border-secondary/30 bg-gradient-to-br from-secondary/5 to-transparent backdrop-blur-xl hover:shadow-glow-secondary transition-all duration-slow">
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full bg-secondary/20 border border-secondary/30">
                          <IconComponent className="w-8 h-8 text-secondary" />
                        </div>
                      </div>
                      <CardTitle className="text-xl font-futura text-secondary">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center font-tech text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Alternative Options */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <div className="glass p-8 rounded-2xl border border-muted/30">
            <h3 className="text-xl font-futura font-bold mb-4">
              Prefer the Web Interface?
            </h3>
            <p className="text-muted-foreground font-tech mb-6">
              You can still access CortiGPT through our web-based chat interface, 
              though you'll miss out on context awareness and highlight features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cortensorChat">
                <Button variant="outline" className="border-secondary/50 text-secondary hover:bg-secondary/10">
                  Use Web Interface Instead
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/choose-mode">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Back to Options
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExtensionInstallPage;