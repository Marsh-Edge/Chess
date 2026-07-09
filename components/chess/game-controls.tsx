'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RotateCcw, Undo2, Swords, Bot, Palette, Gauge } from 'lucide-react'
import { Color } from '@/lib/chess/types'

export type TimeControl = 'bullet' | 'blitz' | 'rapid'

interface GameControlsProps {
  onNewGame: () => void
  onUndo: () => void
  gameMode: 'pvp' | 'ai'
  playerColor: Color
  aiLevel: number
  timeControl: TimeControl
  onGameModeChange: (mode: 'pvp' | 'ai') => void
  onPlayerColorChange: (color: Color) => void
  onAiLevelChange: (level: number) => void
  onTimeControlChange: (tc: TimeControl) => void
  isAIThinking: boolean
  canUndo: boolean
}

const AI_LEVELS = [
  { value: 1, label: 'Beginner' },
  { value: 2, label: 'Easy' },
  { value: 3, label: 'Medium' },
  { value: 4, label: 'Hard' },
  { value: 5, label: 'Expert' },
]

export function GameControls({
  onNewGame,
  onUndo,
  gameMode,
  playerColor,
  aiLevel,
  timeControl,
  onGameModeChange,
  onPlayerColorChange,
  onAiLevelChange,
  onTimeControlChange,
  isAIThinking,
  canUndo,
}: GameControlsProps) {
  const colorLabel = playerColor === Color.White ? 'Play as White' : 'Play as Black'
  const levelLabel = AI_LEVELS.find(l => l.value === aiLevel)?.label ?? aiLevel.toString()

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Select value={gameMode} onValueChange={(v) => v && onGameModeChange(v as 'pvp' | 'ai')}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {gameMode === 'pvp' ? (
                <span className="flex items-center gap-2"><Swords className="size-4" /> vs Player</span>
              ) : (
                <span className="flex items-center gap-2"><Bot className="size-4" /> vs Computer</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pvp">
              <span className="flex items-center gap-2"><Swords className="size-4" /> vs Player</span>
            </SelectItem>
            <SelectItem value="ai">
              <span className="flex items-center gap-2"><Bot className="size-4" /> vs Computer</span>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeControl} onValueChange={(v) => v && onTimeControlChange(v as TimeControl)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bullet">Bullet</SelectItem>
            <SelectItem value="blitz">Blitz</SelectItem>
            <SelectItem value="rapid">Rapid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {gameMode === 'ai' && (
        <div className="grid grid-cols-2 gap-2">
          <Select value={playerColor} onValueChange={(v) => v && onPlayerColorChange(v as Color)}>
            <SelectTrigger className="w-full">
              <SelectValue>
                <span className="flex items-center gap-2"><Palette className="size-4" /> {colorLabel}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Color.White}>
                <span className="flex items-center gap-2">Play as White</span>
              </SelectItem>
              <SelectItem value={Color.Black}>
                <span className="flex items-center gap-2">Play as Black</span>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={aiLevel.toString()} onValueChange={(v) => v && onAiLevelChange(parseInt(v))}>
            <SelectTrigger className="w-full">
              <SelectValue>
                <span className="flex items-center gap-2"><Gauge className="size-4" /> {levelLabel}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {AI_LEVELS.map((l) => (
                <SelectItem key={l.value} value={l.value.toString()}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={onNewGame} className="w-full">
          <RotateCcw className="size-4 mr-1" /> New
        </Button>
        <Button variant="outline" size="sm" onClick={onUndo} disabled={!canUndo} className="w-full">
          <Undo2 className="size-4 mr-1" /> Undo
        </Button>
      </div>

      {isAIThinking && (
        <div className="text-sm text-muted-foreground text-center animate-pulse">
          Computer thinking...
        </div>
      )}
    </div>
  )
}
