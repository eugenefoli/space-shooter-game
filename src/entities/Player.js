/**
 * Player — the user-controlled ship.
 *
 * Handles keyboard + touch input, firing (single and double-shot),
 * invincibility flash after being hit, and power-up effects.
 *
 * Power-up state is managed here; GameScene receives events via
 * `scene.events.emit('powerUpActive' | 'powerUpExpired')`.
 */
import Bullet from './Bullet.js';

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'ship', 0)
      .setScale(2)
      .setCollideWorldBounds(true);

    this.cursors  = scene.input.keyboard.createCursorKeys();
    this.wasd     = scene.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.fireKey  = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.fireCooldown  = 0;
    this.speed         = 200;
    this.isInvincible  = false;
    this.activePowerUp = null;
    this._powerUpTimer = null;
  }

  applyPowerUp(type) {
    if (this._powerUpTimer) this._powerUpTimer.remove();
    this.activePowerUp = type;
    this.scene.events.emit('powerUpActive', type);

    this._powerUpTimer = this.scene.time.delayedCall(10000, () => {
      this.activePowerUp = null;
      this.scene.events.emit('powerUpExpired');
    });
  }

  /** Call when the player is hit. Returns false if currently invincible. */
  hit() {
    if (this.isInvincible) return false;

    this.isInvincible = true;
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 0.1, to: 1 },
      duration: 80,
      repeat: 10,
      yoyo: true,
      onComplete: () => {
        if (this.sprite.active) {
          this.sprite.setAlpha(1);
          this.isInvincible = false;
        }
      }
    });
    return true;
  }

  update() {
    const { sprite, cursors, wasd, scene } = this;
    if (!sprite.active) return;

    const left  = cursors.left.isDown  || wasd.left.isDown  || !!scene.mobileLeft;
    const right = cursors.right.isDown || wasd.right.isDown || !!scene.mobileRight;
    const up    = cursors.up.isDown    || wasd.up.isDown    || !!scene.mobileUp;
    const down  = cursors.down.isDown  || wasd.down.isDown  || !!scene.mobileDown;

    const vx = (left ? -1 : 0) + (right ? 1 : 0);
    const vy = (up   ? -1 : 0) + (down  ? 1 : 0);
    sprite.setVelocity(vx * this.speed, vy * this.speed);

    // Thrust animation — cycle frames when moving, hold frame 0 when still
    const moving = vx !== 0 || vy !== 0;
    if (moving && !sprite.anims.isPlaying) {
      sprite.play('ship-thrust', true);
    } else if (!moving) {
      sprite.stop();
      sprite.setFrame(0);
    }

    const cooldown = this.activePowerUp === 'rapid' ? 80 : 250;
    this.fireCooldown -= scene.game.loop.delta;

    const firePressed = Phaser.Input.Keyboard.JustDown(this.fireKey) ||
                        (this.fireKey.isDown && this.fireCooldown <= 0) ||
                        (scene.mobileFire && this.fireCooldown <= 0);

    if (firePressed) {
      this._fire();
      this.fireCooldown = cooldown;
    }
  }

  _fire() {
    const { x, y } = this.sprite;
    this.scene.audio && this.scene.audio.resume();
    this.scene.audio && this.scene.audio.playShoot();
    if (this.activePowerUp === 'double') {
      new Bullet(this.scene, x - 8, y - 20, this.scene.bullets);
      new Bullet(this.scene, x + 8, y - 20, this.scene.bullets);
    } else {
      new Bullet(this.scene, x, y - 20, this.scene.bullets);
    }
  }
}
