import { Board } from './board';
import { Color, SquareIndex, squareToIndex, indexToSquare } from './types';

export interface FenData {
  board: Board;
  activeColor: Color;
  castlingRights: string;
  enPassantTarget: SquareIndex | null;
  halfMoveClock: number;
  fullMoveNumber: number;
}

export function parseFen(fen: string): FenData {
  const parts = fen.trim().split(/\s+/);

  const boardPart = parts[0];
  const activeColor = parts[1] === 'w' ? Color.White : Color.Black;
  const castlingRights = parts[2] || '-';
  const enPassantTarget = parts[3] && parts[3] !== '-' ? squareToIndex(parts[3]) : null;
  const halfMoveClock = parseInt(parts[4]) || 0;
  const fullMoveNumber = parseInt(parts[5]) || 1;

  return {
    board: Board.fromFen(boardPart),
    activeColor,
    castlingRights,
    enPassantTarget,
    halfMoveClock,
    fullMoveNumber,
  };
}

export function generateFen(
  board: Board,
  activeColor: Color,
  castlingRights: string,
  enPassantTarget: SquareIndex | null,
  halfMoveClock: number,
  fullMoveNumber: number
): string {
  const boardPart = board.toFen();
  const activePart = activeColor === Color.White ? 'w' : 'b';
  const castlingPart = castlingRights || '-';
  const enPassantPart = enPassantTarget !== null ? indexToSquare(enPassantTarget) : '-';

  return `${boardPart} ${activePart} ${castlingPart} ${enPassantPart} ${halfMoveClock} ${fullMoveNumber}`;
}

export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
