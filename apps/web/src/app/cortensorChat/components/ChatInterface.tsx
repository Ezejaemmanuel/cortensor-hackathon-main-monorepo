'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Send,
  Bot,
  User,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Zap
} from 'lucide-react'
import { useCortensorTasks, type ChatMessage, type TaskData } from '../hooks/useCortensorTasks'
import { useCurrentSession, useSessionStore } from '../store/useSessionStore'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface ChatInterfaceProps {
  className?: string
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const currentSession = useCurrentSession()
  const { setSessionDialogOpen } = useSessionStore()
  const {
    messages,
    tasks,
    isSubmittingTask,
    submitTask
  } = useCortensorTasks()

  const [currentMessage, setCurrentMessage] = useState('')

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Focus input when session changes
  useEffect(() => {
    if (currentSession && inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentSession])

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    if (!currentSession) {
      toast.error('Please select or create a session first')
      setSessionDialogOpen(true)
      return
    }

    const messageToSend = currentMessage.trim()
    setCurrentMessage('')

    try {
      await submitTask(currentSession.sessionId, messageToSend)
    } catch (error) {
      console.error('Failed to send message:', error)
      setCurrentMessage(messageToSend) // Restore message on error
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getTaskStatusIcon = (task: TaskData) => {
    switch (task.status) {
      case 'submitting':
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
      case 'queued':
        return <Clock className="h-3 w-3 text-yellow-500" />
      case 'assigned':
        return <Users className="h-3 w-3 text-orange-500" />
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return null
    }
  }

  const getTaskStatusText = (task: TaskData) => {
    switch (task.status) {
      case 'submitting':
        return 'Submitting...'
      case 'queued':
        return 'Queued'
      case 'assigned':
        return `Assigned to ${task.assignedMiners?.length || 0} miners`
      case 'completed':
        return 'Completed'
      case 'failed':
        return 'Failed'
      default:
        return 'Unknown'
    }
  }

  const getMessageTask = (message: ChatMessage): TaskData | undefined => {
    return tasks.find(task =>
      task.sessionId === message.sessionId && task.taskId === message.taskId
    )
  }

  return (
    <div className={className}>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Chat Interface</CardTitle>
            {currentSession && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Session #{currentSession.sessionId}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {messages.length} messages
                </Badge>
              </div>
            )}
          </div>
          {currentSession && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {currentSession.nodeCount} nodes
              </span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {currentSession.redundant}x redundancy
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {currentSession.sla}ms SLA
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {!currentSession ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Session</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select an existing session or create a new one to start chatting.
                </p>
                <Button onClick={() => setSessionDialogOpen(true)}>
                  Create New Session
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Start a conversation by typing a message below.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    {messages.map((message) => {
                      const task = getMessageTask(message)

                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                          {message.sender === 'ai' && (
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bot className="h-4 w-4 text-primary" />
                              </div>
                            </div>
                          )}

                          <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-first' : ''
                            }`}>
                            <div className={`rounded-lg px-4 py-2 ${message.sender === 'user'
                                ? 'bg-primary text-primary-foreground ml-auto'
                                : 'bg-muted'
                              }`}>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>

                            <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                              }`}>
                              <span>
                                {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                              </span>

                              {task && message.sender === 'user' && (
                                <>
                                  <Separator orientation="vertical" className="h-3" />
                                  <div className="flex items-center gap-1">
                                    {getTaskStatusIcon(task)}
                                    <span>{getTaskStatusText(task)}</span>
                                  </div>
                                  {task.taskId && (
                                    <>
                                      <Separator orientation="vertical" className="h-3" />
                                      <span>Task #{task.taskId}</span>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {message.sender === 'user' && (
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Type your message..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isSubmittingTask}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || isSubmittingTask}
                    size="icon"
                  >
                    {isSubmittingTask ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {isSubmittingTask && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Submitting task to Cortensor network...</span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}