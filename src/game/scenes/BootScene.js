// src/game/scenes/BootScene.js
// Laad alle assets en toon laadscherm

import { maakGeluidURLs } from '../audio/SoundGen.js'

export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene') }

  preload() {
    // Laadscherm tekenen
    const W = this.scale.width
    const H = this.scale.height

    // Achtergrond
    this.add.rectangle(W / 2, H / 2, W, H, 0x0d1b12)

    // Logo tekst
    this.add.text(W / 2, H / 2 - 60, 'SuriQuest', {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '48px',
      color:      '#f4c430',
      stroke:     '#8B4513',
      strokeThickness: 4,
    }).setOrigin(0.5)

    this.add.text(W / 2, H / 2 - 10, '2060', {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '32px',
      color:      '#7ec98f',
    }).setOrigin(0.5)

    // Progress bar achtergrond
    this.add.rectangle(W / 2, H / 2 + 50, 300, 12, 0x1a3a22)
    const bar = this.add.rectangle(W / 2 - 150 + 1, H / 2 + 50, 2, 10, 0xf4c430)
      .setOrigin(0, 0.5)

    const loadText = this.add.text(W / 2, H / 2 + 75, 'Laden...', {
      fontFamily: "'Nunito', sans-serif",
      fontSize:   '14px',
      color:      '#7ec98f',
    }).setOrigin(0.5)

    // Update laadbar
    this.load.on('progress', value => {
      bar.setSize(298 * value, 10)
    })

    this.load.on('fileprogress', file => {
      loadText.setText('Laden: ' + file.key)
    })

    // ── AUDIO — synthetisch gegenereerd, geen externe URLs nodig ─
    const snd = maakGeluidURLs()
    this.load.audio('bgm',   snd.bgm)
    this.load.audio('juist', snd.juist)
    this.load.audio('fout',  snd.fout)
    this.load.audio('item',  snd.item)
  }

  create() {
    // Ga naar de wereld scene
    this.scene.start('WorldScene')
  }
}
