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
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { getApiEndpoint } from '@/lib/api-config'
import { SEARCH_MARKER, AI_RESPONSE_CLEANUP_PATTERNS } from '@/lib/constants'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import {
  SelectedTextPreview,
  ClearSelectedTextMessage,
  TextSelectionUpdateMessage,
  GetSelectedTextMessage,
  MessageResponse
} from '@/types/messaging'
import { useChatStore, ChatMessage } from '@/stores/chat-store'
import type { TextSelectionData } from '@/types/messaging'


interface ChatInterfaceProps {
  className?: string
  userAddress: string
}

// Cortensor-themed placeholder texts for AI thinking state
const CORTENSOR_PLACEHOLDER_TEXTS = [
  "Analyzing neural pathways for optimal response...",
  "Connecting to decentralized AI nodes...",
  "Processing through distributed neural networks...",
  "Syncing with blockchain-verified intelligence...",
  "Validating response integrity on-chain...",
  "Routing through fastest available AI nodes...",
  "Ensuring response accuracy via consensus mechanism...",
  "Generating response using federated learning models...",
  "Coordinating with global AI network for best answer...",
  "Processing through edge computing nodes...",
  "Validating computational proofs...",
  "Optimizing neural pathways for efficiency...",
  "Connecting to specialized AI workers...",
  "Ensuring response decentralization..."
]

export function ChatInterface({ className, userAddress }: ChatInterfaceProps) {
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentPlaceholder, setCurrentPlaceholder] = useState('')
  const [selectedTextPreview, setSelectedTextPreview] = useState<SelectedTextPreview | null>(null)
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const placeholderIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Zustand store
  const store = useChatStore()
  const currentTabData = store.getCurrentTabData()
  const messages = currentTabData?.messages || []
  const chatHistory = currentTabData?.chatHistory || []
  const selectedChatId = currentTabData?.selectedChatId || null

  // Get current tab URL on mount
  useEffect(() => {
    const getCurrentTab = async () => {
      try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true })
        if (tabs[0]?.id && tabs[0]?.url) {
          store.setCurrentTab(tabs[0].id.toString(), tabs[0].url)
        }
      } catch (error) {
        console.error('Failed to get current tab:', error)
      }
    }
    getCurrentTab()
  }, [])

  // Utility function to truncate text to approximately two lines
  const truncateToTwoLines = (text: string): string => {
    const words = text.split(' ');
    // Approximate 15-20 words per line for typical UI
    const maxWords = 30;
    if (words.length <= maxWords) {
      return text;
    }
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Function to clear selected text preview
  const clearSelectedTextPreview = (): void => {
    setSelectedTextPreview(null);
    browser.runtime.sendMessage({ type: 'CLEAR_SELECTED_TEXT' } as ClearSelectedTextMessage)
      .catch((error) => {
        console.error('Failed to clear selected text:', error);
      });
  };



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

  // Listen for text selection and website content messages from background script
  useEffect(() => {
    const handleMessage = (message: TextSelectionUpdateMessage) => {
      if (message.type === 'TEXT_SELECTION_UPDATE') {
        const { text, url, timestamp } = message.data;
        if (text && text.trim()) {
          const preview: SelectedTextPreview = {
            originalText: text,
            truncatedText: truncateToTwoLines(text),
            url,
            timestamp,
            isVisible: true
          };
          setSelectedTextPreview(preview);
          // Focus the input field
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }
      }
    };

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

  // Listen for chat switch events
  useEffect(() => {
    const handleChatSwitch = (event: CustomEvent) => {
      const { chatId } = event.detail
      // The store will handle loading the chat automatically
    }

    window.addEventListener('chatSwitched', handleChatSwitch as EventListener)

    return () => {
      window.removeEventListener('chatSwitched', handleChatSwitch as EventListener)
    }
  }, [])

  const handleSendMessage = async () => {
    // Allow sending if there's either a message or selected text
    const hasMessage = currentMessage.trim()
    const hasSelectedText = selectedTextPreview && selectedTextPreview.isVisible

    if ((!hasMessage && !hasSelectedText) || isLoading) return

    if (!selectedChatId) {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true })
      if (tabs[0]?.id) {
        const newChatId = store.createNewChat(tabs[0].id.toString())
        // Wait for state to update
        setTimeout(() => handleSendMessage(), 100)
        return
      }
    }

    // Format the message properly
    let formattedMessage = hasMessage ? currentMessage.trim() : 'tell me about this'

    // Add search marker if web search is enabled
    if (isWebSearchEnabled) {
      formattedMessage = `${SEARCH_MARKER} ${formattedMessage}`
    }

    if (hasSelectedText) {
      formattedMessage = `Context: "${selectedTextPreview.originalText}"\n\nUser request: ${formattedMessage}`;
    }

    // Add user message to store (without search marker for display)
    const displayMessage = formattedMessage.replace(new RegExp(`^${SEARCH_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\s*`), '')
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    if (tabs[0]?.id && selectedChatId) {
      store.addMessage(tabs[0].id.toString(), selectedChatId, {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: displayMessage,
        sender: 'user',
        timestamp: new Date()
      })
    }

    const messageToSend = formattedMessage
    setCurrentMessage('')
    clearSelectedTextPreview() // Clear selected text preview after sending
    setIsLoading(true)

    try {
      // Send the current message with chatId for memory context
      const response = await fetch(getApiEndpoint(`/api/chat?userAddress=${encodeURIComponent(userAddress)}&chatId=${encodeURIComponent(selectedChatId || '')}`), {
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

      // Clean the AI response by removing unwanted patterns
      let cleanResponse = data.content?.[0]?.text || data.message || "No response"
      
      // Apply cleanup patterns
      Object.values(AI_RESPONSE_CLEANUP_PATTERNS).forEach(pattern => {
        cleanResponse = cleanResponse.replace(pattern, '')
      })
      
      cleanResponse = cleanResponse.trim()

      // Add AI message to store
      const tabs = await browser.tabs.query({ active: true, currentWindow: true })
      if (tabs[0]?.id && selectedChatId) {
        store.addMessage(tabs[0].id.toString(), selectedChatId, {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: cleanResponse,
          sender: 'ai',
          timestamp: new Date()
        })
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      // Add error message to store
      const tabs = await browser.tabs.query({ active: true, currentWindow: true })
      if (tabs[0]?.id && selectedChatId) {
        store.addMessage(tabs[0].id.toString(), selectedChatId, {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: "Sorry, I encountered an error processing your message. Please try again.",
          sender: 'ai',
          timestamp: new Date()
        })
      }
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
      browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if (tabs[0]?.id) {
          store.createNewChat(tabs[0].id.toString())
        }
      })
    }
  }, [selectedChatId, chatHistory.length, store])

  // Check if send button should be enabled
  const canSend = (currentMessage.trim() || (selectedTextPreview && selectedTextPreview.isVisible)) && !isLoading

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
            onClick={() => {
              const tabs = browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
                if (tabs[0]?.id) {
                  store.createNewChat(tabs[0].id.toString())
                }
              })
            }}
            size="sm"
            className="p-0 w-8 h-8"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col p-0 h-full">
        {/* Messages Area */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="p-2 h-full sm:p-4" ref={scrollAreaRef}>
            {messages.length === 0 && !isLoading ? (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <div className="text-center">
                  <Bot className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
                  <p className="mb-4 text-muted-foreground">
                    Start a conversation by typing a message below.
                  </p>
                  {/* Ask AI about site button when no text is highlighted */}

                </div>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-4">
                {messages.map((message: ChatMessage) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 sm:gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'ai' && (
                      <div className="flex-shrink-0">
                        <div className="flex justify-center items-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10">
                          <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                        </div>
                      </div>
                    )}

                    <div className={`max-w-[85%] sm:max-w-[80%] ${message.sender === 'user' ? 'order-first' : ''}`}>
                      <div className={`rounded-lg px-2 py-1.5 sm:px-4 sm:py-2 ${message.sender === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                        }`}>
                        {message.sender === 'ai' ? (
                          <MarkdownRenderer content={message.content} className="prose-sm max-w-none text-xs sm:text-sm" />
                        ) : (
                          <p className="whitespace-pre-wrap text-xs sm:text-sm break-words">{message.content}</p>
                        )}
                      </div>

                      <div className={`flex items-center gap-2 mt-0.5 sm:mt-1 text-xs text-muted-foreground ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <span>{formatDistanceToNow(message.timestamp, { addSuffix: true })}</span>
                      </div>
                    </div>

                    {message.sender === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="flex justify-center items-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading placeholder */}
                {isLoading && (
                  <div className="flex gap-2 sm:gap-3 justify-start">
                    <div className="flex-shrink-0">
                      <div className="flex justify-center items-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10">
                        <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      </div>
                    </div>

                    <div className="max-w-[85%] sm:max-w-[80%]">
                      <div className="px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-muted">
                        <div className="flex gap-2 items-center">
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-muted-foreground" />
                          <p className="text-xs sm:text-sm italic text-muted-foreground break-words">
                            {currentPlaceholder}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Spacer to ensure content is not hidden behind input */}
                <div className="h-4 sm:h-6"></div>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Fixed Input Area at Bottom */}
        <div className="sticky bottom-0 z-10 flex-shrink-0 p-2 border-t backdrop-blur-sm sm:p-4 bg-background/95">
          {/* Web Search Status Indicator */}
          {isWebSearchEnabled && (
            <div className="p-2 mb-2 rounded-lg border bg-primary/10 border-primary/20">
              <div className="flex gap-2 items-center text-xs text-primary">
                <Search className="w-3 h-3" />
                <span>Web search is enabled - Your queries will include web search results</span>
              </div>
            </div>
          )}

          {/* Selected Text Preview */}
          {selectedTextPreview && selectedTextPreview.isVisible && (
            <div className="p-3 mb-3 rounded-lg border bg-muted/30 border-primary/20">
              <div className="flex gap-2 justify-between items-start mb-2">
                <div className="flex gap-2 items-center text-xs text-muted-foreground">
                  <span className="text-primary">📄</span>
                  <span>Selected text from {new URL(selectedTextPreview.url).hostname}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelectedTextPreview}
                  className="p-0 w-6 h-6 text-muted-foreground hover:text-foreground"
                >
                  ×
                </Button>
              </div>
              <div className="text-sm leading-relaxed text-foreground/80">
                {selectedTextPreview.truncatedText}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                💡 Add your request below to ask about this text (or leave empty for "tell me about this")
              </div>
            </div>
          )}



          <div className="flex gap-2">
            <div className="flex flex-1 gap-2 items-center">
              <Input
                ref={inputRef}
                placeholder={selectedTextPreview 
                   ? "What would you like to know about the selected text?" 
                   : isWebSearchEnabled 
                     ? "🔍 Web search enabled - Type your message..." 
                     : "Type your message..."
                 }
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 text-sm sm:text-base"
              />
              <Button
                onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
                variant={isWebSearchEnabled ? "default" : "outline"}
                size="sm"
                className={cn(
                  "px-3 transition-colors shrink-0",
                  isWebSearchEnabled 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "hover:bg-muted"
                )}
                title={isWebSearchEnabled ? "Web search enabled - Click to disable" : "Web search disabled - Click to enable"}
              >
                {isWebSearchEnabled ? (
                  <Search className="w-4 h-4" />
                ) : (
                  <SearchX className="w-4 h-4" />
                )}
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!canSend}
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