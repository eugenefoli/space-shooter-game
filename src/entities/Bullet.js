/**
 * Bullet — upward-flying player projectile.
 * Uses frame 2 of laser-bolts.png (the vertical bolt) flipped vertically.
 *
 * NOTE: setVelocityY must be called AFTER group.add() — Phaser resets
 * the physics body when a sprite is added to a group.
 */
export default class Bullet {
  constructor(scene, x, y, group) {
    this.sprite = scene.physics.add.sprite(x, y, 'laser-bolts', 2)
      .setScale(2)
      .setFlipY(true);

    group.add(this.sprite);

    // Set velocity after group.add() — Phaser resets body on group add
    this.sprite.setVelocityY(-500);

    // Auto-destroy when off screen
    scene.time.delayedCall(2000, () => {
      if (this.sprite && this.sprite.active) this.sprite.destroy();
    });
  }
}
