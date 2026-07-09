'use client'

import { EndgameTrainer } from '@/components/chess/endgame-trainer'

export default function EndgamesPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Endgame Training</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Learn and practice essential endgame techniques. Each position includes
          a step-by-step strategy guide and an interactive board to practice on.
        </p>
      </div>
      <EndgameTrainer />
    </div>
  )
}
