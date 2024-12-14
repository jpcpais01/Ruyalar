"use client"

import { useState, useMemo, useEffect } from "react"
import { BookOpen, Plus, FileText, Search, Trash2, Brain, X, Pencil, Clock, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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
    content: '',
    lucidityLevel: 1,
    moodLevel: 3,
    emotions: [] as string[],
    clarity: 3,
    showInJournal: true
  })

  // State for search query
  const [searchQuery, setSearchQuery] = useState('');

  // State for selected entry
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)

  // State for showing analysis
  const [showAnalysis, setShowAnalysis] = useState(false)

  // State for editing entry
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)

  // Function to handle adding a new journal entry
  const handleAddEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;
    
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      title: newEntry.title,
      content: newEntry.content,
      date: new Date(),
      lucidityLevel: newEntry.lucidityLevel,
      moodLevel: newEntry.moodLevel,
      emotions: newEntry.emotions,
      clarity: newEntry.clarity,
      messages: [], // Add an empty array for messages
      text: newEntry.content, // Use content as text
      isUser: true, // Assuming the entry is created by the user
      timestamp: new Date(), // Current timestamp
      lastUpdated: new Date(), // Current timestamp for last update
      showInJournal: newEntry.showInJournal
    };

    const updatedEntries = [entry, ...entries];
    onEntriesChange(updatedEntries);
    
    setNewEntry({
      title: '',
      content: '',
      lucidityLevel: 1,
      moodLevel: 3,
      emotions: [],
      clarity: 3,
      showInJournal: true
    });
    setOpen(false);
  };

  // Function to delete an entry from journal view
  const handleDeleteEntry = (id: string) => {
    const updatedEntries = entries.map(entry => 
      entry.id === id 
        ? { ...entry, showInJournal: false }
        : entry
    )
    onEntriesChange(updatedEntries)
  }

  // Function to handle analyze click (switches to analysis tab)
  const handleAnalyzeClick = (entry: JournalEntry) => {
    const event = new CustomEvent('analyzeDream', {
      detail: { content: entry.content, id: entry.id }
    });
    window.dispatchEvent(event);
  };

  // Filtered entries based on search query and journal visibility
  const filteredEntries = useMemo(() => {
    // First filter by journal visibility
    const journalEntries = entries.filter(entry => entry.showInJournal)
    
    // Then filter by search query if it exists
    if (!searchQuery) return journalEntries
    const query = searchQuery.toLowerCase()
    return journalEntries.filter(
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
              <DialogTitle>New Dream Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Input
                  placeholder="Dream Title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Describe your dream..."
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  className="min-h-[200px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Lucidity Level (1-5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newEntry.lucidityLevel}
                  onChange={(e) => setNewEntry({ ...newEntry, lucidityLevel: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Not Lucid</span>
                  <span>Fully Lucid</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mood Level (1-5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newEntry.moodLevel}
                  onChange={(e) => setNewEntry({ ...newEntry, moodLevel: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Negative</span>
                  <span>Positive</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Dream Clarity (1-5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newEntry.clarity}
                  onChange={(e) => setNewEntry({ ...newEntry, clarity: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Hazy</span>
                  <span>Crystal Clear</span>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddEntry}>Save Dream</Button>
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
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                      <h3 className="font-semibold text-lg line-clamp-1">{entry.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingEntry(entry)
                        }}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteEntry(entry.id)
                        }}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-muted-foreground"
                      >
                        <Archive className="h-4 w-4" />
                        <span className="sr-only">Move to History</span>
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{entry.content}</p>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {entry.date.toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <div className="flex items-center gap-2">
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
                    handleAnalyzeClick(selectedEntry)
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
                <label className="text-sm font-medium">Lucidity Level</label>
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
                <label className="text-sm font-medium">Mood Level</label>
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
                <label className="text-sm font-medium">Dream Clarity</label>
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
                      entry.id === editingEntry.id ? editingEntry : entry
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
    </div>
  )
}
