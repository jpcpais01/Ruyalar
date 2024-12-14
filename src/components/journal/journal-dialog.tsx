"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DreamEntryType } from "@/types/dream"
import { X } from "lucide-react"

const COMMON_EMOTIONS = [
  "Joy", "Fear", "Anxiety", "Peace",
  "Excitement", "Confusion", "Love",
  "Anger", "Sadness", "Wonder",
  "Frustration", "Loneliness"
]

interface JournalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (entry: Omit<DreamEntryType, 'id' | 'date' | 'messages' | 'analysis' | 'text' | 'isUser' | 'timestamp' | 'lastUpdated'>) => void
}

export function JournalDialog({ open, onOpenChange, onSubmit }: JournalDialogProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [lucidityLevel, setLucidityLevel] = useState(1)
  const [moodLevel, setMoodLevel] = useState(3)
  const [clarity, setClarity] = useState(3)
  const [customEmotion, setCustomEmotion] = useState("")

  const handleEmotionToggle = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    )
  }

  const handleAddCustomEmotion = () => {
    if (customEmotion && !selectedEmotions.includes(customEmotion)) {
      setSelectedEmotions(prev => [...prev, customEmotion])
      setCustomEmotion("")
    }
  }

  const handleRemoveEmotion = (emotion: string) => {
    setSelectedEmotions(prev => prev.filter(e => e !== emotion))
  }

  const handleSubmit = () => {
    onSubmit({
      title,
      content,
      emotions: selectedEmotions,
      lucidityLevel,
      moodLevel,
      clarity,
      showInJournal: true,
      tags: []
    })
    
    // Reset form
    setTitle("")
    setContent("")
    setSelectedEmotions([])
    setLucidityLevel(1)
    setMoodLevel(3)
    setClarity(3)
    setCustomEmotion("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Dream Journal Entry</DialogTitle>
          <DialogDescription>
            Record your dream experience. What did you see or feel?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              placeholder="Enter a title for your dream"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="content" className="text-sm font-medium">
              Dream Description
            </label>
            <Textarea
              id="content"
              placeholder="Describe your dream in detail..."
              className="min-h-[200px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">
              Emotions Felt
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedEmotions.map(emotion => (
                <Badge
                  key={emotion}
                  variant="secondary"
                  className="pr-1"
                >
                  {emotion}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-transparent"
                    onClick={() => handleRemoveEmotion(emotion)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 border rounded-lg p-2">
              {COMMON_EMOTIONS.filter(e => !selectedEmotions.includes(e)).map(emotion => (
                <Badge
                  key={emotion}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleEmotionToggle(emotion)}
                >
                  {emotion}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add custom emotion..."
                value={customEmotion}
                onChange={(e) => setCustomEmotion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomEmotion()
                  }
                }}
              />
              <Button 
                variant="outline" 
                onClick={handleAddCustomEmotion}
                disabled={!customEmotion}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Lucidity Level (1-5)
              </label>
              <Input
                type="number"
                min={1}
                max={5}
                value={lucidityLevel}
                onChange={(e) => setLucidityLevel(Number(e.target.value))}
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Mood Level (1-5)
              </label>
              <Input
                type="number"
                min={1}
                max={5}
                value={moodLevel}
                onChange={(e) => setMoodLevel(Number(e.target.value))}
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Dream Clarity (1-5)
              </label>
              <Input
                type="number"
                min={1}
                max={5}
                value={clarity}
                onChange={(e) => setClarity(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSubmit}
            disabled={!title || !content}
          >
            Save Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
