"use client"

import { useState, useEffect, useMemo } from "react"
import { Clock, Trash2, X, BookOpen, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { analyzeDream } from "@/lib/dream-analysis"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DreamEntryType } from "@/types/dream"

interface HistoryContainerProps {
  entries: DreamEntryType[];
  onEntriesChange: (entries: DreamEntryType[]) => void;
  onDreamSelect?: (dream: { id: string, content: string }) => void;
}

export function HistoryContainer({ entries, onEntriesChange, onDreamSelect }: HistoryContainerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<DreamEntryType | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)

  const filteredEntries = useMemo(() => {
    if (!searchQuery) return entries
    const query = searchQuery.toLowerCase()
    return entries.filter(
      entry => 
        entry.title.toLowerCase().includes(query) || 
        entry.content.toLowerCase().includes(query)
    )
  }, [entries, searchQuery])

  // Function to delete an entry permanently
  const handleDeleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id)
    onEntriesChange(updatedEntries)
  }

  // Function to restore entry to journal
  const handleRestoreToJournal = (id: string) => {
    const updatedEntries = entries.map(entry => 
      entry.id === id 
        ? { ...entry, showInJournal: true }
        : entry
    )
    onEntriesChange(updatedEntries)
  }

  // Function to handle analyze click
  const handleAnalyzeClick = (entry: DreamEntryType) => {
    if (onDreamSelect) {
      onDreamSelect({ id: entry.id, content: entry.content });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none flex items-center justify-between px-6 py-3 border-b bg-muted/50">
        <h2 className="text-lg font-semibold">Dream History</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="group relative bg-card rounded-lg p-4 shadow-sm hover:shadow transition-shadow cursor-pointer"
              onClick={() => setSelectedEntry(entry)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-medium">{entry.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {entry.date.toLocaleDateString()}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {entry.tags && entry.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-muted rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div className="text-sm">
                      <div className="font-medium">Lucidity</div>
                      <div className="flex items-center mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full mr-1 ${
                              i < entry.lucidityLevel ? 'bg-purple-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">Mood</div>
                      <div className="flex items-center mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full mr-1 ${
                              i < entry.moodLevel ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">Clarity</div>
                      <div className="flex items-center mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full mr-1 ${
                              i < entry.clarity ? 'bg-blue-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!entry.showInJournal && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestoreToJournal(entry.id);
                      }}
                      className="text-green-500 hover:text-green-600"
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEntry(entry.id);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAnalyzeClick(entry)
                    }}
                    size="sm"
                    variant="outline"
                    className="h-7"
                  >
                    Analyse
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {filteredEntries.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
              <Clock className="h-12 w-12 mb-4" />
              <h3 className="font-semibold mb-2">No history yet</h3>
              <p className="text-sm">Your dream analysis history will appear here.</p>
            </div>
          )}
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

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-sm">
                <div className="font-medium">Lucidity</div>
                <div className="flex items-center mt-1">
                  {selectedEntry && Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full mr-1 ${
                        i < selectedEntry.lucidityLevel ? 'bg-purple-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Mood</div>
                <div className="flex items-center mt-1">
                  {selectedEntry && Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full mr-1 ${
                        i < selectedEntry.moodLevel ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Clarity</div>
                <div className="flex items-center mt-1">
                  {selectedEntry && Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full mr-1 ${
                        i < selectedEntry.clarity ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {selectedEntry?.analysis && (
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

          <DialogFooter>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                onClick={() => {
                  if (selectedEntry) {
                    handleAnalyzeClick(selectedEntry);
                    setSelectedEntry(null);
                  }
                }}
              >
                <Brain className="h-4 w-4 mr-2" />
                Analyze Dream
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
