

export interface PgnData {
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  white?: string;
  black?: string;
  result?: string;
  moves: string[];
}

export function generatePgn(moves: string[], headers?: Partial<PgnData>): string {
  const lines: string[] = [];

  const defaultHeaders: Record<string, string> = {
    Event: headers?.event || 'Chess Game',
    Site: headers?.site || 'Local',
    Date: headers?.date || new Date().toISOString().split('T')[0].replace(/-/g, '.'),
    Round: headers?.round || '1',
    White: headers?.white || 'White',
    Black: headers?.black || 'Black',
    Result: headers?.result || '*',
  };

  for (const [key, value] of Object.entries(defaultHeaders)) {
    lines.push(`[${key} "${value}"]`);
  }

  lines.push('');

  const moveText: string[] = [];
  for (let i = 0; i < moves.length; i++) {
    if (i % 2 === 0) {
      moveText.push(`${Math.floor(i / 2) + 1}.`);
    }
    moveText.push(moves[i]);
  }

  lines.push(moveText.join(' '));

  return lines.join('\n');
}

export function parsePgn(pgn: string): PgnData {
  const data: PgnData = { moves: [] };

  const headerRegex = /\[(\w+)\s+"(.*)"\]/g;
  let match;
  while ((match = headerRegex.exec(pgn)) !== null) {
    const key = match[1].toLowerCase();
    const value = match[2];
    switch (key) {
      case 'event': data.event = value; break;
      case 'site': data.site = value; break;
      case 'date': data.date = value; break;
      case 'round': data.round = value; break;
      case 'white': data.white = value; break;
      case 'black': data.black = value; break;
      case 'result': data.result = value; break;
    }
  }

  const moveText = pgn.replace(/\[.*?\]/g, '').trim();
  const moveRegex = /\d+\.\s*([\w=#+-]+)/g;
  while ((match = moveRegex.exec(moveText)) !== null) {
    data.moves.push(match[1]);
  }

  if (moveText.endsWith('1-0') || moveText.endsWith('0-1') || moveText.endsWith('1/2-1/2')) {
    const result = moveText.match(/(1-0|0-1|1\/2-1\/2)$/);
    if (result) data.result = result[1];
  }

  return data;
}
