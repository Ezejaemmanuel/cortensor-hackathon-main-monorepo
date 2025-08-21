'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  MessageSquare,
  Zap,
  Hash,
  Calendar,
  Server
} from 'lucide-react'
import { useCortensorTasks } from '../hooks/useCortensorTasks'
import { useCurrentSession } from '../store/useSessionStore'
import { cn } from '@/lib/utils'

interface TaskManagerProps {
  className?: string
}

export function TaskManager({ className }: TaskManagerProps) {
  const { tasks, isSubmittingTask } = useCortensorTasks()
  const currentSession = useCurrentSession()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    overview: true,
    active: true,
    completed: false,
    failed: false
  })

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const activeTasks = tasks.filter(task =>
    task.status === 'queued' || task.status === 'assigned'
  )
  const completedTasks = tasks.filter(task => task.status === 'completed')
  const failedTasks = tasks.filter(task => task.status === 'failed')
  const submittingTasks = tasks.filter(task => task.status === 'submitting')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitting':
        return <Clock className="h-4 w-4 text-secondary animate-pulse" />
      case 'queued':
        return <Activity className="h-4 w-4 text-primary" />
      case 'assigned':
        return <Users className="h-4 w-4 text-accent" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-primary" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitting':
        return 'bg-secondary/20 text-secondary border-secondary/30'
      case 'queued':
        return 'bg-primary/20 text-primary border-primary/30'
      case 'assigned':
        return 'bg-accent/20 text-accent border-accent/30'
      case 'completed':
        return 'bg-primary/20 text-primary border-primary/30'
      case 'failed':
        return 'bg-destructive/20 text-destructive border-destructive/30'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const TaskCard = ({ task }: { task: any }) => (
    <Card className="mb-3 bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(task.status)}
            <CardTitle className="text-sm font-medium text-card-foreground">
              Task #{task.taskId}
            </CardTitle>
            <Badge className={cn('text-xs', getStatusColor(task.status))}>
              {task.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {task.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-1 text-card-foreground">Content:</p>
            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
              {task.content}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            {task.globalId && (
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                <span>Global ID: {task.globalId}</span>
              </div>
            )}

            {task.assignedMiners && task.assignedMiners.length > 0 && (
              <div className="flex items-center gap-1">
                <Server className="h-3 w-3" />
                <span>Miners: {task.assignedMiners.length}</span>
              </div>
            )}
          </div>

          {task.assignedMiners && task.assignedMiners.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1 text-card-foreground">Assigned Miners:</p>
              <div className="space-y-1">
                {task.assignedMiners.map((miner: string, index: number) => (
                  <div key={index} className="text-xs font-mono bg-muted p-1 rounded text-muted-foreground">
                    {miner.slice(0, 10)}...{miner.slice(-8)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {task.results && task.results.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1 text-card-foreground">Results:</p>
              <div className="space-y-1">
                {task.results.map((result: string, index: number) => (
                  <div key={index} className="text-sm bg-accent/20 p-2 rounded border border-accent/30 text-card-foreground">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          {task.transactionHash && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Tx Hash: </span>
              <span className="font-mono">
                {task.transactionHash.slice(0, 10)}...{task.transactionHash.slice(-8)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (!currentSession) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Task Manager
          </CardTitle>
          <CardDescription>
            No active session selected. Please select or create a session to view tasks.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Overview Section */}
      <Collapsible
        open={openSections.overview}
        onOpenChange={() => toggleSection('overview')}
      >
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:bg-card/70 transition-colors bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Activity className="h-5 w-5 text-primary" />
                  Task Overview
                </CardTitle>
                {openSections.overview ?
                  <ChevronDown className="h-4 w-4" /> :
                  <ChevronRight className="h-4 w-4" />
                }
              </div>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{activeTasks.length}</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{completedTasks.length}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">{failedTasks.length}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{submittingTasks.length}</div>
                  <div className="text-sm text-muted-foreground">Submitting</div>
                </div>
              </div>

              {isSubmittingTask && (
                <div className="mt-4 p-3 bg-secondary/20 border border-secondary/30 rounded-lg">
                  <div className="flex items-center gap-2 text-secondary">
                    <Zap className="h-4 w-4 animate-pulse" />
                    <span className="text-sm font-medium">Submitting new task...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <Collapsible
          open={openSections.active}
          onOpenChange={() => toggleSection('active')}
        >
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer hover:bg-card/70 transition-colors bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Activity className="h-5 w-5 text-primary" />
                    Active Tasks ({activeTasks.length})
                  </CardTitle>
                  {openSections.active ?
                    <ChevronDown className="h-4 w-4" /> :
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2">
              {activeTasks.map(task => (
                <TaskCard key={`${task.sessionId}-${task.taskId}`} task={task} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <Collapsible
          open={openSections.completed}
          onOpenChange={() => toggleSection('completed')}
        >
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer hover:bg-card/70 transition-colors bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    Completed Tasks ({completedTasks.length})
                  </CardTitle>
                  {openSections.completed ?
                    <ChevronDown className="h-4 w-4" /> :
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2">
              {completedTasks.map(task => (
                <TaskCard key={`${task.sessionId}-${task.taskId}`} task={task} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Failed Tasks */}
      {failedTasks.length > 0 && (
        <Collapsible
          open={openSections.failed}
          onOpenChange={() => toggleSection('failed')}
        >
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer hover:bg-card/70 transition-colors bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <XCircle className="h-5 w-5 text-destructive" />
                    Failed Tasks ({failedTasks.length})
                  </CardTitle>
                  {openSections.failed ?
                    <ChevronDown className="h-4 w-4" /> :
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2">
              {failedTasks.map(task => (
                <TaskCard key={`${task.sessionId}-${task.taskId}`} task={task} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}