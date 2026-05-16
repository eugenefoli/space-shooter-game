import HighScore from '../utils/HighScore.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Starfield background (reuse the same generation as GameScene)
    const gfx = this.make.graphics({ add: false });
    for (let i = 0; i < 140; i++) {
      gfx.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.1, 0.6));
      gfx.fillPoint(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 1);
    }
    gfx.generateTexture('title-stars', width, height);
    gfx.destroy();
    this._stars = this.add.tileSprite(0, 0, width, height, 'title-stars').setOrigin(0, 0);

    // Title
    this.add.text(width / 2, height * 0.22, 'SPACE', {
      fontSize: '52px', fill: '#00ffcc', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.35, 'SHOOTER', {
      fontSize: '52px', fill: '#ff4444', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5);

    // High score
    const hi = HighScore.get();
    this.add.text(width / 2, height * 0.54, `HI-SCORE: ${hi}`, {
      fontSize: '16px', fill: '#ffdd44', fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Controls hint
    this.add.text(width / 2, height * 0.67, 'ARROWS / WASD — MOVE\n    SPACE — FIRE', {
      fontSize: '13px', fill: '#aaaaaa', fontFamily: 'monospace', align: 'center'
    }).setOrigin(0.5);

    // Blinking "press space" text
    const pressText = this.add.text(width / 2, height * 0.82, 'PRESS SPACE TO START', {
      fontSize: '15px', fill: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: pressText,
      alpha: 0,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Start game on Space (or tap on mobile)
    this.input.keyboard.once('keydown-SPACE', () => this._start());
    this.input.once('pointerdown', () => this._start());
  }

  _start() {
    this.scene.start('GameScene');
  }

  update() {
    this._stars.tilePositionY -= 0.8;
  }
}
