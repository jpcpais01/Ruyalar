import { useState, useMemo, useEffect } from "react"
import { BookOpen, Plus, Search, Archive, Brain, X, Pencil, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { JournalDialog } from "./journal-dialog"
import type { DreamEntryType } from "@/types/dream"

// Define a type for journal entries
interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: Date;
  lucidityLevel: number;
  moodLevel: number;
  emotions: string[];
  clarity: number;
  analysis?: {
    messages: {
      text: string;
      isUser: boolean;
      timestamp: Date;
    }[];
    lastUpdated: Date;
  };
  messages: {
    text: string;
    isUser: boolean;
    timestamp: Date;
  }[];
  text: string;
  isUser: boolean;
  timestamp: Date;
  lastUpdated: Date;
  showInJournal: boolean;
  tags: string[];
}

interface JournalContainerProps {
  entries: DreamEntryType[];
  onEntriesChange: (entries: DreamEntryType[]) => void;
  onAnalyze: (id: string, content: string) => void;
}

export function JournalContainer({ entries, onEntriesChange, onAnalyze }: JournalContainerProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)

  const handleNewEntry = (entry: Omit<DreamEntryType, 'id' | 'date' | 'messages' | 'analysis' | 'text' | 'isUser' | 'timestamp' | 'lastUpdated'>) => {
    const newEntry: DreamEntryType = {
      ...entry,
      id: crypto.randomUUID(),
      date: new Date(),
      messages: [],
      text: '',
      isUser: false,
      timestamp: new Date(),
      lastUpdated: new Date(),
      tags: []
    }
    onEntriesChange([newEntry, ...entries])
  }

  const handleDeleteEntry = (id: string) => {
    const updatedEntries = entries.map(entry => 
      entry.id === id 
        ? { ...entry, showInJournal: false }
        : entry
    )
    onEntriesChange(updatedEntries)
  }

  const handleAnalyzeClick = (id: string, content: string) => {
    const event = new CustomEvent('analyzeDream', {
      detail: { content, id }
    })
    window.dispatchEvent(event)
  };

  const filteredEntries = useMemo(() => {
    return entries
      .filter(entry => entry.showInJournal)
      .filter(entry => {
        const searchLower = searchTerm.toLowerCase()
        return (
          entry.title.toLowerCase().includes(searchLower) ||
          entry.content.toLowerCase().includes(searchLower) ||
          entry.emotions.some(emotion => emotion.toLowerCase().includes(searchLower))
        )
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [entries, searchTerm])

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none p-4 border-b">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              className="pl-9"
              placeholder="Search dreams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mb-4" />
            <h3 className="font-medium mb-1">No Dreams Found</h3>
            <p className="text-sm">
              {searchTerm ? "Try a different search term" : "Start by adding your first dream entry"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-card rounded-lg p-4 shadow-sm border cursor-pointer hover:bg-accent/50 transition-colors relative"
                onClick={() => {
                  setSelectedEntry(entry)
                  setShowAnalysis(false)
                }}
              >
                <div className="absolute right-4 top-4 z-10 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAnalyzeClick(entry.id, entry.content)
                    }}
                  >
                    <Brain className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingEntry(entry)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteEntry(entry.id)
                    }}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
                <div className="pr-16">
                  <h3 className="font-medium truncate">{entry.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                  <div className="line-clamp-2 text-sm mb-4">
                    {entry.content}
                  </div>
                  <div className="inline-flex flex-wrap gap-4 text-xs whitespace-nowrap">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-muted-foreground">Lucidity:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`w-1.5 h-1.5 rounded-full ${
                              level <= entry.lucidityLevel
                                ? 'bg-purple-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-muted-foreground">Mood:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`w-1.5 h-1.5 rounded-full ${
                              level <= entry.moodLevel
                                ? 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-muted-foreground">Clarity:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`w-1.5 h-1.5 rounded-full ${
                              level <= entry.clarity
                                ? 'bg-blue-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Emotions */}
                  {entry.emotions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {entry.emotions.map((emotion, index) => (
                        <Badge
                          key={`${emotion}-${index}`}
                          variant="secondary"
                          className="text-xs"
                        >
                          {emotion}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={selectedEntry !== null} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-none">
            <DialogTitle className="text-2xl">
              {selectedEntry?.title}
            </DialogTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {selectedEntry?.date.toLocaleDateString()}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-6 py-4">
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="font-medium">Lucidity Level</div>
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full mr-1.5 ${
                        i < (selectedEntry?.lucidityLevel || 0) ? 'bg-purple-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedEntry?.lucidityLevel === 5 ? 'Fully Lucid' :
                   selectedEntry?.lucidityLevel === 4 ? 'Highly Lucid' :
                   selectedEntry?.lucidityLevel === 3 ? 'Moderately Lucid' :
                   selectedEntry?.lucidityLevel === 2 ? 'Slightly Lucid' :
                   'Not Lucid'}
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium">Mood Level</div>
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full mr-1.5 ${
                        i < (selectedEntry?.moodLevel || 0) ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedEntry?.moodLevel === 5 ? 'Very Positive' :
                   selectedEntry?.moodLevel === 4 ? 'Positive' :
                   selectedEntry?.moodLevel === 3 ? 'Neutral' :
                   selectedEntry?.moodLevel === 2 ? 'Negative' :
                   'Very Negative'}
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium">Dream Clarity</div>
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full mr-1.5 ${
                        i < (selectedEntry?.clarity || 0) ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedEntry?.clarity === 5 ? 'Crystal Clear' :
                   selectedEntry?.clarity === 4 ? 'Very Clear' :
                   selectedEntry?.clarity === 3 ? 'Moderately Clear' :
                   selectedEntry?.clarity === 2 ? 'Somewhat Hazy' :
                   'Very Hazy'}
                </div>
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{selectedEntry?.content}</p>
            </div>

            {selectedEntry?.analysis && showAnalysis && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Dream Analysis</h4>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {selectedEntry.analysis.lastUpdated.toLocaleString()}
                  </p>
                </div>
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
                          {new Date(message.timestamp).toLocaleTimeString()}
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
                variant="outline"
                onClick={() => setShowAnalysis(!showAnalysis)}
              >
                <Brain className="h-4 w-4 mr-2" />
                {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  if (selectedEntry) {
                    handleAnalyzeClick(selectedEntry.id, selectedEntry.content)
                    setSelectedEntry(null)
                    setShowAnalysis(false)
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

      <Dialog open={editingEntry !== null} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Dream Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <Input
              placeholder="Dream Title"
              value={editingEntry?.title || ''}
              onChange={(e) => setEditingEntry(editingEntry ? { ...editingEntry, title: e.target.value } : null)}
            />
            <Textarea
              placeholder="Describe your dream..."
              value={editingEntry?.content || ''}
              onChange={(e) => setEditingEntry(editingEntry ? { ...editingEntry, content: e.target.value } : null)}
              className="min-h-[200px]"
            />
            
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="font-medium">Lucidity Level</div>
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setEditingEntry(editingEntry ? { ...editingEntry, lucidityLevel: i + 1 } : null)}
                      className={`w-3 h-3 rounded-full mr-1.5 transition-colors ${
                        i < (editingEntry?.lucidityLevel || 0) ? 'bg-purple-500' : 'bg-gray-200 hover:bg-purple-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  {editingEntry?.lucidityLevel === 5 ? 'Fully Lucid' :
                   editingEntry?.lucidityLevel === 4 ? 'Highly Lucid' :
                   editingEntry?.lucidityLevel === 3 ? 'Moderately Lucid' :
                   editingEntry?.lucidityLevel === 2 ? 'Slightly Lucid' :
                   'Not Lucid'}
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium">Mood Level</div>
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setEditingEntry(editingEntry ? { ...editingEntry, moodLevel: i + 1 } : null)}
                      className={`w-3 h-3 rounded-full mr-1.5 transition-colors ${
                        i < (editingEntry?.moodLevel || 0) ? 'bg-green-500' : 'bg-gray-200 hover:bg-green-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  {editingEntry?.moodLevel === 5 ? 'Very Positive' :
                   editingEntry?.moodLevel === 4 ? 'Positive' :
                   editingEntry?.moodLevel === 3 ? 'Neutral' :
                   editingEntry?.moodLevel === 2 ? 'Negative' :
                   'Very Negative'}
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium">Dream Clarity</div>
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setEditingEntry(editingEntry ? { ...editingEntry, clarity: i + 1 } : null)}
                      className={`w-3 h-3 rounded-full mr-1.5 transition-colors ${
                        i < (editingEntry?.clarity || 0) ? 'bg-blue-500' : 'bg-gray-200 hover:bg-blue-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  {editingEntry?.clarity === 5 ? 'Crystal Clear' :
                   editingEntry?.clarity === 4 ? 'Very Clear' :
                   editingEntry?.clarity === 3 ? 'Moderately Clear' :
                   editingEntry?.clarity === 2 ? 'Somewhat Hazy' :
                   'Very Hazy'}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingEntry(null)}>Cancel</Button>
              <Button 
                onClick={() => {
                  if (editingEntry) {
                    const updatedEntries = entries.map(entry => 
                      entry.id === editingEntry.id 
                        ? { ...editingEntry, tags: editingEntry.tags || [] } 
                        : entry
                    )
                    onEntriesChange(updatedEntries)
                    setEditingEntry(null)
                  }
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <JournalDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleNewEntry}
      />
    </div>
  )
}
