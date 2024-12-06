"use client"

import { useState, useEffect } from "react"
import { BookOpen, Plus, FileText, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { analyzeDream } from "../chat/chat-container"

// Define a type for journal entries
type JournalEntry = {
  id: string;
  title: string;
  content: string;
  date: Date;
}

export function JournalContainer() {
  // State for managing journal entries
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('journalEntries');
      if (saved) {
        const entries = JSON.parse(saved);
        // Convert date strings back to Date objects
        return entries.map((entry: JournalEntry) => ({
          ...entry,
          date: new Date(entry.date)
        }));
      }
      return [];
    }
    return [];
  });

  // Save to localStorage whenever entries change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
    }
  }, [journalEntries]);

  // State for new entry dialog
  const [open, setOpen] = useState(false)
  
  // State for new entry being created
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: ''
  })

  // Function to handle adding a new journal entry
  const handleSave = (title: string, content: string) => {
    if (!title.trim() || !content.trim()) return;
    
    const newEntry = {
      id: crypto.randomUUID(),
      title,
      content,
      date: new Date()
    };

    const entries = [newEntry, ...journalEntries];
    setJournalEntries(entries);
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    
    // Dispatch custom event for real-time updates
    const event = new CustomEvent('journalEntriesUpdated', { 
      detail: { entries }  // Pass the entries directly as an object
    });
    window.dispatchEvent(event);

    setNewEntry({ title: '', content: '' });
    setOpen(false);
  };

  // Function to delete an entry
  const handleDeleteEntry = (id: string) => {
    const entries = journalEntries.filter(entry => entry.id !== id);
    setJournalEntries(entries);
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    
    // Dispatch custom event for real-time updates
    const event = new CustomEvent('journalEntriesUpdated', { 
      detail: { entries }
    });
    window.dispatchEvent(event);
  }

  // Add state for selected entry and dialog
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setViewDialogOpen(true);
  };

  return (
    <div className="absolute inset-0 overflow-y-auto py-8 scrollbar-hide overflow-x-hidden">
      <div className="w-full max-w-xl mx-auto space-y-6 pl-6 pr-3 relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent" />
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3 text-foreground">
            <BookOpen className="w-10 h-10" />
            Dream Journal
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-6 text-center">
            Record, reflect, and explore the depths of your subconscious mind.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center w-full">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full max-w-md">
                  <Plus className="mr-2 h-4 w-4" /> New Journal Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center">Create New Dream Journal Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input 
                    placeholder="Entry Title" 
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                    className="w-full"
                  />
                  <Textarea 
                    placeholder="Describe your dream..." 
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                    className="min-h-[200px] w-full"
                  />
                  <Button onClick={() => handleSave(newEntry.title, newEntry.content)} className="w-full">
                    Save Entry
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-center">Recent Entries</h2>
            
            {journalEntries.length === 0 ? (
              <div className="text-center text-muted-foreground py-6">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No journal entries yet. Start recording your dreams!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {journalEntries.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="bg-muted p-4 rounded-md hover:bg-muted/80 transition-colors text-left cursor-pointer"
                    onClick={() => handleEntryClick(entry)}
                  >
                    <h3 className="font-semibold mb-2 text-lg">{entry.title}</h3>
                    <p className="text-muted-foreground line-clamp-2">{entry.content}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        {entry.date.toLocaleDateString()}
                      </span>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => analyzeDream(entry.content, entry.id)}
                        >
                          Analyse
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Entry Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="w-[90vw] max-w-2xl mx-auto max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-none">
            <DialogTitle className="text-2xl font-bold mb-2 break-words">
              {selectedEntry?.title}
            </DialogTitle>
            <div className="text-sm text-muted-foreground border-b pb-4">
              {selectedEntry?.date.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </DialogHeader>
          <div className="mt-4 flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              <p className="text-foreground whitespace-pre-wrap break-words leading-relaxed">
                {selectedEntry?.content}
              </p>
            </div>
          </div>
          <div className="flex-none pt-4 mt-4 border-t">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setViewDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
