/**
 * tests/setup.js
 *
 * Global setup for all tests.
 * Provides a minimal Phaser global so entity/scene modules can be imported
 * without a real browser. Only the Phaser surface area actually used by
 * source files is mocked here — keep it as thin as possible.
 */
import { vi } from 'vitest';

// ── Web Audio API mock ──────────────────────────────────────────────────────
// AudioManager creates an AudioContext in its constructor. jsdom doesn't ship
// a Web Audio implementation, so we stub just enough for our tests.
class MockOscillatorNode {
  frequency = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), value: 440 };
  connect    = vi.fn();
  start      = vi.fn();
  stop       = vi.fn();
  type       = 'sine';
}
class MockGainNode {
  gain = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
  connect = vi.fn();
}
class MockBiquadFilterNode {
  frequency = { value: 0 };
  type      = 'lowpass';
  connect   = vi.fn();
}
class MockBufferSource {
  buffer = null;
  connect = vi.fn();
  start   = vi.fn();
}

globalThis.AudioContext = class {
  currentTime = 0;
  state       = 'running';
  sampleRate  = 44100;
  destination = {};
  resume      = vi.fn();
  createOscillator()  { return new MockOscillatorNode(); }
  createGain()        { return new MockGainNode(); }
  createBiquadFilter(){ return new MockBiquadFilterNode(); }
  createBuffer(ch, len, sr) {
    return { getChannelData: () => new Float32Array(len) };
  }
  createBufferSource() { return new MockBufferSource(); }
};
globalThis.webkitAudioContext = globalThis.AudioContext;

// ── Minimal Phaser global ───────────────────────────────────────────────────
globalThis.Phaser = {
  Scene: class Scene {
    constructor(config) { this.sys = {}; }
  },
  Math: {
    Between:       (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    FloatBetween:  (min, max) => Math.random() * (max - min) + min,
    DegToRad:      (deg)      => (deg * Math.PI) / 180,
  },
  Utils: {
    Array: {
      GetRandom: (arr) => arr[Math.floor(Math.random() * arr.length)],
    },
  },
  Input: {
    Keyboard: {
      KeyCodes: { SPACE: 32, W: 87, A: 65, S: 83, D: 68 },
      JustDown:  vi.fn(() => false),
    },
  },
  Physics: {
    Arcade: {
      Sprite: class {
        x = 0; y = 0; active = true;
        setScale      = vi.fn().mockReturnThis();
        setVelocity   = vi.fn().mockReturnThis();
        setVelocityX  = vi.fn().mockReturnThis();
        setVelocityY  = vi.fn().mockReturnThis();
        setAlpha      = vi.fn().mockReturnThis();
        setData       = vi.fn().mockReturnThis();
        getData       = vi.fn();
        setFlipY      = vi.fn().mockReturnThis();
        setCollideWorldBounds = vi.fn().mockReturnThis();
        setFrame      = vi.fn().mockReturnThis();
        stop          = vi.fn().mockReturnThis();
        destroy       = vi.fn();
        play          = vi.fn().mockReturnThis();
        anims         = { isPlaying: false };
        body          = { enable: true, velocity: { x: 0, y: 0 } };
      },
    },
  },
};
