import { Board } from './board';
import {
  PieceType, Color, SquareIndex, Move, GameStatus, GameResult,
  squareToIndex, opponent,
} from './types';
import { generateLegalMoves, applyMoveToBoard } from './moves';
import { getGameStatus, moveToAlgebraic, getCapturedPieces } from './rules';
import { parseFen, generateFen, STARTING_FEN } from './fen';
import { generatePgn } from './pgn';

export interface GameState {
  board: Board;
  activeColor: Color;
  castlingRights: string;
  enPassantTarget: SquareIndex | null;
  halfMoveClock: number;
  fullMoveNumber: number;
  moves: Move[];
  moveNotation: string[];
  positionHistory: string[];
  result: GameResult;
  capturedWhite: PieceType[];
  capturedBlack: PieceType[];
}

export class ChessGame {
  private board: Board;
  private activeColor: Color;
  private castlingRights: string;
  private enPassantTarget: SquareIndex | null;
  private halfMoveClock: number;
  private fullMoveNumber: number;
  private moves: Move[];
  private moveNotation: string[];
  private positionHistory: string[];
  private result: GameResult;
  private initialBoard: Board;

  constructor(fen?: string) {
    if (fen) {
      const data = parseFen(fen);
      this.board = data.board;
      this.activeColor = data.activeColor;
      this.castlingRights = data.castlingRights;
      this.enPassantTarget = data.enPassantTarget;
      this.halfMoveClock = data.halfMoveClock;
      this.fullMoveNumber = data.fullMoveNumber;
    } else {
      const data = parseFen(STARTING_FEN);
      this.board = data.board;
      this.activeColor = data.activeColor;
      this.castlingRights = data.castlingRights;
      this.enPassantTarget = data.enPassantTarget;
      this.halfMoveClock = data.halfMoveClock;
      this.fullMoveNumber = data.fullMoveNumber;
    }

    this.moves = [];
    this.moveNotation = [];
    this.positionHistory = [this.getPositionKey()];
    this.result = { status: GameStatus.Playing };
    this.initialBoard = this.board.clone();
  }

  getState(): GameState {
    return {
      board: this.board,
      activeColor: this.activeColor,
      castlingRights: this.castlingRights,
      enPassantTarget: this.enPassantTarget,
      halfMoveClock: this.halfMoveClock,
      fullMoveNumber: this.fullMoveNumber,
      moves: [...this.moves],
      moveNotation: [...this.moveNotation],
      positionHistory: [...this.positionHistory],
      result: { ...this.result },
      capturedWhite: getCapturedPieces(this.board, Color.White, this.initialBoard),
      capturedBlack: getCapturedPieces(this.board, Color.Black, this.initialBoard),
    };
  }

  getLegalMoves(): Move[] {
    return generateLegalMoves(this.board, this.activeColor, this.castlingRights, this.enPassantTarget);
  }

  makeMove(from: SquareIndex, to: SquareIndex, promotion?: PieceType): Move | null {
    const legalMoves = this.getLegalMoves();
    const move = legalMoves.find(m =>
      m.from === from && m.to === to &&
      (!promotion || m.promotion === promotion)
    );

    if (!move) {
      const fallback = legalMoves.find(m =>
        m.from === from && m.to === to
      );
      if (!fallback) return null;
      return this.applyMove(fallback);
    }

    return this.applyMove(move);
  }

  makeUCIMove(uci: string): Move | null {
    if (uci.length < 4) return null;
    const from = squareToIndex(uci.substring(0, 2));
    const to = squareToIndex(uci.substring(2, 4));
    const promotion = uci.length > 4 ? uci[4] as PieceType : undefined;
    return this.makeMove(from, to, promotion);
  }

  private applyMove(move: Move): Move {
    const captured = this.board.getPiece(move.to);
    const isCapture = captured !== null || move.enPassant === true;

    this.updateCastlingRights(move);
    this.updateEnPassant(move);

    if (move.piece.type === PieceType.Pawn || isCapture) {
      this.halfMoveClock = 0;
    } else {
      this.halfMoveClock++;
    }

    applyMoveToBoard(this.board, move);

    this.moves.push(move);

    const notation = moveToAlgebraic(move);
    this.moveNotation.push(notation);

    if (this.activeColor === Color.Black) {
      this.fullMoveNumber++;
    }
    this.activeColor = opponent(this.activeColor);

    this.positionHistory.push(this.getPositionKey());

    this.result = getGameStatus(
      this.board,
      this.activeColor,
      this.castlingRights,
      this.enPassantTarget,
      this.positionHistory,
      this.halfMoveClock
    );

    return move;
  }

  private updateCastlingRights(move: Move): void {
    if (move.piece.type === PieceType.King) {
      if (move.piece.color === Color.White) {
        this.castlingRights = this.castlingRights.replace(/K/g, '').replace(/Q/g, '');
      } else {
        this.castlingRights = this.castlingRights.replace(/k/g, '').replace(/q/g, '');
      }
    }

    if (move.from === 7 || move.to === 7) this.castlingRights = this.castlingRights.replace(/K/g, '');
    if (move.from === 0 || move.to === 0) this.castlingRights = this.castlingRights.replace(/Q/g, '');
    if (move.from === 63 || move.to === 63) this.castlingRights = this.castlingRights.replace(/k/g, '');
    if (move.from === 56 || move.to === 56) this.castlingRights = this.castlingRights.replace(/q/g, '');

    this.castlingRights = this.castlingRights.replace(/[^KkQq]/g, '');
  }

  private updateEnPassant(move: Move): void {
    if (move.piece.type === PieceType.Pawn && Math.abs(Math.floor(move.from / 8) - Math.floor(move.to / 8)) === 2) {
      this.enPassantTarget = (move.from + move.to) / 2;
    } else {
      this.enPassantTarget = null;
    }
  }

  private getPositionKey(): string {
    return `${this.board.toFen()}-${this.activeColor}-${this.castlingRights}`;
  }

  undoLastMove(): boolean {
    if (this.moves.length === 0) return false;

    const gameStates: { board: Board; activeColor: Color; castlingRights: string; enPassantTarget: SquareIndex | null; halfMoveClock: number; fullMoveNumber: number }[] = [];
    const currentBoard = this.initialBoard.clone();
    let currentColor = parseFen(STARTING_FEN).activeColor;
    let currentCastling = parseFen(STARTING_FEN).castlingRights;
    let currentEnPassant: SquareIndex | null = parseFen(STARTING_FEN).enPassantTarget;
    let currentHalfMove = 0;
    let currentFullMove = 1;

    for (let i = 0; i < this.moves.length - 1; i++) {
      const m = this.moves[i];
      gameStates.push({
        board: currentBoard.clone(),
        activeColor: currentColor,
        castlingRights: currentCastling,
        enPassantTarget: currentEnPassant,
        halfMoveClock: currentHalfMove,
        fullMoveNumber: currentFullMove,
      });

      if (m.piece.type === PieceType.Pawn || m.captured || m.enPassant) {
        currentHalfMove = 0;
      } else {
        currentHalfMove++;
      }

      applyMoveToBoard(currentBoard, m);

      const targetPiece = currentBoard.getPiece(m.to);
      const tmpMove: Move = { ...m, piece: targetPiece || m.piece };
      this.updateCastlingRights(tmpMove);
      currentCastling = this.castlingRights;
      this.updateEnPassant(tmpMove);
      currentEnPassant = this.enPassantTarget;

      currentColor = opponent(currentColor);
      if (currentColor === Color.White) currentFullMove++;
    }

    this.board = currentBoard;
    this.activeColor = currentColor;
    this.castlingRights = currentCastling;
    this.enPassantTarget = currentEnPassant;
    this.halfMoveClock = currentHalfMove;
    this.fullMoveNumber = currentFullMove;
    this.moves.pop();
    this.moveNotation.pop();
    this.positionHistory.pop();

    this.result = { status: GameStatus.Playing };

    return true;
  }

  getFen(): string {
    return generateFen(
      this.board,
      this.activeColor,
      this.castlingRights,
      this.enPassantTarget,
      this.halfMoveClock,
      this.fullMoveNumber
    );
  }

  getPgn(headers?: { white?: string; black?: string }): string {
    return generatePgn(this.moveNotation, {
      white: headers?.white,
      black: headers?.black,
      result: this.result.status === GameStatus.Checkmate
        ? (this.result.winner === Color.White ? '1-0' : '0-1')
        : (this.result.status === GameStatus.Playing ? '*' : '1/2-1/2'),
    });
  }

  getResult(): GameResult {
    return { ...this.result };
  }

  isGameOver(): boolean {
    return this.result.status !== GameStatus.Playing && this.result.status !== GameStatus.Check;
  }

  reset(fen?: string): void {
    const data = fen ? parseFen(fen) : parseFen(STARTING_FEN);
    this.board = data.board;
    this.activeColor = data.activeColor;
    this.castlingRights = data.castlingRights;
    this.enPassantTarget = data.enPassantTarget;
    this.halfMoveClock = data.halfMoveClock;
    this.fullMoveNumber = data.fullMoveNumber;
    this.moves = [];
    this.moveNotation = [];
    this.positionHistory = [this.getPositionKey()];
    this.result = { status: GameStatus.Playing };
    this.initialBoard = this.board.clone();
  }
}
