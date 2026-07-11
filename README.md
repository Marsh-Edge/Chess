<div align="center">

# Chess

**A modern, browser-based chess platform with AI, analysis, and training tools — built entirely in the browser.**

![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss)
![Stockfish](https://img.shields.io/badge/Engine-Stockfish_WASM-brightgreen)

</div>

---

## Preview

<!-- TODO: Add screenshot of the Play page -->
<!-- TODO: Add screenshot of the Analysis board -->
<!-- TODO: Add screenshot of the Opening Explorer -->
<!-- TODO: Add screenshot of the Endgame Trainer -->

> Screenshots coming soon. Run the project locally to see it in action.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Why This Project?](#why-this-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Commands](#commands)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)
- [Acknowledgments](#acknowledgments)

---

## About the Project

Chess is a full-featured chess application that runs entirely in your browser. It includes a **custom chess engine** built from scratch (no `chess.js` dependency), **Stockfish WASM** for AI play and position analysis, an **opening explorer** with 105 ECO-classified openings, and an **endgame trainer** with classic positions.

Everything runs client-side — no backend, no server, no API keys. The Stockfish engine runs as a Web Worker using WebAssembly, keeping the UI responsive while the AI calculates.

---

## Why This Project?

| Problem | Solution |
|---------|----------|
| Most chess apps rely on external APIs or chess libraries | Custom rule engine written from scratch with full FIDE rule coverage |
| AI requires server-side computation | Stockfish WASM runs entirely in the browser via Web Workers |
| No good open-source chess platform with analysis + training | Integrated analysis board, opening explorer, and endgame trainer in one app |
| Existing tools have dated UIs | Modern glass-morphism design with dark/light themes and responsive layout |

---

## Features

| Feature | Description |
|---------|-------------|
| **Player vs Player** | Local two-player mode on the same device |
| **Player vs AI** | Play against Stockfish with 5 difficulty levels (Beginner → Expert) |
| **Position Analysis** | Real-time Stockfish evaluation with centipawn scores and best-move suggestions |
| **Opening Explorer** | Browse 105 ECO-classified openings (A00–E91) with move-by-move visualization |
| **Endgame Trainer** | 5 classic endgame positions with step-by-step strategy guides and hints |
| **Chess Clock** | Bullet (1+0), Blitz (3+2), and Rapid (10+5) time controls with increment |
| **Full Rule Support** | Castling, en passant, pawn promotion, check/checkmate/stalemate, draw detection |
| **Dark / Light Theme** | System-preference detection with manual toggle and localStorage persistence |
| **Board Controls** | Flip board, undo moves, legal move indicators, last-move and check highlighting |
| **Captured Pieces** | Visual display of captured material |
| **FEN Support** | Load arbitrary positions via FEN input in the analysis board |
| **PGN Generation** | Export games in standard PGN notation |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org) (strict mode) |
| UI Library | [React 19](https://react.dev) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Components | [shadcn/ui](https://ui.shadcn.com) (base-nova style) |
| Icons | [Lucide React](https://lucide.dev) |
| AI Engine | [Stockfish WASM](https://github.com/nickkuk/stockfish.wasm) (Web Worker) |
| Toasts | [Sonner](https://sonner.emilkowal.dev) |
| Build | Next.js (Turbopack) |
| Linting | ESLint (next core-web-vitals + typescript) |

---

## Project Structure

```
Chess/
├── app/
│   ├── layout.tsx              # Root layout with header, nav, theme provider
│   ├── page.tsx                # Homepage with links to all sections
│   ├── globals.css             # Global styles, Tailwind config, CSS variables
│   ├── favicon.ico             # Favicon
│   ├── play/
│   │   └── page.tsx            # Play page (PvP & AI modes, timer, promotion)
│   ├── analysis/
│   │   └── page.tsx            # Analysis board with Stockfish evaluation
│   ├── openings/
│   │   └── page.tsx            # Opening explorer with ECO database
│   └── endgames/
│       └── page.tsx            # Endgame training page
├── components/
│   ├── chess/
│   │   ├── board.tsx           # 8×8 chess board with flip support
│   │   ├── square.tsx          # Individual board square with highlights
│   │   ├── piece-icon.tsx      # Unicode chess piece renderer
│   │   ├── game-controls.tsx   # Mode, AI level, time control, color selection
│   │   ├── game-info.tsx       # Status, captured pieces, game result
│   │   ├── move-list.tsx       # Scrollable move notation list
│   │   ├── timer.tsx           # Chess clock display
│   │   ├── promotion-dialog.tsx # Pawn promotion selection
│   │   ├── analysis-board.tsx  # Analysis board with Stockfish eval + FEN input
│   │   ├── opening-explorer.tsx # Opening name display widget
│   │   └── endgame-trainer.tsx # Interactive endgame training
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── chess/
│   │   ├── board.ts            # Board class: squares, piece placement, attacks
│   │   ├── moves.ts            # Legal move generation, castling, en passant
│   │   ├── game.ts             # ChessGame class: game logic, move application, undo
│   │   ├── rules.ts            # Status detection, insufficient material, repetition
│   │   ├── fen.ts              # FEN parser and generator
│   │   ├── pgn.ts              # PGN generator and parser
│   │   ├── openings.ts         # Opening name lookup from FEN
│   │   ├── ai.ts               # AI move getter via Stockfish WASM
│   │   ├── stockfish-worker.ts # Web Worker management for Stockfish
│   │   └── types.ts            # Enums and types: PieceType, Color, Move, GameStatus
│   └── utils.ts                # cn() utility (clsx + tailwind-merge)
├── hooks/
│   ├── useChessGame.ts         # Game state hook: AI moves, square selection
│   └── useTimer.ts             # Chess clock hook with increment support
├── data/
│   └── openings.json           # ECO opening database (105 entries)
├── public/
│   └── stockfish/
│       ├── stockfish.js        # Stockfish WASM loader
│       └── stockfish.wasm      # Stockfish binary (WebAssembly)
└── components.json             # shadcn/ui configuration
```

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org) 18+ (20+ recommended)
- npm, yarn, or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/EdgeQuantum/chess.git
cd chess

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Configuration

No environment variables are required. The application runs entirely client-side — the Stockfish engine executes in the browser via WebAssembly and Web Workers. No API keys, backend servers, or external services are needed.

---

## Usage

### Play Chess

Navigate to `/play` to start a game.

- **Player vs Player**: Select "PvP" mode to play locally with another person.
- **Player vs AI**: Select "AI" mode and choose a difficulty level (Beginner → Expert).
- Configure time control (Bullet / Blitz / Rapid), choose your color, and click **Start Game**.

### Analyze Positions

Navigate to the Analysis page to evaluate positions with Stockfish.

- The engine displays a centipawn evaluation score and advantage label in real time.
- Enter any FEN string to load a custom position.
- The best move is highlighted on the board.

### Explore Openings

Navigate to `/openings` to browse the opening database.

- Click through the ECO categories (A00–E91) to explore openings.
- Step forward and backward through moves with board visualization.
- Read strategic descriptions for major openings (Italian, Sicilian, Ruy Lopez, etc.).

### Train Endgames

Navigate to `/endgames` to practice classic endgame positions.

- 5 positions covering K+Q vs K, K+R vs K, K+P vs K, K+2B vs K, and pawn opposition.
- Follow step-by-step strategy guides and watch for common mistakes.
- Use hints if you get stuck.

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Roadmap

### Completed

- [x] Custom chess rule engine (no external chess library)
- [x] Full FIDE rule coverage (castling, en passant, promotion, draws)
- [x] Stockfish WASM integration with 5 difficulty levels
- [x] Player vs Player and Player vs AI modes
- [x] Real-time position analysis with evaluation display
- [x] Opening explorer with 105 ECO entries
- [x] Endgame trainer with 5 positions and strategy guides
- [x] Chess clock with Bullet, Blitz, and Rapid time controls
- [x] Dark / light theme with system preference detection
- [x] Responsive glass-morphism UI
- [x] FEN loading and PGN generation
- [x] Analysis board with Stockfish evaluation and FEN loading

### Upcoming

- [ ] PGN import and full game review
- [ ] Move annotations and commentary
- [ ] Online multiplayer (WebSocket-based)
- [ ] Opening book statistics and win-rate data
- [ ] Custom endgame position editor
- [ ] Game saving and loading (localStorage)
- [ ] Sound effects and piece animations

---

## Contributing

Contributions are welcome. To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please run `npm run lint` before submitting to ensure code quality.

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Edge Quantum

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Author

**Edge Quantum**

---

## Acknowledgments

- [Stockfish](https://github.com/official-stockfish/stockfish) — the strongest open-source chess engine, ported to WASM
- [Next.js](https://nextjs.org) — the React framework powering the app
- [shadcn/ui](https://ui.shadcn.com) — beautifully designed UI components
- [Tailwind CSS](https://tailwindcss.com) — utility-first CSS framework
- [Lucide](https://lucide.dev) — clean, consistent icon set
- [Sonner](https://sonner.emilkowal.dev) — elegant toast notifications
- The chess community for decades of algorithmic knowledge that made building a custom engine possible
