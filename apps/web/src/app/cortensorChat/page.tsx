'use client'

import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ConnectWalletButton } from '@/components/ui/connect-wallet-button'
import {
  Bot,
  Activity,
  Settings,
  Zap,
  Users,
  MessageSquare,
  Grid3X3,
  BarChart3
} from 'lucide-react'
import { ChatInterface } from './components/ChatInterface'
import { SessionManager } from './components/SessionManager'
import { TaskManager } from './components/TaskManager'
import { EventLogger } from './components/EventLogger'
import { useCortensorSession } from './hooks/useCortensorSession'
import { useCortensorTasks } from './hooks/useCortensorTasks'
import { useSessionStore, useCurrentSession } from './store/useSessionStore'
import { toast } from 'sonner'

export default function CortensorChatPage() {
  const { address, isConnected } = useAccount()
  const { currentSession, userSessions, isLoadingSessions } = useCortensorSession()
  const { tasks, messages } = useCortensorTasks()
  const { setSessionDialogOpen } = useSessionStore()
  const currentSessionFromStore = useCurrentSession()

  // Auto-open session dialog if no sessions exist and user is connected
  useEffect(() => {
    if (isConnected && !isLoadingSessions && userSessions.length === 0 && !currentSessionFromStore) {
      const timer = setTimeout(() => {
        setSessionDialogOpen(true)
        toast.info('Create your first session to start chatting with AI')
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isConnected, isLoadingSessions, userSessions.length, currentSessionFromStore, setSessionDialogOpen])



  const activeTasks = tasks.filter(task =>
    task.status !== 'completed' && task.status !== 'failed'
  )
  const completedTasks = tasks.filter(task => task.status === 'completed')

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Cortensor Chat</CardTitle>
            <CardDescription>
              Connect your wallet to start chatting with AI using the Cortensor network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span>Decentralized AI inference</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Powered by miner network</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>Real-time blockchain events</span>
              </div>
            </div>

            <Separator />

            <ConnectWalletButton className="w-full" />

            <p className="text-xs text-center text-muted-foreground">
              Make sure you have a Web3 wallet installed (MetaMask, WalletConnect, etc.)
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background ">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Cortensor Chat</h1>
                <p className="text-sm text-muted-foreground">
                  Decentralized AI Chat Interface
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Status Indicators */}
              <div className="flex items-center gap-3">
                {currentSessionFromStore && (
                  <Badge variant="outline" className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Session #{currentSessionFromStore.sessionId}
                  </Badge>
                )}

                {activeTasks.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    <Activity className="h-3 w-3 mr-1" />
                    {activeTasks.length} active
                  </Badge>
                )}

                {completedTasks.length > 0 && (
                  <Badge variant="default" className="text-xs">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {completedTasks.length} completed
                  </Badge>
                )}

                <Badge variant="outline" className="text-xs">
                  <Grid3X3 className="h-3 w-3 mr-1" />
                  {tasks.length} total tasks
                </Badge>
              </div>

              {/* Wallet Info */}
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="font-mono text-xs">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Screen Desktop Layout */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-4 gap-4 p-4">
          {/* Left Panel - Session & Task Management */}
          <div className="col-span-1 space-y-4 overflow-y-auto">
            <SessionManager />
            <TaskManager />
          </div>

          {/* Center Panel - Chat Interface */}
          <div className="col-span-2 flex flex-col">
            <ChatInterface className="flex-1" />
          </div>

          {/* Right Panel - Event Logger & Analytics */}
          <div className="col-span-1 space-y-4 overflow-y-auto">
            <EventLogger />

            {/* Quick Stats Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-semibold text-blue-600">{userSessions.length}</div>
                    <div className="text-muted-foreground">Sessions</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-semibold text-green-600">{messages.length}</div>
                    <div className="text-muted-foreground">Messages</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-semibold text-orange-600">{activeTasks.length}</div>
                    <div className="text-muted-foreground">Active</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-semibold text-purple-600">{completedTasks.length}</div>
                    <div className="text-muted-foreground">Complete</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>Powered by Cortensor Network</span>
              <Separator orientation="vertical" className="h-3" />
              <span>Desktop Interface</span>
              {currentSessionFromStore && (
                <>
                  <Separator orientation="vertical" className="h-3" />
                  <span>Session #{currentSessionFromStore.sessionId}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span>Live</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}