'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Zap,
  CheckCircle,
  Users,
  Clock,
  Trash2,
  Hash,
  ExternalLink
} from 'lucide-react'
import {
  useWatchSessionQueueV2TaskEndedEvent,
  useWatchSessionQueueV2TaskAssignedEvent,
  useWatchSessionV2TaskSubmittedEvent
} from '@/generated'
import { useCurrentSessionId } from '../store/useSessionStore'
import { cn } from '@/lib/utils'

interface BlockchainEvent {
  id: string
  type: 'task_submitted' | 'task_assigned' | 'task_ended' | 'session_created' | 'other'
  title: string
  description: string
  timestamp: Date
  data: any
  blockNumber?: number
  transactionHash?: string
  sessionId?: number
  taskId?: number
}

interface EventLoggerProps {
  className?: string
}

export function EventLogger({ className }: EventLoggerProps) {
  const currentSessionId = useCurrentSessionId()
  const [events, setEvents] = useState<BlockchainEvent[]>([])
  const [isOpen, setIsOpen] = useState(true)
  const [maxEvents] = useState(50) // Keep only last 50 events

  const addEvent = (event: Omit<BlockchainEvent, 'id' | 'timestamp'>) => {
    const newEvent: BlockchainEvent = {
      ...event,
      id: `${event.type}-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    }

    setEvents(prev => {
      const updated = [newEvent, ...prev]
      return updated.slice(0, maxEvents) // Keep only recent events
    })
  }

  const clearEvents = () => {
    setEvents([])
  }

  // Watch for task submitted events
  useWatchSessionV2TaskSubmittedEvent({
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.sessionId && log.args.taskId) {
          const sessionId = Number(log.args.sessionId)
          const taskId = Number(log.args.taskId)

          addEvent({
            type: 'task_submitted',
            title: 'Task Submitted',
            description: `Task #${taskId} submitted to session #${sessionId}`,
            data: log.args,
            blockNumber: Number(log.blockNumber),
            transactionHash: log.transactionHash,
            sessionId,
            taskId
          })
        }
      })
    },
  })

  // Watch for task assigned events
  useWatchSessionQueueV2TaskAssignedEvent({
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.sessionId && log.args.taskId) {
          const sessionId = Number(log.args.sessionId)
          const taskId = Number(log.args.taskId)

          addEvent({
            type: 'task_assigned',
            title: 'Task Assigned',
            description: `Task #${taskId} assigned to miners in session #${sessionId}`,
            data: log.args,
            blockNumber: Number(log.blockNumber),
            transactionHash: log.transactionHash,
            sessionId,
            taskId
          })
        }
      })
    },
  })

  // Watch for task ended events
  // Note: This event watcher is used for real-time UI logging only.
  // The useCortensorTasks hook already handles refetching data when tasks end,
  // and queries have automatic refetch intervals, so this is not redundant.
  useWatchSessionQueueV2TaskEndedEvent({
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.sessionId && log.args.taskId) {
          const sessionId = Number(log.args.sessionId)
          const taskId = Number(log.args.taskId)

          addEvent({
            type: 'task_ended',
            title: 'Task Completed',
            description: `Task #${taskId} completed in session #${sessionId}`,
            data: log.args,
            blockNumber: Number(log.blockNumber),
            transactionHash: log.transactionHash,
            sessionId,
            taskId
          })
        }
      })
    },
  })

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'task_submitted':
        return <Zap className="h-4 w-4 text-primary" />
      case 'task_assigned':
        return <Users className="h-4 w-4 text-secondary" />
      case 'task_ended':
        return <CheckCircle className="h-4 w-4 text-accent" />
      case 'session_created':
        return <Activity className="h-4 w-4 text-primary" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'task_submitted':
        return 'bg-card/50 border-border hover:bg-card/70'
      case 'task_assigned':
        return 'bg-card/50 border-border hover:bg-card/70'
      case 'task_ended':
        return 'bg-card/50 border-border hover:bg-card/70'
      case 'session_created':
        return 'bg-card/50 border-border hover:bg-card/70'
      default:
        return 'bg-card/50 border-border hover:bg-card/70'
    }
  }

  const EventCard = ({ event }: { event: BlockchainEvent }) => (
    <Card className={cn('mb-2 transition-all duration-200 hover:shadow-md', getEventColor(event.type))}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            {getEventIcon(event.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-medium text-card-foreground">{event.title}</h4>
                <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                  {event.type.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {event.description}
              </p>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {event.timestamp.toLocaleTimeString()}
                </div>

                {event.blockNumber && (
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Block {event.blockNumber}
                  </div>
                )}

                {event.sessionId && (
                  <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                    Session #{event.sessionId}
                  </Badge>
                )}

                {event.taskId && (
                  <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                    Task #{event.taskId}
                  </Badge>
                )}
              </div>

              {event.transactionHash && (
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <ExternalLink className="h-3 w-3" />
                  <span className="font-mono">
                    {event.transactionHash.slice(0, 10)}...{event.transactionHash.slice(-8)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Filter events for current session if one is selected
  const filteredEvents = currentSessionId
    ? events.filter(event => !event.sessionId || event.sessionId === currentSessionId)
    : events

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Card className={cn('cursor-pointer hover:bg-card/70 transition-colors bg-card border-border', className)}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                <CardTitle className="text-lg">Event Logger</CardTitle>
                {filteredEvents.length > 0 && (
                  <Badge variant="secondary">
                    {filteredEvents.length}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {events.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearEvents()
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                {isOpen ?
                  <ChevronDown className="h-4 w-4" /> :
                  <ChevronRight className="h-4 w-4" />
                }
              </div>
            </div>
            <CardDescription>
              Real-time blockchain events and activity logs
              {currentSessionId && ` (Session #${currentSessionId})`}
            </CardDescription>
          </CardHeader>
        </Card>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No events yet</p>
                <p className="text-xs text-muted-foreground/70">Blockchain events will appear here in real-time</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {filteredEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}