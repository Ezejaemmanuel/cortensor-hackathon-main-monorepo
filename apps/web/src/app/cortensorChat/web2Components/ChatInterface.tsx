'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Send,
  Bot,
  User,
  Loader2,
  Plus,
  Search,
  SearchX
} from 'lucide-react'
import { SEARCH_MARKER, AI_RESPONSE_CLEANUP_PATTERNS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

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

// Futuristic Cortensor-themed placeholder texts for AI thinking state
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, currentPlaceholder])

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
      const response = await fetch(`/api/chat?userAddress=${encodeURIComponent(userAddress)}&chatId=${encodeURIComponent(selectedChatId)}`, {
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
    <Card className={cn(
      "h-full backdrop-blur-xl bg-card/50 border-border/50 shadow-glass",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="flex justify-center items-center w-8 h-8 rounded-lg bg-gradient-secondary shadow-glow-secondary">
              <Bot className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg font-futura text-foreground">
                cortiGPT
              </CardTitle>
            </div>
          </div>
          <Button
            onClick={createNewChat}
            size="sm"
            className="p-0 w-8 h-8"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-full">
        {/* Messages Area */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full p-1 sm:p-4" ref={scrollAreaRef}>
            {messages.length === 0 && !isLoading ? (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <div className="text-center">
                  <Bot className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Start a conversation by typing a message below.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'ai' && (
                      <div className="flex-shrink-0">
                        <div className="flex justify-center items-center w-8 h-8 rounded-full bg-primary/10">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                    )}

                    <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-first' : ''}`}>
                      <div className={`rounded-lg px-4 py-2 ${message.sender === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                        }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>

                      <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <span>{formatDistanceToNow(message.timestamp, { addSuffix: true })}</span>
                      </div>
                    </div>

                    {message.sender === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="flex justify-center items-center w-8 h-8 rounded-full bg-primary/10">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading placeholder */}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0">
                      <div className="flex justify-center items-center w-8 h-8 rounded-full bg-primary/10">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    </div>

                    <div className="max-w-[80%]">
                      <div className="rounded-lg px-4 py-2 bg-muted">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          <p className="text-sm text-muted-foreground italic">
                            {currentPlaceholder}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Spacer to ensure content is not hidden behind input */}
                <div className="h-32 sm:h-36"></div>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Fixed Input Area at Bottom */}
        <div className="flex-shrink-0 p-2 sm:p-4 border-t bg-background/95 backdrop-blur-sm sticky bottom-0 z-10">
          {/* Web Search Status Indicator */}
          {isWebSearchEnabled && (
            <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Web search enabled - Your query will include web results
              </span>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
              variant={isWebSearchEnabled ? "default" : "outline"}
              size="sm"
              className="px-3 shrink-0"
              title={isWebSearchEnabled ? "Disable web search" : "Enable web search"}
            >
              {isWebSearchEnabled ? (
                <Search className="w-4 h-4" />
              ) : (
                <SearchX className="w-4 h-4" />
              )}
            </Button>
            <Input
              ref={inputRef}
              placeholder={isWebSearchEnabled ? "🔍 Web search enabled - Type your message..." : "Type your message..."}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 text-sm sm:text-base"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isLoading}
              size="sm"
              className="px-3 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}