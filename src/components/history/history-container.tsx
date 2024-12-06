"use client"

import { useState, useEffect } from "react"
import { Clock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { analyzeDream } from "../chat/chat-container"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface JournalEntry {
  id: string;
  content: string;
  timestamp: Date;
  title: string;
}

interface HistoryContainerProps {
  onDreamSelect?: (dream: { id: string, content: string }) => void;
}

export function HistoryContainer({ onDreamSelect }: HistoryContainerProps) {
  const [historyEntries, setHistoryEntries] = useState<JournalEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('journalEntries');
      if (saved) {
        const parsedEntries = JSON.parse(saved) as JournalEntry[];
        return parsedEntries.map((entry: JournalEntry) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
      }
    }
    return [];
  });

  // State for viewing entry details
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Update entries when localStorage changes or custom event fires
  useEffect(() => {
    const updateEntries = (entries: JournalEntry[]) => {
      setHistoryEntries(entries.map((entry: JournalEntry) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      })));
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'journalEntries' && e.newValue) {
        try {
          const parsedEntries = JSON.parse(e.newValue) as JournalEntry[];
          updateEntries(parsedEntries);
        } catch (error) {
          console.error('Error parsing journal entries:', error);
        }
      }
    };

    const handleEntriesUpdated = (e: CustomEvent<{ entries: JournalEntry[] }>) => {
      if (e.detail && e.detail.entries) {
        updateEntries(e.detail.entries);
      }
    };

    // Listen for both storage and custom events
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('journalEntriesUpdated', handleEntriesUpdated as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('journalEntriesUpdated', handleEntriesUpdated as EventListener);
    };
  }, []);

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setDialogOpen(true);
  };

  const handleAnalyze = (entry: JournalEntry) => {
    if (onDreamSelect) {
      onDreamSelect({ id: entry.id, content: entry.content });
    }
    analyzeDream(entry.content, entry.id);
  };

  return (
    <div className="h-full w-full overflow-hidden bg-background/50">
      <div className="flex flex-col h-full">
        <div className="flex-none p-4 border-b">
          <div className="max-w-4xl mx-auto px-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Dream History
            </h2>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
          <div className="max-w-4xl mx-auto px-3 space-y-2">
            {historyEntries.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                <p>No dream entries yet</p>
              </div>
            ) : (
              historyEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors cursor-pointer group"
                  onClick={() => handleEntryClick(entry)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{entry.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {entry.content}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {entry.timestamp.toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnalyze(entry);
                        }}
                      >
                        Analyze
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          const entries = historyEntries.filter(e => e.id !== entry.id);
                          localStorage.setItem('journalEntries', JSON.stringify(entries));
                          setHistoryEntries(entries);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedEntry?.title}</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 flex flex-col space-y-4 overflow-y-auto scrollbar-hide">
            <div className="text-sm whitespace-pre-wrap break-words">
              {selectedEntry?.content}
            </div>
            <div className="text-xs text-muted-foreground">
              {selectedEntry?.timestamp.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button
              variant="outline"
              onClick={() => {
                if (selectedEntry) {
                  handleAnalyze(selectedEntry);
                }
                setDialogOpen(false);
              }}
            >
              Analyse Dream
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
