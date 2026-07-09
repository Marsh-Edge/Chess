'use client'

import { Color } from '@/lib/chess/types'
import { Card } from '@/components/ui/card'

interface TimerProps {
  timeWhite: number
  timeBlack: number
  activeColor: Color | null
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function ChessTimer({ timeWhite, timeBlack, activeColor }: TimerProps) {
  return (
    <Card className="p-2">
      <div className="space-y-1">
        <div
          className={`flex justify-between items-center px-3 py-2 rounded-md text-sm transition-all duration-300 ${
            activeColor === Color.Black
              ? 'bg-muted border-l-4 border-primary font-bold text-foreground'
              : 'border-l-4 border-transparent text-muted-foreground'
          }`}
        >
          <span>Black</span>
          <span className={`font-mono text-base tabular-nums ${activeColor === Color.Black ? 'text-foreground' : 'text-muted-foreground'}`}>
            {formatTime(timeBlack)}
          </span>
        </div>
        <div
          className={`flex justify-between items-center px-3 py-2 rounded-md text-sm transition-all duration-300 ${
            activeColor === Color.White
              ? 'bg-muted border-l-4 border-primary font-bold text-foreground'
              : 'border-l-4 border-transparent text-muted-foreground'
          }`}
        >
          <span>White</span>
          <span className={`font-mono text-base tabular-nums ${activeColor === Color.White ? 'text-foreground' : 'text-muted-foreground'}`}>
            {formatTime(timeWhite)}
          </span>
        </div>
      </div>
    </Card>
  )
}
