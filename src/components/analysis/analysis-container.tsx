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

  const CHART_COLORS = {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    muted: 'hsl(var(--muted))',
    card: 'hsl(var(--card))',
    border: 'hsl(var(--border))',
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))'
  }

  // Carefully curated color palette for emotions
  const EMOTION_COLORS = [
    'hsl(280, 95%, 70%)',  // Vibrant Purple
    'hsl(340, 95%, 70%)',  // Bright Pink
    'hsl(200, 95%, 70%)',  // Ocean Blue
    'hsl(150, 95%, 70%)',  // Emerald
    'hsl(50, 95%, 70%)',   // Sunny Yellow
    'hsl(25, 95%, 70%)',   // Warm Orange
    'hsl(320, 95%, 70%)',  // Deep Rose
    'hsl(180, 95%, 70%)',  // Turquoise
    'hsl(100, 95%, 70%)',  // Fresh Green
    'hsl(240, 95%, 70%)'   // Royal Blue
  ]

  const gradients = {
    primary: 'from-[hsl(280,95%,65%)] to-[hsl(340,95%,65%)]',
    secondary: 'from-[hsl(200,95%,65%)] to-[hsl(150,95%,65%)]',
    accent: 'from-[hsl(50,95%,65%)] to-[hsl(25,95%,65%)]',
    highlight: 'from-[hsl(320,95%,65%)] to-[hsl(240,95%,65%)]'
  }

  const chartConfig = {
    animationDuration: 800,
    animationBegin: 0,
    isAnimationActive: entries.length > 0,
    barSize: 45,
    strokeWidth: 2
  }

  useEffect(() => {
    if (!entries?.length) {
      setEmotionsData([])
      setLucidityData([])
      setMoodData([])
      return
    }

    try {
      // Process emotions data
      const emotionsCounts: { [key: string]: number } = {}
      entries.forEach(entry => {
        entry.emotions?.forEach(emotion => {
          if (emotion) {
            emotionsCounts[emotion] = (emotionsCounts[emotion] || 0) + 1
          }
        })
      })
      setEmotionsData(
        Object.entries(emotionsCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10) // Limit to top 10 emotions for better visualization
      )

      // Process lucidity and mood data
      const levels = [1, 2, 3, 4, 5]
      setLucidityData(levels.map(level => ({
        name: `Level ${level}`,
        value: entries.filter(entry => entry.lucidityLevel === level).length
      })))

      setMoodData(levels.map(level => ({
        name: `Level ${level}`,
        value: entries.filter(entry => entry.moodLevel === level).length
      })))
    } catch (error) {
      console.error('Error processing dream analysis data:', error)
      // Set empty data in case of error
      setEmotionsData([])
      setLucidityData([])
      setMoodData([])
    }
  }, [entries])

  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
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
    <div className="h-full p-8 overflow-y-auto space-y-10 bg-background/50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-bold bg-gradient-to-r ${gradients.primary} bg-clip-text text-transparent tracking-tight`}>
            Dream Analysis Dashboard
          </h2>
        </div>
        <div className="bg-card/50 backdrop-blur-sm rounded-xl px-5 py-3 border shadow-sm hover:bg-card/60 transition-all duration-200">
          <p className="text-sm text-muted-foreground/80 text-center">Total Dreams</p>
          <p className={`text-2xl font-bold bg-gradient-to-r ${gradients.secondary} bg-clip-text text-transparent text-center`}>
            {entries.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Emotions Chart */}
        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-7 border shadow-md hover:shadow-lg transition-all duration-200 hover:bg-card/60">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-xl font-semibold bg-gradient-to-r ${gradients.primary} bg-clip-text text-transparent`}>
                Emotional Landscape
              </h3>
              <p className="text-sm text-muted-foreground/80">Distribution of emotions across dreams</p>
            </div>
          </div>
          <div className="flex flex-col h-[350px]">
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={emotionsData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="90%"
                  innerRadius="60%"
                  paddingAngle={4}
                  isAnimationActive={chartConfig.isAnimationActive}
                  animationBegin={chartConfig.animationBegin}
                  animationDuration={chartConfig.animationDuration}
                  label={({ name, value, percent, x, y, midAngle }) => {
                    const RADIAN = Math.PI / 180;
                    if (percent < 0.08) return null;
                    
                    const radius = 80;
                    const centerX = x;
                    const centerY = y;
                    
                    const sin = Math.sin(-RADIAN * midAngle);
                    const cos = Math.cos(-RADIAN * midAngle);
                    
                    const posX = centerX + radius * cos;
                    const posY = centerY + radius * sin;
                    
                    return (
                      <text
                        x={posX}
                        y={posY}
                        fill="currentColor"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-[10px] sm:text-xs font-medium"
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  labelLine={false}
                >
                  {emotionsData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={EMOTION_COLORS[index % EMOTION_COLORS.length]}
                      className="hover:opacity-90 transition-opacity duration-200"
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value as number;
                      const percentage = entries.length > 0 ? ((value / entries.length) * 100).toFixed(1) : '0.0';
                      
                      return (
                        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 px-4 py-2.5 rounded-lg shadow-lg border">
                          <p className="font-medium text-sm">{payload[0].name}</p>
                          <p className="text-xs text-muted-foreground/80 mt-1">
                            {value} dreams ({percentage}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ fill: 'transparent' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-none max-h-[20%] overflow-y-auto">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2.5 px-2">
                {emotionsData.map((entry, index) => (
                  <div 
                    key={`legend-${index}`} 
                    className="flex items-center gap-2 text-sm whitespace-nowrap group cursor-pointer hover:opacity-90 transition-all duration-200"
                  >
                    <div 
                      className="w-2.5 h-2.5 rounded-full ring-2 ring-background shadow-sm" 
                      style={{ backgroundColor: EMOTION_COLORS[index % EMOTION_COLORS.length] }}
                    />
                    <span className="text-muted-foreground/90 group-hover:text-foreground transition-colors duration-200 text-xs">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lucidity Levels */}
        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-7 border shadow-md hover:shadow-lg transition-all duration-200 hover:bg-card/60">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-xl font-semibold bg-gradient-to-r ${gradients.secondary} bg-clip-text text-transparent`}>
                Lucidity Distribution
              </h3>
              <p className="text-sm text-muted-foreground/80">Frequency of lucidity levels in dreams</p>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lucidityData} barSize={chartConfig.barSize}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={CHART_COLORS.border}
                  vertical={false}
                  opacity={0.5}
                />
                <XAxis 
                  dataKey="name" 
                  stroke={CHART_COLORS.foreground}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: CHART_COLORS.border, strokeWidth: 1 }}
                />
                <YAxis 
                  stroke={CHART_COLORS.foreground}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  allowDecimals={false}
                  tickCount={Math.max(...lucidityData.map(d => d.value)) + 1}
                  axisLine={{ stroke: CHART_COLORS.border, strokeWidth: 1 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(var(--primary), 0.1)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 px-4 py-2.5 rounded-lg shadow-lg border">
                          <p className="font-medium text-sm">{payload[0].payload.name}</p>
                          <p className="text-xs text-muted-foreground/80 mt-1">
                            {payload[0].value} dreams
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--foreground))"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={chartConfig.isAnimationActive}
                  animationBegin={chartConfig.animationBegin}
                  animationDuration={chartConfig.animationDuration}
                  opacity={0.9}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-7 border shadow-md hover:shadow-lg transition-all duration-200 hover:bg-card/60">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-xl font-semibold bg-gradient-to-r ${gradients.accent} bg-clip-text text-transparent`}>
                Mood Patterns
              </h3>
              <p className="text-sm text-muted-foreground/80">Distribution of mood levels in dreams</p>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodData} barSize={chartConfig.barSize}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={CHART_COLORS.border}
                  vertical={false}
                  opacity={0.5}
                />
                <XAxis 
                  dataKey="name" 
                  stroke={CHART_COLORS.foreground}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: CHART_COLORS.border, strokeWidth: 1 }}
                />
                <YAxis 
                  stroke={CHART_COLORS.foreground}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  allowDecimals={false}
                  tickCount={Math.max(...moodData.map(d => d.value)) + 1}
                  axisLine={{ stroke: CHART_COLORS.border, strokeWidth: 1 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(var(--foreground), 0.1)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 px-4 py-2.5 rounded-lg shadow-lg border">
                          <p className="font-medium text-sm">{payload[0].payload.name}</p>
                          <p className="text-xs text-muted-foreground/80 mt-1">
                            {payload[0].value} dreams
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--foreground))"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={chartConfig.isAnimationActive}
                  animationBegin={chartConfig.animationBegin}
                  animationDuration={chartConfig.animationDuration}
                  opacity={0.9}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dream Insights */}
        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-7 border shadow-md hover:shadow-lg transition-all duration-200 hover:bg-card/60">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-xl font-semibold bg-gradient-to-r ${gradients.highlight} bg-clip-text text-transparent`}>
                Dream Insights
              </h3>
              <p className="text-sm text-muted-foreground/80">Key metrics and patterns</p>
            </div>
          </div>
          <div className="h-[350px] flex items-center justify-center">
            {entries.length > 0 ? (
              <div className="grid grid-cols-2 gap-8 w-full">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <p className={`text-4xl font-bold bg-gradient-to-r ${gradients.primary} bg-clip-text text-transparent`}>
                      {entries.length}
                    </p>
                    <p className="text-sm text-muted-foreground/80">Dreams Recorded</p>
                  </div>
                  <div className="space-y-2">
                    <p className={`text-4xl font-bold bg-gradient-to-r ${gradients.secondary} bg-clip-text text-transparent`}>
                      {(lucidityData.reduce((acc, curr) => acc + (curr.value * parseInt(curr.name.split(' ')[1])), 0) / entries.length).toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground/80">Average Lucidity</p>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <p className={`text-4xl font-bold bg-gradient-to-r ${gradients.accent} bg-clip-text text-transparent`}>
                      {(moodData.reduce((acc, curr) => acc + (curr.value * parseInt(curr.name.split(' ')[1])), 0) / entries.length).toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground/80">Average Mood</p>
                  </div>
                  <div className="space-y-2">
                    <p className={`text-4xl font-bold bg-gradient-to-r ${gradients.highlight} bg-clip-text text-transparent`}>
                      {emotionsData.length}
                    </p>
                    <p className="text-sm text-muted-foreground/80">Unique Emotions</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-lg text-muted-foreground/90">No dream data available</p>
                <p className="text-sm text-muted-foreground/70">Start recording your dreams to see insights</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
