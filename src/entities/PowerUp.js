/**
 * PowerUp — a collectible orb that grants the player a temporary ability.
 *
 * Types:
 *   'rapid'  — orange orb (frame 0) → rapid-fire mode for 10 s
 *   'double' — blue orb  (frame 1) → double-shot mode for 10 s
 *
 * Velocity is set by GameScene after group.add() (see velocity-after-group-add pattern).
 * Auto-destroys after 8 s if not collected.
 */
export default class PowerUp {
  constructor(scene, x, y, type) {
    // frame 0 = orange rapid-fire orb, frame 1 = blue double-shot orb
    const frame = type === 'rapid' ? 0 : 1;
    this.type = type;
    this.sprite = scene.physics.add.sprite(x, y, 'power-up', frame).setScale(2);
    this.sprite.setData('type', type);

    // Auto-destroy after 8s if not collected
    scene.time.delayedCall(8000, () => {
      if (this.sprite && this.sprite.active) this.sprite.destroy();
    });
  }
}
