/**
 * tests/Player.test.js
 *
 * Unit tests for Player hit() and applyPowerUp() logic.
 * Uses a minimal mock scene that satisfies Player's constructor dependencies.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Player from '../src/entities/Player.js';

/** Minimal Phaser scene mock that Player.constructor requires. */
function makeScene() {
  const events = { emit: vi.fn() };
  let timerCallback = null;

  const scene = {
    events,
    mobileLeft: false, mobileRight: false, mobileUp: false, mobileDown: false, mobileFire: false,
    audio: null,
    bullets: { add: vi.fn() },
    game: { loop: { delta: 16 } },
    physics: {
      add: {
        sprite: vi.fn().mockReturnValue({
          x: 100, y: 100, active: true,
          setScale:              vi.fn().mockReturnThis(),
          setCollideWorldBounds: vi.fn().mockReturnThis(),
          setAlpha:              vi.fn().mockReturnThis(),
          setVelocity:           vi.fn().mockReturnThis(),
          setVelocityX:          vi.fn().mockReturnThis(),
          setVelocityY:          vi.fn().mockReturnThis(),
          setFrame:              vi.fn().mockReturnThis(),
          stop:                  vi.fn().mockReturnThis(),
          play:                  vi.fn().mockReturnThis(),
          anims:                 { isPlaying: false },
          body:                  { velocity: { x: 0, y: 0 } },
        }),
        group: vi.fn().mockReturnValue({ add: vi.fn() }),
      },
    },
    input: {
      keyboard: {
        createCursorKeys: vi.fn().mockReturnValue({
          left:  { isDown: false },
          right: { isDown: false },
          up:    { isDown: false },
          down:  { isDown: false },
        }),
        addKeys: vi.fn().mockReturnValue({
          up:    { isDown: false },
          down:  { isDown: false },
          left:  { isDown: false },
          right: { isDown: false },
        }),
        addKey: vi.fn().mockReturnValue({ isDown: false }),
      },
    },
    tweens: {
      add: vi.fn().mockImplementation(({ onComplete }) => {
        // Auto-call onComplete so invincibility resets in tests
        if (onComplete) onComplete();
      }),
    },
    time: {
      delayedCall: vi.fn().mockImplementation((delay, cb) => {
        timerCallback = cb;
        return { remove: vi.fn() };
      }),
    },
    // expose so tests can trigger the timer manually
    _triggerTimer: () => { if (timerCallback) timerCallback(); },
  };

  return scene;
}

describe('Player.hit()', () => {
  let scene, player;

  beforeEach(() => {
    scene  = makeScene();
    player = new Player(scene, 100, 100);
  });

  it('returns true when not invincible', () => {
    expect(player.hit()).toBe(true);
  });

  it('sets isInvincible to true immediately when hit', () => {
    // Override tweens.add so onComplete is NOT called (to test mid-invincibility)
    scene.tweens.add = vi.fn(); // swallow without calling onComplete
    player = new Player(scene, 100, 100);
    player.hit();
    expect(player.isInvincible).toBe(true);
  });

  it('returns false when already invincible', () => {
    // Make invincible manually
    scene.tweens.add = vi.fn();
    player = new Player(scene, 100, 100);
    player.hit(); // first hit — starts invincibility
    expect(player.hit()).toBe(false); // second hit while invincible
  });

  it('resets isInvincible to false when tween completes', () => {
    // Default scene.tweens.add auto-calls onComplete
    player.hit();
    // After tween completes (called synchronously in mock), invincible resets
    expect(player.isInvincible).toBe(false);
  });
});

describe('Player.applyPowerUp()', () => {
  let scene, player;

  beforeEach(() => {
    scene  = makeScene();
    player = new Player(scene, 100, 100);
  });

  it('sets activePowerUp to the given type', () => {
    player.applyPowerUp('rapid');
    expect(player.activePowerUp).toBe('rapid');
  });

  it('emits powerUpActive event with the type', () => {
    player.applyPowerUp('double');
    expect(scene.events.emit).toHaveBeenCalledWith('powerUpActive', 'double');
  });

  it('clears activePowerUp when the timer fires', () => {
    player.applyPowerUp('rapid');
    scene._triggerTimer(); // simulate 10s expiry
    expect(player.activePowerUp).toBeNull();
  });

  it('emits powerUpExpired when the timer fires', () => {
    player.applyPowerUp('rapid');
    scene._triggerTimer();
    expect(scene.events.emit).toHaveBeenCalledWith('powerUpExpired');
  });

  it('cancels any existing timer when a second power-up is applied', () => {
    player.applyPowerUp('rapid');
    const firstTimer = player._powerUpTimer;
    player.applyPowerUp('double');
    expect(firstTimer.remove).toHaveBeenCalled();
    expect(player.activePowerUp).toBe('double');
  });
});
