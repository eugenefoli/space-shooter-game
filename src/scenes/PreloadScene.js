export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Loading bar
    const bar = this.add.rectangle(240, 320, 0, 20, 0x00ffcc);
    this.load.on('progress', (v) => bar.width = 400 * v);

    // Spritesheets — frame sizes determined from source PNGs
    // ship.png: 80x48 → 10 frames (5 cols × 2 rows) × 16x24
    this.load.spritesheet('ship',         'assets/sprites/ship.png',         { frameWidth: 16, frameHeight: 24 });
    // enemy-small.png: 32x16 → 2 frames × 16x16
    this.load.spritesheet('enemy-small',  'assets/sprites/enemy-small.png',  { frameWidth: 16, frameHeight: 16 });
    // enemy-medium.png: 64x16 → 4 frames × 16x16
    this.load.spritesheet('enemy-medium', 'assets/sprites/enemy-medium.png', { frameWidth: 16, frameHeight: 16 });
    // enemy-big.png: 64x32 → 2 frames × 32x32
    this.load.spritesheet('enemy-big',    'assets/sprites/enemy-big.png',    { frameWidth: 32, frameHeight: 32 });
    // explosion.png: 80x16 → 5 frames × 16x16
    this.load.spritesheet('explosion',    'assets/sprites/explosion.png',    { frameWidth: 16, frameHeight: 16 });
    // laser-bolts.png: 32x32 → 4 frames × 16x16 (2×2 grid)
    this.load.spritesheet('laser-bolts',  'assets/sprites/laser-bolts.png',  { frameWidth: 16, frameHeight: 16 });
    // power-up.png: 32x32 → 4 frames × 16x16 (2×2 grid)
    this.load.spritesheet('power-up',     'assets/sprites/power-up.png',     { frameWidth: 16, frameHeight: 16 });
  }

  create() {
    this.scene.start('TitleScene');
  }
}
