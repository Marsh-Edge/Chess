'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChessBoard } from './board'
import { PlayerBar } from './player-bar'
import { ChessGame } from '@/lib/chess/game'
import { Color, GameStatus, SquareIndex } from '@/lib/chess/types'
import { Lightbulb, RotateCcw, Trophy, Undo2, ChevronRight, AlertTriangle } from 'lucide-react'

interface EndgamePosition {
  name: string
  fen: string
  goal: string
  strategy: string[]
  commonMistake: string
}

const ENDGAME_POSITIONS: EndgamePosition[] = [
  {
    name: 'King + Queen vs King',
    fen: '8/8/8/8/4K3/8/4Q3/4k3 w - - 0 1',
    goal: 'Force checkmate using your king and queen against the lone enemy king — the most basic mating pattern.',
    strategy: [
      'Move your queen to create a box around the enemy king, restricting its movement. Keep the queen a knight\'s move away to avoid stalemate.',
      'Bring your king closer to support the queen and cover additional escape squares.',
      'Force the enemy king to the edge of the board by tightening the queen\'s box step by step.',
      'Deliver checkmate with the queen delivering the final blow on the edge, supported by your king covering escape squares.',
    ],
    commonMistake: 'Bringing the queen too close too early can cause stalemate. Always keep the queen at least a knight\'s move away from the enemy king until the final checkmate.',
  },
  {
    name: 'King + Rook vs King',
    fen: '8/8/8/8/4K3/8/4R3/4k3 w - - 0 1',
    goal: 'Force checkmate using your king and rook against the lone enemy king.',
    strategy: [
      'Use the rook to cut off the enemy king along a rank or file, reducing its available space.',
      'Bring your king closer to support the rook and control squares the enemy king might escape to.',
      'Force the enemy king to the edge by placing your rook on the same rank or file, then moving your king closer step by step.',
      'Deliver checkmate with the rook on the edge rank or file, your king covering all escape squares.',
    ],
    commonMistake: 'Moving the rook without king support — the enemy king can attack and capture the rook when it is undefended.',
  },
  {
    name: 'King + Pawn vs King',
    fen: '8/8/8/3k4/8/8/4P3/4K3 w - - 0 1',
    goal: 'Promote the pawn to a queen (or rook) and then checkmate the enemy king.',
    strategy: [
      'Lead with your king — position it in front of the pawn to secure the promotion path.',
      'Use your king to control the key squares the enemy king uses to block the pawn\'s advance.',
      'Push the pawn only when it can advance safely without being captured by the enemy king.',
      'Once the pawn reaches the 8th rank, promote it to a queen (or rook) and deliver checkmate.',
    ],
    commonMistake: 'Pushing the pawn too early without king support — the enemy king will capture it. Always lead with your king.',
  },
  {
    name: 'King + 2 Bishops vs King',
    fen: '8/8/8/8/4K3/2B5/4B3/4k3 w - - 0 1',
    goal: 'Force checkmate using two bishops and your king — a precise technique that requires coordination.',
    strategy: [
      'Place bishops on adjacent diagonals to form a net that restricts the enemy king\'s movement.',
      'Use your king to help push the enemy king toward the edge of the board.',
      'Gradually shrink the area the enemy king can move in by advancing your bishops and king together.',
      'Deliver checkmate with both bishops and king working together, forcing the king to the corner.',
    ],
    commonMistake: 'If both bishops are on the same color, they cannot force checkmate. Always keep one bishop on light squares and one on dark squares to cover the entire board.',
  },
  {
    name: 'Basic Pawn Endgame: Opposition',
    fen: '8/8/8/3k4/8/4K3/8/8 w - - 0 1',
    goal: 'Gain the opposition to penetrate with your king and win the pawn endgame.',
    strategy: [
      'The opposition means your king faces the enemy king with one square between them — the player who does NOT have to move has the advantage.',
      'If it is your opponent\'s turn when kings are opposed, you have the opposition — they must move sideways or back, letting you advance.',
      'Use the opposition to force your king past the enemy king into a better position.',
      'Once your king penetrates, support a passed pawn or attack enemy pawns from a stronger position.',
    ],
    commonMistake: 'Losing the opposition by moving your king in the wrong direction. Always consider which king move maintains or gains the opposition.',
  },
]

export function EndgameTrainer() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const position = ENDGAME_POSITIONS[selectedIndex]
  const [game, setGame] = useState(() => new ChessGame(position.fen))
  const [selectedSq, setSelectedSq] = useState<SquareIndex | null>(null)
  const [legalMoves, setLegalMoves] = useState<SquareIndex[]>([])
  const [message, setMessage] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [moveCount, setMoveCount] = useState(0)
  const [isSolved, setIsSolved] = useState(false)
  const [completedPositions, setCompletedPositions] = useState<Set<number>>(new Set())

  const state = game.getState()
  const isPlayerTurn = state.activeColor === Color.White
  const moveHistory = state.moveNotation

  const getActiveStepIndex = (): number => {
    if (moveCount === 0) return 0
    const movesPerStep = Math.ceil(position.strategy.length / 4)
    return Math.min(Math.floor(moveCount / Math.max(movesPerStep, 1)), position.strategy.length - 1)
  }

  const loadPosition = (index: number) => {
    const pos = ENDGAME_POSITIONS[index]
    setSelectedIndex(index)
    setGame(new ChessGame(pos.fen))
    setSelectedSq(null)
    setLegalMoves([])
    setMessage('')
    setShowHint(false)
    setMoveCount(0)
    setIsSolved(false)
  }

  const handleSquareClick = (index: SquareIndex) => {
    if (game.isGameOver() || isSolved) return

    if (selectedSq === null) {
      const piece = state.board.getPiece(index)
      if (piece && piece.color === Color.White) {
        setSelectedSq(index)
        setLegalMoves(game.getLegalMoves().filter(m => m.from === index).map(m => m.to))
      }
    } else {
      const move = game.makeMove(selectedSq, index)
      if (move) {
        setSelectedSq(null)
        setLegalMoves([])
        setMoveCount(c => c + 1)
        const result = game.getResult()
        if (result.status === GameStatus.Checkmate) {
          setMessage('Checkmate! Well done!')
          setIsSolved(true)
          setCompletedPositions(prev => new Set(prev).add(selectedIndex))
        } else if (result.status === GameStatus.Stalemate) {
          setMessage(`Stalemate! ${position.commonMistake}`)
        } else {
          setMessage('')
        }
      } else {
        setSelectedSq(null)
        setLegalMoves([])
      }
    }
  }

  const resetPosition = () => {
    loadPosition(selectedIndex)
  }

  const undoMove = () => {
    if (game.undoLastMove()) {
      setSelectedSq(null)
      setLegalMoves([])
      setMoveCount(c => Math.max(0, c - 1))
      setMessage('')
      setIsSolved(false)
    }
  }

  const activeStep = getActiveStepIndex()

  return (
    <div className="w-full">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {ENDGAME_POSITIONS.map((pos, i) => (
          <button
            key={i}
            onClick={() => loadPosition(i)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              selectedIndex === i
                ? 'bg-foreground text-background shadow-md'
                : completedPositions.has(i)
                  ? 'bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {completedPositions.has(i) && <Trophy className="size-3" />}
            {i + 1}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        {/* Board section */}
        <div className="flex flex-col items-center w-full lg:max-w-[720px] shrink-0">
          {/* Turn indicator */}
          <div className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg mb-3 text-sm font-medium ${
            isSolved
              ? 'bg-green-500/10 text-green-700 dark:text-green-400'
              : isPlayerTurn
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
          }`}>
            {isSolved ? (
              <>
                <Trophy className="size-4" />
                <span>Puzzle Complete!</span>
              </>
            ) : isPlayerTurn ? (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-white border border-black/20" />
                <span>Your turn — find the best move</span>
              </>
            ) : (
              <span className="animate-pulse">Waiting for opponent...</span>
            )}
          </div>

          <div className="w-full">
            <PlayerBar
              name="Opponent"
              time={0}
              isActive={!isPlayerTurn && !isSolved}
              color={Color.Black}
            />
          </div>

          <div className="w-full max-w-[500px] lg:max-w-none">
            <ChessBoard
              board={state.board}
              activeColor={state.activeColor}
              selectedSquare={selectedSq}
              legalMoves={legalMoves}
              lastMove={state.moves.length > 0 ? {
                from: state.moves[state.moves.length - 1].from,
                to: state.moves[state.moves.length - 1].to,
              } : null}
              isInCheck={state.result.status === GameStatus.Check}
              onSquareClick={handleSquareClick}
            />
          </div>

          <div className="w-full">
            <PlayerBar
              name="You (White)"
              time={0}
              isActive={isPlayerTurn && !isSolved}
              color={Color.White}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={undoMove} disabled={state.moves.length === 0}>
              <Undo2 className="size-3.5 mr-1" /> Undo
            </Button>
            <Button variant="outline" size="sm" onClick={resetPosition}>
              <RotateCcw className="size-3.5 mr-1" /> Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1"
            >
              <Lightbulb className="size-3.5 text-amber-500" />
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </Button>
          </div>

          {/* Move history */}
          {moveHistory.length > 0 && (
            <div className="w-full mt-3 flex flex-wrap gap-1 justify-center">
              {moveHistory.map((move, i) => (
                <span key={i} className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                  {Math.floor(i / 2) + 1}{i % 2 === 0 ? '.' : '...'}{move}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="w-full lg:w-80 space-y-4 shrink-0">
          {/* Position selector */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Choose a position</p>
              <div className="space-y-1">
                {ENDGAME_POSITIONS.map((pos, i) => (
                  <button
                    key={i}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                      selectedIndex === i
                        ? 'bg-foreground text-background font-medium'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                    onClick={() => loadPosition(i)}
                  >
                    {completedPositions.has(i) && <Trophy className="size-3 text-green-500 shrink-0" />}
                    <span className="truncate">{pos.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Position info */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">{position.name}</h2>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {selectedIndex + 1}/{ENDGAME_POSITIONS.length}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{position.goal}</p>
              </div>

              {/* Strategy steps */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Strategy</p>
                <ol className="space-y-2">
                  {position.strategy.map((step, i) => (
                    <li key={i} className={`text-sm flex items-start gap-2 leading-relaxed transition-colors ${
                      i === activeStep && !isSolved
                        ? 'text-foreground font-medium'
                        : i < activeStep
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-muted-foreground'
                    }`}>
                      <span className={`font-bold min-w-[1.2rem] shrink-0 ${
                        i === activeStep && !isSolved
                          ? 'text-primary'
                          : i < activeStep
                            ? 'text-green-600 dark:text-green-400'
                            : ''
                      }`}>
                        {i < activeStep ? '✓' : <>{i + 1}.</>}
                      </span>
                      <span>{step}</span>
                      {i === activeStep && !isSolved && (
                        <ChevronRight className="size-4 text-primary shrink-0 mt-0.5 animate-pulse" />
                      )}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Hint */}
              {showHint && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Common mistake to avoid</p>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{position.commonMistake}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              {message && (
                <div className={`rounded-lg p-3 ${isSolved ? 'bg-green-500/10 border border-green-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
                  <div className="flex items-start gap-2">
                    {isSolved ? (
                      <Trophy className="size-4 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isSolved ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                        {message}
                      </p>
                      {!isSolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetPosition}
                          className="mt-2 text-xs"
                        >
                          <RotateCcw className="size-3 mr-1" /> Try Again
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              {moveCount > 0 && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{moveCount} {moveCount === 1 ? 'move' : 'moves'} played</span>
                  {isSolved && <span className="text-green-600 dark:text-green-400 font-medium">Solved!</span>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
