'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import {
  Send,
  User,
  Loader2,
  Plus,
  Search,
  SearchX,
  Sparkles,
  Zap,
  X,
  Square
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { getApiEndpoint } from '@/lib/api-config'
import { SEARCH_MARKER, AI_RESPONSE_CLEANUP_PATTERNS, CHAT_HISTORY_LIMIT } from '@/lib/constants'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import {
  SelectedTextPreview,
  ClearSelectedTextMessage,
  TextSelectionUpdateMessage,
  GetSelectedTextMessage,
  MessageResponse
} from '@/types/messaging'
import { useWeb2Chat, ChatMessage } from '@/stores/useWeb2ChatStore'
import type { TextSelectionData } from '@/types/messaging'

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
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentPlaceholder, setCurrentPlaceholder] = useState('')
  const [selectedTextPreview, setSelectedTextPreview] = useState<SelectedTextPreview | null>(null)
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(true)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const placeholderIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isUserScrolledUpRef = useRef(false)
  const shouldAutoScrollRef = useRef(true)

  // Use Web2 Zustand store
  const {
    currentMessages: messages,
    chatHistory,
    selectedChatId,
    setUserAddress,
    createNewChat,
    addMessage,
    updateChatHistory
  } = useWeb2Chat()

  // Initialize user address in store
  useEffect(() => {
    if (userAddress) {
      setUserAddress(userAddress)
    }
  }, [userAddress, setUserAddress])

  // Utility function to truncate text to two lines
  const truncateToTwoLines = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }



  // Enhanced auto-scroll to bottom with smart behavior
  const scrollToBottom = useCallback((force = false) => {
    if (messagesEndRef.current && (shouldAutoScrollRef.current || force)) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      })
      isUserScrolledUpRef.current = false
    }
  }, [])

  // Check if user is near bottom of scroll area
  const checkScrollPosition = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
        isUserScrolledUpRef.current = !isNearBottom
        shouldAutoScrollRef.current = isNearBottom
      }
    }
  }, [])

  // Auto-scroll when new messages arrive (only if user is near bottom)
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom()
    }, 100)
    return () => clearTimeout(timer)
  }, [messages, scrollToBottom])

  // Auto-scroll for loading placeholder only if user is near bottom
  useEffect(() => {
    if (isLoading && currentPlaceholder) {
      const timer = setTimeout(() => {
        scrollToBottom()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [currentPlaceholder, isLoading, scrollToBottom])

  // Add scroll event listener to track user scroll position
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (scrollContainer) {
      const handleScroll = () => {
        checkScrollPosition()
      }
      
      scrollContainer.addEventListener('scroll', handleScroll)
      return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [checkScrollPosition])



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

  // Listen for text selection and website content messages from background script
  useEffect(() => {
    const handleMessage = (message: any, sender: any, sendResponse: any) => {
      if (message.type === 'TEXT_SELECTION_UPDATE') {
        const textSelectionMessage = message as TextSelectionUpdateMessage
        if (textSelectionMessage.data) {
          const preview: SelectedTextPreview = {
            originalText: textSelectionMessage.data.text,
            truncatedText: truncateToTwoLines(textSelectionMessage.data.text),
            url: textSelectionMessage.data.url,
            timestamp: textSelectionMessage.data.timestamp,
            isVisible: true
          }
          setSelectedTextPreview(preview)
        } else {
          setSelectedTextPreview(null)
        }
      }
      return true
    }

    // Listen for messages from background script
    browser.runtime.onMessage.addListener(handleMessage);

    // Request any existing selected text when component mounts
    const getSelectedTextMessage: GetSelectedTextMessage = { type: 'GET_SELECTED_TEXT' };
    browser.runtime.sendMessage(getSelectedTextMessage)
      .then((response: MessageResponse) => {
        if (response.success && response.data && 'text' in response.data) {
          const textData = response.data as TextSelectionData;
          const preview: SelectedTextPreview = {
            originalText: textData.text,
            truncatedText: truncateToTwoLines(textData.text),
            url: textData.url,
            timestamp: textData.timestamp,
            isVisible: true
          };
          setSelectedTextPreview(preview);
        }
      })
      .catch(() => {
        // Background script might not be ready yet
        console.log('Could not get selected text on mount');
      });

    return () => {
      browser.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  // Wrapper function for creating new chat
  const handleCreateNewChat = () => {
    createNewChat()
  }

  const clearSelectedText = () => {
    setSelectedTextPreview(null)
    const clearMessage: ClearSelectedTextMessage = { type: 'CLEAR_SELECTED_TEXT' }
    browser.runtime.sendMessage(clearMessage)
  }

  const handleCancelRequest = () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim() && !selectedTextPreview) return
    if (isLoading) return

    // Removed forced auto-scroll to allow user control

    let messageContent = currentMessage.trim()

    // If there's selected text, include it in the message
    if (selectedTextPreview) {
      const contextMessage = `Context from ${new URL(selectedTextPreview.url).hostname}:\n\n"${selectedTextPreview.originalText}"\n\nUser question: ${messageContent || 'Please analyze this text.'}`
      messageContent = contextMessage
    }

    // If no chat is selected, create a new one
    let currentChatId = selectedChatId
    if (!currentChatId) {
      currentChatId = createNewChat()
    }

    // Prepare the message with search marker if enabled
    const formattedMessage = isWebSearchEnabled 
      ? `${SEARCH_MARKER} ${messageContent}`
      : messageContent

    // Create user message without search marker for display
    const displayMessage = selectedTextPreview 
      ? (currentMessage.trim() || 'Please analyze this text.')
      : (formattedMessage.startsWith(SEARCH_MARKER)
        ? formattedMessage.replace(SEARCH_MARKER, '').trim()
        : formattedMessage)

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: displayMessage,
      sender: 'user',
      timestamp: new Date()
    }

    // Add message to store
    addMessage(currentChatId, userMessage)
    updateChatHistory(currentChatId, userMessage.content, messages.length + 1)

    const messageToSend = formattedMessage
    setCurrentMessage('')
    setSelectedTextPreview(null)
    setIsLoading(true)

    // Clear selected text from background
    const clearMessage: ClearSelectedTextMessage = { type: 'CLEAR_SELECTED_TEXT' }
    browser.runtime.sendMessage(clearMessage)

    // Create new AbortController for this request
    const controller = new AbortController()
    setAbortController(controller)

    try {
      // Get the last N messages for context (including the new user message)
      const allMessages = [...messages, userMessage];
      const recentMessages = allMessages.slice(-CHAT_HISTORY_LIMIT);
      
      // Format messages for the API
      const formattedMessages = recentMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: [{ type: 'text', text: msg.content }]
      }));
      
      // Override the last message with the formatted message (including search marker if enabled)
      if (formattedMessages.length > 0) {
        formattedMessages[formattedMessages.length - 1] = {
          role: 'user',
          content: [{ type: 'text', text: messageToSend }]
        };
      }
      
      // Send the message history with chatId for context
      const response = await fetch(getApiEndpoint(`/api/chat?userAddress=${encodeURIComponent(userAddress)}&chatId=${encodeURIComponent(currentChatId)}`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: formattedMessages
        }),
        signal: controller.signal
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

      // Add AI response to store
      addMessage(currentChatId, aiMessage)
      updateChatHistory(currentChatId, aiMessage.content, messages.length + 2)

    } catch (error) {
      // Check if the error is due to abort
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was cancelled by user')
        return
      }
      
      console.error('Failed to send message:', error)
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: "Sorry, I encountered an error processing your message. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      }
      addMessage(currentChatId, errorMessage)
    } finally {
      setIsLoading(false)
      setAbortController(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const canSend = (currentMessage.trim() || selectedTextPreview) && !isLoading

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col h-full max-h-full overflow-hidden",
        "bg-gradient-to-br from-background via-background to-card/20",
        "backdrop-blur-xl border border-border/30 rounded-2xl",
        "shadow-glass",
        "w-full max-w-full",
        className
      )}>
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-border/30 bg-card/20 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="flex justify-center items-center w-10 h-10 rounded-2xl bg-gradient-primary shadow-glow-primary">
                  <img src="/cortigpt-4.png" alt="CortiGPT" className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse shadow-glow-accent">
                    <Sparkles className="w-2 h-2 text-background m-0.5" />
                  </div>
                </div>
              </div>
              <div>
                <CardTitle className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                  cortiGPT
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Neural Network Intelligence
                </p>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleCreateNewChat}
                  size="sm"
                  className={cn(
                    "relative overflow-hidden group",
                    "bg-gradient-secondary hover:shadow-glow-secondary",
                    "transition-all duration-300 hover:scale-105",
                    "border border-secondary/20 p-2 w-8 h-8"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Start new chat
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="w-full h-full max-h-full" ref={scrollAreaRef}>
            <div className="px-4 py-4">
              {messages.length === 0 && !isLoading ? (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                  <div className="text-center space-y-4 max-w-xs">
                    <div className="relative">
                      <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-neural shadow-glow-primary animate-pulse">
                        <img src="/cortigpt-4.png" alt="CortiGPT" className="w-20 h-20 m-3" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full shadow-glow-accent animate-bounce">
                        <Zap className="w-3 h-3 text-background m-1.5" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        Welcome to cortiGPT
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Your AI assistant is ready. Start a conversation or select text on the page to analyze.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      <div className="px-2 py-1 bg-primary/10 rounded-full text-xs text-primary border border-primary/20">
                        Neural
                      </div>
                      <div className="px-2 py-1 bg-secondary/10 rounded-full text-xs text-secondary border border-secondary/20">
                        Web Search
                      </div>
                      <div className="px-2 py-1 bg-accent/10 rounded-full text-xs text-accent border border-accent/20">
                        Real-time
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message: ChatMessage, index) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3 group animate-in slide-in-from-bottom-4 duration-500",
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {message.sender === 'ai' && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-2xl bg-gradient-primary shadow-glow-primary flex items-center justify-center">
                            <img src="/cortigpt-4.png" alt="CortiGPT" className="w-8 h-8" />
                          </div>
                        </div>
                      )}

                      <div className={cn(
                        "max-w-[85%]",
                        message.sender === 'user' ? 'order-first' : ''
                      )}>
                        <div className={cn(
                          "rounded-2xl px-4 py-3 relative overflow-hidden",
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
                              className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 text-foreground text-xs"
                            />
                          ) : (
                            <p className="text-xs whitespace-pre-wrap leading-relaxed break-words">
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
                          <div className="w-8 h-8 rounded-2xl bg-gradient-secondary shadow-glow-secondary flex items-center justify-center">
                            <User className="w-4 h-4 text-background" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading placeholder */}
                  {isLoading && (
                    <div className="flex gap-3 justify-start animate-in slide-in-from-bottom-4 duration-500">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-2xl bg-gradient-primary shadow-glow-primary flex items-center justify-center animate-pulse">
                          <img src="/cortigpt-4.png" alt="CortiGPT" className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="max-w-[85%]">
                        <div className="rounded-2xl px-4 py-3 bg-card/40 backdrop-blur-sm border border-border/30">
                          <div className="flex gap-2 items-center">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <p className="text-xs italic text-muted-foreground animate-pulse break-words">
                              {currentPlaceholder}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} className="h-6" />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 flex-grow-0 p-4 border-t border-border/30 bg-background/95 backdrop-blur-md rounded-b-2xl w-full">
          {/* Web Search Status Indicator */}
          {isWebSearchEnabled && (
            <div className={cn(
              "flex gap-2 items-center px-3 py-2 mb-3 rounded-xl",
              "bg-gradient-to-r from-secondary/10 to-accent/10",
              "border border-secondary/20 backdrop-blur-sm",
              "animate-in slide-in-from-bottom-2 duration-300"
            )}>
              <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center">
                <Search className="w-3 h-3 text-secondary" />
              </div>
              <span className="text-xs font-medium text-secondary">
                Web search enabled
              </span>
            </div>
          )}

          {/* Selected Text Preview */}
          {selectedTextPreview && selectedTextPreview.isVisible && (
            <div className={cn(
              "p-3 mb-3 rounded-xl border backdrop-blur-sm",
              "bg-gradient-to-r from-accent/10 to-primary/10",
              "border-accent/20 animate-in slide-in-from-bottom-2 duration-300"
            )}>
              <div className="flex gap-2 justify-between items-start mb-2">
                <div className="flex gap-2 items-center text-xs text-muted-foreground">
                  <span className="text-accent">📄</span>
                  <span>Selected from {new URL(selectedTextPreview.url).hostname}</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={clearSelectedText}
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6 hover:bg-destructive/20 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Clear selected text
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed break-words">
                "{selectedTextPreview.truncatedText}"
              </p>
            </div>
          )}
          
          <div className="flex gap-2 items-stretch min-h-[48px] w-full max-w-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "relative overflow-hidden group transition-all duration-300 flex-shrink-0",
                    "border-2 hover:scale-105 px-3 h-12",
                    isWebSearchEnabled 
                      ? "bg-gradient-secondary text-background border-secondary shadow-glow-secondary" 
                      : "border-border/50 hover:border-secondary/50 hover:shadow-glow-secondary/20"
                  )}
                >
                  {isWebSearchEnabled ? (
                    <Search className="w-4 h-4" />
                  ) : (
                    <SearchX className="w-4 h-4" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <div className="text-center">
                  <div className="font-medium">
                    {isWebSearchEnabled ? "Web Search: ON" : "Web Search: OFF"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {isWebSearchEnabled 
                      ? "AI will search the web for current information" 
                      : "AI will use only its training data"}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
            
            <div className="flex-1 min-w-0">
              <Input
                ref={inputRef}
                placeholder={selectedTextPreview 
                  ? "Ask about the selected text..." 
                  : (isWebSearchEnabled ? "🔍 Web search enabled - Type your message..." : "Type your message...")}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className={cn(
                  "text-sm h-12 px-4 rounded-2xl border-2 transition-all duration-300 w-full",
                  "bg-background/50 backdrop-blur-sm resize-none",
                  "focus:border-primary/50 focus:shadow-glow-primary/20",
                  "placeholder:text-muted-foreground/70"
                )}
              />
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={isLoading ? handleCancelRequest : handleSendMessage}
                  disabled={!canSend && !isLoading}
                  size="sm"
                  className={cn(
                    "relative overflow-hidden group h-12 px-4 flex-shrink-0",
                    isLoading 
                      ? "bg-destructive hover:bg-destructive/90 hover:shadow-glow-destructive"
                      : "bg-gradient-primary hover:shadow-glow-primary",
                    "transition-all duration-300 hover:scale-105",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  )}
                >
                  {isLoading ? (
                    <Square className="w-4 h-4" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {isLoading ? "Cancel request" : "Send message (Enter)"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className='h-36'>

        </div>

      </div>
    </TooltipProvider>
  )
}