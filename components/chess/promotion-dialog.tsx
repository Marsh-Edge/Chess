'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { PieceType, Color } from '@/lib/chess/types'
import { PieceIcon } from './piece-icon'

interface PromotionDialogProps {
  open: boolean
  color: Color
  onSelect: (type: PieceType) => void
  onCancel: () => void
}

const PIECES = [PieceType.Queen, PieceType.Rook, PieceType.Bishop, PieceType.Knight]

export function PromotionDialog({ open, color, onSelect, onCancel }: PromotionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="w-auto p-4">
        <DialogTitle className="text-sm text-center">Promote pawn</DialogTitle>
        <div className="flex gap-2 justify-center">
          {PIECES.map((type) => (
            <button
              key={type}
              className="flex items-center justify-center w-14 h-14 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"
              onClick={() => onSelect(type)}
            >
              <PieceIcon type={type} color={color} size={32} />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
