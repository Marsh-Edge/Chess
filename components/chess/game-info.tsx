'use client'

import { Color, GameStatus } from '@/lib/chess/types'
import type { GameState } from '@/lib/chess/game'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { PieceIcon } from './piece-icon'

interface GameInfoProps {
  state: GameState
}

export function GameInfo({ state }: GameInfoProps) {
  const getStatusText = () => {
    switch (state.result.status) {
      case GameStatus.Check:
        return `${state.activeColor === Color.White ? 'White' : 'Black'} is in check!`
      case GameStatus.Checkmate:
        return `Checkmate! ${state.result.winner === Color.White ? 'White' : 'Black'} wins!`
      case GameStatus.Stalemate:
        return 'Stalemate — Draw'
      case GameStatus.Draw:
        return 'Draw'
      case GameStatus.ThreefoldRepetition:
        return 'Draw by threefold repetition'
      case GameStatus.FiftyMoveRule:
        return 'Draw by fifty-move rule'
      case GameStatus.InsufficientMaterial:
        return 'Draw — insufficient material'
      default:
        return `${state.activeColor === Color.White ? 'White' : 'Black'} to move`
    }
  }

  const statusVariant = state.result.status === GameStatus.Checkmate
    ? 'destructive'
    : state.result.status === GameStatus.Check
      ? 'secondary'
      : 'default' as const

  const isGameOver = state.result.status !== GameStatus.Playing && state.result.status !== GameStatus.Check

  return (
    <Card className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <Badge variant={statusVariant} className="text-xs">
          {getStatusText()}
        </Badge>
        <span className="text-xs text-muted-foreground tabular-nums">
          Move {state.fullMoveNumber}
        </span>
      </div>

      {state.capturedWhite.length > 0 && (
        <div className="flex flex-wrap items-center gap-0.5">
          <span className="text-xs text-muted-foreground mr-1">Black captured:</span>
          {state.capturedWhite.map((type, i) => (
            <PieceIcon key={i} type={type} color={Color.Black} size={18} />
          ))}
        </div>
      )}
      {state.capturedBlack.length > 0 && (
        <div className="flex flex-wrap items-center gap-0.5">
          <span className="text-xs text-muted-foreground mr-1">White captured:</span>
          {state.capturedBlack.map((type, i) => (
            <PieceIcon key={i} type={type} color={Color.White} size={18} />
          ))}
        </div>
      )}

      {isGameOver && (
        <div className="text-center text-base font-bold text-primary">
          {state.result.status === GameStatus.Checkmate
            ? `${state.result.winner === Color.White ? '1\u20130' : '0\u20131'}`
            : '\u00BD\u2013\u00BD'}
        </div>
      )}
    </Card>
  )
}
