/**
 * EnemyBullet — downward-flying enemy projectile.
 * Uses frame 3 of laser-bolts.png.
 * Velocity and direction are set by the caller (Enemy._fire()) after group.add().
 */
export default class EnemyBullet {
  constructor(scene, x, y) {
    this.sprite = scene.physics.add.sprite(x, y, 'laser-bolts', 3).setScale(2);

    // Auto-destroy when off screen
    scene.time.delayedCall(3000, () => {
      if (this.sprite && this.sprite.active) this.sprite.destroy();
    });
  }
}
