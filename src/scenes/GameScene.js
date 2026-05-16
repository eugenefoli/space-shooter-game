/**
 * GameScene — core gameplay loop.
 *
 * Responsibilities:
 *  - Wave management (escalating difficulty every 20 s)
 *  - Enemy spawning (individual + formation patterns)
 *  - Mini-boss events every 5th wave
 *  - All Arcade Physics overlap callbacks
 *  - Score tracking and multiplier logic
 *  - Game Over flow + high-score persistence
 *
 * UIScene runs in parallel as an overlay; this scene communicates with it
 * exclusively via `this._ui.events.emit(eventName, payload)`.
 *
 * IMPORTANT — velocity-after-group-add pattern:
 *   Phaser resets a physics body's velocity when it is added to a group.
 *   Always call setVelocity() AFTER group.add(), never inside the entity constructor.
 */
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import PowerUp from '../entities/PowerUp.js';
import AudioManager from '../utils/AudioManager.js';
import HighScore from '../utils/HighScore.js';
import { waveConfig } from '../utils/WaveConfig.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.score           = 0;
    this.lives           = 3;
    this.wave            = 1;
    this.scoreMultiplier = 1;
    this.gameOver        = false;

    // Audio (singleton across restarts)
    if (!this.audio) this.audio = new AudioManager();

    this._createStarfield(width, height);

    // Physics groups
    this.bullets      = this.physics.add.group();
    this.enemies      = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();
    this.powerUps     = this.physics.add.group();

    // Animations
    this._createAnims();

    // Player
    this.player = new Player(this, width / 2, height - 60);

    // Power-up events from Player
    this.events.on('powerUpActive',  (type) => {
      this.scoreMultiplier = 2;
      this.audio.playPowerUp();
      this._ui && this._ui.events.emit('powerUpActive', type);
    });
    this.events.on('powerUpExpired', () => {
      this.scoreMultiplier = 1;
      this._ui && this._ui.events.emit('powerUpExpired');
    });

    // Enemy spawn timer
    this._spawnTimer = this.time.addEvent({
      delay: waveConfig(1).delay,
      callback: this._spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // Wave escalation every 20 s
    this._waveTimer = this.time.addEvent({
      delay: 20000,
      callback: this._nextWave,
      callbackScope: this,
      loop: true
    });

    // Formation spawn every 30 s
    this._formationTimer = this.time.addEvent({
      delay: 30000,
      callback: this._spawnFormation,
      callbackScope: this,
      loop: true
    });

    // Overlaps
    this.physics.add.overlap(this.bullets,      this.enemies,      this._onBulletHitEnemy,        null, this);
    this.physics.add.overlap(this.bullets,      this.enemyBullets, this._onBulletInterceptsEnemy,  null, this);
    this.physics.add.overlap(this.player.sprite, this.enemies,      this._onEnemyHitPlayer,         null, this);
    this.physics.add.overlap(this.player.sprite, this.enemyBullets, this._onEnemyBulletHitPlayer,   null, this);
    this.physics.add.overlap(this.player.sprite, this.powerUps,     this._onPlayerCollectPowerUp,   null, this);

    // HUD
    this.scene.launch('UIScene');
    this._ui = this.scene.get('UIScene');
  }

  _nextWave() {
    this.wave++;
    const cfg = waveConfig(this.wave);
    this._spawnTimer.remove();
    this._spawnTimer = this.time.addEvent({
      delay: cfg.delay,
      callback: this._spawnEnemy,
      callbackScope: this,
      loop: true
    });
    this._ui && this._ui.events.emit('updateWave', this.wave);

    // Every 5th wave — mini-boss event
    if (this.wave % 5 === 0) {
      this._spawnBossWave();
    }
  }

  _spawnBossWave() {
    const { width, height } = this.scale;
    this.audio.playBossWarning();

    const banner = this.add.text(width / 2, height / 2, `⚠  WAVE ${this.wave}  ⚠\nBOSS INCOMING`, {
      fontSize: '22px', fill: '#ff4444', fontFamily: 'monospace', align: 'center'
    }).setOrigin(0.5).setDepth(10);

    this.tweens.add({
      targets: banner,
      alpha: 0,
      duration: 300,
      yoyo: true,
      repeat: 2,
      onComplete: () => banner.destroy()
    });

    // Spawn a buffed big enemy after the banner
    this.time.delayedCall(1200, () => {
      if (this.gameOver) return;
      const x = width / 2;
      const enemy = new Enemy(this, x, -50, 'big');
      enemy.sprite.setData('hp', 8); // double HP for boss
      this.enemies.add(enemy.sprite);
      enemy.sprite.setVelocityY(60);
    });
  }

  _createStarfield(width, height) {
    const gfx = this.make.graphics({ add: false });

    for (let i = 0; i < 120; i++) {
      gfx.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.15, 0.5));
      gfx.fillPoint(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 1);
    }
    gfx.generateTexture('stars-far', width, height);
    gfx.clear();

    for (let i = 0; i < 40; i++) {
      gfx.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.6, 1.0));
      gfx.fillPoint(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 2);
    }
    gfx.generateTexture('stars-near', width, height);
    gfx.destroy();

    this.starsFar  = this.add.tileSprite(0, 0, width, height, 'stars-far').setOrigin(0, 0);
    this.starsNear = this.add.tileSprite(0, 0, width, height, 'stars-near').setOrigin(0, 0);
  }

  _createAnims() {
    const defs = [
      { key: 'ship-idle',        texture: 'ship',         start: 0, end: 0,  rate: 6,  loop: true  },
      { key: 'ship-thrust',      texture: 'ship',         start: 0, end: 4,  rate: 14, loop: true  },
      { key: 'enemy-small-fly',  texture: 'enemy-small',  start: 0, end: 1,  rate: 8,  loop: true  },
      { key: 'enemy-medium-fly', texture: 'enemy-medium', start: 0, end: 3,  rate: 8,  loop: true  },
      { key: 'enemy-big-fly',    texture: 'enemy-big',    start: 0, end: 1,  rate: 6,  loop: true  },
      { key: 'explode',          texture: 'explosion',    start: 0, end: 4,  rate: 12, loop: false, hideOnComplete: true },
    ];
    defs.forEach(({ key, texture, start, end, rate, loop, hideOnComplete }) => {
      if (!this.anims.exists(key)) {
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(texture, { start, end }),
          frameRate: rate,
          repeat: loop ? -1 : 0,
          hideOnComplete: !!hideOnComplete
        });
      }
    });
  }

  _spawnEnemy() {
    const cfg  = waveConfig(this.wave);
    const type = Phaser.Utils.Array.GetRandom(cfg.types);
    const x    = Phaser.Math.Between(20, this.scale.width - 20);

    const enemy = new Enemy(this, x, -30, type);
    this.enemies.add(enemy.sprite);
    enemy.sprite.setVelocityY(Phaser.Math.Between(...cfg.speed));
  }

  _spawnFormation() {
    if (this.gameOver) return;
    const { width } = this.scale;
    const formations = ['line', 'v'];
    const type       = Phaser.Utils.Array.GetRandom(formations);
    const positions  = type === 'v'
      ? [[-60,0],[-30,-30],[0,-50],[30,-30],[60,0]]   // V-shape offsets
      : [[-80,0],[-40,0],[0,0],[40,0],[80,0]];         // horizontal line

    const cx  = width / 2;
    const cfg = waveConfig(this.wave);

    positions.forEach(([ox, oy], i) => {
      this.time.delayedCall(i * 120, () => {
        if (this.gameOver) return;
        const enemy = new Enemy(this, cx + ox, -40 + oy, 'small');
        this.enemies.add(enemy.sprite);
        enemy.sprite.setVelocityY(Phaser.Math.Between(...cfg.speed));
      });
    });
  }

  _onBulletHitEnemy(bullet, enemySprite) {
    bullet.destroy();

    let hp = enemySprite.getData('hp') - 1;
    enemySprite.setData('hp', hp);

    if (hp > 0) {
      this.tweens.add({ targets: enemySprite, alpha: 0.2, duration: 60, yoyo: true });
      return;
    }

    this.audio.playExplode();
    this._explode(enemySprite.x, enemySprite.y);

    const type      = enemySprite.getData('type') || 'small';
    const baseScore = { small: 100, medium: 200, big: 400 }[type];
    this.score     += baseScore * this.scoreMultiplier;
    this._ui.events.emit('updateScore', this.score);

    // 30% chance to drop a power-up
    if (Math.random() < 0.3) {
      const puType = Math.random() < 0.5 ? 'rapid' : 'double';
      const pu     = new PowerUp(this, enemySprite.x, enemySprite.y, puType);
      this.powerUps.add(pu.sprite);
      pu.sprite.setVelocityY(80);
    }

    enemySprite.destroy();
  }

  _onEnemyHitPlayer(playerSprite, enemySprite) {
    if (this.gameOver) return;
    const wasHit = this.player.hit();
    if (!wasHit) return;

    enemySprite.destroy();
    this._explode(playerSprite.x, playerSprite.y);
    this._loseLife();
  }

  _onEnemyBulletHitPlayer(playerSprite, bulletSprite) {
    if (this.gameOver) return;
    const wasHit = this.player.hit();
    if (!wasHit) return;

    bulletSprite.destroy();
    this._explode(playerSprite.x, playerSprite.y);
    this._loseLife();
  }

  _onPlayerCollectPowerUp(playerSprite, powerUpSprite) {
    const type = powerUpSprite.getData('type');
    powerUpSprite.destroy();
    this.player.applyPowerUp(type);
  }

  _onBulletInterceptsEnemy(playerBullet, enemyBullet) {
    playerBullet.destroy();
    enemyBullet.destroy();
    // Small score reward for intercepting
    this.score += 25 * this.scoreMultiplier;
    this._ui.events.emit('updateScore', this.score);
  }

  _loseLife() {
    this.audio.playHit();
    this.cameras.main.shake(250, 0.012);
    this.lives--;
    this._ui.events.emit('updateLives', this.lives);
    if (this.lives <= 0) this._triggerGameOver();
  }

  _explode(x, y) {
    const boom = this.add.sprite(x, y, 'explosion').setScale(2);
    boom.play('explode');
  }

  _triggerGameOver() {
    this.gameOver = true;
    this._spawnTimer.remove();
    this._waveTimer.remove();
    this._formationTimer.remove();
    this.scene.stop('UIScene');

    this.enemies.clear(true, true);
    this.bullets.clear(true, true);
    this.enemyBullets.clear(true, true);
    this.powerUps.clear(true, true);

    if (this.player.sprite.active) this.player.sprite.destroy();

    const { width, height } = this.scale;
    const isNewHigh = HighScore.save(this.score);
    if (isNewHigh && this.score > 0) {
      this.add.text(width / 2, height / 2 - 90, '★ NEW HIGH SCORE! ★', {
        fontSize: '14px', fill: '#ffdd44', fontFamily: 'monospace'
      }).setOrigin(0.5);
    }

    this.add.text(width / 2, height / 2 - 50, 'GAME OVER', {
      fontSize: '36px', fill: '#ff4444', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 4, `SCORE: ${this.score}`, {
      fontSize: '20px', fill: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 32, `HI-SCORE: ${HighScore.get()}`, {
      fontSize: '14px', fill: '#ffdd44', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 58, `WAVE: ${this.wave}`, {
      fontSize: '14px', fill: '#aaaaaa', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 88, 'PRESS SPACE TO PLAY AGAIN', {
      fontSize: '13px', fill: '#aaaaaa', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => this.scene.restart());
    this.input.once('pointerdown', () => this.scene.restart());
  }

  update() {
    if (this.gameOver) return;

    this.starsFar.tilePositionY  -= 0.5;
    this.starsNear.tilePositionY -= 1.5;

    this.player.update();
  }
}
