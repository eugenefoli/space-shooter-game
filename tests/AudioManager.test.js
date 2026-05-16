/**
 * tests/AudioManager.test.js
 *
 * Verifies that AudioManager constructs cleanly and that all public play*
 * methods are callable without throwing. AudioContext is mocked in setup.js.
 */
import { describe, it, expect } from 'vitest';
import AudioManager from '../src/utils/AudioManager.js';

describe('AudioManager', () => {
  it('constructs without throwing', () => {
    expect(() => new AudioManager()).not.toThrow();
  });

  describe('play* methods', () => {
    let am;
    beforeEach(() => { am = new AudioManager(); });

    it('playShoot() does not throw', () => {
      expect(() => am.playShoot()).not.toThrow();
    });

    it('playExplode() does not throw', () => {
      expect(() => am.playExplode()).not.toThrow();
    });

    it('playPowerUp() does not throw', () => {
      expect(() => am.playPowerUp()).not.toThrow();
    });

    it('playHit() does not throw', () => {
      expect(() => am.playHit()).not.toThrow();
    });

    it('playBossWarning() does not throw', () => {
      expect(() => am.playBossWarning()).not.toThrow();
    });

    it('resume() does not throw', () => {
      expect(() => am.resume()).not.toThrow();
    });
  });
});
