# Space Shooter — Game Specification

**Engine:** Phaser 3 · **Language:** JavaScript (ES Modules) · **Art:** Pixel art by [ansimuz](https://ansimuz.itch.io) (CC0)

---

## Overview

A retro vertical-scrolling 2D space shooter. The player pilots a rocket ship upward through increasingly difficult waves of alien enemies, collecting power-ups and earning a high score. Three lives and a respawn mechanic give the player a fighting chance.

---

## Requirements

### Functional

| # | Requirement |
|---|---|
| F-1 | Player ship moves in all four directions (arrow keys or WASD) and is constrained to the viewport |
| F-2 | Player fires laser bolts upward (Space bar); auto-fire supported with held key |
| F-3 | Three enemy tiers spawn in waves: small, medium, and big |
| F-4 | Enemies move downward and fire back at the player |
| F-5 | Collisions between lasers and enemies trigger an explosion animation and award points |
| F-6 | Collisions between enemies/enemy fire and the player cost one life and trigger a respawn |
| F-7 | Power-ups spawn randomly and grant a temporary upgrade when collected |
| F-8 | Wave difficulty increases over time (more enemies, faster movement, more frequent fire) |
| F-9 | Player starts with 3 lives; game over when all lives are lost |
| F-10 | Score is tracked and displayed throughout; a Game Over screen shows the final score |
| F-11 | Background scrolls vertically in a seamless loop |

### Non-Functional

| # | Requirement |
|---|---|
| N-1 | Runs in any modern browser via `index.html` on a local HTTP server (no build step required) |
| N-2 | Targets 60 fps on a mid-range laptop |
| N-3 | All assets are CC0 — no attribution required |

---

## Pixel Art Assets

All assets are located in the `assets/` folder.

### Sprites

| Asset | Path | Used For |
|---|---|---|
| Player Ship | [`assets/sprites/ship.png`](assets/sprites/ship.png) | Player-controlled rocket (sprite sheet with idle + thrust frames) |
| Enemy — Small | [`assets/sprites/enemy-small.png`](assets/sprites/enemy-small.png) | Fast, low-health grunt enemies |
| Enemy — Medium | [`assets/sprites/enemy-medium.png`](assets/sprites/enemy-medium.png) | Mid-tier enemies with moderate speed and health |
| Enemy — Big | [`assets/sprites/enemy-big.png`](assets/sprites/enemy-big.png) | Slow, tanky enemies; appear in later waves |
| Laser Bolts | [`assets/sprites/laser-bolts.png`](assets/sprites/laser-bolts.png) | Player and enemy projectiles (sprite sheet) |
| Explosion | [`assets/sprites/explosion.png`](assets/sprites/explosion.png) | Animated explosion on destroy (sprite strip) |
| Power-Up | [`assets/sprites/power-up.png`](assets/sprites/power-up.png) | Collectible orbs that grant temporary upgrades |

### Backgrounds

> The existing desert/cloud backgrounds don't fit the space theme and will be replaced with a custom starfield generated procedurally in canvas, or swapped with a space background asset in a future iteration.

---

## Milestones

Each milestone produces a fully playable build.

---

### Milestone 1 — Core Loop (Playable Proof of Concept)

**Goal:** You can fly, shoot, get hit, and die. The loop is fun even without polish.

**Deliverables:**

- [ ] Phaser 3 project scaffolded (`index.html`, `src/main.js`, scene structure)
- [ ] `PreloadScene` loads all sprite assets listed above
- [ ] Procedural scrolling starfield background (tiled points or a dark gradient scroll)
- [ ] Player ship renders using `ship.png`; moves with arrow keys, constrained to screen
- [ ] Player fires laser bolts upward (Space); bolts use `laser-bolts.png`
- [ ] Small enemies (`enemy-small.png`) spawn from the top in simple straight-down waves
- [ ] Bullet–enemy collision destroys both and plays explosion (`explosion.png`)
- [ ] Enemy–player collision costs one life; player respawns with brief invincibility flash
- [ ] HUD shows current lives (3 icons) and score
- [ ] Game Over screen when all lives are lost, with final score and restart button

**Win condition:** A player can start the game, shoot enemies, lose all lives, and restart.

---

### Milestone 2 — Enemy Variety & Power-Ups

**Goal:** Introduce all three enemy types and the power-up system for tactical depth.

**Deliverables:**

- [ ] Medium enemies (`enemy-medium.png`) added; appear from Wave 3 onward
- [ ] Big enemies (`enemy-big.png`) added; appear from Wave 6 onward, require multiple hits
- [ ] Enemy fire — small and medium enemies shoot laser bolts back at the player
- [ ] Big enemies fire spread shots (3 bolts in a fan)
- [ ] Wave escalation — each wave increases enemy count, speed, and fire rate
- [ ] Power-ups (`power-up.png`) drop randomly from destroyed enemies
  - **Blue orb** — rapid fire (lasts 10 s)
  - **Orange orb** — double shot (lasts 10 s)
- [ ] Power-up indicator shown in HUD when active
- [ ] Score multiplier displayed; killing an enemy while powered-up awards bonus points

**Win condition:** All three enemy types appear, power-ups can be collected, and the game visibly gets harder over time.

---

### Milestone 3 — Polish & Game Feel

**Goal:** The game feels complete and replayable.

**Deliverables:**

- [ ] Animated ship thrust frames from `ship.png` sprite sheet
- [ ] Screen shake on player hit
- [ ] Enemy entry animations (enemies fly in from off-screen in formation patterns)
- [ ] Big enemy acts as a mini-boss every 5 waves — larger HP pool, announcement text
- [ ] High score persisted in `localStorage` and displayed on Game Over screen
- [ ] Audio integration — background music loop and SFX for shoot, explosion, and power-up from `assets/audio/`
- [ ] Start / title screen with game title, high score, and "Press Space to Start"
- [ ] Mobile-friendly virtual D-pad and fire button (stretch goal)
- [ ] Performance pass: object pooling for bullets and explosions

**Win condition:** The game has a full arc (title → play → game over → restart), saves a high score, and feels polished.

---

## Development Conventions

### Testing
- The test suite uses **Vitest + jsdom** (`npm test`).
- **Every new feature must ship with at least one test** covering its pure logic.
- Place test files in `tests/` mirroring the source structure.
- Run `npm run deploy` instead of starting the server manually — it gates the server behind a passing test run (`npm test && python3 -m http.server 8080`).

---

## Out of Scope (for now)

- Multiplayer
- Procedural level generation beyond wave scaling
- Leaderboards / backend
- Custom pixel art or new assets

---

## Credits

Pixel art assets by [Luis Zuno (@ansimuz)](https://ansimuz.itch.io) — licensed [CC0](http://creativecommons.org/publicdomain/zero/1.0/).
