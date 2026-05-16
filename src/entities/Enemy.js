/**
 * Enemy — a single enemy ship.
 *
 * Supports three types ('small' | 'medium' | 'big') via a static TYPES config.
 * HP is stored on the sprite's data map so GameScene overlap callbacks can read
 * it without needing a reference to the Enemy object itself.
 *
 * Fire timers are scheduled in the constructor and reference `this.scene.enemyBullets`
 * directly (set by GameScene.create()) to avoid passing the group as a parameter.
 */
import EnemyBullet from './EnemyBullet.js';

// Per-type config: texture, animation key, hp, display scale, fire interval range (ms)
export const TYPES = {
  small:  { texture: 'enemy-small',  anim: 'enemy-small-fly',  hp: 1, scale: 2, fireMin: 2000, fireMax: 3500 },
  medium: { texture: 'enemy-medium', anim: 'enemy-medium-fly', hp: 2, scale: 2, fireMin: 1800, fireMax: 3000 },
  big:    { texture: 'enemy-big',    anim: 'enemy-big-fly',    hp: 4, scale: 3, fireMin: 1500, fireMax: 2500 },
};

export default class Enemy {
  constructor(scene, x, y, type = 'small') {
    this.scene = scene;
    this.type  = type;

    const cfg = TYPES[type];
    this.sprite = scene.physics.add.sprite(x, y, cfg.texture, 0).setScale(cfg.scale);
    this.sprite.setData('hp',   cfg.hp);
    this.sprite.setData('type', type);
    this.sprite.play(cfg.anim);

    // Auto-destroy when off-screen bottom
    this._destroyTimer = scene.time.addEvent({
      delay: 10000,
      callback: () => { if (this.sprite && this.sprite.active) this.sprite.destroy(); }
    });

    // Schedule enemy fire
    const cfg2 = TYPES[type];
    this._fireTimer = scene.time.addEvent({
      delay: Phaser.Math.Between(cfg2.fireMin, cfg2.fireMax),
      callback: this._fire,
      callbackScope: this,
      loop: true
    });
  }

  _fire() {
    if (!this.sprite || !this.sprite.active) return;
    const { enemyBullets } = this.scene;
    if (!enemyBullets) return;

    const sx = this.sprite.x;
    const sy = this.sprite.y + 10;

    if (this.type === 'big') {
      // 3-bolt fan: 75°, 90°, 105° in Phaser degrees (0=right, 90=down)
      [75, 90, 105].forEach(angle => {
        const eb = new EnemyBullet(this.scene, sx, sy);
        enemyBullets.add(eb.sprite);
        this.scene.physics.velocityFromAngle(angle, 350, eb.sprite.body.velocity);
      });
    } else {
      const eb = new EnemyBullet(this.scene, sx, sy);
      enemyBullets.add(eb.sprite);
      eb.sprite.setVelocityY(350);
    }
  }

  stopTimers() {
    if (this._fireTimer)   this._fireTimer.remove();
    if (this._destroyTimer) this._destroyTimer.remove();
  }
}

