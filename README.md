# Space Shooter

A retro vertical-scrolling 2D space shooter built with **[Phaser 3](https://phaser.io/)** and CC0 pixel art by **[ansimuz](https://ansimuz.itch.io)**. No build step, no dependencies to install — just serve the folder and play.

---

## Quick Start

```bash
# 1. Install dev dependencies (Vitest, jsdom)
npm install

# 2. Run the test suite
npm test

# 3. Run tests + start the game server (pre-deploy gate)
npm run deploy
# then open http://localhost:8080
```

> **Note:** ES Modules require HTTP. Opening `index.html` directly via `file://` will fail. Any static file server works (`npx serve .`, VS Code Live Server, etc.).

---

## Testing

The project uses [Vitest](https://vitest.dev/) with jsdom for fast, browser-API-compatible unit tests.

| Script | Description |
|---|---|
| `npm test` | Run all tests once |
| `npm run test:watch` | Watch mode — re-runs on save |
| `npm run test:coverage` | Coverage report (`coverage/index.html`) |
| `npm run deploy` | `npm test && python3 -m http.server 8080` — tests must pass before server starts |

### Test files

| File | Covers |
|---|---|
| `tests/HighScore.test.js` | localStorage get/save/no-downgrade |
| `tests/WaveConfig.test.js` | Correct enemy types per wave, delay curve, cap behaviour |
| `tests/Enemy.types.test.js` | HP, scale, texture, animation keys for all 3 types |
| `tests/AudioManager.test.js` | All `play*` methods callable without errors |
| `tests/Player.test.js` | `hit()` invincibility guard, `applyPowerUp()` state + timer reset |
| `tests/GameScene.scoring.test.js` | Score formula per enemy type × multiplier |

### Convention
**Every new feature must ship with at least one test** covering its pure logic. Place tests in `tests/` alongside existing files.

---

## How to Play

### Controls

| Input | Action |
|---|---|
| `←` `→` `↑` `↓` or `W` `A` `S` `D` | Move ship |
| `Space` | Fire laser |
| `Space` (title / game over screen) | Start / restart |
| Touch D-pad + 🔥 button *(mobile)* | Move + fire |

### Objective

Survive as long as possible. Destroy enemies to earn points. Collect power-up orbs that enemies drop. The game never ends — waves keep coming and difficulty increases every 20 seconds.

### Scoring

| Event | Points |
|---|---|
| Destroy small enemy | 100 |
| Destroy medium enemy | 200 |
| Destroy big enemy | 400 |
| Intercept enemy bullet | 25 |
| Any kill while powered-up | ×2 multiplier |

Your high score is saved automatically in your browser (`localStorage`).

---

## Gameplay Features

### Enemy Types

| Type | HP | Behaviour |
|---|---|---|
| **Small** (purple) | 1 | Fast, fires straight down every 2–3.5 s |
| **Medium** (winged) | 2 | Moderate speed, fires every 1.8–3 s; flashes when hit |
| **Big** (large) | 4 | Slow, fires a 3-bolt fan spread every 1.5–2.5 s |

### Wave System

- A new wave begins every **20 seconds**.
- **Waves 1–2:** Small enemies only.
- **Waves 3–5:** Small + medium enemies; faster spawns.
- **Wave 6+:** All three types; fastest spawn rate.
- **Every 5th wave** (5, 10, 15 …): A **mini-boss** spawns — a buffed big enemy with 8 HP, preceded by a "BOSS INCOMING" banner and audio cue.
- Every **30 seconds** a formation of 5 small enemies enters in either a **V-shape** or **horizontal line**.

### Power-Ups

Enemies have a **30% chance** to drop a power-up orb on death. Orbs drift downward and disappear after 8 seconds if not collected.

| Orb | Effect | Duration |
|---|---|---|
| 🟠 Orange — Rapid Fire | Fire cooldown 250 ms → 80 ms | 10 s |
| 🔵 Blue — Double Shot | Fires two side-by-side bolts | 10 s |

Active power-up name and `×2` score badge are shown in the HUD.

### Player

- **3 lives** with respawn. After being hit the ship flashes and is **invincible for ~1.8 seconds**.
- **Screen shake** on every hit.
- **Thrust animation** plays while moving; returns to idle frame when still.
- Player bullets can **intercept enemy bullets** (both vanish, +25 pts).

### Audio

All sounds are synthesised at runtime via the **Web Audio API** — no audio files needed.

| Sound | Trigger |
|---|---|
| Shoot chirp | Every player bullet fired |
| Explosion thud | Enemy destroyed |
| Ascending tones | Power-up collected |
| Sawtooth descent | Player hit |
| Low thumps | Boss wave announcement |

---

## Project Structure

```
space-shooter-game/
├── index.html                  # Entry point — loads Phaser CDN + src/main.js
├── README.md
├── SPEC.md                     # Game design specification & milestones
├── assets/
│   ├── sprites/                # CC0 pixel-art spritesheets (ansimuz)
│   │   ├── ship.png            # Player ship  — 80×48, 10 frames (5×2)
│   │   ├── enemy-small.png     # Small enemy  — 32×16, 2 frames
│   │   ├── enemy-medium.png    # Medium enemy — 64×16, 4 frames
│   │   ├── enemy-big.png       # Big enemy    — 64×32, 2 frames
│   │   ├── laser-bolts.png     # Bullets      — 32×32, 4 frames (2×2)
│   │   ├── explosion.png       # Explosion    — 80×16, 5 frames
│   │   └── power-up.png        # Power-ups    — 32×32, 4 frames (2×2)
│   ├── backgrounds/            # Unused desert/cloud backgrounds (not space-themed)
│   └── license.txt             # CC0 — Luis Zuno (@ansimuz)
└── src/
    ├── main.js                 # Phaser game config + scene registry
    ├── scenes/
    │   ├── PreloadScene.js     # Loads all spritesheets, then starts TitleScene
    │   ├── TitleScene.js       # Title screen with hi-score + start prompt
    │   ├── GameScene.js        # Core game loop — spawning, physics, waves, game over
    │   └── UIScene.js          # Overlay HUD (score, lives, wave, power-up) + mobile controls
    ├── entities/
    │   ├── Player.js           # Player ship — movement, firing, power-ups, invincibility
    │   ├── Enemy.js            # Enemy — type config, HP, fire timers
    │   ├── Bullet.js           # Player bullet — upward projectile
    │   ├── EnemyBullet.js      # Enemy bullet — downward projectile
    │   ├── PowerUp.js          # Collectible orb — type, auto-expire
    │   └── Explosion.js        # (legacy stub — explosions handled inline in GameScene)
    └── utils/
        ├── AudioManager.js     # Web Audio API SFX synthesiser
        └── HighScore.js        # localStorage read/write helper
```

### Scene Flow

```
PreloadScene  →  TitleScene  →  GameScene (+ UIScene overlay)
                     ↑               |
                     └── restart ────┘ (Space on Game Over)
```

`GameScene` and `UIScene` run in parallel as Phaser's multi-scene system. `GameScene` emits events (`updateScore`, `updateLives`, `updateWave`, `powerUpActive`, `powerUpExpired`) that `UIScene` listens to — keeping game logic and UI cleanly separated.

---

## Architecture Notes

### Why plain ES Modules (no bundler)?

Keeping everything as native `import`/`export` means zero tooling, zero config, and instant iteration — just edit a file and refresh. The tradeoff is a small number of sequential module requests at load time, which is fine for a single-page game.

### Entity construction pattern

All entities follow the same pattern to work around a Phaser quirk where `physics.add.group()` resets a body's velocity when a sprite is added to it:

```js
// ✅ Correct order — velocity set AFTER group.add()
const enemy = new Enemy(scene, x, y, type);
this.enemies.add(enemy.sprite);          // group.add() resets velocity internally
enemy.sprite.setVelocityY(speed);        // set velocity here, not in constructor
```

### Scene communication via events

`GameScene` never reaches into `UIScene`'s DOM — it only emits on `this._ui.events`. `UIScene` only listens. This one-way data flow makes it safe to restart `GameScene` without touching `UIScene`'s internal state.

### Audio unlock

Web Audio contexts start suspended until a user gesture. `AudioManager.resume()` is called inside `Player._fire()` (the first Space keypress), which is already a gesture, so sound unlocks naturally on first shot.

---

## Recommendations for Improvement

### Gameplay
| # | Idea |
|---|---|
| 1 | **Scrolling space background** — replace the procedural dots with a real starfield image or nebula tileset. The desert/cloud PNGs in `assets/backgrounds/` are unused and could be swapped for space art. |
| 2 | **Distinct boss sprite** — currently the mini-boss is just a scaled-up big enemy. A dedicated sprite (or a tint) would make it feel more threatening. |
| 3 | **Enemy movement patterns** — enemies currently fall straight down. Adding sinusoidal weaving, dive-bombing, or holding formations would add variety. |
| 4 | **Player shield power-up** — a third power-up type (frame 2 or 3 of `power-up.png`) that absorbs one hit. |
| 5 | **Combo multiplier** — reward chains of rapid kills with an escalating multiplier that resets if the player is hit. |
| 6 | **Difficulty cap** — waves scale indefinitely; adding a difficulty ceiling prevents the game from becoming unplayable. |

### Technical
| # | Idea |
|---|---|
| 7 | **Object pooling** — replace `sprite.destroy()` with `group.killAndHide(sprite)` and `group.get()` for bullets and explosions to reduce GC pressure at high wave counts. |
| 8 | **TypeScript** — adding a `tsconfig.json` and JSDoc `@type` annotations (or migrating to `.ts` files) would catch bugs earlier without requiring a bundler. |
| 9 | **Scene data passing** — use `this.scene.start('GameScene', { difficulty: 'hard' })` to pass config between scenes cleanly rather than globals. |
| 10 | **Automated tests** — Phaser scenes can be unit-tested with Jest + `jest-canvas-mock`. At minimum, test `HighScore.js` and the wave config lookup. |
| 11 | **Background music** — `AudioManager` already has the Web Audio plumbing; add a simple procedural chord loop using oscillators + an LFO for a retro chiptune feel. |

---

## Code Documentation Best Practices

This codebase uses a light-touch documentation style. Here are the conventions to follow when contributing:

### 1 — File-level header comment

Every file should open with a one-line description of its responsibility:

```js
/**
 * Enemy — spawns and manages a single enemy sprite.
 * Handles per-type config (HP, speed, fire rate) and schedules fire timers.
 */
```

### 2 — JSDoc for public methods

Annotate any method that another module calls directly:

```js
/**
 * Apply a power-up effect to the player.
 * @param {'rapid'|'double'} type - The power-up variant to activate.
 */
applyPowerUp(type) { … }
```

```js
/**
 * Register a hit on this player.
 * @returns {boolean} false if currently invincible (hit ignored), true if damage was taken.
 */
hit() { … }
```

### 3 — Inline comments only where non-obvious

Avoid comments that restate the code. Add them only to explain *why*, not *what*:

```js
// ❌ Redundant
sprite.setVelocityY(speed); // set the velocity

// ✅ Explains the non-obvious constraint
group.add(enemy.sprite);         // must happen before setVelocity —
enemy.sprite.setVelocityY(speed);// Phaser resets the body on group.add()
```

### 4 — Magic numbers → named constants

```js
// ❌ Hard to understand or change
if (Math.random() < 0.3) { … }

// ✅ Self-documenting
const POWER_UP_DROP_CHANCE = 0.3;
if (Math.random() < POWER_UP_DROP_CHANCE) { … }
```

### 5 — Keep `_` prefix for private methods

Methods prefixed with `_` (e.g. `_fire()`, `_spawnEnemy()`) are internal implementation details. Public API methods have no prefix (e.g. `hit()`, `applyPowerUp()`).

### 6 — Config objects over constructor parameters

When an entity needs more than 2–3 config values, use a config object or a static lookup (like `TYPES` in `Enemy.js`) rather than a long parameter list.

---

## Credits

Pixel art assets by [Luis Zuno (@ansimuz)](https://ansimuz.itch.io) — licensed [CC0](http://creativecommons.org/publicdomain/zero/1.0/) (public domain, no attribution required).

Built with [Phaser 3](https://phaser.io/) loaded from CDN — no build step required.

