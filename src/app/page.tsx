"use client"

import { useEffect, useState, useCallback, memo } from "react"
import { useTheme } from "next-themes"
import { ThemeToggle } from "@/components/theme-toggle"
import { NavButton } from "@/components/nav-button"
import { ChatContainer } from "@/components/chat/chat-container"
import { JournalContainer } from "@/components/journal/journal-container"
import { HistoryContainer } from "@/components/history/history-container"
import useEmblaCarousel from "embla-carousel-react"
import { Brain, BookOpen, Clock } from "lucide-react"
import { JournalDialog } from "@/components/journal/journal-dialog"

interface DreamEntry {
  id: string
  title: string
  content: string
  date: Date
  analysis?: {
    messages: {
      text: string
      isUser: boolean
      timestamp: Date
    }[]
    lastUpdated: Date
  }
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [journalOpen, setJournalOpen] = useState(false)
  const [entries, setEntries] = useState<DreamEntry[]>([])
  const [selectedDream, setSelectedDream] = useState<{ id: string, content: string } | null>(null)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false, 
    axis: "x",
    dragFree: true,
    startIndex: 0,
    breakpoints: {
      '(max-width: 768px)': { dragFree: true },
      '(min-width: 769px)': { dragFree: false }
    }
  })

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index)
    setCurrentSlide(index)
  }, [emblaApi])

  useEffect(() => {
    if (emblaApi) {
      const onSelect = () => {
        setCurrentSlide(emblaApi.selectedScrollSnap())
      }
      
      emblaApi.on('select', onSelect)
      emblaApi.on('reInit', onSelect)
      
      return () => {
        emblaApi.off('select', onSelect)
        emblaApi.off('reInit', onSelect)
      }
    }
  }, [emblaApi])

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on('pointerDown', () => {
        // Handle pointer down if needed
      })
      
      emblaApi.on('pointerUp', () => {
        // Handle pointer up if needed
      })
    }
  }, [emblaApi])

  // Handle dream analysis event
  useEffect(() => {
    const handleAnalyzeDream = (event: CustomEvent<{ content: string; id: string }>) => {
      const { content, id } = event.detail;
      setSelectedDream({ id, content });
      scrollTo(0); // Switch to analysis tab
    };

    window.addEventListener('analyzeDream', handleAnalyzeDream as EventListener);
    return () => {
      window.removeEventListener('analyzeDream', handleAnalyzeDream as EventListener);
    };
  }, [scrollTo]);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(0) // Ensure we start at AI Analysis page
    }
  }, [emblaApi])

  // Load entries on mount
  useEffect(() => {
    const loadedEntries = localStorage.getItem('dreamEntries');
    if (loadedEntries) {
      try {
        const parsed = JSON.parse(loadedEntries);
        const entriesWithDates = parsed.map((entry: Omit<DreamEntry, 'date' | 'analysis'> & {
          date: string;
          analysis?: {
            messages: {
              text: string;
              isUser: boolean;
              timestamp: string;
            }[];
            lastUpdated: string;
          };
        }) => ({
          ...entry,
          date: new Date(entry.date),
          analysis: entry.analysis ? {
            ...entry.analysis,
            messages: entry.analysis.messages.map((msg: {
              text: string;
              isUser: boolean;
              timestamp: string;
            }) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })),
            lastUpdated: new Date(entry.analysis.lastUpdated)
          } : undefined
        }));
        setEntries(entriesWithDates);
      } catch (error) {
        console.error('Error loading entries:', error);
      }
    }
  }, []);

  const handleEntriesUpdate = useCallback((newEntries: DreamEntry[]) => {
    // Ensure dates are properly handled
    const entriesWithDates = newEntries.map(entry => ({
      ...entry,
      date: entry.date instanceof Date ? entry.date : new Date(entry.date),
      analysis: entry.analysis ? {
        ...entry.analysis,
        messages: entry.analysis.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
        })),
        lastUpdated: entry.analysis.lastUpdated instanceof Date ? 
          entry.analysis.lastUpdated : new Date(entry.analysis.lastUpdated)
      } : undefined
    }));

    setEntries(entriesWithDates);
    
    // Convert dates to ISO strings for storage
    const entriesForStorage = entriesWithDates.map(entry => ({
      ...entry,
      date: entry.date.toISOString(),
      analysis: entry.analysis ? {
        ...entry.analysis,
        messages: entry.analysis.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        })),
        lastUpdated: entry.analysis.lastUpdated.toISOString()
      } : undefined
    }));
    localStorage.setItem('dreamEntries', JSON.stringify(entriesForStorage));
  }, []);

  const handleDreamAnalysis = useCallback((dreamId: string, messages: { text: string; isUser: boolean; timestamp: Date }[]) => {
    setEntries(prevEntries => {
      const entryIndex = prevEntries.findIndex(entry => entry.id === dreamId);
      if (entryIndex === -1) return prevEntries;

      const newEntries = [...prevEntries];
      newEntries[entryIndex] = {
        ...newEntries[entryIndex],
        analysis: {
          messages,
          lastUpdated: new Date()
        }
      };

      // Save to localStorage with proper date handling
      const entriesForStorage = newEntries.map(entry => ({
        ...entry,
        date: entry.date.toISOString(),
        analysis: entry.analysis ? {
          ...entry.analysis,
          messages: entry.analysis.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          })),
          lastUpdated: entry.analysis.lastUpdated.toISOString()
        } : undefined
      }));
      localStorage.setItem('dreamEntries', JSON.stringify(entriesForStorage));
      return newEntries;
    });
  }, []);

  const handleNewChat = useCallback(() => {
    setSelectedDream(null) // Clear the selected dream when starting a new chat
  }, []);

  useEffect(() => {
    const handleSwitchToAnalysisTab = () => {
      scrollTo(0); // AI Analysis is at index 0
    };

    window.addEventListener('switchToAnalysisTab', handleSwitchToAnalysisTab);
    return () => {
      window.removeEventListener('switchToAnalysisTab', handleSwitchToAnalysisTab);
    };
  }, [scrollTo]);

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-background">
      <header className="flex-none flex items-center justify-between px-6 py-3 border-b">
        <div className="flex items-center space-x-6">
          <NavButton
            icon={Brain}
            label="AI Analysis"
            active={currentSlide === 0}
            onClick={() => scrollTo(0)}
          />
          <NavButton
            icon={BookOpen}
            label="Journal"
            active={currentSlide === 1}
            onClick={() => scrollTo(1)}
          />
          <NavButton
            icon={Clock}
            label="History"
            active={currentSlide === 2}
            onClick={() => scrollTo(2)}
          />
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 relative overflow-hidden">
        <div className="embla h-full" ref={emblaRef}>
          <div className="embla__container h-full">
            <div className="embla__slide h-full">
              <ChatContainer
                dreamId={selectedDream?.id}
                dreamContent={selectedDream?.content}
                onAnalysisComplete={handleDreamAnalysis}
                onNewChat={handleNewChat}
              />
            </div>
            <div className="embla__slide h-full">
              <JournalContainer
                entries={entries}
                onEntriesChange={handleEntriesUpdate}
              />
            </div>
            <div className="embla__slide h-full">
              <HistoryContainer
                entries={entries}
                onEntriesChange={handleEntriesUpdate}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
