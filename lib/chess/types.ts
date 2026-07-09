export enum PieceType {
  King = 'k',
  Queen = 'q',
  Rook = 'r',
  Bishop = 'b',
  Knight = 'n',
  Pawn = 'p',
}

export enum Color {
  White = 'w',
  Black = 'b',
}

export interface Piece {
  type: PieceType;
  color: Color;
}

export type SquareIndex = number;

export interface Move {
  from: SquareIndex;
  to: SquareIndex;
  piece: Piece;
  captured?: Piece;
  promotion?: PieceType;
  castling?: 'k' | 'q';
  enPassant?: boolean;
}

export enum GameStatus {
  Playing = 'playing',
  Check = 'check',
  Checkmate = 'checkmate',
  Stalemate = 'stalemate',
  Draw = 'draw',
  ThreefoldRepetition = 'threefold-repetition',
  FiftyMoveRule = 'fifty-move-rule',
  InsufficientMaterial = 'insufficient-material',
}

export interface GameResult {
  status: GameStatus;
  winner?: Color;
  reason?: string;
}

export const FILES = 'abcdefgh';
export const RANKS = '87654321';

export function squareToIndex(square: string): SquareIndex {
  const file = square.charCodeAt(0) - 97;
  const rank = 8 - parseInt(square[1]);
  return rank * 8 + file;
}

export function indexToSquare(index: SquareIndex): string {
  const file = index % 8;
  const rank = Math.floor(index / 8);
  return FILES[file] + RANKS[rank];
}

export function isLightSquare(index: SquareIndex): boolean {
  const file = index % 8;
  const rank = Math.floor(index / 8);
  return (file + rank) % 2 === 1;
}

export function opponent(color: Color): Color {
  return color === Color.White ? Color.Black : Color.White;
}
