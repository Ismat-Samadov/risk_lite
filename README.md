# 🌐 Risk Lite — World Domination Strategy

A full-stack, browser-based strategy game built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**. Conquer territories, build armies, and crush your AI opponents in a sleek neon aesthetic.

---

## ✨ Features

- **30 territories** across 6 continents (North America, South America, Europe, Africa, Asia, Oceania)
- **Turn-based gameplay** with three distinct phases: Deploy → Attack → Fortify
- **AI opponents** with two difficulty tiers — Easy (random) and Hard (strategic continent-focusing)
- **2–4 players** (1 human + 1–3 AI)
- **Continent bonuses** for controlling entire continents
- **Dice-based combat** with animated dice roll display (attacker up to 3 dice, defender up to 2)
- **Win/lose detection** with animated end screen and confetti on victory
- **Sound effects** via Web Audio API — no external assets (toggle on/off)
- **Pause / resume** functionality
- **High score** persistence via `localStorage`
- **Responsive & mobile-first** — works on desktop, tablet, and phone
- **Neon/glassmorphism** visual theme with Framer Motion animations

---

## 🎮 Controls

### Desktop
| Action | Control |
|---|---|
| Select territory / Place troops | Left click |
| Choose attack target | Click attacker, then click enemy territory |
| Choose fortify target | Click your territory with >1 troop, then click adjacent friendly |
| Skip attack phase | "Skip Attack" button |
| End turn | "End Turn →" button |
| Pause / Resume | ⏸ button |

### Mobile / Touch
| Action | Control |
|---|---|
| Select / place | Tap |
| Attack | Tap your territory, then tap the target |
| Fortify | Tap source, then tap destination |
| End turn | "End Turn" button in sidebar |

---

## 🗺️ Game Rules

1. **Setup** — territories are randomly distributed; each player places remaining troops one at a time.
2. **Deploy** — receive reinforcements equal to `max(3, floor(territories / 3))` plus continent bonuses.
3. **Attack** — click your territory (≥2 troops) then an adjacent enemy territory. Dice are compared: attacker rolls up to 3, defender up to 2. Higher die wins each comparison.
4. **Fortify** — move troops between two adjacent friendly territories (once per turn).
5. **Win** — be the last player with territories.

### Continent Bonuses
| Continent | Territories | Bonus |
|---|---|---|
| North America | 5 | +3 |
| South America | 3 | +2 |
| Europe | 5 | +3 |
| Africa | 4 | +2 |
| Asia | 8 | +5 |
| Oceania | 4 | +2 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Map rendering | Inline SVG with React |
| Sound | Web Audio API (no external files) |
| State | React hooks (`useState`, `useEffect`, `useCallback`) |
| Persistence | `localStorage` (high score) |
| Deployment | Vercel (zero config) |

---

## 🚀 Running Locally

```bash
# Clone or download the project
git clone <repo-url>
cd risk_lite

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
# Production build
npm run build
npm start
```

---

## ☁️ Deploy to Vercel

1. Push your code to a GitHub/GitLab/Bitbucket repository.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects Next.js — no extra configuration needed.
4. Click **Deploy**.

Or use the Vercel CLI:
```bash
npx vercel --prod
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css        # Global styles + neon theme variables
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Root page (menu ↔ game orchestration)
├── components/
│   ├── game/
│   │   ├── ContinentLegend.tsx  # Continent bonus reference
│   │   ├── DiceRoll.tsx         # Animated combat dice display
│   │   ├── EndScreen.tsx        # Win/lose screen with confetti
│   │   ├── GameMap.tsx          # SVG map with territory nodes
│   │   ├── GameScreen.tsx       # Main game layout assembly
│   │   ├── MainMenu.tsx         # Game setup / start screen
│   │   ├── PhaseBar.tsx         # Phase indicator + action buttons
│   │   └── PlayerPanel.tsx      # Player stats sidebar
│   └── ui/
│       ├── Button.tsx            # Reusable neon button
│       └── Modal.tsx             # Glassmorphism modal
├── hooks/
│   ├── useGame.ts               # Central game state management
│   └── useSounds.ts             # Web Audio API sound effects
├── lib/
│   ├── aiPlayer.ts              # AI decision logic (easy/hard)
│   ├── constants.ts             # Game constants
│   ├── gameEngine.ts            # Combat, reinforcements, win detection
│   └── mapData.ts               # Territory definitions & adjacencies
└── types/
    └── game.ts                  # TypeScript type definitions
```

---

## 🎨 Theme

Dark neon aesthetic with:
- Background: `#030712` with subtle cyan grid overlay
- Player colors: Cyan / Red / Green / Orange with glow effects
- Glassmorphism panels with `backdrop-blur`
- Framer Motion spring/keyframe animations throughout
