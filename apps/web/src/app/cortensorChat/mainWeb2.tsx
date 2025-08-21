'use client'

import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectWalletButton } from '@/components/ui/connect-wallet-button'
import { Bot, Wallet, Zap, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
    Credenza,
    CredenzaBody,
    CredenzaClose,
    CredenzaContent,
    CredenzaDescription,
    CredenzaFooter,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaTrigger,
} from '@/components/ui/credenza'
import { Button } from '@/components/ui/button'

export function CortensorChatWeb2() {
    const { address, isConnected } = useAccount()
    const [showWalletPrompt, setShowWalletPrompt] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    // Generate or retrieve user ID
    useEffect(() => {
        const storedUserId = localStorage.getItem('cortensor_user_id')
        
        if (isConnected && address) {
            // If wallet is connected, use wallet address as user ID
            setUserId(address)
        } else if (storedUserId) {
            // If user ID exists in localStorage, use it
            setUserId(storedUserId)
        } else {
            // Show wallet connection prompt if no user ID and not connected
            setShowWalletPrompt(true)
        }
    }, [isConnected, address])

    // Generate random user ID and store in localStorage
    const generateRandomUserId = () => {
        const randomId = `user_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
        localStorage.setItem('cortensor_user_id', randomId)
        setUserId(randomId)
        setShowWalletPrompt(false)
    }

    // Handle wallet connection
    const handleWalletConnect = () => {
        setShowWalletPrompt(false)
        // The wallet connection will be handled by the ConnectWalletButton
        // and the useEffect will update the userId when address changes
    }

    return (
        <div className="p-4 min-h-screen bg-background">
            {/* Wallet Connection Prompt Credenza */}
            <Credenza open={showWalletPrompt} onOpenChange={setShowWalletPrompt}>
                <CredenzaContent className="backdrop-blur-xl bg-card/95 border-border/50 shadow-glass">
                    <CredenzaHeader>
                        <div className="flex items-center space-x-3">
                            <div className="flex justify-center items-center w-12 h-12 rounded-full bg-gradient-primary shadow-glow-primary">
                                <Wallet className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <CredenzaTitle className="text-xl font-futura text-foreground">
                                    Connect Your Wallet
                                </CredenzaTitle>
                                <CredenzaDescription className="text-muted-foreground">
                                    Connect your wallet to track your messages and get a personalized experience
                                </CredenzaDescription>
                            </div>
                        </div>
                    </CredenzaHeader>
                    <CredenzaBody className="space-y-4">
                        <div className="p-4 rounded-lg border bg-muted/50 border-border/50">
                            <h4 className="mb-2 font-medium text-foreground">Why connect your wallet?</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• Track your conversation history</li>
                                <li>• Personalized AI responses</li>
                                <li>• Secure and decentralized</li>
                                <li>• Access to premium features</li>
                            </ul>
                        </div>
                        <div className="flex justify-center items-center space-x-2 text-sm text-muted-foreground">
                            <Zap className="w-4 h-4" />
                            <span>Secure • Decentralized • Private</span>
                        </div>
                    </CredenzaBody>
                    <CredenzaFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <ConnectWalletButton 
                            className="flex-1" 
                        />
                        <Button 
                            variant="outline" 
                            className="flex-1" 
                            onClick={generateRandomUserId}
                        >
                            Continue Without Wallet
                        </Button>
                    </CredenzaFooter>
                </CredenzaContent>
            </Credenza>

            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <Card className="backdrop-blur-xl bg-card/50 border-border/50 shadow-glass">
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-gradient-secondary shadow-glow-secondary">
                                    <Bot className="w-6 h-6 text-secondary-foreground" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-futura text-foreground">
                                        Cortensor Chat Web2
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground">
                                        Advanced AI chat interface with Web2 features
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                {/* Main Content Placeholder */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Chat Area Placeholder */}
                    <div className="lg:col-span-2">
                        <Card className="h-[600px] bg-card/50 backdrop-blur-xl border-border/50 shadow-glass">
                            <CardHeader>
                                <CardTitle className="text-lg font-futura text-foreground">
                                    Chat Interface
                                </CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    Web2 chat features coming soon
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center items-center h-full">
                                <div className="space-y-4 text-center">
                                    <div className="flex justify-center items-center mx-auto w-16 h-16 rounded-full animate-pulse bg-gradient-neural shadow-glow-accent">
                                        <Bot className="w-8 h-8 text-accent-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 text-lg font-futura text-foreground">
                                            Web2 Features
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Enhanced chat capabilities, file uploads, and more coming soon...
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Placeholder */}
                    <div className="space-y-6">
                        <Card className="backdrop-blur-xl bg-card/50 border-border/50 shadow-glass">
                            <CardHeader>
                                <CardTitle className="text-lg font-futura text-foreground">
                                    Web2 Tools
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="p-3 rounded-lg border bg-muted/50 border-border/50">
                                        <h4 className="mb-1 font-medium text-foreground">File Upload</h4>
                                        <p className="text-sm text-muted-foreground">Upload and analyze documents</p>
                                    </div>
                                    <div className="p-3 rounded-lg border bg-muted/50 border-border/50">
                                        <h4 className="mb-1 font-medium text-foreground">Templates</h4>
                                        <p className="text-sm text-muted-foreground">Pre-built conversation starters</p>
                                    </div>
                                    <div className="p-3 rounded-lg border bg-muted/50 border-border/50">
                                        <h4 className="mb-1 font-medium text-foreground">Export</h4>
                                        <p className="text-sm text-muted-foreground">Save conversations</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}