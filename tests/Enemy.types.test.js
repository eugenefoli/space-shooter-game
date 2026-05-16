/**
 * tests/Enemy.types.test.js
 *
 * Verifies the static TYPES config in Enemy.js.
 * These values drive HP, scaling, animation, and texture keys
 * across the whole game — regression-guard them here.
 */
import { describe, it, expect } from 'vitest';
import { TYPES } from '../src/entities/Enemy.js';

describe('Enemy.TYPES', () => {
  it('defines exactly the three expected types', () => {
    expect(Object.keys(TYPES)).toEqual(['small', 'medium', 'big']);
  });

  describe('small', () => {
    const t = TYPES.small;
    it('has HP of 1', ()          => expect(t.hp).toBe(1));
    it('has scale of 2', ()       => expect(t.scale).toBe(2));
    it('uses enemy-small texture', ()   => expect(t.texture).toBe('enemy-small'));
    it('uses enemy-small-fly anim', ()  => expect(t.anim).toBe('enemy-small-fly'));
    it('has positive fire interval range', () => {
      expect(t.fireMin).toBeGreaterThan(0);
      expect(t.fireMax).toBeGreaterThan(t.fireMin);
    });
  });

  describe('medium', () => {
    const t = TYPES.medium;
    it('has HP of 2', ()          => expect(t.hp).toBe(2));
    it('uses enemy-medium texture', ()  => expect(t.texture).toBe('enemy-medium'));
    it('uses enemy-medium-fly anim', () => expect(t.anim).toBe('enemy-medium-fly'));
  });

  describe('big', () => {
    const t = TYPES.big;
    it('has HP of 4', ()          => expect(t.hp).toBe(4));
    it('has scale of 3', ()       => expect(t.scale).toBe(3));
    it('uses enemy-big texture', ()     => expect(t.texture).toBe('enemy-big'));
    it('uses enemy-big-fly anim', ()    => expect(t.anim).toBe('enemy-big-fly'));
    it('fires faster than small', () => {
      expect(TYPES.big.fireMin).toBeLessThan(TYPES.small.fireMin);
    });
  });
});
