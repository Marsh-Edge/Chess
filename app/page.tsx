import Link from 'next/link'
import { Swords, Bot, ChartScatter, BookOpen, Target } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-8rem)] gap-8 text-center px-4 py-8">
      <div className="space-y-4">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">Chess</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Play, analyze, and improve your game
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 w-full max-w-lg">
        <Link
          href="/play?mode=pvp"
          className="flex flex-col items-center gap-3 p-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/20 transition-all hover:scale-105"
        >
          <Swords className="size-10" />
          <span className="text-xl font-semibold">Play vs Human</span>
          <span className="text-sm text-muted-foreground">Challenge a friend locally</span>
        </Link>
        <Link
          href="/play?mode=ai"
          className="flex flex-col items-center gap-3 p-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/20 transition-all hover:scale-105"
        >
          <Bot className="size-10" />
          <span className="text-xl font-semibold">Play vs Computer</span>
          <span className="text-sm text-muted-foreground">Face Stockfish AI</span>
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 w-full max-w-lg">
        <Link
          href="/analysis"
          className="flex flex-col items-center gap-2 p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/20 transition-all hover:scale-105"
        >
          <ChartScatter className="size-8" />
          <span className="text-base font-semibold">Analysis</span>
          <span className="text-xs text-muted-foreground">Evaluate positions with Stockfish</span>
        </Link>
        <Link
          href="/openings"
          className="flex flex-col items-center gap-2 p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/20 transition-all hover:scale-105"
        >
          <BookOpen className="size-8" />
          <span className="text-base font-semibold">Openings</span>
          <span className="text-xs text-muted-foreground">Browse ECO opening database</span>
        </Link>
        <Link
          href="/endgames"
          className="flex flex-col items-center gap-2 p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/20 transition-all hover:scale-105"
        >
          <Target className="size-8" />
          <span className="text-base font-semibold">Endgames</span>
          <span className="text-xs text-muted-foreground">Practice common endgame patterns</span>
        </Link>
      </div>
    </div>
  )
}
