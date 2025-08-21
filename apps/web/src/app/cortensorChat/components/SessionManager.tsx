'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronDown,
  Plus,
  RefreshCw,
  Settings,
  Calendar,
  Users,
  Clock,
  Zap
} from 'lucide-react'
import { useCortensorSession } from '../hooks/useCortensorSession'
import { useChatStore } from '../store/useChatStore'
import { SessionCreationDialog } from './SessionCreationDialog'
import { formatDistanceToNow } from 'date-fns'

interface SessionManagerProps {
  className?: string
}

export function SessionManager({ className }: SessionManagerProps) {
  const {
    currentSession,
    userSessions,
    isLoadingSessions,
    selectSession,
    refreshSessions
  } = useCortensorSession()

  const {
    isSessionDialogOpen,
    setSessionDialogOpen,
    selectedSessionId,
    setSelectedSessionId
  } = useChatStore()

  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshSessions()
    setIsRefreshing(false)
  }

  const handleSessionSelect = (sessionId: number) => {
    setSelectedSessionId(sessionId)
    selectSession(sessionId)
  }

  const getSessionStatusBadge = (session: any) => {
    const now = Date.now()
    const sessionTime = Number(session.timestamp) * 1000
    const isRecent = now - sessionTime < 24 * 60 * 60 * 1000 // 24 hours

    if (isRecent) {
      return <Badge variant="default" className="text-xs">Active</Badge>
    }
    return <Badge variant="secondary" className="text-xs">Inactive</Badge>
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Session Manager</CardTitle>
              <CardDescription>
                {currentSession
                  ? `Active: ${currentSession.name || `Session #${currentSession.sessionId}`}`
                  : 'No active session'
                }
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing || isLoadingSessions}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                size="sm"
                onClick={() => setSessionDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {currentSession && (
            <>
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Current Session Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Nodes: {currentSession.nodeCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span>Redundancy: {currentSession.redundant}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>SLA: {currentSession.sla}ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {currentSession.timestamp 
                        ? formatDistanceToNow(new Date(Number(currentSession.timestamp) * 1000), { addSuffix: true })
                        : 'No timestamp available'
                      }
                    </span>
                  </div>
                </div>
              </div>
              <Separator className="mb-4" />
            </>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Available Sessions</h4>
              <Badge variant="outline" className="text-xs">
                {userSessions.length} sessions
              </Badge>
            </div>

            {isLoadingSessions ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading sessions...</span>
              </div>
            ) : userSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">
                  No sessions found. Create your first session to get started.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSessionDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Session
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {userSessions.map((session) => (
                    <div
                      key={session.sessionId}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${selectedSessionId === session.sessionId
                          ? 'border-primary bg-accent'
                          : 'border-border'
                        }`}
                      onClick={() => handleSessionSelect(session.sessionId)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {session.name || `Session #${session.sessionId}`}
                          </span>
                          {getSessionStatusBadge(session)}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Settings className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Session Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSessionSelect(session.sessionId)
                              }}
                            >
                              Select Session
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {session.description && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {session.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>ID: {session.sessionId}</span>
                        <span>Nodes: {session.nodeCount}</span>
                        <span>
                          {session.timestamp 
                            ? formatDistanceToNow(new Date(Number(session.timestamp) * 1000), { addSuffix: true })
                            : 'No timestamp'
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>

      <SessionCreationDialog
        open={isSessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
      />
    </div>
  )
}