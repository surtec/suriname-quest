// src/game/objects/Player.js
// Surinaams karakter dat door de wereld loopt

export default class Player {
  constructor(scene, x, y) {
    this.scene  = scene
    this.speed  = 120
    this.facing = 'down'  // 'up' | 'down' | 'left' | 'right'

    // Teken het karakter met Phaser Graphics (geen externe sprites nodig)
    this.container = scene.add.container(x, y)

    // Schaduw
    this.shadow = scene.add.ellipse(0, 22, 24, 8, 0x000000, 0.2)
    this.container.add(this.shadow)

    // Benen (Graphics)
    this.legs = scene.add.graphics()
    this.container.add(this.legs)

    // Lichaam
    this.body = scene.add.graphics()
    this.container.add(this.body)

    // Hoofd
    this.head = scene.add.graphics()
    this.container.add(this.head)

    // Hoed
    this.hat = scene.add.graphics()
    this.container.add(this.hat)

    // Naam label
    this.nameLabel = scene.add.text(0, 28, '', {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '11px',
      color:      '#7ec98f',
      stroke:     '#000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0)
    this.container.add(this.nameLabel)

    // Collision body voor physics
    scene.physics.add.existing(this.container)
    this.body_phys = this.container.body
    this.body_phys.setSize(20, 20)
    this.body_phys.setOffset(-10, 5)

    this.walkFrame = 0
    this.drawCharacter()
  }

  setNaam(naam) {
    this.nameLabel.setText(naam + ' ⭐')
  }

  drawCharacter() {
    const f = this.walkFrame

    // Benen tekenen
    this.legs.clear()
    this.legs.fillStyle(0x2a2a2a, 1)
    const legSwing = Math.sin(f * 0.25) * 5
    // Linker been
    this.legs.fillRoundedRect(-6, 8 + legSwing, 7, 13, 3)
    // Rechter been
    this.legs.fillRoundedRect(0, 8 - legSwing, 7, 13, 3)

    // Schoenen
    this.legs.fillStyle(0x1a1a1a, 1)
    this.legs.fillRoundedRect(-8, 20 + legSwing, 10, 4, 2)
    this.legs.fillRoundedRect(-1, 20 - legSwing, 10, 4, 2)

    // Lichaam (jurk/cape in Surinaams groen)
    this.body.clear()
    // Cape
    this.body.fillStyle(0x3aaa6a, 1)
    this.body.fillTriangle(-11, 8, 11, 8, -14, 22)
    this.body.fillTriangle(-11, 8, 11, 8, 14, 22)
    // Torso
    this.body.fillStyle(0x2a8a50, 1)
    this.body.fillRoundedRect(-9, -12, 18, 22, { tl: 3, tr: 3, bl: 0, br: 0 })
    // Sjaal (geel)
    this.body.fillStyle(0xf4c430, 1)
    this.body.fillRoundedRect(-7, -4, 14, 5, 2)
    // Arm met item
    this.body.fillStyle(0xb07040, 1)
    this.body.fillRoundedRect(8, -9, 4, 14, 2)
    this.body.fillRoundedRect(12, -2 + Math.sin(f * 0.04) * 2, 4, 12, 2)

    // Hoofd
    this.head.clear()
    this.head.fillStyle(0xd4905a, 1)
    this.head.fillCircle(0, -20, 10)
    // Ogen
    this.head.fillStyle(0x1a1a1a, 1)
    this.head.fillCircle(-3.5, -21, 1.5)
    this.head.fillCircle(3.5, -21, 1.5)
    // Neus
    this.head.fillStyle(0xb07040, 1)
    this.head.fillCircle(0, -18.5, 1.2)

    // Hoed (traditioneel Surinaams)
    this.hat.clear()
    // Rand
    this.hat.fillStyle(0x1a4a2a, 1)
    this.hat.fillRoundedRect(-13, -27, 26, 5, 2)
    // Hoedenlichaam
    this.hat.fillStyle(0x2a6a3a, 1)
    this.hat.fillTriangle(-9, -27, 9, -27, 5, -45)
    this.hat.fillRoundedRect(-8, -38, 16, 12, 2)
    // Bloem op hoed
    this.hat.fillStyle(0xf4c430, 1)
    this.hat.fillCircle(4, -42, 3)
    this.hat.fillStyle(0xe84040, 1)
    this.hat.fillCircle(4, -42, 2)
  }

  update(cursors, wasd) {
    const body = this.body_phys
    body.setVelocity(0)

    let moving = false

    // Beweging — pijltjestoetsen of WASD
    if (cursors.left.isDown  || wasd.left.isDown)  { body.setVelocityX(-this.speed); this.facing = 'left';  moving = true }
    if (cursors.right.isDown || wasd.right.isDown) { body.setVelocityX(this.speed);  this.facing = 'right'; moving = true }
    if (cursors.up.isDown    || wasd.up.isDown)    { body.setVelocityY(-this.speed); this.facing = 'up';    moving = true }
    if (cursors.down.isDown  || wasd.down.isDown)  { body.setVelocityY(this.speed);  this.facing = 'down';  moving = true }

    // Diagonale normalisatie
    if (body.velocity.x !== 0 && body.velocity.y !== 0) {
      body.velocity.normalize().scale(this.speed)
    }

    // Loopanimatie
    if (moving) {
      this.walkFrame++
    } else {
      this.walkFrame = 0
    }

    this.drawCharacter()

    // Diepte sortering (hoger in scherm = verder weg)
    this.container.setDepth(this.container.y)
  }

  getPosition() {
    return { x: this.container.x, y: this.container.y }
  }
}
