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
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { getApiEndpoint } from '@/lib/api-config'
import { SelectedTextPreview, ClearSelectedTextMessage, TextSelectionUpdateMessage, GetSelectedTextMessage, MessageResponse } from '@/types/messaging'


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
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentPlaceholder, setCurrentPlaceholder] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [selectedTextPreview, setSelectedTextPreview] = useState<SelectedTextPreview | null>(null)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const placeholderIntervalRef = useRef<NodeJS.Timeout | null>(null)

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

  // Listen for text selection messages from background script
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
        if (response.success && response.data && response.data.text) {
          const preview: SelectedTextPreview = {
            originalText: response.data.text,
            truncatedText: truncateToTwoLines(response.data.text),
            url: response.data.url,
            timestamp: response.data.timestamp,
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

    // Format the message properly if there's selected text
    let formattedMessage = currentMessage.trim();
    if (selectedTextPreview && selectedTextPreview.isVisible) {
      formattedMessage = `Context: "${selectedTextPreview.originalText}"\n\nUser request: ${currentMessage.trim()}`;
    }

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: formattedMessage,
      sender: 'user',
      timestamp: new Date()
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    saveMessages(selectedChatId, newMessages)
    updateChatHistory(userMessage.content)

    const messageToSend = formattedMessage
    setCurrentMessage('')
    clearSelectedTextPreview() // Clear selected text preview after sending
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

      // Clean the AI response by removing </s> tags
      const cleanResponse = (data.content?.[0]?.text || data.message || "No response").replace(/<\/s>$/g, '').trim()

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
              <div className="h-60 sm:h-60"></div>
            </div>
          )}
          </ScrollArea>
        </div>

        {/* Fixed Input Area at Bottom */}
        <div className="flex-shrink-0 p-2 sm:p-4 border-t bg-background/95 backdrop-blur-sm sticky bottom-0 z-10">
          {/* Selected Text Preview */}
          {selectedTextPreview && selectedTextPreview.isVisible && (
            <div className="mb-3 p-3 bg-muted/30 border border-primary/20 rounded-lg">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-primary">📄</span>
                  <span>Selected text from {new URL(selectedTextPreview.url).hostname}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelectedTextPreview}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  ×
                </Button>
              </div>
              <div className="text-sm text-foreground/80 leading-relaxed">
                {selectedTextPreview.truncatedText}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                💡 Add your request below to ask about this text
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder={selectedTextPreview ? "What would you like to know about the selected text?" : "Type your message..."}
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