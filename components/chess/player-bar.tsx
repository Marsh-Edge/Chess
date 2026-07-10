'use client'

import { Color } from '@/lib/chess/types'
import { Bot, User } from 'lucide-react'

interface PlayerBarProps {
  name: string
  time: number
  isActive: boolean
  color: Color
  isAI?: boolean
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function PlayerBar({ name, time, isActive, color, isAI }: PlayerBarProps) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300 w-full ${
        isActive
          ? 'bg-muted/80 border-l-4 border-primary shadow-sm'
          : 'border-l-4 border-transparent'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
          style={{ backgroundColor: color === Color.White ? '#ffffff' : '#1a1a1a' }}
        />
        {isAI ? (
          <Bot className={`size-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
        ) : (
          <User className={`size-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
        )}
        <span className={`text-sm font-medium truncate ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
          {name}
        </span>
      </div>
      <span
        className={`font-mono text-base tabular-nums shrink-0 ml-3 ${
          isActive ? 'text-foreground font-bold' : 'text-muted-foreground'
        } ${isActive && time < 30 ? 'text-destructive animate-pulse' : ''}`}
      >
        {formatTime(time)}
      </span>
    </div>
  )
}
