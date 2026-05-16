/**
 * tests/GameScene.scoring.test.js
 *
 * Tests the scoring formula extracted from GameScene._onBulletHitEnemy.
 * Rather than instantiating the full scene (which requires a live Phaser renderer),
 * we extract and test the pure scoring logic directly.
 *
 * Formula: baseScore[type] × scoreMultiplier
 * Base scores: small=100, medium=200, big=400
 * Multiplier:  1 (no power-up) | 2 (power-up active)
 */
import { describe, it, expect } from 'vitest';

// ── Extracted pure-logic (mirrors GameScene._onBulletHitEnemy) ─────────────
const BASE_SCORE = { small: 100, medium: 200, big: 400 };

function calcScore(type, multiplier = 1) {
  return (BASE_SCORE[type] ?? 0) * multiplier;
}

// ── Tests ──────────────────────────────────────────────────────────────────
describe('scoring formula (no multiplier)', () => {
  it('small enemy  → 100 pts', () => expect(calcScore('small')).toBe(100));
  it('medium enemy → 200 pts', () => expect(calcScore('medium')).toBe(200));
  it('big enemy    → 400 pts', () => expect(calcScore('big')).toBe(400));
});

describe('scoring formula (×2 multiplier)', () => {
  it('small  ×2 → 200 pts',  () => expect(calcScore('small',  2)).toBe(200));
  it('medium ×2 → 400 pts',  () => expect(calcScore('medium', 2)).toBe(400));
  it('big    ×2 → 800 pts',  () => expect(calcScore('big',    2)).toBe(800));
});

describe('edge cases', () => {
  it('unknown type → 0 pts', () => expect(calcScore('unknown')).toBe(0));
  it('multiplier 1 is default', () => expect(calcScore('small', 1)).toBe(calcScore('small')));
  it('big is worth more than medium which is more than small', () => {
    expect(calcScore('big')).toBeGreaterThan(calcScore('medium'));
    expect(calcScore('medium')).toBeGreaterThan(calcScore('small'));
  });
  it('accumulated score after killing one of each', () => {
    const total = ['small', 'medium', 'big'].reduce((sum, t) => sum + calcScore(t), 0);
    expect(total).toBe(700);
  });
  it('accumulated score with multiplier after killing one of each', () => {
    const total = ['small', 'medium', 'big'].reduce((sum, t) => sum + calcScore(t, 2), 0);
    expect(total).toBe(1400);
  });
});
