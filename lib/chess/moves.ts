import { Board } from './board';
import { Piece, PieceType, Color, SquareIndex, Move, indexToSquare, opponent } from './types';

export function generateLegalMoves(board: Board, color: Color, castlingRights: string, enPassantTarget: SquareIndex | null): Move[] {
  const pseudoMoves = generatePseudoLegalMoves(board, color, castlingRights, enPassantTarget);
  return pseudoMoves.filter(move => !wouldBeInCheck(board, move, color));
}

function generatePseudoLegalMoves(board: Board, color: Color, castlingRights: string, enPassantTarget: SquareIndex | null): Move[] {
  const moves: Move[] = [];
  const pieces = board.getAllPieces(color);

  for (const { index, piece } of pieces) {
    switch (piece.type) {
      case PieceType.Pawn:
        moves.push(...getPawnMoves(board, index, piece, enPassantTarget));
        break;
      case PieceType.Knight:
        moves.push(...getMoves(board, index, piece, board.getPseudoLegalAttacks(index)));
        break;
      case PieceType.Bishop:
        moves.push(...getMoves(board, index, piece, board.getPseudoLegalAttacks(index)));
        break;
      case PieceType.Rook:
        moves.push(...getMoves(board, index, piece, board.getPseudoLegalAttacks(index)));
        break;
      case PieceType.Queen:
        moves.push(...getMoves(board, index, piece, board.getPseudoLegalAttacks(index)));
        break;
      case PieceType.King:
        moves.push(...getMoves(board, index, piece, board.getPseudoLegalAttacks(index)));
        moves.push(...getCastlingMoves(board, index, piece, castlingRights));
        break;
    }
  }

  return moves;
}

function getMoves(board: Board, from: SquareIndex, piece: Piece, targets: SquareIndex[]): Move[] {
  const moves: Move[] = [];
  for (const to of targets) {
    const captured = board.getPiece(to);
    if (captured && captured.color === piece.color) continue;
    moves.push({ from, to, piece, captured: captured || undefined });
  }
  return moves;
}

function getPawnMoves(board: Board, index: SquareIndex, piece: Piece, enPassantTarget: SquareIndex | null): Move[] {
  const moves: Move[] = [];
  const rank = Math.floor(index / 8);
  const file = index % 8;
  const direction = piece.color === Color.White ? -1 : 1;
  const startRank = piece.color === Color.White ? 6 : 1;
  const promotionRank = piece.color === Color.White ? 0 : 7;

  const oneForward = (rank + direction) * 8 + file;
  if (rank + direction >= 0 && rank + direction < 8 && !board.isSquareOccupied(oneForward)) {
    if (rank + direction === promotionRank) {
      moves.push(...getPromotionMoves(index, oneForward, piece));
    } else {
      moves.push({ from: index, to: oneForward, piece });
    }

    const twoForward = (rank + 2 * direction) * 8 + file;
    if (rank === startRank && !board.isSquareOccupied(twoForward)) {
      moves.push({ from: index, to: twoForward, piece });
    }
  }

  for (const df of [-1, 1]) {
    const newFile = file + df;
    if (newFile < 0 || newFile >= 8) continue;
    const captureTarget = (rank + direction) * 8 + newFile;
    if (rank + direction < 0 || rank + direction >= 8) continue;

    const capturedPiece = board.getPiece(captureTarget);
    if (capturedPiece && capturedPiece.color !== piece.color) {
      if (rank + direction === promotionRank) {
        moves.push(...getPromotionMoves(index, captureTarget, piece, capturedPiece));
      } else {
        moves.push({ from: index, to: captureTarget, piece, captured: capturedPiece });
      }
    }

    if (enPassantTarget !== null && captureTarget === enPassantTarget) {
      const enPassantCaptureIndex = rank * 8 + newFile;
      const epCaptured = board.getPiece(enPassantCaptureIndex);
      moves.push({
        from: index,
        to: captureTarget,
        piece,
        captured: epCaptured || undefined,
        enPassant: true,
      });
    }
  }

  return moves;
}

function getPromotionMoves(from: SquareIndex, to: SquareIndex, piece: Piece, captured?: Piece): Move[] {
  return [PieceType.Queen, PieceType.Rook, PieceType.Bishop, PieceType.Knight].map(promotion => ({
    from, to, piece, captured, promotion,
  }));
}

function getCastlingMoves(board: Board, index: SquareIndex, piece: Piece, castlingRights: string): Move[] {
  const moves: Move[] = [];
  const color = piece.color;
  const rank = color === Color.White ? 7 : 0;

  if (board.isCheck(color)) return moves;

  if (castlingRights.includes(color === Color.White ? 'K' : 'k')) {
    if (!board.isSquareOccupied(rank * 8 + 5) && !board.isSquareOccupied(rank * 8 + 6)) {
      if (!board.isAttacked(rank * 8 + 4, opponent(color)) &&
          !board.isAttacked(rank * 8 + 5, opponent(color)) &&
          !board.isAttacked(rank * 8 + 6, opponent(color))) {
        moves.push({ from: index, to: rank * 8 + 6, piece, castling: 'k' });
      }
    }
  }

  if (castlingRights.includes(color === Color.White ? 'Q' : 'q')) {
    if (!board.isSquareOccupied(rank * 8 + 3) && !board.isSquareOccupied(rank * 8 + 2) && !board.isSquareOccupied(rank * 8 + 1)) {
      if (!board.isAttacked(rank * 8 + 4, opponent(color)) &&
          !board.isAttacked(rank * 8 + 3, opponent(color)) &&
          !board.isAttacked(rank * 8 + 2, opponent(color))) {
        moves.push({ from: index, to: rank * 8 + 2, piece, castling: 'q' });
      }
    }
  }

  return moves;
}

function wouldBeInCheck(board: Board, move: Move, color: Color): boolean {
  const testBoard = board.clone();
  applyMoveToBoard(testBoard, move);

  const kingIndex = testBoard.getKingIndex(color);
  if (kingIndex === -1) return true;

  return testBoard.isAttacked(kingIndex, opponent(color));
}

export function applyMoveToBoard(board: Board, move: Move): void {
  board.setPiece(move.from, null);
  board.setPiece(move.to, move.piece);

  if (move.enPassant) {
    const capturedRank = move.from % 8 === move.to % 8
      ? Math.floor(move.from / 8)
      : Math.floor(move.from / 8);
    const epIndex = capturedRank * 8 + (move.to % 8);
    board.setPiece(epIndex, null);
  }

  if (move.castling === 'k') {
    const rank = move.from;
    board.setPiece(rank * 8 + 7, null);
    board.setPiece(rank * 8 + 5, { type: PieceType.Rook, color: move.piece.color });
  } else if (move.castling === 'q') {
    const rank = move.from;
    board.setPiece(rank * 8 + 0, null);
    board.setPiece(rank * 8 + 3, { type: PieceType.Rook, color: move.piece.color });
  }

  if (move.promotion) {
    board.setPiece(move.to, { type: move.promotion, color: move.piece.color });
  }
}

export function applyMove(board: Board, move: Move): Board {
  const newBoard = board.clone();
  applyMoveToBoard(newBoard, move);
  return newBoard;
}

export function moveToUCI(move: Move): string {
  return indexToSquare(move.from) + indexToSquare(move.to) + (move.promotion || '');
}
