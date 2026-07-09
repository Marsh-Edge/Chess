'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { ChessBoard } from '@/components/chess/board'
import { GameInfo } from '@/components/chess/game-info'
import { MoveList } from '@/components/chess/move-list'
import { ChessTimer } from '@/components/chess/timer'
import { GameControls } from '@/components/chess/game-controls'
import { useChessGame } from '@/hooks/useChessGame'
import { useTimer } from '@/hooks/useTimer'
import { Color, GameStatus, PieceType, SquareIndex } from '@/lib/chess/types'
import { Card } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { Bot } from 'lucide-react'
import type { TimeControl } from '@/components/chess/game-controls'

const TIME_CONTROLS: Record<TimeControl, { initialMinutes: number; incrementSeconds: number }> = {
  bullet: { initialMinutes: 1, incrementSeconds: 0 },
  blitz: { initialMinutes: 3, incrementSeconds: 2 },
  rapid: { initialMinutes: 10, incrementSeconds: 5 },
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>}>
      <PlayContent />
    </Suspense>
  )
}

function PlayContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const isAi = mode === 'ai'
  const [timeControl, setTimeControl] = useState<TimeControl>('blitz')
  const tc = TIME_CONTROLS[timeControl]

  const game = useChessGame(isAi ? 'ai' : 'pvp', Color.White, 3)
  const timer = useTimer({ initialMinutes: tc.initialMinutes, incrementSeconds: tc.incrementSeconds })
  const [promotionPending, setPromotionPending] = useState<{ from: SquareIndex; to: SquareIndex; color: Color } | null>(null)
  const state = game.state

  useEffect(() => {
    const ct = TIME_CONTROLS[timeControl]
    if (timer.isRunning) return
    timer.reset(ct.initialMinutes * 60)
  }, [timeControl, timer])

  const handleSquareClick = useCallback((index: SquareIndex) => {
    if (state.result.status === GameStatus.Checkmate || state.result.status === GameStatus.Stalemate) return

    if (game.selectedSquare === null) {
      const piece = state.board.getPiece(index)
      if (piece && piece.color === state.activeColor) {
        game.handleSquareClick(index)
        if (!timer.isRunning) {
          timer.start(state.activeColor)
        }
      }
    } else {
      const piece = state.board.getPiece(index)
      const movingPiece = state.board.getPiece(game.selectedSquare)

      if (piece && piece.color === state.activeColor) {
        game.handleSquareClick(index)
        return
      }

      if (movingPiece?.type === PieceType.Pawn) {
        const targetRank = Math.floor(index / 8)
        if ((movingPiece.color === Color.White && targetRank === 0) ||
            (movingPiece.color === Color.Black && targetRank === 7)) {
          setPromotionPending({ from: game.selectedSquare, to: index, color: movingPiece.color })
          return
        }
      }

      game.handleSquareClick(index)
      timer.switchTimer(state.activeColor === Color.White ? Color.Black : Color.White)
    }
  }, [state, game, timer])

  const handlePromotion = useCallback((type: PieceType) => {
    if (!promotionPending) return
    game.makeMove(promotionPending.from, promotionPending.to, type)
    setPromotionPending(null)
    timer.switchTimer(state.activeColor === Color.White ? Color.Black : Color.White)
  }, [promotionPending, game, timer, state.activeColor])

  useEffect(() => {
    if (timer.isExpired) {
      timer.stop()
    }
  }, [timer.isExpired, timer])

  useEffect(() => {
    if (state.result.status === GameStatus.Checkmate || state.result.status === GameStatus.Stalemate ||
        state.result.status === GameStatus.Draw || state.result.status === GameStatus.ThreefoldRepetition ||
        state.result.status === GameStatus.FiftyMoveRule || state.result.status === GameStatus.InsufficientMaterial) {
      timer.stop()
    }
  }, [state.result.status, timer])

  const handleNewGame = useCallback(() => {
    game.resetGame()
    timer.reset(TIME_CONTROLS[timeControl].initialMinutes * 60)
  }, [game, timer, timeControl])

  const handleUndo = useCallback(() => {
    game.undoMove()
  }, [game])

  const handleTimeControlChange = useCallback((tc: TimeControl) => {
    setTimeControl(tc)
    game.resetGame()
    timer.reset(TIME_CONTROLS[tc].initialMinutes * 60)
  }, [game, timer])

  return (
    <div className="flex flex-col lg:flex-row gap-4 justify-center items-start w-full">
      {/* Timer column (left on desktop, top on mobile) */}
      <div className="w-full lg:w-auto shrink-0">
        <ChessTimer
          timeWhite={timer.timeWhite}
          timeBlack={timer.timeBlack}
          activeColor={timer.activeColor}
        />
      </div>

      {/* Board column (fills remaining space, can shrink) */}
      <div className="flex flex-col items-center w-full lg:flex-1 lg:min-w-0">
        <div className="relative w-full flex flex-col items-center">
          {game.isAIThinking && (
            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/15 z-10">
              <div className="bg-card/90 backdrop-blur-sm px-6 py-4 rounded-lg shadow-xl border border-border flex items-center gap-3">
                <Bot className="size-5 animate-pulse" />
                <span className="font-semibold text-sm animate-pulse">Computer thinking...</span>
              </div>
            </div>
          )}
          <ChessBoard
            board={state.board}
            activeColor={state.activeColor}
            selectedSquare={game.selectedSquare}
            legalMoves={game.legalMoves}
            lastMove={state.moves.length > 0 ? {
              from: state.moves[state.moves.length - 1].from,
              to: state.moves[state.moves.length - 1].to,
            } : null}
            isInCheck={state.result.status === GameStatus.Check}
            onSquareClick={handleSquareClick}
          />
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-80 space-y-4 shrink-0">
        <GameInfo state={state} />

        <GameControls
          onNewGame={handleNewGame}
          onUndo={handleUndo}
          gameMode={game.gameMode}
          playerColor={game.playerColor}
          aiLevel={game.aiLevel}
          timeControl={timeControl}
          onGameModeChange={game.setGameMode}
          onPlayerColorChange={game.setPlayerColor}
          onAiLevelChange={game.setAiLevel}
          onTimeControlChange={handleTimeControlChange}
          isAIThinking={game.isAIThinking}
          canUndo={state.moves.length > 0}
        />

        <MoveList moves={state.moveNotation} />
      </div>

      {promotionPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="p-6">
            <div className="text-center mb-4 font-semibold">Promote Pawn</div>
            <div className="flex gap-3 justify-center">
              {[PieceType.Queen, PieceType.Rook, PieceType.Bishop, PieceType.Knight].map(type => (
                <button
                  key={type}
                  className="w-16 h-16 rounded-lg border-2 border-border hover:bg-muted flex items-center justify-center text-3xl cursor-pointer transition-colors text-foreground"
                  onClick={() => handlePromotion(type)}
                >
                  {String.fromCharCode(
                    ({
                      [Color.White]: { [PieceType.Queen]: 0x2655, [PieceType.Rook]: 0x2656, [PieceType.Bishop]: 0x2657, [PieceType.Knight]: 0x2658 },
                      [Color.Black]: { [PieceType.Queen]: 0x265B, [PieceType.Rook]: 0x265C, [PieceType.Bishop]: 0x265D, [PieceType.Knight]: 0x265E },
                    } as Record<Color, Record<string, number>>)[promotionPending.color][type]
                  )}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
