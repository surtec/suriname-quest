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
    this.add.rectangle(W / 2, H / 2, W, H, 0x080E20)
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
    g.fillGradientStyle(0x1a3a70, 0x0d2858, 0x1a3060, 0x0a1848, 1)
    g.fillRect(0, 0, W, H * 0.5)
    g.fillStyle(0x2860B0, 0.28)
    g.fillEllipse(W * 0.15, H * 0.3, 130, 85)
    g.fillEllipse(W * 0.85, H * 0.25, 110, 75)
    // Bodem
    g.fillGradientStyle(0x080E20, 0x060C1A, 0x050A16, 0x040810, 1)
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
        bg.fillStyle(0xf4c430, 0.18)
        bg.lineStyle(2, 0xf4c430, 0.9)
      } else {
        bg.fillStyle(0x0A1E48, 0.85)
        bg.lineStyle(1.5, 0x2860C0, 0.55)
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
          bg.fillStyle(0x1A3A78, 1)
          bg.lineStyle(2, 0x50AAFF, 1)
          bg.fillRoundedRect(x - kaartBreedte / 2, y, kaartBreedte, kaartHoogte, 12)
          bg.strokeRoundedRect(x - kaartBreedte / 2, y, kaartBreedte, kaartHoogte, 12)
        })
        zone.on('pointerout', () => {
          bg.clear()
          bg.fillStyle(0x0A1E48, 0.85)
          bg.lineStyle(1.5, 0x2860C0, 0.55)
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

    // Toon trading card overlay
    this.toonKaartOverlay(item)

    // Update HUD
    this.game.events.emit('item-gevonden', { item, punten: 50 })
  }

  toonKaartOverlay(item) {
    const W = this.scale.width
    const H = this.scale.height

    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75)
      .setInteractive().setDepth(200)

    const card = this.add.container(W / 2, H / 2).setDepth(201)

    // Kaart achtergrond
    const bg = this.add.graphics()
    bg.fillStyle(0x0d2018, 1)
    bg.fillRoundedRect(-115, -155, 230, 315, 18)
    // Goud buitenrand
    bg.lineStyle(3, 0xf4c430, 1)
    bg.strokeRoundedRect(-115, -155, 230, 315, 18)
    // Subtiele binnenrand
    bg.lineStyle(1, 0xf4c430, 0.3)
    bg.strokeRoundedRect(-107, -147, 214, 299, 14)
    card.add(bg)

    // Emoji groot
    const emojiTekst = this.add.text(0, -90, item.emoji, { fontSize: '62px' }).setOrigin(0.5)
    card.add(emojiTekst)

    // Naam
    const naamTekst = this.add.text(0, -28, item.naam, {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '17px',
      color:      '#f4c430',
      wordWrap:   { width: 200 },
      align:      'center',
    }).setOrigin(0.5)
    card.add(naamTekst)

    // Beschrijving
    const beschTekst = this.add.text(0, 10, item.beschrijving, {
      fontFamily: "'Nunito', sans-serif",
      fontSize:   '11px',
      color:      'rgba(255,255,255,0.82)',
      wordWrap:   { width: 200 },
      align:      'center',
      lineSpacing: 3,
    }).setOrigin(0.5, 0)
    card.add(beschTekst)

    // Groene "VERZAMELD!" badge
    const badgeBg = this.add.graphics()
    badgeBg.fillStyle(0x2a8a50, 1)
    badgeBg.fillRoundedRect(-65, 118, 130, 28, 8)
    card.add(badgeBg)
    const badgeTekst = this.add.text(0, 132, '✓  VERZAMELD!', {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '14px',
      color:      '#f4c430',
    }).setOrigin(0.5)
    card.add(badgeTekst)

    // Tik-hint
    const hint = this.add.text(0, 150, 'tik om te sluiten', {
      fontFamily: "'Nunito', sans-serif",
      fontSize:   '10px',
      color:      'rgba(255,255,255,0.35)',
    }).setOrigin(0.5)
    card.add(hint)

    // Animeer in
    card.setScale(0.05).setAlpha(0)
    this.tweens.add({
      targets:  card,
      scaleX:   1,
      scaleY:   1,
      alpha:    1,
      duration: 420,
      ease:     'Back.easeOut',
    })

    const sluiten = () => {
      this.tweens.add({
        targets:  [card, dim],
        alpha:    0,
        scaleX:   card.scaleX * 0.8,
        scaleY:   card.scaleY * 0.8,
        duration: 200,
        onComplete: () => { card.destroy(); dim.destroy() },
      })
    }
    dim.on('pointerdown', sluiten)
    card.setInteractive(new Phaser.Geom.Rectangle(-115, -155, 230, 315), Phaser.Geom.Rectangle.Contains)
    card.on('pointerdown', sluiten)
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
