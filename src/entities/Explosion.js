export default class Explosion {
  constructor(scene, x, y) {
    const sprite = scene.add.sprite(x, y, 'explosion');
    sprite.play('explode');
  }
}
