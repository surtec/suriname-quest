// src/game/scenes/WorldScene.js
// Node-select kaartscherm — tik een locatie om te spelen

import { LOCATIONS } from '../data/locations.js'

const RIV_H  = 150
const PRM_Y  = 150
const PRM_H  = 56
const CITY_Y = 207
const VX     = [144, 308, 480, 644, 816]
const HY     = [291, 375, 459]
const STR_W  = 18
const BOS_Y  = 514

export default class WorldScene extends Phaser.Scene {
  constructor() { super('WorldScene') }

  init(data) {
    this.spelerData = data.speler || {
      naam: 'Sari', punten: 0, level: 1,
      collectibles: [], completedLocations: [],
    }
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height

    this.tekeningAchtergrond(W, H)
    this.cameras.main.setBounds(0, 0, W, H)

    this.activePopup = null
    this.klikOpNode  = false

    this.maakHotspots()
    this.maakSpelerKarakter()

    // Sluit popup bij klik buiten node
    this.input.on('pointerdown', () => {
      if (this.activePopup && !this.klikOpNode) this.sluitPopup()
      this.klikOpNode = false
    })

    this.game.events.emit('hud-update', {
      punten:             this.spelerData.punten,
      level:              this.spelerData.level,
      naam:               this.spelerData.naam,
      completedLocations: this.spelerData.completedLocations || [],
    })

    if (this.cache.audio.exists('bgm')) {
      const bestaand = this.sound.get('bgm')
      if (!bestaand) {
        this.bgm = this.sound.add('bgm', { loop: true, volume: 0.3 })
        this.bgm.play()
      } else {
        this.bgm = bestaand
        if (!this.bgm.isPlaying) this.bgm.play()
      }
    }

    this._muteHandler = (e) => { this.sound.setMute(e.detail.gedempt) }
    window.addEventListener('suriquest-mute', this._muteHandler)
    this.events.on('shutdown', () => {
      window.removeEventListener('suriquest-mute', this._muteHandler)
    })
  }

  update() {}

  // ═══════════════════════════════════════════════════════════
  //  HOTSPOTS — NODE SELECT KNOPPEN
  // ═══════════════════════════════════════════════════════════

  maakHotspots() {
    this.tekeningPad()

    const completed      = this.spelerData.completedLocations || []
    const quizResultaten = this.spelerData.quizResultaten     || {}

    LOCATIONS.forEach((locatie, idx) => {
      const { x, y } = locatie.wereldPositie
      const isDone    = completed.includes(locatie.id)
      const sterren   = quizResultaten[locatie.id]?.sterren || 0
      const nodeY     = y - 72

      // Gebouw tekening
      const gebouw = this.add.graphics().setDepth(y - 5)
      this.tekenGebouw(gebouw, x, y, locatie)

      // Buitenste glow
      const glow = this.add.graphics().setDepth(y + 46)
      glow.fillStyle(isDone ? 0xf4c430 : 0x7ec98f, 0.18)
      glow.fillCircle(x, nodeY, 44)

      // Node ring (hertekend bij hover)
      const ring = this.add.graphics().setDepth(y + 50)
      const tekenRing = (hover) => {
        ring.clear()
        ring.fillStyle(isDone ? 0x3a2800 : (hover ? 0x1a3a68 : 0x0a1e3a), 1)
        ring.fillCircle(x, nodeY, 34)
        ring.lineStyle(3.5, isDone ? 0xf4c430 : (hover ? 0xffffff : 0x40AAFF), 1)
        ring.strokeCircle(x, nodeY, 34)
      }
      tekenRing(false)

      // Nummer / vinkje
      this.add.text(x, nodeY, isDone ? '✓' : String(idx + 1), {
        fontFamily: "'Fredoka One', cursive",
        fontSize:   isDone ? '26px' : '22px',
        color:      isDone ? '#f4c430' : '#40aaff',
        stroke:     '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5).setDepth(y + 52)

      // Naam label
      this.add.text(x, nodeY - 46, locatie.naam, {
        fontFamily: "'Fredoka One', cursive",
        fontSize:   '12px',
        color:      isDone ? '#f4c430' : '#ffffff',
        stroke:     '#000',
        strokeThickness: 3,
        backgroundColor: isDone ? 'rgba(58,40,0,0.82)' : 'rgba(0,0,0,0.68)',
        padding:    { x: 6, y: 3 },
      }).setOrigin(0.5, 1).setDepth(y + 60)

      // Sterren (3 kleine icoontjes)
      for (let s = 0; s < 3; s++) {
        this.add.text(x - 16 + s * 16, nodeY + 44, s < sterren ? '⭐' : '✦', {
          fontSize: '10px',
          color:    s < sterren ? '#f4c430' : 'rgba(255,255,255,0.22)',
        }).setOrigin(0.5).setDepth(y + 52)
      }

      // Pulseer ring op niet-voltooide nodes
      if (!isDone) {
        this.tweens.add({
          targets:  glow,
          scaleX:   1.6, scaleY: 1.6, alpha: 0,
          duration: 1500, repeat: -1, ease: 'Sine.easeOut',
        })
      }

      // Klik zone
      this.add.zone(x, nodeY, 74, 74)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.klikOpNode = true
          this.toonLocatiePopup(locatie, isDone, sterren)
        })
        .on('pointerover', () => tekenRing(true))
        .on('pointerout',  () => tekenRing(false))
    })
  }

  // ═══════════════════════════════════════════════════════════
  //  SPELER KARAKTER OP DE KAART
  // ═══════════════════════════════════════════════════════════

  maakSpelerKarakter() {
    const completed = this.spelerData.completedLocations || []
    // Vind eerste niet-voltooide locatie, of laatste als alles klaar
    const idx = LOCATIONS.findIndex(l => !completed.includes(l.id))
    const loc  = LOCATIONS[idx >= 0 ? idx : LOCATIONS.length - 1]
    const cx   = loc.wereldPositie.x
    const cy   = loc.wereldPositie.y - 72 + 44  // onder de node

    const g = this.add.graphics().setDepth(999)

    const tekenKarakter = (flip) => {
      g.clear()
      const sx = flip ? -1 : 1
      // Schaduw
      g.fillStyle(0x000000, 0.18)
      g.fillEllipse(cx, cy + 22, 28, 8)
      // Lichaam
      g.fillStyle(0xF4C430, 1)
      g.fillRoundedRect(cx - 8 * sx, cy + 4, 16, 18, 4)
      // Hoofd
      g.fillStyle(0xF5C17A, 1)
      g.fillCircle(cx, cy - 4, 10)
      // Haar
      g.fillStyle(0x3A2000, 1)
      g.fillEllipse(cx, cy - 11, 18, 8)
      // Ogen
      g.fillStyle(0x000000, 1)
      g.fillCircle(cx - 3, cy - 5, 1.5)
      g.fillCircle(cx + 3, cy - 5, 1.5)
      // Glimlach
      g.lineStyle(1.5, 0x8B4513, 1)
      g.beginPath(); g.arc(cx, cy - 2, 4, 0.2, Math.PI - 0.2); g.strokePath()
      // Benen (geanimeerd)
      g.fillStyle(0x2858D8, 1)
      g.fillRoundedRect(cx - 7, cy + 20, 6, 12, 2)
      g.fillRoundedRect(cx + 1, cy + 20, 6, 12, 2)
      // Schoenen
      g.fillStyle(0x1A1A1A, 1)
      g.fillRoundedRect(cx - 8, cy + 30, 8, 4, 2)
      g.fillRoundedRect(cx, cy + 30, 8, 4, 2)
    }

    tekenKarakter(false)

    // Hup animatie
    this.tweens.add({
      targets:  g,
      y:        { from: 0, to: -5 },
      yoyo:     true, repeat: -1,
      duration: 400, ease: 'Sine.easeInOut',
    })

    // Naam boven karakter
    this.add.text(cx, cy - 26, this.spelerData.naam || 'Sari', {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '11px',
      color:      '#f4c430',
      stroke:     '#000',
      strokeThickness: 3,
      backgroundColor: 'rgba(0,0,0,0.55)',
      padding:    { x: 4, y: 2 },
    }).setOrigin(0.5).setDepth(1000)
  }

  // ═══════════════════════════════════════════════════════════
  //  LOCATIE POPUP — STAGE CARD
  // ═══════════════════════════════════════════════════════════

  toonLocatiePopup(locatie, isDone, sterren) {
    if (this.activePopup) this.sluitPopup()

    const W = this.scale.width
    const H = this.scale.height

    // Donkere overlay
    const overlay = this.add.graphics().setDepth(490)
    overlay.fillStyle(0x000000, 0.68)
    overlay.fillRect(0, 0, W, H)
    overlay.setAlpha(0)
    this.tweens.add({ targets: overlay, alpha: 1, duration: 220 })

    // Popup container
    const pop = this.add.container(W / 2, H / 2).setDepth(500).setAlpha(0).setScale(0.82)

    // ── Kaart achtergrond ──
    const bg = this.add.graphics()
    bg.fillStyle(0x0A1E38, 1)
    bg.fillRoundedRect(-205, -180, 410, 362, 22)
    bg.lineStyle(3, isDone ? 0xf4c430 : 0x40AAFF, 1)
    bg.strokeRoundedRect(-205, -180, 410, 362, 22)
    bg.lineStyle(1, isDone ? 0xf4c430 : 0x40AAFF, 0.22)
    bg.strokeRoundedRect(-197, -172, 394, 346, 18)
    pop.add(bg)

    // ── Gekleurde header band ──
    const header = this.add.graphics()
    header.fillStyle(isDone ? 0x3a2800 : 0x0d2a4a, 1)
    header.fillRoundedRect(-205, -180, 410, 64, { tl: 22, tr: 22, bl: 0, br: 0 })
    pop.add(header)

    // Jaar badge
    const jaarBg = this.add.graphics()
    jaarBg.fillStyle(isDone ? 0xf4c430 : 0x40AAFF, 0.25)
    jaarBg.fillRoundedRect(-38, -170, 76, 22, 10)
    pop.add(jaarBg)
    pop.add(this.add.text(0, -159, locatie.jaar, {
      fontFamily: "'Nunito', sans-serif",
      fontSize:   '11px', fontStyle: 'bold',
      color:      isDone ? '#f4c430' : '#40aaff',
    }).setOrigin(0.5))

    // Naam
    pop.add(this.add.text(0, -130, locatie.naam, {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '28px',
      color:      '#ffffff',
      stroke:     '#000000',
      strokeThickness: 4,
      wordWrap:   { width: 380 },
      align:      'center',
    }).setOrigin(0.5))

    // Scheidingslijn
    const lijn = this.add.graphics()
    lijn.lineStyle(1, isDone ? 0xf4c430 : 0x40AAFF, 0.3)
    lijn.beginPath()
    lijn.moveTo(-180, -95)
    lijn.lineTo(180, -95)
    lijn.strokePath()
    pop.add(lijn)

    // Beschrijving
    const kortBeschr = locatie.beschrijving.substring(0, 130) +
      (locatie.beschrijving.length > 130 ? '…' : '')
    pop.add(this.add.text(0, -80, kortBeschr, {
      fontFamily: "'Nunito', sans-serif",
      fontSize:   '12px',
      color:      'rgba(255,255,255,0.78)',
      wordWrap:   { width: 380 },
      align:      'center',
      lineSpacing: 4,
    }).setOrigin(0.5, 0))

    // Status / sterren rij
    if (isDone && sterren > 0) {
      const sterRij = '⭐'.repeat(sterren) + '☆'.repeat(3 - sterren)
      const statusBg = this.add.graphics()
      statusBg.fillStyle(0xf4c430, 0.12)
      statusBg.fillRoundedRect(-90, 40, 180, 32, 10)
      pop.add(statusBg)
      pop.add(this.add.text(0, 56, `${sterRij}  Voltooid!`, {
        fontFamily: "'Fredoka One', cursive",
        fontSize:   '15px',
        color:      '#f4c430',
      }).setOrigin(0.5))
    } else if (!isDone) {
      pop.add(this.add.text(0, 56, '☆ ☆ ☆  Nog niet gespeeld', {
        fontFamily: "'Nunito', sans-serif",
        fontSize:   '12px',
        color:      'rgba(255,255,255,0.38)',
      }).setOrigin(0.5))
    }

    // ── Spelen knop ──
    const speelBg = this.add.graphics()
    speelBg.fillStyle(0xf4c430, 1)
    speelBg.fillRoundedRect(-130, 84, 260, 56, 16)
    pop.add(speelBg)

    pop.add(this.add.text(0, 112, isDone ? '↩  Opnieuw spelen' : '▶  Spelen!', {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '22px',
      color:      '#1a3a00',
    }).setOrigin(0.5))

    const speelZone = this.add.zone(0, 112, 260, 56)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        speelBg.clear()
        speelBg.fillStyle(0xe8b820, 1)
        speelBg.fillRoundedRect(-130, 84, 260, 56, 16)
      })
      .on('pointerout', () => {
        speelBg.clear()
        speelBg.fillStyle(0xf4c430, 1)
        speelBg.fillRoundedRect(-130, 84, 260, 56, 16)
      })
      .on('pointerdown', () => this.gaanNaarLocatie(locatie.id))
    pop.add(speelZone)

    // ── Sluiten knop ──
    const sluitBg = this.add.graphics()
    sluitBg.fillStyle(0xffffff, 0.08)
    sluitBg.fillRoundedRect(-130, 148, 260, 36, 12)
    pop.add(sluitBg)
    pop.add(this.add.text(0, 166, '✕  Sluiten', {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '14px',
      color:      'rgba(255,255,255,0.45)',
    }).setOrigin(0.5))
    this.add.zone(0, 166, 260, 36)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.sluitPopup())
    pop.add(this.add.zone(0, 166, 260, 36)
      .setInteractive()
      .on('pointerdown', () => this.sluitPopup()))

    // Animeer in
    this.tweens.add({
      targets:  pop,
      alpha:    1, scaleX: 1, scaleY: 1,
      duration: 260, ease: 'Back.easeOut',
    })

    this.activePopup = { container: pop, overlay }
  }

  sluitPopup() {
    if (!this.activePopup) return
    const { container, overlay } = this.activePopup
    this.tweens.add({
      targets:  [container, overlay],
      alpha:    0,
      duration: 180,
      onComplete: () => { container.destroy(); overlay.destroy() },
    })
    this.activePopup = null
  }

  // ═══════════════════════════════════════════════════════════
  //  PAD TUSSEN LOCATIES
  // ═══════════════════════════════════════════════════════════

  tekeningPad() {
    const padPunten = [
      { x: 266, y: 296 },   // waterkant
      { x: 160, y: 425 },   // cultuurhuis
      { x: 394, y: 340 },   // anton_de_kom
      { x: 534, y: 413 },   // onafhankelijkheidsplein
      { x: 700, y: 425 },   // hendrikschool
      { x: 805, y: 267 },   // fort_zeelandia
    ]

    const gPad = this.add.graphics().setDepth(90)

    // Schaduwpad
    gPad.lineStyle(10, 0x000000, 0.16)
    gPad.beginPath()
    gPad.moveTo(padPunten[0].x, padPunten[0].y - 72)
    for (let i = 1; i < padPunten.length; i++) {
      gPad.lineTo(padPunten[i].x, padPunten[i].y - 72)
    }
    gPad.strokePath()

    // Witpad
    gPad.lineStyle(6, 0xffffff, 0.45)
    gPad.beginPath()
    gPad.moveTo(padPunten[0].x, padPunten[0].y - 72)
    for (let i = 1; i < padPunten.length; i++) {
      gPad.lineTo(padPunten[i].x, padPunten[i].y - 72)
    }
    gPad.strokePath()

    // Goud stippelpad
    gPad.lineStyle(3, 0xf4c430, 0.72)
    for (let i = 0; i < padPunten.length - 1; i++) {
      const ax = padPunten[i].x,     ay = padPunten[i].y - 72
      const bx = padPunten[i + 1].x, by = padPunten[i + 1].y - 72
      const dist   = Math.hypot(bx - ax, by - ay)
      const stappen = Math.floor(dist / 14)
      for (let s = 0; s < stappen; s += 2) {
        const t0 = s / stappen, t1 = (s + 1) / stappen
        gPad.beginPath()
        gPad.moveTo(ax + (bx - ax) * t0, ay + (by - ay) * t0)
        gPad.lineTo(ax + (bx - ax) * t1, ay + (by - ay) * t1)
        gPad.strokePath()
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  NAVIGATIE
  // ═══════════════════════════════════════════════════════════

  gaanNaarLocatie(locatieId) {
    this.cameras.main.fadeOut(300, 0, 0, 0)
    this.time.delayedCall(300, () => {
      this.scene.start('LocationScene', {
        locatieId,
        speler: this.spelerData,
      })
    })
  }

  // ═══════════════════════════════════════════════════════════
  //  PARAMARIBO KAART ACHTERGROND
  // ═══════════════════════════════════════════════════════════

  tekeningAchtergrond(W, H) {

    // ── LUCHT (SKY) ──────────────────────────────────────────
    const gSky = this.add.graphics()
    gSky.fillGradientStyle(0x1890E8, 0x1890E8, 0x68C0FF, 0x48AEFF, 1)
    gSky.fillRect(0, 0, W, 108)

    // Zon
    gSky.fillStyle(0xFFE030, 0.30)
    gSky.fillCircle(W * 0.80, 46, 42)
    gSky.fillStyle(0xFFE030, 0.55)
    gSky.fillCircle(W * 0.80, 46, 30)
    gSky.fillStyle(0xFFF080, 1)
    gSky.fillCircle(W * 0.80, 46, 20)
    // Zonnestralen
    gSky.lineStyle(2.5, 0xFFE030, 0.45)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      gSky.beginPath()
      gSky.moveTo(W * 0.80 + Math.cos(a) * 33, 46 + Math.sin(a) * 33)
      gSky.lineTo(W * 0.80 + Math.cos(a) * 50, 46 + Math.sin(a) * 50)
      gSky.strokePath()
    }

    // Wolk 1 (geanimeerd)
    const wolk1 = this.add.graphics()
    wolk1.fillStyle(0xFFFFFF, 0.90)
    wolk1.fillEllipse(0, 0, 78, 28); wolk1.fillEllipse(-22, -10, 58, 24); wolk1.fillEllipse(22, -8, 54, 20)
    wolk1.setPosition(160, 36)
    this.tweens.add({ targets: wolk1, x: { from: 140, to: 190 }, yoyo: true, repeat: -1, duration: 9000, ease: 'Sine.easeInOut' })

    // Wolk 2
    const wolk2 = this.add.graphics()
    wolk2.fillStyle(0xFFFFFF, 0.80)
    wolk2.fillEllipse(0, 0, 65, 22); wolk2.fillEllipse(-18, -8, 48, 19); wolk2.fillEllipse(18, -7, 44, 17)
    wolk2.setPosition(480, 26)
    this.tweens.add({ targets: wolk2, x: { from: 460, to: 510 }, yoyo: true, repeat: -1, duration: 12000, ease: 'Sine.easeInOut' })

    // Wolk 3
    const wolk3 = this.add.graphics()
    wolk3.fillStyle(0xFFFFFF, 0.70)
    wolk3.fillEllipse(0, 0, 55, 20); wolk3.fillEllipse(-15, -7, 42, 17)
    wolk3.setPosition(670, 55)
    this.tweens.add({ targets: wolk3, x: { from: 650, to: 700 }, yoyo: true, repeat: -1, duration: 10000, ease: 'Sine.easeInOut' })

    // ── SURINAME RIVIER (WATER STRIP) ─────────────────────────
    const gRiv = this.add.graphics()
    gRiv.fillGradientStyle(0x1A72C8, 0x1A72C8, 0x3A9AE8, 0x2880D8, 1)
    gRiv.fillRect(0, 108, W, 46)
    gRiv.fillStyle(0x80CCFF, 0.25)
    gRiv.fillRect(0, 116, W, 20)
    // Zon spiegeling in water
    gRiv.fillStyle(0xFFE030, 0.18)
    gRiv.fillRect(W * 0.72, 108, 70, 46)

    // Golvende lijntjes
    for (let i = 0; i < 8; i++) {
      const wg = this.add.graphics()
      wg.lineStyle(1.5, 0xffffff, 0.22)
      wg.beginPath()
      const wx = W * (0.03 + i * 0.12)
      wg.moveTo(wx, 120 + (i % 3) * 10)
      wg.lineTo(wx + 70, 120 + (i % 3) * 10)
      wg.strokePath()
      this.tweens.add({ targets: wg, x: { from: -10, to: 10 }, alpha: { from: 0.5, to: 0.05 }, yoyo: true, repeat: -1, duration: 1800 + i * 350 })
    }

    // Schip
    const gSchip = this.add.graphics()
    gSchip.fillStyle(0x7A5020, 1)
    gSchip.fillRoundedRect(0, 0, 68, 18, 4)
    gSchip.fillStyle(0x5A3800, 0.8)
    gSchip.fillRect(10, -28, 4, 28)
    gSchip.fillStyle(0xFFFFF0, 0.88)
    gSchip.fillTriangle(14, -28, 14, -10, 44, -19)
    gSchip.fillStyle(0xDD2828, 1)
    gSchip.fillRect(10, -36, 14, 8)
    gSchip.setPosition(W * 0.27, 120)
    this.tweens.add({ targets: gSchip, x: { from: W * 0.18, to: W * 0.42 }, yoyo: true, repeat: -1, duration: 14000, ease: 'Sine.easeInOut' })

    // ── WATERKANT PROMENADE ───────────────────────────────────
    const gPrm = this.add.graphics()
    gPrm.fillGradientStyle(0xF0CC50, 0xE8C040, 0xF8DC68, 0xF0CC50, 1)
    gPrm.fillRect(0, PRM_Y, W, PRM_H)
    gPrm.lineStyle(0.7, 0xC89A28, 0.35)
    for (let tx = 0; tx < W; tx += 28) {
      gPrm.beginPath(); gPrm.moveTo(tx, PRM_Y); gPrm.lineTo(tx, PRM_Y + PRM_H); gPrm.strokePath()
    }
    for (let ty = PRM_Y; ty <= PRM_Y + PRM_H; ty += 28) {
      gPrm.beginPath(); gPrm.moveTo(0, ty); gPrm.lineTo(W, ty); gPrm.strokePath()
    }
    gPrm.lineStyle(0, 0, 0)
    gPrm.fillStyle(0x000000, 0.10)
    gPrm.fillRect(0, PRM_Y, W, 5)

    // ── STADSGEBIED BASIS ─────────────────────────────────────
    const gStad = this.add.graphics()
    gStad.fillStyle(0xF2E070, 1)
    gStad.fillRect(0, CITY_Y, W, H - CITY_Y)

    const kolX = [0, ...VX.map(x => x + STR_W / 2), W]
    const rijY  = [CITY_Y, ...HY.map(y => y + STR_W / 2), BOS_Y]
    const blokKleuren = [
      0xFBE98C, 0xF5DD80, 0xFCEF94, 0xF2E07A, 0xF8E888, 0xF0DA82,
      0xFAEC90, 0xEEDA7A, 0xF6E888, 0xFBED8C, 0xF2E082, 0xF8E88E,
      0xFCEB8A, 0xF4E07C, 0xFAEC8C, 0xEEDA78, 0xF6EA86, 0xF2E07E,
      0xFAED90, 0xF6E480, 0xF4EC8A, 0xFCE880, 0xF8EC88, 0xF0E07C,
    ]
    let blokIdx = 0
    for (let ri = 0; ri < rijY.length - 1; ri++) {
      for (let ki = 0; ki < kolX.length - 1; ki++) {
        const bx1 = kolX[ki]
        const by1 = rijY[ri]
        const bx2 = ki < kolX.length - 2 ? VX[ki] - STR_W / 2 : W
        const by2 = ri < rijY.length - 2 ? HY[ri] - STR_W / 2 : BOS_Y
        if (bx2 > bx1 && by2 > by1) {
          gStad.fillStyle(blokKleuren[blokIdx % blokKleuren.length], 1)
          gStad.fillRect(bx1, by1, bx2 - bx1, by2 - by1)
        }
        blokIdx++
      }
    }

    const gStraat = this.add.graphics()
    gStraat.fillStyle(0xD4A840, 0.9)
    HY.forEach(hy => gStraat.fillRect(0, hy - STR_W / 2, W, STR_W))
    gStraat.fillRect(0, CITY_Y, W, STR_W / 2)
    VX.forEach(vx => gStraat.fillRect(vx - STR_W / 2, CITY_Y, STR_W, H - CITY_Y))

    gStraat.lineStyle(0.5, 0xB89030, 0.35)
    HY.forEach(hy => {
      gStraat.beginPath(); gStraat.moveTo(0, hy); gStraat.lineTo(W, hy); gStraat.strokePath()
    })
    VX.forEach(vx => {
      gStraat.beginPath(); gStraat.moveTo(vx, CITY_Y); gStraat.lineTo(vx, BOS_Y); gStraat.strokePath()
    })
    gStraat.lineStyle(0, 0, 0)

    // ── ONAFHANKELIJKHEIDSPLEIN GROEN PARK ────────────────────
    const gPlein = this.add.graphics()
    gPlein.fillStyle(0x2EB828, 1)
    gPlein.fillRect(492, 383, 141, 67)
    gPlein.fillStyle(0x40D038, 0.50)
    gPlein.fillRect(498, 389, 129, 55)
    gPlein.lineStyle(1.5, 0x209018, 0.65)
    gPlein.strokeRect(492, 383, 141, 67)
    gPlein.lineStyle(0, 0, 0)
    gPlein.lineStyle(1, 0xC8B850, 0.45)
    gPlein.beginPath(); gPlein.moveTo(492, 383); gPlein.lineTo(633, 450); gPlein.strokePath()
    gPlein.beginPath(); gPlein.moveTo(633, 383); gPlein.lineTo(492, 450); gPlein.strokePath()
    gPlein.lineStyle(0, 0, 0)
    gPlein.fillStyle(0xF4D040, 0.65)
    gPlein.fillCircle(506, 397, 4); gPlein.fillCircle(621, 397, 4)
    gPlein.fillCircle(506, 436, 4); gPlein.fillCircle(621, 436, 4)

    // ── PRESIDENTIEEL PALMTUIN ────────────────────────────────
    const gPalmtuin = this.add.graphics()
    gPalmtuin.fillStyle(0x38C030, 0.50)
    gPalmtuin.fillRect(319, 383, 150, 67)
    gPalmtuin.fillStyle(0x28A820, 0.30)
    gPalmtuin.fillRect(326, 389, 136, 55)

    this.tekeningStadsgebouwen(W, H)

    // ── REGENWOUD RAND ────────────────────────────────────────
    const gBos = this.add.graphics()
    gBos.fillGradientStyle(0x2E9028, 0x288020, 0x227018, 0x1E6818, 1)
    gBos.fillRect(0, BOS_Y, W, H - BOS_Y)
    gBos.fillStyle(0x1E7818, 0.85)
    for (let bx = 5; bx < W; bx += 44) {
      const bh = 18 + Math.sin(bx * 0.17) * 11
      gBos.fillEllipse(bx + 20, BOS_Y, 38, bh + 12)
    }
    gBos.fillStyle(0x38882E, 0.55)
    for (let bx = 20; bx < W; bx += 62) {
      gBos.fillEllipse(bx + 14, BOS_Y - 5, 28, 18)
    }
    gBos.fillStyle(0x5CA848, 0.35)
    for (let bx = 10; bx < W; bx += 38) {
      gBos.fillEllipse(bx + 16, BOS_Y - 8, 20, 12)
    }

    this.tekeningPalmen(W)
    this.tekeningStadsbomen()
  }

  tekeningPalmen(W) {
    const palmPosities = [78, 210, 380, 550, 710, 870]
    palmPosities.forEach(px => {
      const g = this.add.graphics().setDepth(PRM_Y + PRM_H + 5)
      const py = PRM_Y + PRM_H - 12
      g.fillStyle(0x000000, 0.14)
      g.fillEllipse(px, py + 6, 32, 11)
      g.lineStyle(5, 0x9B7040, 1)
      g.beginPath()
      g.moveTo(px, py)
      for (let qi = 1; qi <= 8; qi++) {
        const qt = qi / 8
        g.lineTo(
          (1-qt)*(1-qt)*px + 2*(1-qt)*qt*(px+8) + qt*qt*(px+5),
          (1-qt)*(1-qt)*py + 2*(1-qt)*qt*(py-26) + qt*qt*(py-52)
        )
      }
      g.strokePath()
      g.lineStyle(0, 0, 0)
      const bladKleuren = [0x2E8B2E, 0x3A9E3A, 0x227022]
      for (let i = 0; i < 8; i++) {
        const hoek = (i / 8) * Math.PI * 2
        g.fillStyle(bladKleuren[i % 3], 1)
        g.fillEllipse(px + 5 + Math.cos(hoek) * 15, py - 52 + Math.sin(hoek) * 8, 30, 9)
      }
      g.fillStyle(0x9B7040, 0.85)
      g.fillCircle(px + 5, py - 49, 5)
      g.fillCircle(px + 9, py - 46, 4)
    })
  }

  tekeningStadsbomen() {
    const boomPlaatsen = [
      { x: 68,  y: CITY_Y + 14 }, { x: 220, y: CITY_Y + 14 },
      { x: 575, y: CITY_Y + 14 }, { x: 718, y: CITY_Y + 14 },
      { x: 878, y: CITY_Y + 14 }, { x: 68,  y: HY[0] + 14 },
      { x: 392, y: HY[0] + 14 }, { x: 704, y: HY[0] + 14 },
      { x: 888, y: HY[0] + 14 }, { x: 222, y: HY[1] + 14 },
      { x: 704, y: HY[1] + 14 }, { x: 68,  y: HY[2] + 14 },
      { x: 392, y: HY[2] + 14 }, { x: 888, y: HY[2] + 14 },
    ]
    boomPlaatsen.forEach(({ x, y }) => {
      const g = this.add.graphics().setDepth(y + 5)
      g.fillStyle(0x000000, 0.11)
      g.fillEllipse(x, y + 4, 32, 12)
      g.fillStyle(0x7B5020, 1)
      g.fillRect(x - 5, y, 9, 18)
      g.fillStyle(0x3A8020, 1)
      g.fillCircle(x, y - 12, 18)
      g.fillStyle(0x4A9030, 0.72)
      g.fillCircle(x - 8, y - 18, 13)
      g.fillCircle(x + 7, y - 18, 12)
      g.fillStyle(0x5AAA40, 0.35)
      g.fillCircle(x + 2, y - 24, 9)
    })
  }

  tekeningStadsgebouwen(W, H) {
    const gebouwtjes = [
      { x: 54,  y: 262, w: 72, h: 38, k: 0xE83828, dk: 0xA82010 },
      { x: 104, y: 262, w: 40, h: 33, k: 0x2858D8, dk: 0x1840B0 },
      { x: 198, y: 253, w: 66, h: 40, k: 0xF0C020, dk: 0xC09010 },
      { x: 262, y: 255, w: 40, h: 36, k: 0x28A840, dk: 0x187828 },
      { x: 358, y: 258, w: 74, h: 38, k: 0xE86820, dk: 0xA84810 },
      { x: 432, y: 249, w: 40, h: 36, k: 0x9830C8, dk: 0x701898 },
      { x: 668, y: 255, w: 69, h: 36, k: 0xD04080, dk: 0xA02058 },
      { x: 736, y: 259, w: 42, h: 33, k: 0x18A898, dk: 0x087868 },
      { x: 57,  y: 338, w: 78, h: 38, k: 0x2858D8, dk: 0x1840B0 },
      { x: 86,  y: 343, w: 42, h: 33, k: 0xE83828, dk: 0xA82010 },
      { x: 203, y: 333, w: 66, h: 38, k: 0x28A840, dk: 0x187828 },
      { x: 836, y: 338, w: 77, h: 36, k: 0xF0C020, dk: 0xC09010 },
      { x: 878, y: 330, w: 60, h: 42, k: 0x9830C8, dk: 0x701898 },
      { x: 54,  y: 426, w: 74, h: 38, k: 0xE86820, dk: 0xA84810 },
      { x: 105, y: 421, w: 31, h: 30, k: 0x18A898, dk: 0x087868 },
      { x: 836, y: 422, w: 80, h: 38, k: 0xD04080, dk: 0xA02058 },
    ]
    gebouwtjes.forEach(({ x, y, w, h, k, dk }) => {
      const g = this.add.graphics().setDepth(y + 5)
      // Schaduw
      g.fillStyle(0x000000, 0.18)
      g.fillRect(x + 4, y + 4, w, h)
      // Muur
      g.fillStyle(k, 1)
      g.fillRect(x, y, w, h)
      // Lichtere zijpanelen
      g.fillStyle(0xFFFFFF, 0.08)
      g.fillRect(x, y, 4, h)
      // Dak
      g.fillStyle(dk, 1)
      g.fillTriangle(x - 5, y, x + w + 5, y, x + w / 2, y - h * 0.62)
      // Dakrand
      g.fillStyle(0x000000, 0.15)
      g.fillRect(x - 3, y - 2, w + 6, 4)
      // Ramen
      const aantalRamen = w > 55 ? 2 : 1
      const raamB = w * 0.20, raamH = h * 0.36
      for (let r = 0; r < aantalRamen; r++) {
        const rx = x + w * (aantalRamen === 1 ? 0.38 : (r === 0 ? 0.15 : 0.58))
        const ry = y + h * 0.15
        // Raam achtergrond (nacht = donkerblauw, dag = lichtblauw)
        g.fillStyle(0xA8D8F0, 0.85)
        g.fillRoundedRect(rx, ry, raamB, raamH, 2)
        // Raamkozijn
        g.lineStyle(1.5, dk, 0.9)
        g.strokeRoundedRect(rx, ry, raamB, raamH, 2)
        // Kruisje in raam
        g.lineStyle(0.8, dk, 0.5)
        g.beginPath(); g.moveTo(rx + raamB / 2, ry); g.lineTo(rx + raamB / 2, ry + raamH); g.strokePath()
        g.beginPath(); g.moveTo(rx, ry + raamH / 2); g.lineTo(rx + raamB, ry + raamH / 2); g.strokePath()
      }
      // Deur
      const deurB = w * 0.22, deurH = h * 0.38
      const deurX = x + (w - deurB) / 2
      g.fillStyle(0x3A1A00, 1)
      g.fillRoundedRect(deurX, y + h - deurH, deurB, deurH, { tl: 3, tr: 3, bl: 0, br: 0 })
      g.fillStyle(0xF4C430, 1)
      g.fillCircle(deurX + deurB * 0.75, y + h - deurH * 0.5, 1.5)
      g.lineStyle(0, 0, 0)
    })
  }

  // ═══════════════════════════════════════════════════════════
  //  GEBOUWEN TEKENEN
  // ═══════════════════════════════════════════════════════════

  tekenGebouw(g, x, y, locatie) {
    switch (locatie.id) {
      case 'fort_zeelandia':          this.tekenFortZeelandia(g, x, y);          break
      case 'waterkant':               this.tekenWaterkant(g, x, y);               break
      case 'onafhankelijkheidsplein': this.tekenOnafhankelijkheidsplein(g, x, y); break
      case 'anton_de_kom':            this.tekenAntonDeKom(g, x, y);              break
      case 'cultuurhuis':             this.tekenCultuurhuis(g, x, y);             break
      case 'hendrikschool':           this.tekenHendrikschool(g, x, y);           break
      default: this._tekenStandaard(g, x, y, locatie.kleur)
    }
  }

  _ster(g, cx, cy, bR, iR) {
    g.beginPath()
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? bR : iR
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2
      if (i === 0) g.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
      else         g.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
    }
    g.closePath()
    g.fillPath()
  }

  _vlag(g, x, y, w, h) {
    const stripes = [
      { k: 0x378B49, f: 0.20 }, { k: 0xFFFFFF, f: 0.10 },
      { k: 0xB40A2D, f: 0.40 }, { k: 0xFFFFFF, f: 0.10 },
      { k: 0x378B49, f: 0.20 },
    ]
    let dy = 0
    stripes.forEach(({ k, f }) => {
      g.fillStyle(k, 1)
      g.fillRect(x, y + dy, w, Math.ceil(h * f))
      dy += h * f
    })
    g.fillStyle(0xFFC300, 1)
    this._ster(g, x + w / 2, y + h * 0.5, 3, 1.4)
  }

  tekenFortZeelandia(g, x, y) {
    const cy = y - 49
    g.fillStyle(0x000000, 0.22)
    g.fillEllipse(x, y + 3, 104, 23)
    g.fillStyle(0xF2E4B4, 1)
    this._ster(g, x, cy, 59, 29)
    g.fillStyle(0x8B2020, 1)
    this._ster(g, x, cy, 54, 26)
    g.lineStyle(0.7, 0x000000, 0.12)
    for (let row = cy - 47; row < cy + 21; row += 7) {
      g.beginPath(); g.moveTo(x - 54, row); g.lineTo(x + 54, row); g.strokePath()
    }
    for (let col = x - 50; col < x + 50; col += 11) {
      g.beginPath(); g.moveTo(col, cy - 47); g.lineTo(col, cy + 21); g.strokePath()
    }
    g.lineStyle(0, 0, 0)
    g.fillStyle(0xD4A830, 1)
    g.fillCircle(x, cy, 25)
    g.fillStyle(0xE0C050, 0.45)
    g.fillCircle(x - 5, cy - 5, 15)
    g.fillStyle(0xF8F5EC, 1)
    g.fillRect(x - 12, cy - 12, 25, 16)
    g.fillStyle(0xCC5515, 1)
    g.fillTriangle(x - 16, cy - 12, x + 16, cy - 12, x, cy - 27)
    g.fillStyle(0xAA4010, 0.6)
    g.fillRect(x - 16, cy - 14, 33, 3)
    g.fillStyle(0x88CCEE, 0.88)
    g.fillRect(x - 10, cy - 10, 7, 7)
    g.fillRect(x + 4,  cy - 10, 7, 7)
    g.fillStyle(0x5A2A0A, 1)
    g.fillRoundedRect(x - 3, cy, 7, 9, 1)
    g.fillStyle(0x8B6040, 1)
    g.fillRect(x + 16, cy - 30, 3, 33)
    this._vlag(g, x + 19, cy - 30, 23, 15)
  }

  tekenWaterkant(g, x, y) {
    g.fillStyle(0x000000, 0.22)
    g.fillEllipse(x, y + 3, 98, 24)
    g.fillStyle(0xE8C240, 1)
    g.fillRect(x - 41, y - 61, 82, 61)
    g.fillStyle(0xF0D060, 0.34)
    for (let i = 0; i < 82; i += 10) g.fillRect(x - 41 + i, y - 61, 4, 61)
    g.lineStyle(0.5, 0xB89020, 0.28)
    for (let row = y - 61; row < y; row += 8) {
      g.beginPath(); g.moveTo(x - 41, row); g.lineTo(x + 41, row); g.strokePath()
    }
    g.lineStyle(0, 0, 0)
    g.fillStyle(0xD4A820, 1)
    g.fillRect(x - 44, y - 21, 88, 21)
    g.fillStyle(0x367A36, 1)
    g.fillRect(x - 47, y - 32, 94, 11)
    g.fillStyle(0xB89020, 1)
    ;[-30, -10, 12, 30].forEach(px => g.fillRect(x + px, y - 32, 5, 32))
    ;[-27, 12].forEach(wx => {
      g.fillStyle(0x88CCEE, 0.78)
      g.fillRect(x + wx, y - 56, 18, 17)
      g.fillStyle(0x2D7D2D, 1)
      g.fillRect(x + wx - 5, y - 56, 5, 17)
      g.fillRect(x + wx + 18, y - 56, 5, 17)
      g.lineStyle(0.8, 0xC8A020, 0.58)
      g.strokeRect(x + wx, y - 56, 18, 17)
      g.lineStyle(0, 0, 0)
    })
    g.fillStyle(0x8B4513, 1)
    g.fillRoundedRect(x - 7, y - 27, 14, 27, { tl: 4, tr: 4, bl: 0, br: 0 })
    g.fillStyle(0xF4C430, 1)
    g.fillCircle(x + 4, y - 14, 1.5)
    g.fillStyle(0x367A36, 1)
    g.fillTriangle(x - 47, y - 61, x + 47, y - 61, x, y - 93)
    g.fillStyle(0x48A048, 0.38)
    g.fillTriangle(x - 24, y - 61, x, y - 91, x + 8, y - 61)
    g.fillStyle(0x285A28, 0.82)
    g.fillRect(x - 47, y - 62, 94, 4)
  }

  tekenOnafhankelijkheidsplein(g, x, y) {
    g.fillStyle(0x000000, 0.22)
    g.fillEllipse(x, y + 3, 108, 24)
    g.fillStyle(0xA8A8A8, 1)
    g.fillRect(x - 52, y - 29, 104, 29)
    g.fillStyle(0xBCBCBC, 0.50)
    g.fillRect(x - 52, y - 29, 104, 5)
    g.lineStyle(0.6, 0x888888, 0.48)
    for (let tx = x - 52; tx <= x + 52; tx += 14) {
      g.beginPath(); g.moveTo(tx, y - 29); g.lineTo(tx, y); g.strokePath()
    }
    for (let ty = y - 29; ty <= y; ty += 15) {
      g.beginPath(); g.moveTo(x - 52, ty); g.lineTo(x + 52, ty); g.strokePath()
    }
    g.lineStyle(0, 0, 0)
    g.fillStyle(0xE8E8E8, 1)
    g.fillRect(x - 15, y - 37, 30, 11)
    g.fillStyle(0xD0D0D0, 1)
    g.fillRect(x - 15, y - 29, 30, 3)
    g.fillStyle(0xF5F5F5, 1)
    g.fillRect(x - 7, y - 85, 14, 48)
    g.fillStyle(0xFFFFFF, 0.55)
    g.fillRect(x - 4, y - 85, 4, 48)
    g.fillStyle(0xD8D8D8, 0.40)
    g.fillRect(x + 3, y - 85, 4, 48)
    g.fillStyle(0xE8E8E8, 1)
    g.fillRect(x - 11, y - 88, 22, 5)
    g.fillStyle(0xF4C430, 1)
    this._ster(g, x, y - 97, 11, 5)
    g.fillStyle(0xE8B020, 0.52)
    this._ster(g, x + 1, y - 99, 7, 3)
    g.fillStyle(0x7A6040, 1)
    g.fillRect(x - 40, y - 29, 3, 45)
    this._vlag(g, x - 37, y - 74, 19, 12)
    g.fillRect(x + 37, y - 29, 3, 45)
    this._vlag(g, x + 40, y - 74, 19, 12)
    g.fillStyle(0x3A8A3A, 1)
    g.fillEllipse(x - 60, y - 13, 30, 20)
    g.fillEllipse(x + 60, y - 13, 30, 20)
    g.fillStyle(0x2D7D2D, 0.78)
    g.fillEllipse(x - 48, y - 21, 23, 16)
    g.fillEllipse(x + 48, y - 21, 23, 16)
  }

  tekenAntonDeKom(g, x, y) {
    g.fillStyle(0x000000, 0.22)
    g.fillEllipse(x, y + 3, 90, 22)
    g.fillStyle(0xC84040, 1)
    g.fillRect(x - 36, y - 58, 72, 58)
    g.fillStyle(0xD85050, 0.38)
    for (let i = 0; i < 72; i += 9) g.fillRect(x - 36 + i, y - 58, 4, 58)
    g.lineStyle(0.5, 0x901818, 0.25)
    for (let row = y - 58; row < y; row += 7) {
      g.beginPath(); g.moveTo(x - 36, row); g.lineTo(x + 36, row); g.strokePath()
    }
    g.lineStyle(0, 0, 0)
    g.fillStyle(0xA03020, 1)
    g.fillRect(x - 40, y - 20, 80, 20)
    g.fillStyle(0x702010, 1)
    g.fillRect(x - 42, y - 30, 84, 10)
    g.fillStyle(0x902818, 1)
    ;[-24, 0, 22].forEach(px => g.fillRect(x + px, y - 30, 4, 30))
    ;[-22, 14].forEach(wx => {
      g.fillStyle(0xA8D8EE, 0.75)
      g.fillRect(x + wx, y - 52, 16, 15)
      g.lineStyle(0.8, 0x901818, 0.55)
      g.strokeRect(x + wx, y - 52, 16, 15)
      g.lineStyle(0, 0, 0)
    })
    g.fillStyle(0x5A1A0A, 1)
    g.fillRoundedRect(x - 6, y - 28, 12, 28, { tl: 4, tr: 4, bl: 0, br: 0 })
    g.fillStyle(0x701010, 1)
    g.fillTriangle(x - 42, y - 58, x + 42, y - 58, x, y - 88)
    g.fillStyle(0x501010, 0.6)
    g.fillRect(x - 42, y - 60, 84, 4)
    g.fillStyle(0xF4C430, 0.9)
    g.fillRect(x - 22, y - 47, 44, 8)
  }

  tekenCultuurhuis(g, x, y) {
    g.fillStyle(0x000000, 0.22)
    g.fillEllipse(x, y + 3, 100, 22)
    g.fillStyle(0x4A2870, 1)
    g.fillRect(x - 44, y - 60, 88, 60)
    g.fillStyle(0x6A3890, 0.35)
    for (let i = 0; i < 88; i += 11) g.fillRect(x - 44 + i, y - 60, 5, 60)
    g.lineStyle(0.5, 0x8A58B0, 0.20)
    for (let row = y - 60; row < y; row += 8) {
      g.beginPath(); g.moveTo(x - 44, row); g.lineTo(x + 44, row); g.strokePath()
    }
    g.lineStyle(0, 0, 0)
    g.fillStyle(0x2A5A40, 1)
    g.fillRect(x - 44, y - 28, 88, 28)
    g.fillStyle(0x3A7A58, 0.4)
    g.fillEllipse(x, y - 38, 60, 24)
    g.fillStyle(0x3A1A60, 1)
    g.fillRect(x - 10, y - 32, 20, 32)
    g.fillStyle(0x4A2870, 1)
    g.fillEllipse(x, y - 32, 20, 10)
    ;[-28, 20].forEach(wx => {
      g.fillStyle(0xF4C430, 0.55)
      g.fillRect(x + wx, y - 52, 14, 18)
      g.fillStyle(0xF4C430, 0.80)
      g.fillEllipse(x + wx + 7, y - 52, 14, 7)
      g.lineStyle(0.8, 0x8A58B0, 0.50)
      g.strokeRect(x + wx, y - 52, 14, 18)
      g.lineStyle(0, 0, 0)
    })
    g.fillStyle(0x2A1A50, 1)
    g.fillRect(x - 44, y - 65, 88, 7)
    g.fillRect(x - 36, y - 72, 72, 7)
    g.fillRect(x - 24, y - 79, 48, 7)
    g.fillStyle(0x6A3890, 1)
    g.fillRect(x - 8, y - 94, 16, 15)
    g.fillStyle(0xF4C430, 1)
    g.fillTriangle(x - 10, y - 94, x + 10, y - 94, x, y - 108)
  }

  tekenHendrikschool(g, x, y) {
    g.fillStyle(0x000000, 0.22)
    g.fillEllipse(x, y + 3, 100, 22)
    g.fillStyle(0x4A88C4, 1)
    g.fillRect(x - 44, y - 58, 88, 58)
    g.fillStyle(0xFFFFFF, 0.18)
    g.fillRect(x - 44, y - 38, 88, 5)
    g.fillRect(x - 44, y - 20, 88, 3)
    ;[-30, -10, 10, 28].forEach(wx => {
      g.fillStyle(0xB8E0F8, 0.80)
      g.fillRect(x + wx, y - 52, 12, 12)
      g.lineStyle(0.8, 0xFFFFFF, 0.55)
      g.strokeRect(x + wx, y - 52, 12, 12)
      g.beginPath(); g.moveTo(x + wx + 6, y - 52); g.lineTo(x + wx + 6, y - 40); g.strokePath()
      g.beginPath(); g.moveTo(x + wx, y - 46); g.lineTo(x + wx + 12, y - 46); g.strokePath()
      g.lineStyle(0, 0, 0)
    })
    ;[-20, 10].forEach(wx => {
      g.fillStyle(0xB8E0F8, 0.75)
      g.fillRect(x + wx, y - 32, 16, 14)
      g.lineStyle(0.8, 0xFFFFFF, 0.50)
      g.strokeRect(x + wx, y - 32, 16, 14)
      g.lineStyle(0, 0, 0)
    })
    g.fillStyle(0x2A5A8A, 1)
    g.fillRoundedRect(x - 8, y - 30, 16, 30, { tl: 6, tr: 6, bl: 0, br: 0 })
    g.fillStyle(0xFFFFFF, 0.3)
    g.fillRect(x - 7, y - 29, 6, 12)
    g.fillStyle(0xFFFFFF, 1)
    g.fillTriangle(x - 14, y - 58, x + 14, y - 58, x, y - 72)
    g.fillStyle(0x2A5A8A, 1)
    g.fillRect(x - 48, y - 62, 96, 5)
    for (let bx = x - 44; bx < x + 48; bx += 8) {
      g.fillStyle(0xFFFFFF, 0.75)
      g.fillRect(bx, y - 70, 3, 8)
    }
    g.fillStyle(0x7A6040, 1)
    g.fillRect(x + 26, y - 70, 2, 28)
    this._vlag(g, x + 28, y - 70, 16, 10)
  }

  _tekenStandaard(g, x, y, kleur) {
    g.fillStyle(0x000000, 0.2)
    g.fillEllipse(x, y + 3, 80, 18)
    g.fillStyle(kleur, 1)
    g.fillRoundedRect(x - 32, y - 56, 64, 57, 5)
    g.fillStyle(0x4a2a08, 1)
    g.fillRoundedRect(x - 8, y - 20, 16, 21, { tl: 5, tr: 5, bl: 0, br: 0 })
    g.fillStyle(Phaser.Display.Color.IntegerToColor(kleur).darken(30).color, 1)
    g.fillTriangle(x - 38, y - 56, x + 38, y - 56, x, y - 84)
  }
}
