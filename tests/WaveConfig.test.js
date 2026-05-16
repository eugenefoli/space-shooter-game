/**
 * tests/WaveConfig.test.js
 *
 * Unit tests for the WaveConfig utility.
 * Verifies that waveConfig() returns the right types pool, that the spawn
 * delay decreases with wave number, and that capping behaviour works.
 */
import { describe, it, expect } from 'vitest';
import { WAVE_CONFIG, waveConfig } from '../src/utils/WaveConfig.js';

describe('WAVE_CONFIG structure', () => {
  it('index 0 is null (waves are 1-based)', () => {
    expect(WAVE_CONFIG[0]).toBeNull();
  });

  it('every non-null entry has types, delay and speed arrays', () => {
    for (let i = 1; i < WAVE_CONFIG.length; i++) {
      const cfg = WAVE_CONFIG[i];
      expect(cfg).toHaveProperty('types');
      expect(cfg).toHaveProperty('delay');
      expect(cfg).toHaveProperty('speed');
      expect(Array.isArray(cfg.types)).toBe(true);
      expect(cfg.types.length).toBeGreaterThan(0);
      expect(Array.isArray(cfg.speed)).toBe(true);
      expect(cfg.speed).toHaveLength(2);
    }
  });
});

describe('waveConfig()', () => {
  it('wave 1 and 2 only include "small" enemies', () => {
    [1, 2].forEach(w => {
      const types = waveConfig(w).types;
      expect(types.every(t => t === 'small')).toBe(true);
    });
  });

  it('wave 3 includes at least one "medium" enemy', () => {
    expect(waveConfig(3).types).toContain('medium');
  });

  it('wave 6 includes at least one "big" enemy', () => {
    expect(waveConfig(6).types).toContain('big');
  });

  it('spawn delay decreases from wave 1 to wave 6', () => {
    const d1 = waveConfig(1).delay;
    const d6 = waveConfig(6).delay;
    expect(d6).toBeLessThan(d1);
  });

  it('caps at the last config entry for very high wave numbers', () => {
    const last = WAVE_CONFIG[WAVE_CONFIG.length - 1];
    expect(waveConfig(999)).toEqual(last);
    expect(waveConfig(100)).toEqual(last);
  });

  it('returns a config with a positive delay', () => {
    for (let w = 1; w <= 10; w++) {
      expect(waveConfig(w).delay).toBeGreaterThan(0);
    }
  });
});
