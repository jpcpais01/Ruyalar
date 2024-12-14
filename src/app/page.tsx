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
import { DreamEntryType } from "@/types/dream"

class DreamEntry implements DreamEntryType {
  id: string
  title: string
  content: string
  date: Date
  lucidityLevel: number
  moodLevel: number
  emotions: string[]
  clarity: number
  analysis?: {
    messages: {
      text: string
      isUser: boolean
      timestamp: Date
    }[]
    lastUpdated: Date
  }
  messages: {
    text: string
    isUser: boolean
    timestamp: Date
  }[]
  text: string
  isUser: boolean
  timestamp: Date
  lastUpdated: Date
  showInJournal: boolean
  tags: string[]

  constructor(data: Partial<DreamEntryType> = {}) {
    this.id = data.id || crypto.randomUUID()
    this.title = data.title || ''
    this.content = data.content || ''
    this.date = data.date || new Date()
    this.lucidityLevel = data.lucidityLevel || 1
    this.moodLevel = data.moodLevel || 3
    this.emotions = data.emotions || []
    this.clarity = data.clarity || 3
    this.analysis = data.analysis
    this.messages = data.messages || []
    this.text = data.text || ''
    this.isUser = data.isUser || false
    this.timestamp = data.timestamp || new Date()
    this.lastUpdated = data.lastUpdated || new Date()
    this.showInJournal = data.showInJournal ?? true
    this.tags = data.tags || []
  }
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const [currentSlide, setCurrentSlide] = useState(1)
  const [previousSlide, setPreviousSlide] = useState(1)
  const [journalOpen, setJournalOpen] = useState(false)
  const [entries, setEntries] = useState<DreamEntry[]>([])
  const [selectedDream, setSelectedDream] = useState<{ id: string, content: string } | null>(null)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    axis: "x",
    dragFree: false,
    containScroll: "trimSnaps",
    align: "center",
    skipSnaps: false,
    startIndex: 1 // Start at Journal page
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
      setPreviousSlide(currentSlide); // Store current slide
      scrollTo(0); // Switch to analysis tab
    };

    window.addEventListener('analyzeDream', handleAnalyzeDream as EventListener);
    return () => {
      window.removeEventListener('analyzeDream', handleAnalyzeDream as EventListener);
    };
  }, [scrollTo, currentSlide]);

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load entries on mount
  useEffect(() => {
    const loadedEntries = localStorage.getItem('dreamEntries');
    if (loadedEntries) {
      try {
        const parsed = JSON.parse(loadedEntries);
        const entriesWithDates = parsed.map((entry: Omit<DreamEntryType, 'date' | 'analysis'> & {
          date: string;
          analysis?: {
            messages: {
              text: string;
              isUser: boolean;
              timestamp: string;
            }[];
            lastUpdated: string;
          };
        }) => new DreamEntry({
          ...entry,
          date: new Date(entry.date),
          tags: entry.tags || [], // Ensure tags are always present
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
    const entriesWithDates = newEntries.map(entry => new DreamEntry({
      ...entry,
      date: entry.date instanceof Date ? entry.date : new Date(entry.date),
      tags: entry.tags || [], // Ensure tags are always present
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
      tags: entry.tags || [], // Ensure tags are always present
      analysis: entry.analysis ? {
        ...entry.analysis,
        messages: entry.analysis.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        })),
        lastUpdated: entry.analysis.lastUpdated.toISOString()
      } : undefined
    }));
    const json = JSON.stringify(entriesForStorage);
    const regex = /<[^>]*>/g;
    const cleanJson = json.replace(regex, '');
    localStorage.setItem('dreamEntries', cleanJson);
  }, []);

  const handleDreamAnalysis = useCallback((dreamId: string, messages: { text: string; isUser: boolean; timestamp: Date }[]) => {
    setEntries(prevEntries => {
      const entryIndex = prevEntries.findIndex(entry => entry.id === dreamId);
      if (entryIndex === -1) return prevEntries;

      const newEntries = [...prevEntries];
      newEntries[entryIndex] = new DreamEntry({
        ...newEntries[entryIndex],
        analysis: {
          messages,
          lastUpdated: new Date()
        }
      });

      // Save to localStorage with proper date handling
      const entriesForStorage = newEntries.map(entry => ({
        ...entry,
        date: entry.date.toISOString(),
        tags: entry.tags || [], // Ensure tags are always present
        analysis: entry.analysis ? {
          ...entry.analysis,
          messages: entry.analysis.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          })),
          lastUpdated: entry.analysis.lastUpdated.toISOString()
        } : undefined
      }));
      const json = JSON.stringify(entriesForStorage);
      const regex = /<[^>]*>/g;
      const cleanJson = json.replace(regex, '');
      localStorage.setItem('dreamEntries', cleanJson);
      return newEntries;
    });
  }, []);

  const handleJournalAnalyze = useCallback((id: string, content: string) => {
    const messages = [{
      text: content,
      isUser: true,
      timestamp: new Date()
    }];
    handleDreamAnalysis(id, messages);
  }, [handleDreamAnalysis]);

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

  if (!mounted) return null

  return (
    <main className="fixed inset-0 flex flex-col bg-background">
      <div className="flex-none p-4 flex items-center justify-between border-b">
        <h1 className="text-xl font-bold">Rüyalar</h1>
        <ThemeToggle />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="embla h-full">
          <div className="embla__viewport h-full" ref={emblaRef}>
            <div className="embla__container h-full">
              <div className="embla__slide h-full overflow-hidden">
                <ChatContainer
                  dreamId={selectedDream?.id}
                  dreamContent={selectedDream?.content}
                  onAnalysisComplete={handleDreamAnalysis}
                  onNewChat={handleNewChat}
                />
              </div>
              <div className="embla__slide h-full overflow-hidden">
                <JournalContainer
                  entries={entries}
                  onEntriesChange={handleEntriesUpdate}
                  onAnalyze={handleJournalAnalyze}
                />
              </div>
              <div className="embla__slide h-full overflow-hidden">
                <HistoryContainer
                  entries={entries}
                  onEntriesChange={handleEntriesUpdate}
                  onDreamSelect={({ id, content }) => {
                    setSelectedDream({ id, content });
                    scrollTo(0); // Switch to analysis tab
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-none border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="flex justify-around py-2 px-safe">
          <NavButton
            icon={Brain}
            label="AI Analysis"
            isActive={currentSlide === 0}
            onClick={() => scrollTo(0)}
          />
          <NavButton
            icon={BookOpen}
            label="Journal"
            isActive={currentSlide === 1}
            onClick={() => scrollTo(1)}
          />
          <NavButton
            icon={Clock}
            label="History"
            isActive={currentSlide === 2}
            onClick={() => scrollTo(2)}
          />
        </nav>
      </div>
    </main>
  )
}
