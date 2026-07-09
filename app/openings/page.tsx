'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getAllOpenings } from '@/lib/chess/openings'
import { ChessGame } from '@/lib/chess/game'
import { ChessBoard } from '@/components/chess/board'
import { SquareIndex } from '@/lib/chess/types'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface OpeningEntry {
  name: string
  eco: string
  fen: string
  moves: string[]
}

const OPENING_DESCRIPTIONS: Record<string, string> = {
  'Italian Game': 'One of the oldest chess openings. White develops the bishop to c4 targeting the weak f7 square, while preparing to castle quickly.',
  'Sicilian Defense': 'The most popular response to 1.e4. Black fights for the center asymmetrically, leading to rich tactical and strategic play.',
  'French Defense': 'A solid opening where Black creates a pawn chain e6-d5, leading to a closed position with space advantage for White.',
  'Ruy Lopez': 'One of the most studied openings. White puts pressure on Black\'s knight defending the e5 pawn, leading to deep strategic battles.',
  'Caro-Kann Defense': 'A solid and reliable opening where Black establishes a strong pawn center with c6 and d5, known for its defensive solidity.',
  'Queen\'s Gambit': 'An opening where White offers a pawn to gain central control. Black can accept or decline, leading to different strategic plans.',
  'King\'s Indian Defense': 'A hypermodern opening where Black allows White to occupy the center and then attacks it with pieces, leading to sharp play.',
  'Pirc Defense': 'A hypermodern opening where Black allows White to build a big center, planning to counter-attack with ...e5 or ...c5.',
  'English Opening': 'A flexible opening where White starts with 1.c4, controlling the d5 square and often transposing to other openings.',
  'Nimzo-Indian Defense': 'A strategic opening where Black pins the knight on c3, fighting for control of the e4 square and the dark squares.',
  'Grünfeld Defense': 'A dynamic opening where Black allows White to build a strong center, then attacks it with pieces, known for sharp tactical play.',
  'Queen\'s Indian Defense': 'A solid opening where Black develops the bishop to b7, controlling the e4 square and preparing to castle.',
  'Dutch Defense': 'An aggressive opening where Black plays ...f5, controlling the e4 square and preparing a kingside attack.',
  'Modern Defense': 'A hypermodern opening where Black fianchettoes the king\'s bishop and delays committing pawns to the center.',
  'Alekhine\'s Defense': 'A provocative opening where Black invites White to push pawns and create weaknesses, planning to counter-attack later.',
  'Scandinavian Defense': 'An immediate challenge to the center where Black captures on d5 with the queen, developing early but risking tempo loss.',
  'Petrov\'s Defense': 'A symmetrical opening where Black copies White\'s moves, leading to a solid but slightly passive position for Black.',
  'Philidor Defense': 'An old solid opening where Black supports the e5 pawn with ...d6, leading to a cramped but solid position.',
  'King\'s Gambit': 'A romantic-era opening where White sacrifices a pawn to gain rapid development and attacking chances.',
  'Vienna Game': 'A flexible opening where White develops the knight to c3 instead of f3, keeping options open for different setups.',
}

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'A', label: 'A' },
  { key: 'B', label: 'B' },
  { key: 'C', label: 'C' },
  { key: 'D', label: 'D' },
  { key: 'E', label: 'E' },
]

export default function OpeningsPage() {
  const [search, setSearch] = useState('')
  const [selectedOpening, setSelectedOpening] = useState<OpeningEntry | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [game, setGame] = useState<ChessGame | null>(null)
  const [selectedSq, setSelectedSq] = useState<SquareIndex | null>(null)
  const [legalMoves, setLegalMoves] = useState<SquareIndex[]>([])
  const [moveIndex, setMoveIndex] = useState(0)

  const allOpenings = getAllOpenings()

  const filtered = useMemo(() =>
    allOpenings.filter(o =>
      (activeCategory === 'all' || o.eco.startsWith(activeCategory)) &&
      (o.name.toLowerCase().includes(search.toLowerCase()) || o.eco.toLowerCase().includes(search.toLowerCase()))
    ),
    [allOpenings, search, activeCategory]
  )

  const handleOpeningClick = (opening: OpeningEntry) => {
    setSelectedOpening(opening)
    setMoveIndex(0)
    const g = new ChessGame(opening.fen)
    setGame(g)
    setSelectedSq(null)
    setLegalMoves([])
  }

  const handleBoardClick = (index: SquareIndex) => {
    if (!game) return
    if (selectedSq === null) {
      const piece = game.getState().board.getPiece(index)
      if (piece) {
        setSelectedSq(index)
        setLegalMoves(game.getLegalMoves().filter(m => m.from === index).map(m => m.to))
      }
    } else {
      const move = game.makeMove(selectedSq, index)
      if (move) {
        setSelectedSq(null)
        setLegalMoves([])
        setMoveIndex(m => m + 1)
      } else {
        setSelectedSq(null)
        setLegalMoves([])
      }
    }
  }

  const resetToOpening = () => {
    if (!selectedOpening) return
    setMoveIndex(0)
    const g = new ChessGame(selectedOpening.fen)
    setGame(g)
    setSelectedSq(null)
    setLegalMoves([])
  }

  const stepForward = () => {
    if (!game || !selectedOpening || moveIndex >= selectedOpening.moves.length) return
    const moves = selectedOpening.moves
    if (moveIndex < moves.length) {
      game.makeUCIMove(moves[moveIndex])
      setSelectedSq(null)
      setLegalMoves([])
      setMoveIndex(i => i + 1)
    }
  }

  const stepBack = () => {
    if (!game || moveIndex <= 0) return
    game.undoLastMove()
    setSelectedSq(null)
    setLegalMoves([])
    setMoveIndex(i => i - 1)
  }

  const state = game?.getState()
  const description = selectedOpening ? OPENING_DESCRIPTIONS[selectedOpening.name] : ''
  const mainVariations = selectedOpening?.moves.slice(0, 6) ?? []

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Opening Explorer</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Browse and learn chess openings. Select an opening to see its position
          on the board, read about its strategy, and step through the main moves.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        <div className="flex flex-col items-center w-full lg:max-w-[720px] shrink-0">
          {selectedOpening && state ? (
            <>
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
                  isInCheck={false}
                  onSquareClick={handleBoardClick}
                />
              </div>
              {mainVariations.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={stepBack} disabled={moveIndex === 0}>
                    <ChevronLeft className="size-3.5" />
                  </Button>
                  <span className="text-xs text-muted-foreground min-w-[4rem] text-center">
                    {moveIndex} / {mainVariations.length}
                  </span>
                  <Button variant="outline" size="sm" onClick={stepForward} disabled={moveIndex >= mainVariations.length}>
                    <ChevronRight className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={resetToOpening} className="text-xs">
                    Reset
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-20 w-full">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground text-lg">Select an opening from the list</p>
                <p className="text-sm text-muted-foreground/60">Browse by category or search by name</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-80 shrink-0">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search openings..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex gap-1 flex-wrap">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      activeCategory === cat.key
                        ? 'bg-foreground text-background font-medium'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                    onClick={() => setActiveCategory(cat.key)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="max-h-[220px] overflow-y-auto -mx-4 px-4 space-y-0.5">
                {filtered.map(opening => (
                  <button
                    key={opening.eco}
                    className={`w-full text-left px-2.5 py-2 rounded text-sm hover:bg-muted transition-colors flex items-start gap-2 cursor-pointer ${
                      selectedOpening?.eco === opening.eco ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleOpeningClick(opening)}
                  >
                    <Badge variant="outline" className="font-mono text-xs min-w-[2.5rem] mt-0.5 shrink-0">
                      {opening.eco}
                    </Badge>
                    <span className="text-sm leading-snug">{opening.name}</span>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No openings found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedOpening && (
            <Card className="mt-4">
              <CardContent className="p-4 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="font-mono text-xs">{selectedOpening.eco}</Badge>
                  </div>
                  <h2 className="text-lg font-bold leading-tight">{selectedOpening.name}</h2>
                </div>

                {description ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic leading-relaxed">An opening line from the ECO classification.</p>
                )}

                {mainVariations.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Main line</p>
                    <div className="text-sm font-mono bg-muted/40 rounded p-2.5 space-y-0.5">
                      {(() => {
                        const rows: string[] = []
                        for (let i = 0; i < mainVariations.length; i += 2) {
                          const moveNum = Math.floor(i / 2) + 1
                          const w = mainVariations[i]
                          const b = mainVariations[i + 1]
                          rows.push(`${moveNum}. ${w}${b ? `  ${b}` : ''}`)
                        }
                        return rows.map((row, i) => (
                          <div key={i} className={`${moveIndex >= (i * 2 + 2) ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            {row}
                          </div>
                        ))
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
