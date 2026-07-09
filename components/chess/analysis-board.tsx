'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { ChessBoard } from './board'
import { ChessGame } from '@/lib/chess/game'
import { Color, PieceType, SquareIndex, GameStatus, squareToIndex } from '@/lib/chess/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { RotateCcw, Play, Pause, ChevronDown, ChevronRight, Lightbulb, Swords } from 'lucide-react'
import { initAI, sendCommand, setEvalCallback, setMoveCallback, terminate } from '@/lib/chess/stockfish-worker'
import { moveToAlgebraic } from '@/lib/chess/rules'

function getAdvantageLabel(score: number): { label: string; variant: 'default' | 'secondary' | 'destructive' } {
  const absScore = Math.abs(score)
  if (absScore < 0.3) return { label: 'Equal', variant: 'secondary' }
  if (absScore < 1.0) return { label: score > 0 ? 'White slightly better' : 'Black slightly better', variant: 'secondary' }
  if (absScore < 3.0) return { label: score > 0 ? 'White has advantage' : 'Black has advantage', variant: 'default' }
  return { label: score > 0 ? 'White winning' : 'Black winning', variant: 'destructive' }
}

function uciToAlgebraic(uci: string, game: ChessGame): string {
  if (!uci || uci === '(none)') return ''
  const from = squareToIndex(uci.substring(0, 2))
  const to = squareToIndex(uci.substring(2, 4))
  const promotion = uci.length > 4 ? uci[4] as PieceType : undefined
  const board = game.getState().board
  const piece = board.getPiece(from)
  const captured = board.getPiece(to)
  if (!piece) return uci
  return moveToAlgebraic({
    from, to, piece,
    captured: captured || undefined,
    promotion,
  })
}

function getStatusText(status: GameStatus, activeColor: 'white' | 'black'): string {
  switch (status) {
    case GameStatus.Check: return `${activeColor === 'white' ? 'White' : 'Black'} is in check`
    case GameStatus.Checkmate: return `Checkmate! ${activeColor === 'white' ? 'Black' : 'White'} wins`
    case GameStatus.Stalemate: return 'Stalemate — draw'
    case GameStatus.Draw: return 'Draw'
    case GameStatus.ThreefoldRepetition: return 'Draw by repetition'
    case GameStatus.FiftyMoveRule: return 'Draw — 50 moves without capture'
    case GameStatus.InsufficientMaterial: return 'Draw — insufficient material'
    default: return activeColor === 'white' ? 'White to move' : 'Black to move'
  }
}

export function AnalysisBoard() {
  const [game] = useState(() => new ChessGame())
  const [state, setState] = useState(game.getState())
  const [selectedSq, setSelectedSq] = useState<SquareIndex | null>(null)
  const [legalMoves, setLegalMoves] = useState<SquareIndex[]>([])
  const [fenInput, setFenInput] = useState(game.getFen())
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isEvalRunning, setIsEvalRunning] = useState(false)
  const [evalDisplay, setEvalDisplay] = useState<{ score: number; depth: number; isMate: boolean } | null>(null)
  const [bestMove, setBestMove] = useState<string | null>(null)

  const refresh = useCallback(() => {
    const s = game.getState()
    setState(s)
    setFenInput(game.getFen())
  }, [game])

  const handleSquareClick = useCallback((index: SquareIndex) => {
    if (selectedSq === null) {
      const piece = state.board.getPiece(index)
      if (piece) {
        setSelectedSq(index)
        setLegalMoves(game.getLegalMoves().filter(m => m.from === index).map(m => m.to))
      }
    } else {
      const move = game.makeMove(selectedSq, index)
      if (move) {
        setSelectedSq(null)
        setLegalMoves([])
        refresh()
        setBestMove(null)
        if (isEvalRunning) {
          sendCommand('stop')
          setIsEvalRunning(false)
          setEvalDisplay(null)
        }
      } else {
        setSelectedSq(null)
        setLegalMoves([])
      }
    }
  }, [selectedSq, state, game, refresh, isEvalRunning])

  const handleFenSubmit = () => {
    try {
      const newGame = new ChessGame(fenInput)
      game.reset()
      Object.assign(game, newGame)
      refresh()
      setBestMove(null)
      if (isEvalRunning) {
        sendCommand('stop')
        setIsEvalRunning(false)
        setEvalDisplay(null)
      }
    } catch {
      setFenInput(game.getFen())
    }
  }

  const toggleEval = async () => {
    if (isEvalRunning) {
      setIsEvalRunning(false)
      sendCommand('stop')
      setEvalDisplay(null)
      setBestMove(null)
    } else {
      setIsEvalRunning(true)
      setEvalDisplay(null)
      setBestMove(null)
      try {
        await initAI()
        setEvalCallback((data) => {
          setEvalDisplay(data)
        })
        setMoveCallback((best) => {
          setBestMove(best)
        })
        sendCommand(`position fen ${game.getFen()}`)
        sendCommand('go depth 18')
      } catch {
        setIsEvalRunning(false)
        setEvalDisplay({ score: 0, depth: 0, isMate: false })
      }
    }
  }

  useEffect(() => {
    return () => { terminate() }
  }, [])

  const statusText = useMemo(() => {
    const color = state.activeColor === Color.White ? 'white' as const : 'black' as const
    return getStatusText(state.result.status, color)
  }, [state.result.status, state.activeColor])

  const moveCount = Math.ceil(state.moveNotation.length / 2)

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        <div className="flex justify-center w-full lg:max-w-[720px] shrink-0">
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

        <div className="w-full lg:w-80 space-y-4 shrink-0">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Swords className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{statusText}</span>
                </div>
                {moveCount > 0 && (
                  <p className="text-xs text-muted-foreground">Move {moveCount}</p>
                )}
              </div>

              {evalDisplay && (
                <div className="bg-muted/40 rounded-lg p-3 space-y-2">
                  {evalDisplay.isMate ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">Mate</Badge>
                      <span className="text-sm font-medium">
                        Checkmate in {Math.abs(evalDisplay.score)} {Math.abs(evalDisplay.score) === 1 ? 'move' : 'moves'}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getAdvantageLabel(evalDisplay.score).variant} className="text-xs">
                          {getAdvantageLabel(evalDisplay.score).label}
                        </Badge>
                        <span className="text-sm font-mono">
                          {evalDisplay.score > 0 ? '+' : ''}{(evalDisplay.score / 100).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Analysis depth: {evalDisplay.depth}</p>
                    </div>
                  )}

                  {bestMove && (
                    <div className="flex items-center gap-2 pt-1 border-t border-border">
                      <Lightbulb className="size-3.5 text-amber-500" />
                      <span className="text-sm">
                        Best move: <strong>{uciToAlgebraic(bestMove, game)}</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={isEvalRunning ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleEval}
                  className="flex items-center gap-1.5"
                >
                  {isEvalRunning ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                  {isEvalRunning ? 'Stop Analysis' : 'Analyze Position'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { game.reset(); refresh(); setBestMove(null); setEvalDisplay(null) }}>
                  <RotateCcw className="size-3.5 mr-1" /> Reset
                </Button>
              </div>

              <div>
                <button
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                  Advanced
                </button>
                {showAdvanced && (
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={fenInput}
                      onChange={(e) => setFenInput(e.target.value)}
                      placeholder="FEN position string"
                      className="font-mono text-xs"
                    />
                    <Button variant="outline" size="sm" onClick={handleFenSubmit}>
                      Load
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {state.moveNotation.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Moves played</p>
                <ScrollArea className="h-[180px] rounded border border-border p-2">
                  <div className="text-xs font-mono space-y-0.5">
                    {(() => {
                      const rows: string[] = []
                      for (let i = 0; i < state.moveNotation.length; i += 2) {
                        const moveNum = Math.floor(i / 2) + 1
                        const white = state.moveNotation[i]
                        const black = state.moveNotation[i + 1]
                        rows.push(`${moveNum}. ${white}${black ? `  ${black}` : ''}`)
                      }
                      return rows.map((row, i) => (
                        <div key={i} className="hover:bg-muted/50 px-1.5 py-0.5 rounded">{row}</div>
                      ))
                    })()}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
