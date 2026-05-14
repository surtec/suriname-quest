// src/game/scenes/QuizScene.js
// Quiz mini-game — Snufkin "Level Up" stijl popup

import { getLocation } from '../data/locations.js'

export default class QuizScene extends Phaser.Scene {
  constructor() { super('QuizScene') }

  init(data) {
    this.locatieId  = data.locatieId
    this.spelerData = data.speler
    this.locatie    = getLocation(data.locatieId)
    this.vragen     = [...this.locatie.quiz]
    this.huidig     = 0
    this.score      = 0
    this.beantwoord = false
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height

    // Achtergrond (donker, gefocust)
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a1208)

    // Decoratieve planten hoeken
    this.tekeningHoekDecoratie(W, H)

    // Progress dots bovenaan
    this.progressDots = []
    this.maakProgressDots(W)

    // Kaart container (wordt per vraag ververst)
    this.vraagContainer = this.add.container(0, 0)
    this.toonVraag()
  }

  tekeningHoekDecoratie(W, H) {
    const g = this.add.graphics()
    // Bladeren in hoeken
    g.fillStyle(0x2a6a20, 0.4)
    g.fillTriangle(0, 0, 80, 0, 0, 80)
    g.fillTriangle(W, 0, W - 80, 0, W, 80)
    g.fillStyle(0x3a8a30, 0.3)
    g.fillCircle(30, 30, 25)
    g.fillCircle(W - 30, 30, 25)
    g.fillStyle(0x4aa040, 0.25)
    g.fillCircle(15, 60, 18)
    g.fillCircle(W - 15, 60, 18)
  }

  maakProgressDots(W) {
    const totaal = this.vragen.length
    const spacing = 28
    const startX = W / 2 - (totaal - 1) * spacing / 2

    this.vragen.forEach((_, i) => {
      const g = this.add.graphics()
      if (i < this.huidig) {
        g.fillStyle(0xf4c430, 1)
      } else if (i === this.huidig) {
        g.fillStyle(0x7ec98f, 1)
      } else {
        g.fillStyle(0xffffff, 0.2)
      }
      g.fillCircle(startX + i * spacing, 25, 6)
      this.progressDots.push(g)
    })
  }

  verversProgressDots() {
    this.progressDots.forEach((g, i) => {
      g.clear()
      if (i < this.huidig) {
        g.fillStyle(0xf4c430, 1)
      } else if (i === this.huidig) {
        g.fillStyle(0x7ec98f, 1)
      } else {
        g.fillStyle(0xffffff, 0.2)
      }
      g.fillCircle(0, 0, 6)
    })
  }

  toonVraag() {
    this.beantwoord = false
    this.vraagContainer.removeAll(true)

    const W = this.scale.width
    const H = this.scale.height
    const vraag = this.vragen[this.huidig]

    // Emoji afbeelding
    const emojiBox = this.add.graphics()
    emojiBox.fillStyle(0x1a4a2e, 1)
    emojiBox.lineStyle(1.5, 0x2a6a3e, 1)
    emojiBox.fillRoundedRect(W / 2 - 130, 45, 260, 90, 12)
    emojiBox.strokeRoundedRect(W / 2 - 130, 45, 260, 90, 12)
    this.vraagContainer.add(emojiBox)

    this.add.text(W / 2, 90, vraag.emoji, {
      fontSize: '46px',
    }).setOrigin(0.5).setDepth(1)

    // Vraag tekst
    this.add.text(W / 2, 150, vraag.vraag, {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '18px',
      color:      '#ffffff',
      wordWrap:   { width: W - 40 },
      align:      'center',
    }).setOrigin(0.5, 0)

    // Antwoord knoppen
    this.antwoordKnoppen = []
    const cols = 2
    const knopB = (W - 40) / cols - 8
    const knopH = 54

    vraag.opties.forEach((optie, i) => {
      const col = i % cols
      const rij = Math.floor(i / cols)
      const x   = 20 + col * (knopB + 8)
      const y   = 200 + rij * (knopH + 8)

      const knopBg = this.add.graphics()
      knopBg.fillStyle(0xffffff, 0.07)
      knopBg.lineStyle(2, 0xffffff, 0.18)
      knopBg.fillRoundedRect(x, y, knopB, knopH, 12)
      knopBg.strokeRoundedRect(x, y, knopB, knopH, 12)

      const tekst = this.add.text(x + knopB / 2, y + knopH / 2, optie, {
        fontFamily: "'Nunito', sans-serif",
        fontSize:   '14px',
        fontStyle:  'bold',
        color:      '#ffffff',
        wordWrap:   { width: knopB - 16 },
        align:      'center',
      }).setOrigin(0.5)

      // Interactie zone
      const zone = this.add.zone(x + knopB / 2, y + knopH / 2, knopB, knopH)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.beantwoordVraag(i, knopBg, tekst))
        .on('pointerover', () => {
          if (!this.beantwoord) {
            knopBg.clear()
            knopBg.fillStyle(0xffffff, 0.15)
            knopBg.lineStyle(2, 0x7ec98f, 0.8)
            knopBg.fillRoundedRect(x, y, knopB, knopH, 12)
            knopBg.strokeRoundedRect(x, y, knopB, knopH, 12)
          }
        })
        .on('pointerout', () => {
          if (!this.beantwoord) {
            knopBg.clear()
            knopBg.fillStyle(0xffffff, 0.07)
            knopBg.lineStyle(2, 0xffffff, 0.18)
            knopBg.fillRoundedRect(x, y, knopB, knopH, 12)
            knopBg.strokeRoundedRect(x, y, knopB, knopH, 12)
          }
        })

      this.antwoordKnoppen.push({ bg: knopBg, tekst, zone, juist: i === vraag.juist, x, y, w: knopB, h: knopH })
    })

    // Animatie — slide in van rechts
    this.vraagContainer.setX(W)
    this.tweens.add({
      targets:  this.vraagContainer,
      x:        0,
      duration: 300,
      ease:     'Back.easeOut',
    })
  }

  beantwoordVraag(keuze, gekozenBg, gekozenTekst) {
    if (this.beantwoord) return
    this.beantwoord = true

    const W = this.scale.width
    const vraag = this.vragen[this.huidig]
    const isJuist = keuze === vraag.juist

    if (isJuist) {
      this.score++
      if (this.cache.audio.exists('juist')) this.sound.play('juist', { volume: 0.6 })
      // Groen — goed!
      gekozenBg.clear()
      gekozenBg.fillStyle(0x7ec98f, 0.3)
      gekozenBg.lineStyle(2.5, 0x7ec98f, 1)
      const { x, y, w, h } = this.antwoordKnoppen[keuze]
      gekozenBg.fillRoundedRect(x, y, w, h, 12)
      gekozenBg.strokeRoundedRect(x, y, w, h, 12)
      gekozenTekst.setColor('#7ec98f')

      // Confetti effect
      this.cameras.main.flash(150, 126, 201, 143, false)
    } else {
      if (this.cache.audio.exists('fout')) this.sound.play('fout', { volume: 0.6 })
      // Rood — fout
      const { x, y, w, h } = this.antwoordKnoppen[keuze]
      gekozenBg.clear()
      gekozenBg.fillStyle(0xe24b4a, 0.25)
      gekozenBg.lineStyle(2.5, 0xe24b4a, 1)
      gekozenBg.fillRoundedRect(x, y, w, h, 12)
      gekozenBg.strokeRoundedRect(x, y, w, h, 12)
      gekozenTekst.setColor('#e24b4a')

      // Toon het juiste antwoord in groen
      const juistKnop = this.antwoordKnoppen[vraag.juist]
      juistKnop.bg.clear()
      juistKnop.bg.fillStyle(0x7ec98f, 0.25)
      juistKnop.bg.lineStyle(2.5, 0x7ec98f, 1)
      juistKnop.bg.fillRoundedRect(juistKnop.x, juistKnop.y, juistKnop.w, juistKnop.h, 12)
      juistKnop.bg.strokeRoundedRect(juistKnop.x, juistKnop.y, juistKnop.w, juistKnop.h, 12)
      juistKnop.tekst.setColor('#7ec98f')
    }

    // Uitleg tekst
    const uitlegBg = this.add.graphics()
    uitlegBg.fillStyle(isJuist ? 0x7ec98f : 0xe24b4a, 0.12)
    uitlegBg.lineStyle(1, isJuist ? 0x7ec98f : 0xe24b4a, 0.4)
    uitlegBg.fillRoundedRect(20, 328, W - 40, 50, 10)
    uitlegBg.strokeRoundedRect(20, 328, W - 40, 50, 10)

    this.add.text(W / 2, 353, vraag.uitleg, {
      fontFamily: "'Nunito', sans-serif",
      fontSize:   '12px',
      color:      isJuist ? '#7ec98f' : '#e24b4a',
      wordWrap:   { width: W - 60 },
      align:      'center',
    }).setOrigin(0.5)

    // Volgende knop
    this.time.delayedCall(400, () => {
      const volgKnop = this.add.text(W / 2, H - 45, 'Volgende vraag →', {
        fontFamily: "'Fredoka One', cursive",
        fontSize:   '18px',
        color:      '#1a3a00',
        backgroundColor: '#f4c430',
        padding:    { x: 20, y: 10 },
      }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.huidig++
          if (this.huidig >= this.vragen.length) {
            this.toonWinScherm()
          } else {
            this.verversProgressDots()
            this.toonVraag()
            uitlegBg.destroy()
            volgKnop.destroy()
          }
        })
    })
  }

  toonWinScherm() {
    const W = this.scale.width
    const H = this.scale.height
    const sterren = this.score === this.vragen.length ? 3 : this.score >= this.vragen.length / 2 ? 2 : 1
    const puntBonus = sterren * 100

    // Wis alles
    this.children.removeAll(true)

    // Achtergrond
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a1208)
    this.tekeningHoekDecoratie(W, H)

    // Ster (zoals Snufkin Level Up!)
    const sterGrootte = 90
    const sg = this.add.graphics()
    sg.fillStyle(0xf4c430, 1)
    sg.lineStyle(3, 0xc8860a, 1)
    // Ster punten tekenen
    const punten = 5
    const buitenR = sterGrootte / 2
    const binnenR = buitenR * 0.45
    sg.beginPath()
    for (let i = 0; i < punten * 2; i++) {
      const r = i % 2 === 0 ? buitenR : binnenR
      const a = (i / (punten * 2)) * Math.PI * 2 - Math.PI / 2
      if (i === 0) sg.moveTo(W / 2 + r * Math.cos(a), 100 + r * Math.sin(a))
      else sg.lineTo(W / 2 + r * Math.cos(a), 100 + r * Math.sin(a))
    }
    sg.closePath()
    sg.fillPath()
    sg.strokePath()

    // Level nummer in ster
    const nieuwLevel = (this.spelerData.level || 1) + (sterren >= 2 ? 1 : 0)
    this.add.text(W / 2, 100, String(nieuwLevel), {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '28px',
      color:      '#7a4a00',
    }).setOrigin(0.5)

    // Sterren resultaat
    const sterEmoji = '⭐'.repeat(sterren) + '☆'.repeat(3 - sterren)
    this.add.text(W / 2, 160, sterEmoji, { fontSize: '32px' }).setOrigin(0.5)

    // Titel
    this.add.text(W / 2, 205, sterren === 3 ? 'PERFECT! 🎉' : 'GOED GEDAAN!', {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '28px',
      color:      '#f4c430',
      stroke:     '#8B4513',
      strokeThickness: 3,
    }).setOrigin(0.5)

    // Score
    this.add.text(W / 2, 248, `${this.score} van de ${this.vragen.length} vragen goed!`, {
      fontFamily: "'Nunito', sans-serif",
      fontSize:   '14px',
      color:      'rgba(255,255,255,0.75)',
    }).setOrigin(0.5)

    // Badge
    const badgeBg = this.add.graphics()
    badgeBg.lineStyle(2, 0xf4c430, 1)
    badgeBg.fillStyle(0xf4c430, 0.1)
    badgeBg.fillRoundedRect(W / 2 - 80, 270, 160, 80, 16)
    badgeBg.strokeRoundedRect(W / 2 - 80, 270, 160, 80, 16)

    const locatieBadge = {
      fort_zeelandia: '🏰', waterkant: '🚢', onafhankelijkheidsplein: '🎆',
      anton_de_kom: '✊', cultuurhuis: '🎭', hendrikschool: '🎓',
    }
    this.add.text(W / 2, 294, locatieBadge[this.locatie.id] || '⭐', {
      fontSize: '32px',
    }).setOrigin(0.5)

    this.add.text(W / 2, 328, this.locatie.naam + ' Held!', {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '13px',
      color:      '#f4c430',
    }).setOrigin(0.5)

    // Uitleg tekst (Snufkin stijl)
    this.add.text(W / 2, 368, `Je hebt ${puntBonus} punten verdiend!\nJe leert steeds meer over Suriname.`, {
      fontFamily: "'Lora', serif",
      fontSize:   '12px',
      fontStyle:  'italic',
      color:      'rgba(255,255,255,0.65)',
      align:      'center',
      lineSpacing: 4,
    }).setOrigin(0.5)

    // Terug naar stad knop
    this.add.text(W / 2, H - 45, '🗺️  Terug naar de stad', {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '18px',
      color:      '#1a3a00',
      backgroundColor: '#f4c430',
      padding:    { x: 20, y: 10 },
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        const nieuweData = {
          ...this.spelerData,
          punten: (this.spelerData.punten || 0) + puntBonus,
          level:  nieuwLevel,
        }
        // Sla op in Firebase via game event
        this.game.events.emit('sla-quiz-op', {
          locatieId: this.locatieId,
          score:     this.score,
          sterren,
          speler:    nieuweData,
        })
        this.cameras.main.fadeOut(300, 0, 0, 0)
        this.time.delayedCall(300, () => {
          this.scene.start('WorldScene', { speler: nieuweData })
        })
      })
  }
}
