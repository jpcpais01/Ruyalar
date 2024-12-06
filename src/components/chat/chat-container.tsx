"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"
import { analyzeDream, resetConversation } from "@/lib/dream-analysis"

interface Message {
  text: string
  isUser: boolean
  timestamp: Date
}

interface ChatContainerProps {
  dreamId?: string
  dreamContent?: string
  onAnalysisComplete?: (dreamId: string, messages: Message[]) => void
  onNewChat?: () => void
}

export function ChatContainer({ dreamId, dreamContent, onAnalysisComplete, onNewChat }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initialDreamProcessed = useRef(false)

  // Reset state when dream changes
  useEffect(() => {
    if (dreamId) {
      setMessages([])
      initialDreamProcessed.current = false
      resetConversation()
    }
  }, [dreamId])

  // Process initial dream content
  useEffect(() => {
    const processDream = async () => {
      if (dreamContent && dreamId) {
        setMessages([])
        resetConversation()
        
        const userMessage = { text: dreamContent, isUser: true, timestamp: new Date() }
        
        setIsLoading(true)
        try {
          const analysis = await analyzeDream(dreamContent)
          const aiMessage = { text: analysis, isUser: false, timestamp: new Date() }
          const newMessages = [userMessage, aiMessage]
          
          setMessages(newMessages)
        } catch (error) {
          console.error('Error analyzing dream:', error)
          const errorMessage = {
            text: 'Sorry, I encountered an error while analyzing your dream. Please try again.',
            isUser: false,
            timestamp: new Date()
          }
          setMessages([userMessage, errorMessage])
        } finally {
          setIsLoading(false)
        }
      }
    }

    processDream()
  }, [dreamContent, dreamId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return

    const userMessage = { text: currentMessage, isUser: true, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setCurrentMessage("")
    setIsLoading(true)

    try {
      const analysis = await analyzeDream(currentMessage)
      const aiMessage = { text: analysis, isUser: false, timestamp: new Date() }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error analyzing message:', error)
      const errorMessage = {
        text: 'Sorry, I encountered an error while processing your message. Please try again.',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
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

  const handleNewChat = () => {
    setMessages([])
    resetConversation()
    setCurrentMessage("")
    initialDreamProcessed.current = false
    if (onNewChat) {
      onNewChat()
    }
  }

  return (
    <div className="flex flex-col h-full max-h-full">
      <div className="flex-none flex items-center justify-between px-6 py-3 border-b bg-muted/50">
        <h2 className="text-lg font-semibold">Dream Analysis</h2>
        <div className="flex gap-2">
          {dreamId && messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (dreamId && onAnalysisComplete) {
                  onAnalysisComplete(dreamId, messages)
                }
              }}
            >
              Save Analysis
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
          >
            New Chat
          </Button>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20">
          <div className="px-6 py-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[85%] ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="flex-none p-4 border-t bg-background">
        <div className="flex gap-2">
          <Textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a question about your dream..."
            className="min-h-[60px] max-h-[180px]"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isLoading}
            className="px-4"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
