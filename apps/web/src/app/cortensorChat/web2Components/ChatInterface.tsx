'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import {
  Send,
  Bot,
  User,
  Loader2,
  Plus,
  Search,
  SearchX,
  Sparkles,
  Zap
} from 'lucide-react'
import { SEARCH_MARKER, AI_RESPONSE_CLEANUP_PATTERNS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { getApiEndpoint } from '@/lib/api-config'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'

interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

interface ChatHistoryItem {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
}

interface ChatInterfaceProps {
  className?: string
  userAddress: string
}

// Enhanced Cortensor-themed placeholder texts for AI thinking state
const CORTENSOR_PLACEHOLDER_TEXTS = [
  "🧠 Initializing quantum neural matrices...",
  "⚡ Establishing secure channels to 47 AI nodes...",
  "🔗 Synchronizing with distributed consciousness network...",
  "🌐 Routing through hyperspace data corridors...",
  "🔮 Consulting the collective AI wisdom...",
  "⚙️ Calibrating synaptic response algorithms...",
  "🚀 Launching deep learning protocols...",
  "💫 Weaving thoughts through cosmic data streams...",
  "🔬 Analyzing molecular patterns in your query...",
  "🌟 Harmonizing with stellar computation clusters...",
  "🎯 Targeting optimal response vectors...",
  "🔄 Cycling through infinite possibility matrices...",
  "🛸 Downloading insights from the AI mothership...",
  "⚛️ Splitting atoms of information for precision...",
  "🌊 Surfing waves of pure digital consciousness...",
  "🔥 Igniting fusion reactors of creativity...",
  "💎 Crystallizing thoughts into perfect responses...",
  "🌈 Painting responses with spectrum of knowledge...",
  "⚡ Channeling lightning-fast neural computations...",
  "🎭 Orchestrating symphony of AI collaboration...",
  "🔭 Scanning distant galaxies of information...",
  "🧬 Decoding DNA sequences of your question...",
  "🌀 Spiraling through dimensions of understanding...",
  "💫 Materializing wisdom from quantum foam...",
  "🎪 Performing computational acrobatics...",
  "🔮 Gazing into crystal balls of possibility...",
  "⚗️ Brewing perfect elixir of knowledge...",
  "🎨 Sculpting responses from raw data marble...",
  "🌺 Blooming insights in digital gardens...",
  "🎵 Composing melodies of meaningful answers..."
]

export function ChatInterface({ className, userAddress }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false)
  const [currentPlaceholder, setCurrentPlaceholder] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const placeholderIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load messages for a specific chat
  const loadChatMessages = useCallback((chatId: string) => {
    const savedMessages = localStorage.getItem(`cortensor_messages_${userAddress}_${chatId}`)
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages) as Array<{
          id: string
          content: string
          sender: 'user' | 'ai'
          timestamp: string
        }>
        setMessages(parsed.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
        setSelectedChatId(chatId)
      } catch (error) {
        console.error('Failed to parse messages:', error)
        setMessages([])
        setSelectedChatId(chatId)
      }
    } else {
      setMessages([])
      setSelectedChatId(chatId)
    }
  }, [userAddress])

  // Load chat history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(`cortensor_chat_history_${userAddress}`)
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory) as Array<{
          id: string
          title: string
          lastMessage: string
          timestamp: string
          messageCount: number
        }>
        setChatHistory(parsed.map((item) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })))
      } catch (error) {
        console.error('Failed to parse chat history:', error)
      }
    }

    // Load current chat messages if any
    const currentChatId = localStorage.getItem(`cortensor_current_chat_${userAddress}`)
    if (currentChatId) {
      loadChatMessages(currentChatId)
    }
  }, [userAddress, loadChatMessages])

  // Listen for chat switch events
  useEffect(() => {
    const handleChatSwitch = (event: CustomEvent) => {
      const { chatId } = event.detail
      loadChatMessages(chatId)
    }

    window.addEventListener('chatSwitched', handleChatSwitch as EventListener)

    return () => {
      window.removeEventListener('chatSwitched', handleChatSwitch as EventListener)
    }
  }, [loadChatMessages])

  // Enhanced auto-scroll to bottom with smooth behavior
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      })
    }
  }, [])

  // Auto-scroll when new messages arrive
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom()
    }, 100)
    return () => clearTimeout(timer)
  }, [messages, currentPlaceholder, scrollToBottom])

  // Rotate placeholder texts while loading
  useEffect(() => {
    if (isLoading) {
      setCurrentPlaceholder(CORTENSOR_PLACEHOLDER_TEXTS[0])
      let index = 0
      placeholderIntervalRef.current = setInterval(() => {
        index = (index + 1) % CORTENSOR_PLACEHOLDER_TEXTS.length
        setCurrentPlaceholder(CORTENSOR_PLACEHOLDER_TEXTS[index])
      }, 2000)
    } else {
      setCurrentPlaceholder('')
      if (placeholderIntervalRef.current) {
        clearInterval(placeholderIntervalRef.current)
      }
    }

    return () => {
      if (placeholderIntervalRef.current) {
        clearInterval(placeholderIntervalRef.current)
      }
    }
  }, [isLoading])

  // Save messages to localStorage
  const saveMessages = (chatId: string, msgs: ChatMessage[]) => {
    localStorage.setItem(`cortensor_messages_${userAddress}_${chatId}`, JSON.stringify(msgs))
  }

  // Save chat history to localStorage
  const saveChatHistory = useCallback((history: ChatHistoryItem[]) => {
    localStorage.setItem(`cortensor_chat_history_${userAddress}`, JSON.stringify(history))
    setChatHistory(history)
  }, [userAddress])

  // Create new chat
  const createNewChat = useCallback(() => {
    const newChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newChat: ChatHistoryItem = {
      id: newChatId,
      title: `Chat ${chatHistory.length + 1}`,
      lastMessage: 'New conversation started',
      timestamp: new Date(),
      messageCount: 0
    }
    const updatedHistory = [newChat, ...chatHistory]
    saveChatHistory(updatedHistory)
    setSelectedChatId(newChatId)
    setMessages([])
    localStorage.setItem(`cortensor_current_chat_${userAddress}`, newChatId)
  }, [chatHistory, saveChatHistory, userAddress])

  // Update chat history with latest message
  const updateChatHistory = (message: string) => {
    if (!selectedChatId) return

    const updatedHistory = chatHistory.map(chat =>
      chat.id === selectedChatId
        ? {
          ...chat,
          lastMessage: message,
          timestamp: new Date(),
          messageCount: messages.length + 1
        }
        : chat
    )
    saveChatHistory(updatedHistory)
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return

    if (!selectedChatId) {
      createNewChat()
      // Wait for state to update
      setTimeout(() => handleSendMessage(), 100)
      return
    }

    // Prepare the message with search marker if enabled
    const formattedMessage = isWebSearchEnabled 
      ? `${SEARCH_MARKER} ${currentMessage.trim()}`
      : currentMessage.trim()

    // Create user message without search marker for display
    const displayMessage = formattedMessage.startsWith(SEARCH_MARKER)
      ? formattedMessage.replace(SEARCH_MARKER, '').trim()
      : formattedMessage

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: displayMessage,
      sender: 'user',
      timestamp: new Date()
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    saveMessages(selectedChatId, newMessages)
    updateChatHistory(userMessage.content)

    const messageToSend = formattedMessage
    setCurrentMessage('')
    setIsLoading(true)

    try {
      // Send the current message with chatId for memory context
      const response = await fetch(getApiEndpoint(`/api/chat?userAddress=${encodeURIComponent(userAddress)}&chatId=${encodeURIComponent(selectedChatId)}`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: [{ type: 'text', text: messageToSend }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Clean the AI response using cleanup patterns
      let cleanResponse = data.content?.[0]?.text || data.message || "No response"
      AI_RESPONSE_CLEANUP_PATTERNS.forEach(pattern => {
        cleanResponse = cleanResponse.replace(pattern, '')
      })
      cleanResponse = cleanResponse.trim()

      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: cleanResponse,
        sender: 'ai',
        timestamp: new Date()
      }

      const updatedMessages = [...newMessages, aiMessage]
      setMessages(updatedMessages)
      saveMessages(selectedChatId, updatedMessages)
      updateChatHistory(aiMessage.content)

    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: "Sorry, I encountered an error processing your message. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      }
      const updatedMessages = [...newMessages, errorMessage]
      setMessages(updatedMessages)
      saveMessages(selectedChatId, updatedMessages)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Create initial chat if none exists
  useEffect(() => {
    if (!selectedChatId && chatHistory.length === 0) {
      createNewChat()
    }
  }, [selectedChatId, chatHistory.length, createNewChat])

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col w-full max-w-4xl mx-auto",
        "bg-gradient-to-br from-background via-background to-card/20",
        "backdrop-blur-xl border border-border/30 rounded-2xl",
        "shadow-glass overflow-hidden",
        "h-[calc(100vh-8rem)] min-h-[600px]",
        "sm:h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)]",
        "sm:min-h-[500px] md:min-h-[600px]",
        className
      )}>
        {/* Header */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-border/30 bg-card/20 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative">
                <div className="flex justify-center items-center w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-gradient-primary shadow-glow-primary">
                  <Bot className="w-5 sm:w-7 h-5 sm:h-7 text-background" />
                  <div className="absolute -top-1 -right-1 w-3 sm:w-4 h-3 sm:h-4 bg-accent rounded-full animate-pulse shadow-glow-accent">
                    <Sparkles className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-background m-0.5" />
                  </div>
                </div>
              </div>
              <div>
                <CardTitle className="text-lg sm:text-2xl font-bold font-futura bg-gradient-primary bg-clip-text text-transparent gradient-text">
                  cortiGPT
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-tech">
                  Neural Network Intelligence
                </p>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={createNewChat}
                  size="lg"
                  className={cn(
                    "relative overflow-hidden group font-tech",
                    "bg-gradient-secondary hover:shadow-glow-secondary",
                    "transition-all duration-300 hover:scale-105",
                    "border border-secondary/20 glow-secondary"
                  )}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Chat
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Start a new conversation
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              {messages.length === 0 && !isLoading ? (
                <div className="flex items-center justify-center h-full min-h-[300px] sm:min-h-[400px]">
                  <div className="text-center space-y-4 sm:space-y-6 max-w-xs sm:max-w-md">
                    <div className="relative">
                      <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto rounded-3xl bg-gradient-neural shadow-glow-primary animate-pulse">
                        <Bot className="w-10 sm:w-12 h-10 sm:h-12 text-background m-3 sm:m-4" />
                      </div>
                      <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-6 sm:w-8 h-6 sm:h-8 bg-accent rounded-full shadow-glow-accent animate-bounce">
                        <Zap className="w-3 sm:w-4 h-3 sm:h-4 text-background m-1.5 sm:m-2" />
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <h3 className="text-lg sm:text-xl font-semibold font-futura text-primary-glow">
                        Welcome to cortiGPT
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-tech">
                        Your AI-powered assistant is ready to help. Start a conversation by typing a message below.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                      <div className="px-2 sm:px-3 py-1 bg-neural-primary/10 rounded-full text-xs text-neural-primary border border-neural-primary/20 glow-primary">
                        Neural Network
                      </div>
                      <div className="px-2 sm:px-3 py-1 bg-neural-secondary/10 rounded-full text-xs text-neural-secondary border border-neural-secondary/20 glow-secondary">
                        Web Search
                      </div>
                      <div className="px-2 sm:px-3 py-1 bg-neural-tertiary/10 rounded-full text-xs text-neural-tertiary border border-neural-tertiary/20 glow-accent">
                        Real-time
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 sm:space-y-8">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3 sm:gap-4 group animate-in slide-in-from-bottom-4 duration-500",
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {message.sender === 'ai' && (
                        <div className="flex-shrink-0">
                          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-2xl bg-gradient-primary shadow-glow-primary flex items-center justify-center">
                            <Bot className="w-4 sm:w-5 h-4 sm:h-5 text-background" />
                          </div>
                        </div>
                      )}

                      <div className={cn(
                        "max-w-[85%] sm:max-w-[80%] lg:max-w-[70%]",
                        message.sender === 'user' ? 'order-first' : ''
                      )}>
                        <div className={cn(
                          "rounded-2xl px-4 sm:px-6 py-3 sm:py-4 relative overflow-hidden",
                          "backdrop-blur-sm border transition-all duration-300",
                          "group-hover:shadow-lg group-hover:scale-[1.02]",
                          message.sender === 'user'
                            ? cn(
                                "bg-gradient-primary text-background ml-auto",
                                "shadow-glow-primary/30 border-primary/20",
                                "before:absolute before:inset-0 before:bg-gradient-to-r",
                                "before:from-transparent before:via-white/10 before:to-transparent",
                                "before:-translate-x-full hover:before:translate-x-full",
                                "before:transition-transform before:duration-700"
                              )
                            : cn(
                                "bg-card/40 border-border/30",
                                "shadow-sm hover:shadow-glow-secondary/20"
                              )
                        )}>
                          {message.sender === 'ai' ? (
                            <MarkdownRenderer 
                              content={message.content} 
                              className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 text-foreground text-xs sm:text-sm font-tech"
                            />
                          ) : (
                            <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-tech break-words">
                              {message.content}
                            </p>
                          )}
                        </div>

                        <div className={cn(
                          "flex items-center gap-2 mt-1 text-xs text-muted-foreground",
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        )}>
                          <span>{formatDistanceToNow(message.timestamp, { addSuffix: true })}</span>
                        </div>
                      </div>

                      {message.sender === 'user' && (
                        <div className="flex-shrink-0">
                          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-2xl bg-gradient-secondary shadow-glow-secondary flex items-center justify-center">
                            <User className="w-4 sm:w-5 h-4 sm:h-5 text-background" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading placeholder */}
                  {isLoading && (
                    <div className="flex gap-3 sm:gap-4 justify-start animate-in slide-in-from-bottom-4 duration-500">
                      <div className="flex-shrink-0">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-2xl bg-gradient-primary shadow-glow-primary flex items-center justify-center animate-pulse">
                          <Bot className="w-4 sm:w-5 h-4 sm:h-5 text-background" />
                        </div>
                      </div>

                      <div className="max-w-[85%] sm:max-w-[80%] lg:max-w-[70%]">
                        <div className="rounded-2xl px-4 sm:px-6 py-3 sm:py-4 bg-card/40 backdrop-blur-sm border border-border/30">
                          <div className="flex gap-2 items-center">
                            <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin text-neural-primary" />
                            <p className="text-xs sm:text-sm italic text-muted-foreground animate-pulse font-tech break-words">
                              {currentPlaceholder}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} className="h-4 sm:h-6" />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area - Adaptive Height */}
        <div className="flex-shrink-0 border-t border-border/30 bg-background/95 backdrop-blur-md p-4 space-y-4 rounded-b-2xl glass">
          {/* Web Search Status Indicator */}
          {isWebSearchEnabled && (
            <div className={cn(
              "flex gap-3 items-center px-4 py-3 mb-4 rounded-xl",
              "bg-gradient-to-r from-neural-secondary/10 to-neural-tertiary/10",
              "border border-neural-secondary/20 backdrop-blur-sm glow-secondary",
              "animate-in slide-in-from-bottom-2 duration-300"
            )}>
              <div className="w-8 h-8 bg-neural-secondary/20 rounded-full flex items-center justify-center glow-secondary">
                <Search className="w-4 h-4 text-neural-secondary" />
              </div>
              <span className="text-sm font-medium text-neural-secondary font-tech">
                Web search enabled - Your queries will include web results
              </span>
            </div>
          )}
          
          <div className="flex gap-3 sm:gap-4 items-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "sm:w-auto sm:h-auto p-2 sm:p-3",
                    "relative overflow-hidden group transition-all duration-300 font-tech",
                    "border-2 hover:scale-105 glass",
                    isWebSearchEnabled 
                      ? "bg-gradient-secondary text-background border-neural-secondary shadow-glow-secondary glow-secondary" 
                      : "border-border/50 hover:border-neural-secondary/50 hover:shadow-glow-secondary/20"
                  )}
                >
                  {isWebSearchEnabled ? (
                    <Search className="w-4 sm:w-5 h-4 sm:h-5" />
                  ) : (
                    <SearchX className="w-4 sm:w-5 h-4 sm:h-5" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {isWebSearchEnabled ? "Disable web search" : "Enable web search"}
              </TooltipContent>
            </Tooltip>
            
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder={isWebSearchEnabled ? "🔍 Web search enabled - Type your message..." : "Type your message..."}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className={cn(
                  "text-sm sm:text-base h-12 sm:h-14 px-4 sm:px-6 rounded-2xl border-2 transition-all duration-300 font-tech",
                  "bg-background/50 backdrop-blur-sm glass",
                  "focus:border-neural-primary/50 focus:shadow-glow-primary/20 focus:glow-primary",
                  "placeholder:text-muted-foreground/70"
                )}
              />
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isLoading}
                  size="sm"
                  className={cn(
                    "relative overflow-hidden group h-12 sm:h-14 px-4 sm:px-6 font-tech",
                    "bg-gradient-primary hover:shadow-glow-primary glow-primary",
                    "transition-all duration-300 hover:scale-105",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                  ) : (
                    <Send className="w-4 sm:w-5 h-4 sm:h-5" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {isLoading ? "Sending message..." : "Send message (Enter)"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}