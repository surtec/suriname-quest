// src/game/scenes/LocationScene.js
// Locatie bezoek scherm — verzamel items en doe quiz

import { getLocation } from '../data/locations.js'

export default class LocationScene extends Phaser.Scene {
  constructor() { super('LocationScene') }

  init(data) {
    this.locatieId   = data.locatieId
    this.spelerData  = data.speler
    this.locatie     = getLocation(data.locatieId)
    this.gevonden    = new Set(data.speler.collectibles || [])
    this.nieuwGevonden = []
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height
    const L = this.locatie

    // ── ACHTERGROND ───────────────────────────────────────────
    // Sfeer achtergrond passend bij de locatie
    this.add.rectangle(W / 2, H / 2, W, H, 0x0d1b12)
    this.tekeningAchtergrond(W, H)

    // ── TERUG KNOP ────────────────────────────────────────────
    const terugKnop = this.add.text(20, 20, '← Terug naar stad', {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '14px',
      color:      '#7ec98f',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding:    { x: 10, y: 6 },
    }).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.gaanNaarWereld())
      .on('pointerover', function() { this.setColor('#f4c430') })
      .on('pointerout',  function() { this.setColor('#7ec98f') })

    // ── LOCATIE NAAM ──────────────────────────────────────────
    this.add.text(W / 2, 22, L.naam, {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '28px',
      color:      '#f4c430',
      stroke:     '#8B4513',
      strokeThickness: 3,
    }).setOrigin(0.5, 0)

    this.add.text(W / 2, 56, L.jaar, {
      fontFamily: "'Nunito', sans-serif",
      fontSize:   '12px',
      color:      '#7ec98f',
      backgroundColor: 'rgba(126,201,143,0.15)',
      padding:    { x: 8, y: 3 },
    }).setOrigin(0.5, 0)

    // Beschrijving
    this.add.text(W / 2, 82, L.beschrijving, {
      fontFamily: "'Nunito', sans-serif",
      fontSize:   '13px',
      color:      'rgba(255,255,255,0.8)',
      wordWrap:   { width: W - 40 },
      align:      'center',
      lineSpacing: 4,
    }).setOrigin(0.5, 0)

    // ── COLLECTIBLES SECTIE ───────────────────────────────────
    const yStart = 145
    this.add.text(W / 2, yStart, '✨ Verzamelen ✨', {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '16px',
      color:      '#f4c430',
    }).setOrigin(0.5, 0)

    this.maakCollectibles(W, yStart + 28)

    // ── QUIZ KNOP ─────────────────────────────────────────────
    this.maakQuizKnop(W, H)
  }

  tekeningAchtergrond(W, H) {
    const g = this.add.graphics()
    // Tropisch landschap achtergrond voor de locatie
    g.fillGradientStyle(0x1a4a2e, 0x0d2818, 0x1a3a22, 0x0a1f10, 1)
    g.fillRect(0, 0, W, H * 0.5)
    g.fillStyle(0x2a5a35, 0.3)
    g.fillEllipse(W * 0.15, H * 0.3, 120, 80)
    g.fillEllipse(W * 0.85, H * 0.25, 100, 70)
    // Bodem
    g.fillGradientStyle(0x0d1b12, 0x0a1510, 0x08100a, 0x060c08, 1)
    g.fillRect(0, H * 0.5, W, H * 0.5)
  }

  maakCollectibles(W, yStart) {
    const L = this.locatie
    const kolommen = 3
    const kaartBreedte = (W - 40) / kolommen - 8
    const kaartHoogte  = 90

    L.collectibles.forEach((item, i) => {
      const kolom = i % kolommen
      const rij   = Math.floor(i / kolommen)
      const x     = 20 + kolom * (kaartBreedte + 8) + kaartBreedte / 2
      const y     = yStart + rij * (kaartHoogte + 8)
      const gevonden = this.gevonden.has(item.id)

      // Kaart achtergrond
      const bg = this.add.graphics()
      if (gevonden) {
        bg.fillStyle(0xf4c430, 0.15)
        bg.lineStyle(2, 0xf4c430, 0.8)
      } else {
        bg.fillStyle(0xffffff, 0.06)
        bg.lineStyle(1.5, 0xffffff, 0.1)
      }
      bg.fillRoundedRect(x - kaartBreedte / 2, y, kaartBreedte, kaartHoogte, 12)
      bg.strokeRoundedRect(x - kaartBreedte / 2, y, kaartBreedte, kaartHoogte, 12)

      // Emoji icoon
      this.add.text(x, y + 22, item.emoji, {
        fontSize: '30px',
      }).setOrigin(0.5, 0.5)

      // Naam
      this.add.text(x, y + 48, item.naam, {
        fontFamily: "'Nunito', sans-serif",
        fontSize:   '11px',
        fontStyle:  'bold',
        color:      '#ffffff',
        wordWrap:   { width: kaartBreedte - 10 },
        align:      'center',
      }).setOrigin(0.5, 0)

      // Gevonden badge
      if (gevonden) {
        this.add.text(x + kaartBreedte / 2 - 6, y + 6, '✓', {
          fontFamily: "'Nunito', sans-serif",
          fontSize:   '10px',
          color:      '#1a3a00',
          backgroundColor: '#f4c430',
          padding:    { x: 3, y: 1 },
        }).setOrigin(1, 0)
      } else {
        // Klikbaar maken — verzamel het item!
        const zone = this.add.zone(x, y + kaartHoogte / 2, kaartBreedte, kaartHoogte)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => this.verzamelItem(item, bg, zone))

        // Hover effect
        zone.on('pointerover', () => {
          bg.clear()
          bg.fillStyle(0xffffff, 0.12)
          bg.lineStyle(1.5, 0x7ec98f, 0.8)
          bg.fillRoundedRect(x - kaartBreedte / 2, y, kaartBreedte, kaartHoogte, 12)
          bg.strokeRoundedRect(x - kaartBreedte / 2, y, kaartBreedte, kaartHoogte, 12)
        })
        zone.on('pointerout', () => {
          bg.clear()
          bg.fillStyle(0xffffff, 0.06)
          bg.lineStyle(1.5, 0xffffff, 0.1)
          bg.fillRoundedRect(x - kaartBreedte / 2, y, kaartBreedte, kaartHoogte, 12)
          bg.strokeRoundedRect(x - kaartBreedte / 2, y, kaartBreedte, kaartHoogte, 12)
        })
      }
    })
  }

  verzamelItem(item, bg, zone) {
    if (this.gevonden.has(item.id)) return

    this.gevonden.add(item.id)
    this.nieuwGevonden.push(item.id)

    // Verwijder klikbaarheid
    zone.destroy()

    if (this.cache.audio.exists('item')) this.sound.play('item', { volume: 0.7 })

    // ✓ Effect
    const W = this.scale.width

    // Goud flash animatie
    this.cameras.main.flash(200, 244, 196, 48, false)

    // Popup melding onderaan
    const popup = this.add.container(W / 2, this.scale.height - 80)
    const popBg = this.add.graphics()
    popBg.fillStyle(0xf4c430, 0.95)
    popBg.fillRoundedRect(-140, -20, 280, 40, 10)
    const popTekst = this.add.text(0, 0, `${item.emoji} ${item.naam} gevonden! +50 punten`, {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '14px',
      color:      '#1a3a00',
    }).setOrigin(0.5)
    popup.add([popBg, popTekst])
    popup.setAlpha(0).setScale(0.8)

    this.tweens.add({
      targets:  popup,
      alpha:    1,
      scaleX:   1,
      scaleY:   1,
      duration: 300,
      ease:     'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1800, () => {
          this.tweens.add({ targets: popup, alpha: 0, y: '-=20', duration: 300 })
        })
      },
    })

    // Update HUD
    this.game.events.emit('item-gevonden', { item, punten: 50 })
  }

  maakQuizKnop(W, H) {
    const y = H - 65

    // Knop achtergrond
    const knop = this.add.graphics()
    knop.fillStyle(0xf4c430, 1)
    knop.fillRoundedRect(W / 2 - 130, y, 260, 50, 12)

    const knopTekst = this.add.text(W / 2, y + 25, '🎮  Quiz doen!', {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '22px',
      color:      '#1a3a00',
    }).setOrigin(0.5)

    // Klik zone
    const zone = this.add.zone(W / 2, y + 25, 260, 50)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.gaanNaarQuiz())
      .on('pointerover', () => {
        knop.clear()
        knop.fillStyle(0xe8b020, 1)
        knop.fillRoundedRect(W / 2 - 130, y, 260, 50, 12)
      })
      .on('pointerout', () => {
        knop.clear()
        knop.fillStyle(0xf4c430, 1)
        knop.fillRoundedRect(W / 2 - 130, y, 260, 50, 12)
      })
  }

  gaanNaarQuiz() {
    this.cameras.main.fadeOut(300, 0, 0, 0)
    this.time.delayedCall(300, () => {
      this.scene.start('QuizScene', {
        locatieId:     this.locatieId,
        speler:        {
          ...this.spelerData,
          collectibles: [...this.gevonden],
          punten:       (this.spelerData.punten || 0) + this.nieuwGevonden.length * 50,
        },
      })
    })
  }

  gaanNaarWereld() {
    this.cameras.main.fadeOut(300, 0, 0, 0)
    this.time.delayedCall(300, () => {
      this.scene.start('WorldScene', {
        speler: {
          ...this.spelerData,
          collectibles: [...this.gevonden],
          punten:       (this.spelerData.punten || 0) + this.nieuwGevonden.length * 50,
        },
      })
    })
  }
}
