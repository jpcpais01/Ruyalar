"use client"

import { useState, useMemo, useEffect } from "react"
import { BookOpen, Plus, FileText, Search, Trash2, Brain, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Define a type for journal entries
interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: Date;
  analysis?: {
    messages: {
      text: string;
      isUser: boolean;
      timestamp: Date;
    }[];
    lastUpdated: Date;
  };
}

interface JournalContainerProps {
  entries: JournalEntry[];
  onEntriesChange: (entries: JournalEntry[]) => void;
  onAnalyze: (id: string, content: string) => void;
}

export function JournalContainer({ entries, onEntriesChange, onAnalyze }: JournalContainerProps) {
  // State for new entry dialog
  const [open, setOpen] = useState(false)
  
  // State for new entry being created
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: ''
  })

  // State for search query
  const [searchQuery, setSearchQuery] = useState('');

  // State for selected entry
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)

  // State for showing analysis
  const [showAnalysis, setShowAnalysis] = useState(false)

  // Function to handle adding a new journal entry
  const handleAddEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;
    
    const entry = {
      id: crypto.randomUUID(),
      title: newEntry.title,
      content: newEntry.content,
      date: new Date()
    };

    const updatedEntries = [entry, ...entries]
    onEntriesChange(updatedEntries)
    
    setNewEntry({ title: '', content: '' }); // Reset form
    setOpen(false); // Close dialog
  };

  // Function to delete an entry
  const handleDeleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id)
    onEntriesChange(updatedEntries)
  }

  // Function to handle analyze click
  const handleAnalyzeClick = (entry: JournalEntry) => {
    const event = new CustomEvent('analyzeDream', {
      detail: { content: entry.content, id: entry.id }
    });
    window.dispatchEvent(event);
  };

  // Filtered entries based on search query
  const filteredEntries = useMemo(() => {
    if (!searchQuery) return entries
    const query = searchQuery.toLowerCase()
    return entries.filter(
      entry => 
        entry.title.toLowerCase().includes(query) || 
        entry.content.toLowerCase().includes(query)
    )
  }, [entries, searchQuery])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none flex flex-col gap-4 px-6 py-4 bg-background/80 backdrop-blur-sm border-b">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg">
              <Plus className="h-5 w-5 mr-2" />
              New Dream Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Your Dream</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Give your dream a title..."
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
              />
              <Textarea
                placeholder="Describe your dream in detail..."
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                className="min-h-[200px]"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleAddEntry} 
                  disabled={!newEntry.title || !newEntry.content}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Save Dream
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dreams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20">
          <div className="min-h-full px-6 py-4 space-y-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="group relative bg-card hover:bg-accent rounded-lg p-4 transition-colors border shadow-sm"
                onClick={() => {
                  setSelectedEntry(entry)
                  setShowAnalysis(false)
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-lg">{entry.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{entry.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.date.toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} • {entry.date.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAnalyzeClick(entry)
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Analyse
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteEntry(entry.id)
                      }}
                      variant="destructive"
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {entry.analysis && (
                  <div className="mt-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedEntry(entry)
                        setShowAnalysis(true)
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      View Analysis • {entry.analysis.lastUpdated.toLocaleString()}
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {filteredEntries.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mb-4" />
                <h3 className="font-semibold mb-2">No dreams yet</h3>
                <p className="text-sm">Start journaling your dreams by clicking the New Dream Entry button above.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={selectedEntry !== null} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>{selectedEntry?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pt-4">
            <div className="space-y-2">
              <h4 className="font-medium">Dream Content</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedEntry?.content}</p>
            </div>
            {selectedEntry?.analysis && showAnalysis && (
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-medium">Analysis</h4>
                <div className="space-y-4">
                  {selectedEntry.analysis.messages.map((message, index) => (
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
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
