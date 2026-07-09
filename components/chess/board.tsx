'use client'

import { useState } from 'react'
import { SquareIndex, Color } from '@/lib/chess/types'
import { Board as BoardClass } from '@/lib/chess/board'
import { Square } from './square'

interface BoardProps {
  board: BoardClass
  activeColor: Color
  selectedSquare: SquareIndex | null
  legalMoves: SquareIndex[]
  lastMove: { from: SquareIndex; to: SquareIndex } | null
  isInCheck: boolean
  onSquareClick: (index: SquareIndex) => void
}

export function ChessBoard({
  board,
  activeColor,
  selectedSquare,
  legalMoves,
  lastMove,
  isInCheck,
  onSquareClick,
}: BoardProps) {
  const [flipped, setFlipped] = useState(false)

  const squares: number[] = []
  for (let i = 0; i < 64; i++) {
    squares.push(flipped ? 63 - i : i)
  }

  const kingIndex = board.getKingIndex(activeColor)
  const checkSquare = isInCheck ? kingIndex : -1

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="grid grid-cols-8 gap-0 shadow-2xl rounded-lg overflow-hidden w-full"
        style={{
          maxWidth: 'min(95vw, 720px)',
          border: '2px solid var(--border)',
        }}
      >
        {squares.map((index) => {
          const piece = board.getPiece(index)
          const isSelected = selectedSquare === index
          const isLegal = legalMoves.includes(index)
          const isCheckSquare = checkSquare === index
          const isLastMove = lastMove !== null && (lastMove.from === index || lastMove.to === index)

          return (
            <Square
              key={index}
              index={index}
              piece={piece}
              isSelected={isSelected}
              isLegalMove={isLegal}
              isCheck={isCheckSquare}
              isLastMove={isLastMove}
              onClick={() => onSquareClick(index)}
              boardFlipped={flipped}
            />
          )
        })}
      </div>
      <button
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setFlipped(!flipped)}
      >
        Flip Board
      </button>
    </div>
  )
}
