"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChatMessage } from "./message"
import { ChatInput } from "./chat-input"
import { useTheme } from "next-themes"
import { sendMessage, Message as ChatServiceMessage } from "@/lib/chat-service"

// Create a custom event for tab switching
export const switchToAnalysisTab = () => {
  const event = new CustomEvent('switchToAnalysisTab');
  window.dispatchEvent(event);
}

// Create a custom event for dream analysis
export const analyzeDream = (content: string, id: string) => {
  const event = new CustomEvent('analyzeDream', { 
    detail: { content, id } 
  });
  window.dispatchEvent(event);
  switchToAnalysisTab(); // Also trigger tab switch
}

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function ChatContainer({ dreamId: initialDreamId, dreamContent }: { dreamId?: string, dreamContent?: string }) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentMessage, setCurrentMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your dream analysis AI. Share your dream with me, and I'll help you understand its deeper meaning. ",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [dreamId, setDreamId] = useState(initialDreamId)
  const { theme } = useTheme()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      text: message,
      isUser: true,
      timestamp: new Date(),
    }

    // Update messages immediately with user message
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setCurrentMessage("");

    try {
      // Convert messages to chat service format
      const chatMessages: ChatServiceMessage[] = messages.map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));

      // Add the new message
      chatMessages.push({
        role: 'user' as const,
        content: message
      });

      // Send to chat service
      const response = await sendMessage(chatMessages);
      
      const aiMessage: Message = {
        text: response.content,
        isUser: false,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage: Message = {
        text: "I apologize, but I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const handleAnalyzeDream = (event: CustomEvent<{ content: string, id: string }>) => {
      const { content, id } = event.detail;
      setCurrentMessage(content);
      // Set the dream ID when analyzing
      if (id) {
        setDreamId(id);
      }
      // Reset messages to initial state before starting new analysis
      setMessages([{
        text: "Hello! I'm your dream analysis AI. Share your dream with me, and I'll help you understand its deeper meaning. ",
        isUser: false,
        timestamp: new Date(),
      }]);
      handleSendMessage(content);
    };

    window.addEventListener('analyzeDream', handleAnalyzeDream as EventListener);
    return () => {
      window.removeEventListener('analyzeDream', handleAnalyzeDream as EventListener);
    };
  }, [handleSendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleNewChat = () => {
    setMessages([{
      text: "Hello! I'm your dream analysis AI. Share your dream with me, and I'll help you understand its deeper meaning. ",
      isUser: false,
      timestamp: new Date(),
    }]);
    setCurrentMessage("");
    setDreamId(undefined);
  };

  const handleSaveChat = () => {
    if (!dreamId) return;
    
    const chatContent = messages.map(msg => `${msg.isUser ? 'You' : 'AI'}: ${msg.text}`).join('\n');
    
    try {
      // Get existing entries
      const saved = localStorage.getItem('journalEntries');
      if (saved) {
        const entries = JSON.parse(saved) as JournalEntry[];
        const dreamEntry = entries.find((entry: JournalEntry) => entry.id === dreamId);
        if (dreamEntry) {
          // Remove any existing chat discussion
          let content = dreamEntry.content;
          const chatIndex = content.indexOf('\n\n--- Chat Discussion ---\n');
          if (chatIndex !== -1) {
            content = content.substring(0, chatIndex);
          }
          
          // Add the new chat discussion
          dreamEntry.content = content + '\n\n--- Chat Discussion ---\n' + chatContent;
          localStorage.setItem('journalEntries', JSON.stringify(entries));
          
          // Dispatch custom event to notify of the update
          const event = new CustomEvent('journalEntriesUpdated', {
            detail: { entries: entries }
          });
          window.dispatchEvent(event);
        }
      }
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background/50 overflow-hidden" data-chat-container>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <div className="flex flex-col py-4 space-y-4 w-full max-w-4xl mx-auto pl-6 pr-3">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.text}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="flex-none border-t w-full">
        <div className="max-w-4xl mx-auto pl-6 pr-3 w-full">
          <ChatInput 
            onSend={handleSendMessage} 
            onSaveChat={dreamId ? handleSaveChat : undefined}
            onNew={handleNewChat}
            disabled={isLoading}
            placeholder="Share your dream..."
            value={currentMessage}
            onChange={setCurrentMessage}
          />
        </div>
      </div>
    </div>
  )
}

interface JournalEntry {
  id: string;
  content: string;
  timestamp: Date;
  title: string;
}
