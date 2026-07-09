'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { useEffect, useRef } from 'react'

interface MoveListProps {
  moves: string[]
}

export function MoveList({ moves }: MoveListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [moves.length])

  const pairs: { num: number; white?: string; black?: string }[] = []
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    })
  }

  return (
    <Card>
      <div className="px-3 py-2 font-semibold text-xs text-muted-foreground uppercase tracking-wider border-b">Moves</div>
      <ScrollArea ref={scrollRef} className="h-[200px]">
        <div className="p-2">
          {pairs.map((pair) => (
            <div key={pair.num} className="flex text-sm gap-1 py-0.5 hover:bg-muted/50 rounded px-2 items-center">
              <span className="w-7 text-xs text-muted-foreground font-medium tabular-nums">{pair.num}.</span>
              <span className="w-18 font-mono text-xs px-1.5 py-0.5 rounded bg-muted/30">{pair.white || ''}</span>
              <span className="w-18 font-mono text-xs px-1.5 py-0.5 rounded bg-muted/30">{pair.black || ''}</span>
            </div>
          ))}
          {moves.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-6">No moves yet</div>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
