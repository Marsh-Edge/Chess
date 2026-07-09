'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getOpeningName, getOpeningContinuation } from '@/lib/chess/openings'

interface OpeningExplorerProps {
  fen: string
}

export function OpeningExplorer({ fen }: OpeningExplorerProps) {
  const openingName = useMemo(() => getOpeningName(fen), [fen])
  const continuation = useMemo(() => getOpeningContinuation(fen), [fen])

  return (
    <Card className="p-3">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Opening</div>
      {openingName ? (
        <div className="space-y-2">
          <Badge variant="secondary" className="text-xs">{openingName}</Badge>
          {continuation && continuation.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Suggested: </span>
              {continuation.join(' ')}
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">No opening recognized</div>
      )}
    </Card>
  )
}
