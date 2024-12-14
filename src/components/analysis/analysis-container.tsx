"use client"

import { useEffect, useState } from "react"
import type { DreamEntryType } from "@/types/dream"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import { cn } from "@/lib/utils"

interface AnalysisContainerProps {
  entries: DreamEntryType[]
}

export function AnalysisContainer({ entries }: AnalysisContainerProps) {
  const [emotionsData, setEmotionsData] = useState<{ name: string; value: number }[]>([])
  const [lucidityData, setLucidityData] = useState<{ name: string; value: number }[]>([])
  const [moodData, setMoodData] = useState<{ name: string; value: number }[]>([])

  useEffect(() => {
    // Process emotions data
    const emotionsCounts: { [key: string]: number } = {}
    entries.forEach(entry => {
      entry.emotions.forEach(emotion => {
        emotionsCounts[emotion] = (emotionsCounts[emotion] || 0) + 1
      })
    })
    setEmotionsData(
      Object.entries(emotionsCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    )

    // Process lucidity data
    const lucidityLevels = [1, 2, 3, 4, 5]
    const lucidityCount = lucidityLevels.map(level => ({
      name: `Level ${level}`,
      value: entries.filter(entry => entry.lucidityLevel === level).length
    }))
    setLucidityData(lucidityCount)

    // Process mood data
    const moodLevels = [1, 2, 3, 4, 5]
    const moodCount = moodLevels.map(level => ({
      name: `Level ${level}`,
      value: entries.filter(entry => entry.moodLevel === level).length
    }))
    setMoodData(moodCount)
  }, [entries])

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(var(--muted))',
    'hsl(var(--card))'
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover/95 backdrop-blur supports-[backdrop-filter]:bg-popover/85 p-2 rounded-lg shadow-lg border">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            Count: {payload[0].value}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-full p-4 overflow-y-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dream Analysis Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Total Dreams: {entries.length}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Emotions Chart */}
        <div className="bg-card rounded-lg p-4 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Emotional Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={emotionsData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {emotionsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lucidity Levels */}
        <div className="bg-card rounded-lg p-4 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Lucidity Levels</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lucidityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="bg-card rounded-lg p-4 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Mood Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dream Clarity */}
        <div className="bg-card rounded-lg p-4 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Dream Clarity</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lucidityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
