import { Piece, PieceType, Color, SquareIndex, opponent } from './types';

export class Board {
  private squares: (Piece | null)[];

  constructor() {
    this.squares = new Array(64).fill(null);
  }

  static startingPosition(): Board {
    const board = new Board();
    const backRank = [PieceType.Rook, PieceType.Knight, PieceType.Bishop, PieceType.Queen, PieceType.King, PieceType.Bishop, PieceType.Knight, PieceType.Rook];

    for (let file = 0; file < 8; file++) {
      board.setPiece(0 * 8 + file, { type: backRank[file], color: Color.Black });
      board.setPiece(1 * 8 + file, { type: PieceType.Pawn, color: Color.Black });
      board.setPiece(6 * 8 + file, { type: PieceType.Pawn, color: Color.White });
      board.setPiece(7 * 8 + file, { type: backRank[file], color: Color.White });
    }

    return board;
  }

  static empty(): Board {
    return new Board();
  }

  getPiece(index: SquareIndex): Piece | null {
    return this.squares[index];
  }

  setPiece(index: SquareIndex, piece: Piece | null): void {
    this.squares[index] = piece;
  }

  clone(): Board {
    const board = new Board();
    board.squares = [...this.squares];
    return board;
  }

  getKingIndex(color: Color): SquareIndex {
    for (let i = 0; i < 64; i++) {
      const piece = this.squares[i];
      if (piece && piece.type === PieceType.King && piece.color === color) {
        return i;
      }
    }
    return -1;
  }

  findAttacks(index: SquareIndex, byColor: Color): SquareIndex[] {
    const attackers: SquareIndex[] = [];
    for (let i = 0; i < 64; i++) {
      const piece = this.squares[i];
      if (piece && piece.color === byColor) {
        const attacks = this.getPseudoLegalAttacks(i);
        if (attacks.includes(index)) {
          attackers.push(i);
        }
      }
    }
    return attackers;
  }

  isAttacked(index: SquareIndex, byColor: Color): boolean {
    for (let i = 0; i < 64; i++) {
      const piece = this.squares[i];
      if (piece && piece.color === byColor) {
        const attacks = this.getPseudoLegalAttacks(i);
        if (attacks.includes(index)) return true;
      }
    }
    return false;
  }

  isCheck(color: Color): boolean {
    const kingIndex = this.getKingIndex(color);
    if (kingIndex === -1) return false;
    return this.isAttacked(kingIndex, opponent(color));
  }

  getPseudoLegalAttacks(index: SquareIndex): SquareIndex[] {
    const piece = this.squares[index];
    if (!piece) return [];

    switch (piece.type) {
      case PieceType.Pawn: return this.getPawnAttacks(index, piece.color);
      case PieceType.Knight: return this.getKnightMoves(index);
      case PieceType.Bishop: return this.getSlidingMoves(index, [1, 1], [1, -1], [-1, 1], [-1, -1]);
      case PieceType.Rook: return this.getSlidingMoves(index, [1, 0], [-1, 0], [0, 1], [0, -1]);
      case PieceType.Queen: return this.getSlidingMoves(index, [1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]);
      case PieceType.King: return this.getKingMoves(index);
      default: return [];
    }
  }

  isSquareOccupied(index: SquareIndex): boolean {
    return this.squares[index] !== null;
  }

  private getPawnAttacks(index: SquareIndex, color: Color): SquareIndex[] {
    const attacks: SquareIndex[] = [];
    const rank = Math.floor(index / 8);
    const file = index % 8;
    const direction = color === Color.White ? -1 : 1;

    for (const df of [-1, 1]) {
      const newFile = file + df;
      const newRank = rank + direction;
      if (newFile >= 0 && newFile < 8 && newRank >= 0 && newRank < 8) {
        const target = newRank * 8 + newFile;
        const targetPiece = this.squares[target];
        if (targetPiece && targetPiece.color !== color) {
          attacks.push(target);
        }
        attacks.push(target);
      }
    }

    return attacks;
  }

  private getKnightMoves(index: SquareIndex): SquareIndex[] {
    const moves: SquareIndex[] = [];
    const rank = Math.floor(index / 8);
    const file = index % 8;
    const offsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];

    for (const [dr, df] of offsets) {
      const newRank = rank + dr;
      const newFile = file + df;
      if (newRank >= 0 && newRank < 8 && newFile >= 0 && newFile < 8) {
        moves.push(newRank * 8 + newFile);
      }
    }

    return moves;
  }

  private getSlidingMoves(index: SquareIndex, ...directions: [number, number][]): SquareIndex[] {
    const moves: SquareIndex[] = [];
    const rank = Math.floor(index / 8);
    const file = index % 8;
    const piece = this.squares[index];
    if (!piece) return moves;

    for (const [dr, df] of directions) {
      let newRank = rank + dr;
      let newFile = file + df;
      while (newRank >= 0 && newRank < 8 && newFile >= 0 && newFile < 8) {
        const target = newRank * 8 + newFile;
        const targetPiece = this.squares[target];
        if (targetPiece) {
          if (targetPiece.color !== piece.color) {
            moves.push(target);
          }
          break;
        }
        moves.push(target);
        newRank += dr;
        newFile += df;
      }
    }

    return moves;
  }

  private getKingMoves(index: SquareIndex): SquareIndex[] {
    const moves: SquareIndex[] = [];
    const rank = Math.floor(index / 8);
    const file = index % 8;

    for (let dr = -1; dr <= 1; dr++) {
      for (let df = -1; df <= 1; df++) {
        if (dr === 0 && df === 0) continue;
        const newRank = rank + dr;
        const newFile = file + df;
        if (newRank >= 0 && newRank < 8 && newFile >= 0 && newFile < 8) {
          moves.push(newRank * 8 + newFile);
        }
      }
    }

    return moves;
  }

  getAllPieces(color: Color): { index: SquareIndex; piece: Piece }[] {
    const result: { index: SquareIndex; piece: Piece }[] = [];
    for (let i = 0; i < 64; i++) {
      const piece = this.squares[i];
      if (piece && piece.color === color) {
        result.push({ index: i, piece });
      }
    }
    return result;
  }

  toFen(): string {
    let fen = '';
    for (let rank = 0; rank < 8; rank++) {
      let emptyCount = 0;
      for (let file = 0; file < 8; file++) {
        const piece = this.squares[rank * 8 + file];
        if (piece) {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          const char = piece.type;
          fen += piece.color === Color.White ? char.toUpperCase() : char;
        } else {
          emptyCount++;
        }
      }
      if (emptyCount > 0) fen += emptyCount;
      if (rank < 7) fen += '/';
    }
    return fen;
  }

  static fromFen(boardPart: string): Board {
    const board = new Board();
    const rows = boardPart.split('/');
    for (let rank = 0; rank < 8; rank++) {
      let file = 0;
      for (const char of rows[rank]) {
        if (char >= '1' && char <= '8') {
          file += parseInt(char);
        } else {
          const isUpper = char === char.toUpperCase();
          const pieceType = char.toLowerCase() as PieceType;
          board.setPiece(rank * 8 + file, {
            type: pieceType,
            color: isUpper ? Color.White : Color.Black,
          });
          file++;
        }
      }
    }
    return board;
  }
}
