import { Piece, SquareIndex, isLightSquare } from '@/lib/chess/types'
import { PieceIcon } from './piece-icon'

interface SquareProps {
  index: SquareIndex
  piece: Piece | null
  isSelected: boolean
  isLegalMove: boolean
  isCheck: boolean
  isLastMove: boolean
  onClick: () => void
  boardFlipped: boolean
}

const FILES = 'abcdefgh'

export function Square({
  index,
  piece,
  isSelected,
  isLegalMove,
  isCheck,
  isLastMove,
  onClick,
  boardFlipped,
}: SquareProps) {
  const rank = Math.floor(index / 8)
  const file = index % 8
  const isLight = isLightSquare(index)
  const isTopEdge = rank === (boardFlipped ? 7 : 0)
  const isLeftEdge = file === (boardFlipped ? 7 : 0)

  const bg = isLight
    ? 'var(--board-light)'
    : 'var(--board-dark)'

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer transition-[background-color] duration-150 select-none"
      style={{ aspectRatio: '1', backgroundColor: bg }}
      onClick={onClick}
    >
      {isLeftEdge && (
        <span className="absolute top-0.5 left-0.5 text-[9px] font-bold opacity-50 select-none pointer-events-none leading-none" style={{ color: isLight ? 'var(--board-dark)' : 'var(--board-light)' }}>
          {boardFlipped ? rank + 1 : 8 - rank}
        </span>
      )}
      {isTopEdge && (
        <span className="absolute bottom-0.5 right-0.5 text-[9px] font-bold opacity-50 select-none pointer-events-none leading-none" style={{ color: isLight ? 'var(--board-dark)' : 'var(--board-light)' }}>
          {FILES[boardFlipped ? 7 - file : file]}
        </span>
      )}

      {isLastMove && (
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: 'var(--board-lastmove)' }} />
      )}

      {isCheck && (
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: 'var(--board-check)' }} />
      )}

      {isSelected && (
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: 'var(--board-selected)' }} />
      )}

      {piece && (
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <PieceIcon type={piece.type} color={piece.color} />
        </div>
      )}

      {isLegalMove && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          {piece ? (
            <div className="w-[90%] h-[90%] rounded-full border-[3px]" style={{ borderColor: 'var(--board-legal)' }} />
          ) : (
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--board-legal)' }} />
          )}
        </div>
      )}
    </div>
  )
}
