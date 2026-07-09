'use client'

import { AnalysisBoard } from '@/components/chess/analysis-board'

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Analysis</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Analyze chess positions with the Stockfish engine. Load FEN strings,
          make moves, and get real-time evaluation scores and depth analysis.
        </p>
      </div>
      <AnalysisBoard />
    </div>
  )
}
