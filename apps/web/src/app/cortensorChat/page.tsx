'use client'

import  { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CortensorChatWeb3 } from './mainWeb3'
import { CortensorChatWeb2 } from './mainWeb2'
import { Bot, Globe, Zap } from 'lucide-react'

type TabType = 'web3' | 'web2'

const MainChatPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('web2')

  const tabs = [
    {
      id: 'web2' as TabType,
      label: 'Web2 Chat',
      icon: Globe,
      description: 'Traditional AI features'
    },
    {
      id: 'web3' as TabType,
      label: 'Web3 Chat',
      icon: Zap,
      description: 'Blockchain-powered AI'
    }
  ]

  const tabVariants = {
    enter: {
      opacity: 0,
      x: 20
    },
    center: {
      opacity: 1,
      x: 0
    },
    exit: {
      opacity: 0,
      x: -20
    }
  }

  const tabTransition = {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1] as const
  }

  return (
    <div className="min-h-screen bg-background pt-6">
      {/* Custom Glassmorphism Tabs */}
      <div className="sticky top-0 z-50 border-b backdrop-blur-xl bg-background/80 border-border/50">
        <div className="px-2 py-2 mx-auto max-w-7xl sm:px-4 sm:py-4">
          <div className="flex justify-center items-center">
            <div className="flex relative p-1 rounded-2xl border backdrop-blur-xl bg-card/30 border-border/50 shadow-glass sm:p-2">
              {/* Active tab indicator */}
              <motion.div
                className="absolute inset-y-2 rounded-xl bg-gradient-primary shadow-glow-primary"
                layoutId="activeTab"
                initial={false}
                animate={{
                  x: activeTab === 'web3' ? 'calc(50% + 2px)' : '2px',
                  width: 'calc(50% - 4px)'
                }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30
                }}
              />

              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative z-10 flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:px-6 sm:py-3 rounded-xl transition-all duration-smooth font-futura ${
                      isActive
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon 
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-smooth ${
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                      }`} 
                    />
                    <div className="text-left">
                      <div className={`text-xs sm:text-sm font-medium transition-all duration-smooth ${
                        isActive ? 'text-primary-foreground' : 'text-foreground'
                      }`}>
                        {tab.label}
                      </div>
                      <div className={`text-xs transition-all duration-smooth hidden sm:block ${
                        isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}>
                        {tab.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content with Framer Motion */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={tabTransition}
          >
            {activeTab === 'web3' ? (
              <CortensorChatWeb3 />
            ) : (
              <CortensorChatWeb2 />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default MainChatPage;