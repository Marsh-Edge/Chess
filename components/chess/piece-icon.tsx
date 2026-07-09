import { PieceType, Color } from '@/lib/chess/types'

const PIECE_UNICODE: Record<string, string> = {
  'wk': '\u2654', 'wq': '\u2655', 'wr': '\u2656', 'wb': '\u2657', 'wn': '\u2658', 'wp': '\u2659',
  'bk': '\u265A', 'bq': '\u265B', 'br': '\u265C', 'bb': '\u265D', 'bn': '\u265E', 'bp': '\u265F',
}

export function PieceIcon({ type, color, size }: { type: PieceType; color: Color; size?: number }) {
  const unicode = PIECE_UNICODE[color + type]

  return (
    <span
      className="select-none leading-none flex items-center justify-center"
      style={{
        fontSize: size ?? 'clamp(32px, 9vw, 64px)',
        color: color === Color.White ? '#ffffff' : '#111111',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5)) drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
        WebkitTextStroke: color === Color.White ? '0.8px rgba(0,0,0,0.25)' : 'none',
      }}
    >
      {unicode}
    </span>
  )
}
