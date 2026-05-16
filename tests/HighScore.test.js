/**
 * tests/HighScore.test.js
 *
 * Unit tests for the HighScore localStorage wrapper.
 * jsdom provides a functional localStorage implementation.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import HighScore from '../src/utils/HighScore.js';

const KEY = 'spaceShooterHiScore';

beforeEach(() => {
  localStorage.clear();
});

describe('HighScore.get()', () => {
  it('returns 0 when nothing is stored', () => {
    expect(HighScore.get()).toBe(0);
  });

  it('returns the stored numeric value', () => {
    localStorage.setItem(KEY, '1500');
    expect(HighScore.get()).toBe(1500);
  });
});

describe('HighScore.save()', () => {
  it('persists a new high score and returns true', () => {
    const isNew = HighScore.save(800);
    expect(isNew).toBe(true);
    expect(localStorage.getItem(KEY)).toBe('800');
  });

  it('updates when new score is higher and returns true', () => {
    HighScore.save(500);
    const isNew = HighScore.save(1000);
    expect(isNew).toBe(true);
    expect(HighScore.get()).toBe(1000);
  });

  it('does NOT update when new score is lower and returns false', () => {
    HighScore.save(1000);
    const isNew = HighScore.save(400);
    expect(isNew).toBe(false);
    expect(HighScore.get()).toBe(1000);
  });

  it('does NOT update when score equals current high and returns false', () => {
    HighScore.save(1000);
    const isNew = HighScore.save(1000);
    expect(isNew).toBe(false);
  });
});
