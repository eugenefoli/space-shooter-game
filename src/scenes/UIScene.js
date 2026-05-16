/**
 * UIScene — HUD overlay running in parallel with GameScene.
 *
 * Displays score, lives, wave number, and active power-up indicator.
 * On touch devices, renders on-screen D-pad and fire button.
 *
 * Listens to events emitted by GameScene via `this._ui.events.emit()`:
 *   updateScore(score)   updateLives(lives)   updateWave(wave)
 *   powerUpActive(type)  powerUpExpired()
 *
 * Mobile control state is written to GameScene properties
 * (mobileLeft, mobileRight, mobileUp, mobileDown, mobileFire)
 * which Player.js reads each frame.
 */
export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.scoreText = this.add.text(10, 10, 'SCORE: 0', {
      fontSize: '14px', fill: '#ffffff', fontFamily: 'monospace'
    });

    this.livesText = this.add.text(width - 10, 10, 'LIVES: 3', {
      fontSize: '14px', fill: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(1, 0);

    this.waveText = this.add.text(width / 2, 10, 'WAVE 1', {
      fontSize: '14px', fill: '#ffdd44', fontFamily: 'monospace'
    }).setOrigin(0.5, 0);

    this.multiplierText = this.add.text(10, 30, '', {
      fontSize: '12px', fill: '#ff9900', fontFamily: 'monospace'
    }).setVisible(false);

    this.powerUpText = this.add.text(width / 2, height - 50, '', {
      fontSize: '13px', fill: '#00ffcc', fontFamily: 'monospace'
    }).setOrigin(0.5, 1).setVisible(false);

    this.events.on('updateScore', (score) => this.scoreText.setText(`SCORE: ${score}`));
    this.events.on('updateLives', (lives) => this.livesText.setText(`LIVES: ${lives}`));
    this.events.on('updateWave',  (wave)  => {
      this.waveText.setText(`WAVE ${wave}`);
      this.tweens.add({ targets: this.waveText, scaleX: 1.4, scaleY: 1.4, duration: 200, yoyo: true });
    });
    this.events.on('powerUpActive', (type) => {
      this.powerUpText.setText(type === 'rapid' ? '⚡ RAPID FIRE' : '✦ DOUBLE SHOT').setVisible(true);
      this.multiplierText.setText('×2').setVisible(true);
    });
    this.events.on('powerUpExpired', () => {
      this.powerUpText.setVisible(false);
      this.multiplierText.setVisible(false);
    });

    // Mobile controls — only shown on touch devices
    if (this.sys.game.device.input.touch) {
      this._createMobileControls(width, height);
    }
  }

  _createMobileControls(width, height) {
    const game    = this.scene.get('GameScene');
    const btnSize = 52;
    const pad     = 16;
    const alpha   = 0.35;
    const by      = height - pad - btnSize;   // bottom row y
    const bx      = pad;                      // left edge

    const makeBtn = (x, y, label, onDown, onUp) => {
      const bg = this.add.rectangle(x, y, btnSize, btnSize, 0xffffff, alpha)
        .setInteractive()
        .setScrollFactor(0);
      this.add.text(x, y, label, { fontSize: '20px', fontFamily: 'monospace', fill: '#ffffff' })
        .setOrigin(0.5)
        .setScrollFactor(0);
      bg.on('pointerdown', onDown);
      bg.on('pointerup',   onUp);
      bg.on('pointerout',  onUp);
      return bg;
    };

    // D-pad
    makeBtn(bx + btnSize,       by,            '▲', () => game.mobileUp    = true, () => game.mobileUp    = false);
    makeBtn(bx,                 by,            '◀', () => game.mobileLeft  = true, () => game.mobileLeft  = false);
    makeBtn(bx + btnSize * 2,   by,            '▶', () => game.mobileRight = true, () => game.mobileRight = false);
    makeBtn(bx + btnSize,       by + btnSize,  '▼', () => game.mobileDown  = true, () => game.mobileDown  = false);

    // Fire button (bottom-right)
    makeBtn(width - pad - btnSize, by, '🔥', () => game.mobileFire = true, () => game.mobileFire = false);
  }
}
