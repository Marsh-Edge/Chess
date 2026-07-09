import { Board } from './board';
import { Color, PieceType, SquareIndex, GameStatus, GameResult, indexToSquare } from './types';
import { generateLegalMoves } from './moves';

export function getGameStatus(board: Board, color: Color, castlingRights: string, enPassantTarget: SquareIndex | null, moveHistory: string[], halfMoveClock: number): GameResult {
  const hasLegalMoves = generateLegalMoves(board, color, castlingRights, enPassantTarget).length > 0;
  const inCheck = board.isCheck(color);

  if (!hasLegalMoves) {
    if (inCheck) {
      return { status: GameStatus.Checkmate, winner: color === Color.White ? Color.Black : Color.White };
    }
    return { status: GameStatus.Stalemate };
  }

  if (isInsufficientMaterial(board)) {
    return { status: GameStatus.InsufficientMaterial };
  }

  if (halfMoveClock >= 100) {
    return { status: GameStatus.FiftyMoveRule };
  }

  if (isThreefoldRepetition(moveHistory)) {
    return { status: GameStatus.ThreefoldRepetition };
  }

  if (inCheck) {
    return { status: GameStatus.Check };
  }

  return { status: GameStatus.Playing };
}

export function isInsufficientMaterial(board: Board): boolean {
  const pieces = [];
  for (let i = 0; i < 64; i++) {
    const piece = board.getPiece(i);
    if (piece) pieces.push(piece);
  }

  if (pieces.length === 2) return true;

  if (pieces.length === 3) {
    const hasMinor = pieces.some(p => p.type === PieceType.Bishop || p.type === PieceType.Knight);
    return hasMinor;
  }

  return false;
}

export function isThreefoldRepetition(moveHistory: string[]): boolean {
  const positions = new Map<string, number>();
  for (const pos of moveHistory) {
    positions.set(pos, (positions.get(pos) || 0) + 1);
    if (positions.get(pos)! >= 3) return true;
  }
  return false;
}

export function getCapturedPieces(board: Board, color: Color, initialBoard?: Board): PieceType[] {
  const captured: PieceType[] = [];
  const initialPieces = new Map<string, number>();

  if (initialBoard) {
    for (let i = 0; i < 64; i++) {
      const p = initialBoard.getPiece(i);
      if (p && p.color === color) {
        const key = `${p.type}-${p.color}`;
        initialPieces.set(key, (initialPieces.get(key) || 0) + 1);
      }
    }
  }

  for (let i = 0; i < 64; i++) {
    const p = board.getPiece(i);
    if (p && p.color === color) {
      const key = `${p.type}-${p.color}`;
      initialPieces.set(key, (initialPieces.get(key) || 0) - 1);
    }
  }

  for (const [key, count] of initialPieces) {
    if (count > 0) {
      const type = key.split('-')[0] as PieceType;
      for (let j = 0; j < count; j++) {
        captured.push(type);
      }
    }
  }

  return captured;
}

export function moveToAlgebraic(move: { from: SquareIndex; to: SquareIndex; piece: { type: PieceType; color: Color }; captured?: { type: PieceType }; promotion?: PieceType; castling?: 'k' | 'q'; enPassant?: boolean }, disambiguation: string = ''): string {
  if (move.castling === 'k') return 'O-O';
  if (move.castling === 'q') return 'O-O-O';

  const pieceChar = move.piece.type === PieceType.Pawn ? '' : move.piece.type.toUpperCase();
  const capture = move.captured ? 'x' : '';
  const toSquare = indexToSquare(move.to);
  const promotion = move.promotion ? '=' + move.promotion.toUpperCase() : '';
  return `${pieceChar}${disambiguation}${capture}${toSquare}${promotion}`;
}
