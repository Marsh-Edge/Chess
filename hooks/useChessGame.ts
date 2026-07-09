'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { ChessGame } from '@/lib/chess/game'
import { SquareIndex, PieceType, Color, GameStatus, opponent } from '@/lib/chess/types'
import { initAI, sendCommand, setMoveCallback } from '@/lib/chess/stockfish-worker'

export function useChessGame(mode?: 'pvp' | 'ai', initialPlayerColor?: Color, initialAiLevel?: number) {
  const [game] = useState(() => new ChessGame())

  const [state, setState] = useState(() => game.getState())
  const [selectedSquare, setSelectedSquare] = useState<SquareIndex | null>(null)
  const [legalMoves, setLegalMoves] = useState<SquareIndex[]>([])
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>(mode ?? 'pvp')
  const [playerColor, setPlayerColor] = useState<Color>(initialPlayerColor ?? Color.White)
  const [aiLevel, setAiLevel] = useState(initialAiLevel ?? 3)

  const isAIThinkingRef = useRef(false)
  const gameModeRef = useRef(gameMode)
  const playerColorRef = useRef(playerColor)
  const aiLevelRef = useRef(aiLevel)

  useEffect(() => {
    gameModeRef.current = gameMode
  }, [gameMode])

  useEffect(() => {
    playerColorRef.current = playerColor
  }, [playerColor])

  useEffect(() => {
    aiLevelRef.current = aiLevel
  }, [aiLevel])

  const refreshState = useCallback(() => {
    setState(game.getState())
  }, [game])

  const applyAIMove = useCallback(async () => {
    if (isAIThinkingRef.current) return
    isAIThinkingRef.current = true
    setIsAIThinking(true)
    try {
      await initAI(aiLevelRef.current)

      await new Promise<void>((resolve) => {
        setMoveCallback((bestMove: string) => {
          if (bestMove && bestMove !== '(none)') {
            game.makeUCIMove(bestMove)
            refreshState()
          }
          resolve()
        })
        sendCommand(`position fen ${game.getFen()}`)
        sendCommand('go depth 10')
      })
    } catch (err) {
      console.error('[AI] Error:', err)
    }
    isAIThinkingRef.current = false
    setIsAIThinking(false)
  }, [game, refreshState])

  const isGameOver = state.result.status !== GameStatus.Playing && state.result.status !== GameStatus.Check

  const handleSquareClick = useCallback((index: SquareIndex) => {
    if (isGameOver) return
    if (gameModeRef.current === 'ai' && state.activeColor === opponent(playerColorRef.current)) return

    if (selectedSquare === null) {
      const piece = state.board.getPiece(index)
      if (piece && piece.color === state.activeColor) {
        setSelectedSquare(index)
        setLegalMoves(game.getLegalMoves().filter(m => m.from === index).map(m => m.to))
      }
    } else {
      if (index === selectedSquare) {
        setSelectedSquare(null)
        setLegalMoves([])
        return
      }

      const piece = state.board.getPiece(index)
      if (piece && piece.color === state.activeColor) {
        setSelectedSquare(index)
        setLegalMoves(game.getLegalMoves().filter(m => m.from === index).map(m => m.to))
        return
      }

      const move = game.makeMove(selectedSquare, index)
      if (move) {
        setSelectedSquare(null)
        setLegalMoves([])
        refreshState()
      } else {
        setSelectedSquare(null)
        setLegalMoves([])
      }
    }
  }, [selectedSquare, state, game, refreshState, isGameOver])

  const makeMove = useCallback((from: SquareIndex, to: SquareIndex, promotion?: PieceType): boolean => {
    const move = game.makeMove(from, to, promotion)
    if (move) {
      setSelectedSquare(null)
      setLegalMoves([])
      refreshState()
      return true
    }
    return false
  }, [game, refreshState])

  const undoMove = useCallback(() => {
    if (game.undoLastMove()) {
      setSelectedSquare(null)
      setLegalMoves([])
      refreshState()
    }
  }, [game, refreshState])

  const resetGame = useCallback(() => {
    game.reset()
    setSelectedSquare(null)
    setLegalMoves([])
    setIsAIThinking(false)
    isAIThinkingRef.current = false
    refreshState()
  }, [game, refreshState])

  const setFen = useCallback((fen: string) => {
    game.reset(fen)
    setSelectedSquare(null)
    setLegalMoves([])
    refreshState()
  }, [game, refreshState])

  const getLegalMovesForSquare = useCallback((index: SquareIndex): SquareIndex[] => {
    return game.getLegalMoves().filter(m => m.from === index).map(m => m.to)
  }, [game])

  useEffect(() => {
    if (gameModeRef.current !== 'ai') return
    if (isAIThinkingRef.current) return
    if (isGameOver) return
    if (state.activeColor !== opponent(playerColorRef.current)) return

    const id = setTimeout(() => applyAIMove(), 150)
    return () => clearTimeout(id)
  }, [state.moves.length, state.activeColor, state.result.status, applyAIMove, isGameOver])

  return useMemo(() => ({
    state,
    selectedSquare,
    legalMoves,
    isAIThinking,
    gameMode,
    playerColor,
    aiLevel,
    setGameMode,
    setPlayerColor,
    setAiLevel,
    handleSquareClick,
    makeMove,
    undoMove,
    resetGame,
    setFen,
    getLegalMovesForSquare,
    refreshState,
  }), [
    state, selectedSquare, legalMoves, isAIThinking,
    gameMode, playerColor, aiLevel,
    setGameMode, setPlayerColor, setAiLevel,
    handleSquareClick, makeMove, undoMove, resetGame, setFen,
    getLegalMovesForSquare, refreshState,
  ])
}
