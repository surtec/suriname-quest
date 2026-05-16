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
    this.add.rectangle(W / 2, H / 2, W, H, 0x080E20)

    // Decoratieve planten hoeken
    this.tekeningHoekDecoratie(W, H)

    // Terug knop
    this.add.text(16, 16, '← Stoppen', {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '13px',
      color:      '#7ec98f',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding:    { x: 9, y: 5 },
    }).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.cameras.main.fadeOut(250, 0, 0, 0)
        this.time.delayedCall(250, () => {
          this.scene.start('WorldScene', { speler: this.spelerData })
        })
      })
      .on('pointerover', function() { this.setColor('#f4c430') })
      .on('pointerout',  function() { this.setColor('#7ec98f') })

    // Progress dots bovenaan
    this.progressDots = []
    this.maakProgressDots(W)

    // Kaart container (wordt per vraag ververst)
    this.vraagContainer = this.add.container(0, 0)
    this.toonVraag()
  }

  spawConfetti(W) {
    const kleuren = [0xf4c430, 0x7ec98f, 0xe24b4a, 0x4a9eff, 0xff9f4a, 0xff69b4, 0xffffff]
    for (let i = 0; i < 32; i++) {
      const g = this.add.graphics().setDepth(200)
      g.fillStyle(kleuren[i % kleuren.length], 1)
      const maat = Phaser.Math.Between(5, 10)
      g.fillRect(-maat / 2, -maat / 2, maat, maat)
      const sx = Phaser.Math.Between(20, W - 20)
      g.setPosition(sx, -10)
      this.tweens.add({
        targets:  g,
        y:        this.scale.height + 20,
        x:        sx + Phaser.Math.Between(-80, 80),
        angle:    Phaser.Math.Between(-360, 360),
        alpha:    { from: 1, to: 0.15 },
        duration: Phaser.Math.Between(900, 1600),
        delay:    i * 35,
        ease:     'Quad.easeIn',
        onComplete: () => g.destroy(),
      })
    }
  }

  tekeningHoekDecoratie(W, H) {
    const g = this.add.graphics()
    g.fillStyle(0x1050B0, 0.45)
    g.fillTriangle(0, 0, 100, 0, 0, 100)
    g.fillTriangle(W, 0, W - 100, 0, W, 100)
    g.fillStyle(0x2070D0, 0.28)
    g.fillCircle(35, 35, 28)
    g.fillCircle(W - 35, 35, 28)
    g.fillStyle(0x40A0FF, 0.18)
    g.fillCircle(15, 75, 20)
    g.fillCircle(W - 15, 75, 20)
    // Gouden sterretjes
    g.fillStyle(0xF4C430, 0.35)
    g.fillCircle(60, 18, 4)
    g.fillCircle(W - 60, 18, 4)
    g.fillCircle(90, 45, 3)
    g.fillCircle(W - 90, 45, 3)
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
    // Vernietig alles — container + losse scene-objecten
    this.vraagContainer.removeAll(true)
    if (this._vraagObjecten) {
      this._vraagObjecten.forEach(o => { if (o && o.active) o.destroy() })
    }
    this._vraagObjecten = []

    const W = this.scale.width
    const vraag = this.vragen[this.huidig]

    // Emoji box — in container
    const emojiBox = this.add.graphics()
    emojiBox.fillStyle(0x0A1E48, 1)
    emojiBox.lineStyle(1.5, 0x2860C0, 1)
    emojiBox.fillRoundedRect(W / 2 - 130, 45, 260, 90, 12)
    emojiBox.strokeRoundedRect(W / 2 - 130, 45, 260, 90, 12)
    this.vraagContainer.add(emojiBox)

    // Emoji tekst — in container
    const emojiTekst = this.add.text(W / 2, 90, vraag.emoji, { fontSize: '46px' }).setOrigin(0.5)
    this.vraagContainer.add(emojiTekst)

    // Vraag tekst — in container
    const vraagTekst = this.add.text(W / 2, 150, vraag.vraag, {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '18px',
      color:      '#ffffff',
      wordWrap:   { width: W - 40 },
      align:      'center',
    }).setOrigin(0.5, 0)
    this.vraagContainer.add(vraagTekst)

    // Antwoord knoppen — allemaal in container
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
      knopBg.fillStyle(0x0A1E48, 1)
      knopBg.lineStyle(2, 0x2860C0, 0.7)
      knopBg.fillRoundedRect(x, y, knopB, knopH, 12)
      knopBg.strokeRoundedRect(x, y, knopB, knopH, 12)
      this.vraagContainer.add(knopBg)

      const tekst = this.add.text(x + knopB / 2, y + knopH / 2, optie, {
        fontFamily: "'Nunito', sans-serif",
        fontSize:   '14px',
        fontStyle:  'bold',
        color:      '#ffffff',
        wordWrap:   { width: knopB - 16 },
        align:      'center',
      }).setOrigin(0.5)
      this.vraagContainer.add(tekst)

      const zone = this.add.zone(x + knopB / 2, y + knopH / 2, knopB, knopH)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.beantwoordVraag(i, knopBg, tekst))
        .on('pointerover', () => {
          if (!this.beantwoord) {
            knopBg.clear()
            knopBg.fillStyle(0x1A3A78, 1)
            knopBg.lineStyle(2, 0x50AAFF, 1)
            knopBg.fillRoundedRect(x, y, knopB, knopH, 12)
            knopBg.strokeRoundedRect(x, y, knopB, knopH, 12)
          }
        })
        .on('pointerout', () => {
          if (!this.beantwoord) {
            knopBg.clear()
            knopBg.fillStyle(0x0A1E48, 1)
            knopBg.lineStyle(2, 0x2860C0, 0.7)
            knopBg.fillRoundedRect(x, y, knopB, knopH, 12)
            knopBg.strokeRoundedRect(x, y, knopB, knopH, 12)
          }
        })
      this.vraagContainer.add(zone)

      this.antwoordKnoppen.push({ bg: knopBg, tekst, zone, juist: i === vraag.juist, x, y, w: knopB, h: knopH })
    })

    // Slide in van rechts
    this.vraagContainer.setX(W)
    this.tweens.add({ targets: this.vraagContainer, x: 0, duration: 300, ease: 'Back.easeOut' })
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

      // Confetti + schudden
      this.cameras.main.flash(120, 126, 201, 143, false)
      this.cameras.main.shake(280, 0.006)
      this.spawConfetti(W)

      // +1 score popup
      const plusTekst = this.add.text(W / 2, 170, '+1 ⭐', {
        fontFamily: "'Fredoka One', cursive",
        fontSize:   '28px',
        color:      '#f4c430',
        stroke:     '#000',
        strokeThickness: 3,
      }).setOrigin(0.5).setDepth(150)
      this.tweens.add({
        targets:  plusTekst,
        y:        120,
        alpha:    0,
        duration: 900,
        ease:     'Quad.easeOut',
        onComplete: () => plusTekst.destroy(),
      })
    } else {
      if (this.cache.audio.exists('fout')) this.sound.play('fout', { volume: 0.6 })
      // Rood — fout + schudden
      this.cameras.main.shake(350, 0.014)
      this.cameras.main.flash(200, 226, 75, 74, false)
      const { x, y, w, h } = this.antwoordKnoppen[keuze]
      gekozenBg.clear()
      gekozenBg.fillStyle(0xe24b4a, 0.25)
      gekozenBg.lineStyle(2.5, 0xe24b4a, 1)
      gekozenBg.fillRoundedRect(x, y, w, h, 12)
      gekozenBg.strokeRoundedRect(x, y, w, h, 12)
      gekozenTekst.setColor('#e24b4a')

      // Wiebel animatie op fout knop
      this.tweens.add({
        targets:  gekozenBg,
        x:        { from: -6, to: 6 },
        duration: 60,
        yoyo:     true,
        repeat:   4,
        ease:     'Sine.easeInOut',
      })

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

    const uitlegTekst = this.add.text(W / 2, 353, vraag.uitleg, {
      fontFamily: "'Nunito', sans-serif",
      fontSize:   '12px',
      color:      isJuist ? '#7ec98f' : '#e24b4a',
      wordWrap:   { width: W - 60 },
      align:      'center',
    }).setOrigin(0.5)
    this._vraagObjecten.push(uitlegBg, uitlegTekst)

    // Volgende knop
    this.time.delayedCall(400, () => {
      const volgKnop = this.add.text(W / 2, 410, 'Volgende vraag →', {
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
          }
        })
      this._vraagObjecten.push(uitlegBg, volgKnop)
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
    this.add.rectangle(W / 2, H / 2, W, H, 0x080E20)
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

    // Sterren — één voor één animeren
    const sterOffsets = [-44, 0, 44]
    sterOffsets.forEach((offset, i) => {
      const isSter = i < sterren
      const s = this.add.text(W / 2 + offset, 160, isSter ? '⭐' : '☆', {
        fontSize: '32px',
      }).setOrigin(0.5).setScale(0).setAlpha(0)
      this.tweens.add({
        targets:  s,
        scaleX:   1, scaleY: 1, alpha: 1,
        duration: 380,
        delay:    300 + i * 180,
        ease:     'Back.easeOut',
      })
    })

    // Titel — springt in na de sterren
    const totaal = this.vragen.length
    const titelOpties = {
      goed:    { tekst: 'GOED GEDAAN! 🎉', kleur: '#f4c430' },
      medium:  { tekst: 'KAN BETER! 👍',   kleur: '#ff9f4a' },
      slecht:  { tekst: 'OEFENEN MAAR! 💪', kleur: '#e24b4a' },
    }
    const titelKeuze = this.score === totaal ? titelOpties.goed
                     : this.score >= Math.ceil(totaal / 2) ? titelOpties.medium
                     : titelOpties.slecht

    const titelTekst = this.add.text(W / 2, 205, titelKeuze.tekst, {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '28px',
      color:      titelKeuze.kleur,
      stroke:     '#8B4513',
      strokeThickness: 3,
    }).setOrigin(0.5).setScale(0)
    this.tweens.add({
      targets:  titelTekst,
      scaleX:   1, scaleY: 1,
      duration: 500,
      delay:    300 + sterOffsets.length * 180,
      ease:     'Elastic.easeOut',
    })

    // Confetti op het winscherm
    if (sterren >= 2) this.time.delayedCall(300, () => this.spawConfetti(W))

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
    const berichtOpties = [
      'Wauw, alles goed! Jij bent een echte Suriname-kenner! 🌟',
      'Bijna perfect! Nog een keer oefenen en je weet het helemaal! 📚',
      'Niet erg, iedereen leert! Probeer het nog eens! 💡',
    ]
    const bericht = this.score === totaal ? berichtOpties[0]
                  : this.score >= Math.ceil(totaal / 2) ? berichtOpties[1]
                  : berichtOpties[2]

    this.add.text(W / 2, 368, `Je hebt ${puntBonus} punten verdiend!\n${bericht}`, {
      fontFamily: "'Lora', serif",
      fontSize:   '12px',
      fontStyle:  'italic',
      color:      'rgba(255,255,255,0.65)',
      align:      'center',
      lineSpacing: 4,
    }).setOrigin(0.5)

    // Terug naar stad knop
    this.add.text(W / 2, 440, '🗺️  Terug naar de stad', {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '18px',
      color:      '#1a3a00',
      backgroundColor: '#f4c430',
      padding:    { x: 20, y: 10 },
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        const bestaandCompleted = this.spelerData.completedLocations || []
        const nieuweData = {
          ...this.spelerData,
          punten:             (this.spelerData.punten || 0) + puntBonus,
          level:              nieuwLevel,
          completedLocations: bestaandCompleted.includes(this.locatieId)
            ? bestaandCompleted
            : [...bestaandCompleted, this.locatieId],
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
