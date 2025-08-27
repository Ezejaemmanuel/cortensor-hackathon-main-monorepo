"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Download, Chrome, CheckCircle, ExternalLink, ArrowLeft, Zap, Shield, Eye } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
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
      description: "Toggle &apos;Developer mode&apos; in the top-right corner of the Extensions page",
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
      description: "Understands the webpage you&apos;re viewing for relevant responses"
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
    <div className="pt-32 pb-16 min-h-screen bg-background">
      <div className="px-4 mx-auto max-w-6xl sm:px-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/choose-mode">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Mode Selection
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-16 text-center"
        >
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <div className="p-4 rounded-full border bg-primary/20 border-primary/30">
              <Chrome className="w-12 h-12 text-primary" />
            </div>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="mb-6 text-4xl font-bold sm:text-5xl md:text-6xl font-futura"
          >
            Install <span className="gradient-text text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">CortiGPT</span> Extension
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="mx-auto mb-8 max-w-3xl text-lg sm:text-xl text-muted-foreground font-tech"
          >
            Get the full power of decentralized AI with context awareness and highlight-to-explain features
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center mb-8">
            <Badge className="px-4 py-2 bg-primary/20 text-primary border-primary/30">
              🚀 Latest Version 1.0.0
            </Badge>
            <Badge className="px-4 py-2 text-green-400 bg-green-500/20 border-green-500/30">
              ✅ Chrome Compatible
            </Badge>
            <Badge className="px-4 py-2 text-blue-400 bg-blue-500/20 border-blue-500/30">
              🔒 Privacy First
            </Badge>
          </motion.div>

          {/* Download Button */}
          <motion.div variants={itemVariants}>
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground group"
              onClick={() => {
                // In a real implementation, this would trigger the download
                alert('Extension download would start here. Currently in development.');
              }}
            >
              <Download className="mr-3 w-5 h-5" />
              Download CortiGPT Extension
              <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
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
            className="mb-12 text-3xl font-bold text-center font-futura"
          >
            Installation Steps
          </motion.h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {installSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div key={step.step} variants={itemVariants}>
                  <Card className="h-full bg-gradient-to-br to-transparent backdrop-blur-xl transition-all glass border-accent/30 from-accent/5 hover:shadow-glow-accent duration-slow">
                    <CardHeader className="pb-4 text-center">
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <div className="p-3 rounded-full border bg-accent/20 border-accent/30">
                            <IconComponent className="w-6 h-6 text-accent" />
                          </div>
                          <div className="flex absolute -top-2 -right-2 justify-center items-center w-6 h-6 text-xs font-bold rounded-full bg-primary text-primary-foreground">
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
            className="mb-12 text-3xl font-bold text-center font-futura"
          >
            What You&apos;ll Get
          </motion.h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="h-full bg-gradient-to-br to-transparent backdrop-blur-xl transition-all glass border-secondary/30 from-secondary/5 hover:shadow-glow-secondary duration-slow">
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full border bg-secondary/20 border-secondary/30">
                          <IconComponent className="w-8 h-8 text-secondary" />
                        </div>
                      </div>
                      <CardTitle className="text-xl font-futura text-secondary">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-center font-tech">
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
          <div className="p-8 rounded-2xl border glass border-muted/30">
            <h3 className="mb-4 text-xl font-bold font-futura">
              Prefer the Web Interface?
            </h3>
            <p className="mb-6 text-muted-foreground font-tech">
              You can still access CortiGPT through our web-based chat interface, 
              though you&apos;ll miss out on context awareness and highlight features.
            </p>
            <div className="flex flex-col gap-4 justify-center sm:flex-row">
              <Link href="/cortensorChat">
                <Button variant="outline" className="border-secondary/50 text-secondary hover:bg-secondary/10">
                  Use Web Interface Instead
                  <ExternalLink className="ml-2 w-4 h-4" />
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