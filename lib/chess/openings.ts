import openingsData from '@/data/openings.json';


interface OpeningEntry {
  name: string;
  eco: string;
  fen: string;
  moves: string[];
}

const openings: OpeningEntry[] = openingsData as OpeningEntry[];

export function getOpeningName(currentFen: string): string | null {
  const normalizedFen = normalizeFen(currentFen);

  let bestMatch: OpeningEntry | null = null;
  let bestMoveCount = 0;

  for (const opening of openings) {
    const openingFen = normalizeFen(opening.fen);

    if (openingFen === normalizedFen) {
      if (opening.moves.length > bestMoveCount) {
        bestMatch = opening;
        bestMoveCount = opening.moves.length;
      }
    }
  }

  if (bestMatch) {
    return `${bestMatch.eco} - ${bestMatch.name}`;
  }

  for (const opening of openings) {
    const openingFen = normalizeFen(opening.fen);
    if (normalizedFen.startsWith(openingFen.substring(0, Math.min(openingFen.length, 20)))) {
      if (opening.moves.length > bestMoveCount) {
        bestMatch = opening;
        bestMoveCount = opening.moves.length;
      }
    }
  }

  return bestMatch ? `${bestMatch.eco} - ${bestMatch.name}` : null;
}

export function getOpeningContinuation(currentFen: string): string[] | null {
  const normalizedFen = normalizeFen(currentFen);

  for (const opening of openings) {
    const openingFen = normalizeFen(opening.fen);
    if (openingFen === normalizedFen) {
      return opening.moves.slice(0, 3);
    }
  }

  return null;
}

export function getAllOpenings(): OpeningEntry[] {
  return openings;
}

function normalizeFen(fen: string): string {
  const parts = fen.trim().split(/\s+/);
  const boardPart = parts[0];
  const activePart = parts[1] || 'w';
  const castlingPart = parts[2] || '-';
  const epPart = parts[3] || '-';

  const rows = boardPart.split('/').map(row => {
    let expanded = '';
    for (const char of row) {
      if (char >= '1' && char <= '8') {
        expanded += ' '.repeat(parseInt(char));
      } else {
        expanded += char;
      }
    }
    return expanded;
  });

  const normalizedRows = rows.map(row => {
    let result = '';
    let emptyCount = 0;
    for (const char of row) {
      if (char === ' ') {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          result += emptyCount;
          emptyCount = 0;
        }
        result += char;
      }
    }
    if (emptyCount > 0) result += emptyCount;
    return result;
  });

  return `${normalizedRows.join('/')} ${activePart} ${castlingPart} ${epPart}`;
}
