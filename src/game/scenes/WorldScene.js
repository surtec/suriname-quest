// src/game/scenes/WorldScene.js
// Paramaribo 2060 — stadskaart gebaseerd op de echte plattegrond

import Player    from '../objects/Player.js'
import { LOCATIONS } from '../data/locations.js'

// Canvas: 960 × 560
// Kaartindeling (y):
//   0   – 150  → Suriname Rivier (noorden)
//   150 – 206  → Waterkant promenade
//   207 – 560  → Stadsgebied
//     207 – 291  → Blok rij 1
//     291 – 375  → Blok rij 2
//     375 – 459  → Blok rij 3
//     459 – 514  → Blok rij 4
//     514 – 560  → Regenwoud rand (zuiden)
// Verticale straten (x): 144, 308, 480, 644, 816
// Hotspots:
//   Fort Zeelandia         → x=805, y=267
//   De Waterkant           → x=266, y=296
//   Onafhankelijkheidsplein→ x=534, y=413

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
    this.spelerData = data.speler || { naam: 'Sari', punten: 0, level: 1, collectibles: [] }
  }

  create() {
    const W = this.scale.width   // 960
    const H = this.scale.height  // 560

    this.tekeningAchtergrond(W, H)

    this.physics.world.setBounds(0, 0, W, H)

    this.player = new Player(this, W * 0.42, H * 0.62)
    this.player.setNaam(this.spelerData.naam)
    this.physics.world.enable(this.player.container)
    this.player.body_phys.setCollideWorldBounds(true)

    this.hotspots = []
    this.maakHotspots()

    this.activeHotspot = null
    this.interactKey   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)

    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd    = {
      up:    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }

    this.cameras.main.setBounds(0, 0, W, H)
    this.cameras.main.startFollow(this.player.container, true, 0.08, 0.08)
    this.cameras.main.setZoom(1.6)

    this.interactBubble = this.maakInteractieBubble()

    this.game.events.emit('hud-update', {
      punten: this.spelerData.punten,
      level:  this.spelerData.level,
      naam:   this.spelerData.naam,
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

    this.touchInput = { left: false, right: false, up: false, down: false }
    this.maakTouchKnoppen(W, H)
  }

  // ═══════════════════════════════════════════════════════════
  //  PARAMARIBO KAART ACHTERGROND
  // ═══════════════════════════════════════════════════════════

  tekeningAchtergrond(W, H) {

    // ── SURINAME RIVIER ───────────────────────────────────────
    const gRiv = this.add.graphics()
    gRiv.fillGradientStyle(0x1B4F8A, 0x1B4F8A, 0x3878B8, 0x2460A0, 1)
    gRiv.fillRect(0, 0, W, RIV_H + 4)
    // Lichtere zone midden rivier
    gRiv.fillStyle(0x60A0D0, 0.18)
    gRiv.fillRect(0, RIV_H * 0.12, W, RIV_H * 0.50)
    // Donkere diepte bij oostkant (Fort Zeelandia)
    gRiv.fillGradientStyle(0x0C3870, 0x0C3870, 0x1B5090, 0x1B5090, 0.55)
    gRiv.fillRect(W * 0.65, 0, W * 0.35, RIV_H)
    // Noordoever
    gRiv.fillStyle(0xC8B06A, 0.45)
    gRiv.fillRect(0, 0, W, 7)

    // Golf animaties (meer golven voor rijker beeld)
    for (let i = 0; i < 11; i++) {
      const wg = this.add.graphics()
      wg.lineStyle(1.5, 0xffffff, 0.20)
      wg.beginPath()
      const wx = W * (0.02 + i * 0.09)
      const wy = RIV_H * (0.22 + (i % 4) * 0.18)
      wg.moveTo(wx, wy)
      wg.lineTo(wx + 80, wy)
      wg.strokePath()
      this.tweens.add({
        targets:  wg,
        x: { from: -12, to: 12 },
        alpha: { from: 0.50, to: 0.05 },
        yoyo: true, repeat: -1,
        duration: 1800 + i * 320,
      })
    }

    // Schip op de rivier
    const gSchip = this.add.graphics()
    gSchip.fillStyle(0x7A5020, 1)
    gSchip.fillRoundedRect(0, 0, 68, 18, 4)
    gSchip.fillStyle(0x5A3800, 0.8)
    gSchip.fillRect(10, -28, 4, 28)
    gSchip.fillStyle(0xFFFFF0, 0.88)
    gSchip.fillTriangle(14, -28, 14, -10, 44, -19)
    gSchip.fillStyle(0xDD2828, 1)
    gSchip.fillRect(10, -36, 14, 8)
    gSchip.setPosition(W * 0.27, RIV_H * 0.50)
    this.tweens.add({
      targets: gSchip,
      x: { from: W * 0.20, to: W * 0.38 },
      yoyo: true, repeat: -1,
      duration: 14000, ease: 'Sine.easeInOut',
    })

    // ── WATERKANT PROMENADE ───────────────────────────────────
    const gPrm = this.add.graphics()
    gPrm.fillGradientStyle(0xCAAA68, 0xC2A260, 0xD2B272, 0xCAAA68, 1)
    gPrm.fillRect(0, PRM_Y, W, PRM_H)
    // Tegels
    gPrm.lineStyle(0.7, 0xAA8840, 0.30)
    for (let tx = 0; tx < W; tx += 28) {
      gPrm.beginPath(); gPrm.moveTo(tx, PRM_Y); gPrm.lineTo(tx, PRM_Y + PRM_H); gPrm.strokePath()
    }
    for (let ty = PRM_Y; ty <= PRM_Y + PRM_H; ty += 28) {
      gPrm.beginPath(); gPrm.moveTo(0, ty); gPrm.lineTo(W, ty); gPrm.strokePath()
    }
    gPrm.lineStyle(0, 0, 0)
    // Schaduw waterrand
    gPrm.fillStyle(0x000000, 0.10)
    gPrm.fillRect(0, PRM_Y, W, 5)

    // ── STADSGEBIED BASIS ─────────────────────────────────────
    const gStad = this.add.graphics()
    gStad.fillStyle(0xD2BC7A, 1)
    gStad.fillRect(0, CITY_Y, W, H - CITY_Y)

    // Stadsblokken met kleurvariaite
    const kolX = [0, ...VX.map(x => x + STR_W / 2), W]
    const rijY  = [CITY_Y, ...HY.map(y => y + STR_W / 2), BOS_Y]
    const blokKleuren = [
      0xDBC67E, 0xCFBA72, 0xD6C27C, 0xCAB46A, 0xD2BE78, 0xCCB670,
      0xD4C07A, 0xC8AE68, 0xCEB872, 0xD6C47E, 0xCAB46C, 0xD0BE74,
      0xD8C47A, 0xCCB66C, 0xD4C076, 0xC6AC68, 0xCEBA70, 0xD2BE78,
      0xD6C27C, 0xCAB66E, 0xD0BC72, 0xCCB06A, 0xD4BE76, 0xC8B270,
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

    // Straten (horizontaal)
    const gStraat = this.add.graphics()
    gStraat.fillStyle(0xB8A45C, 0.9)
    HY.forEach(hy => gStraat.fillRect(0, hy - STR_W / 2, W, STR_W))
    gStraat.fillRect(0, CITY_Y, W, STR_W / 2)

    // Straten (verticaal)
    VX.forEach(vx => gStraat.fillRect(vx - STR_W / 2, CITY_Y, STR_W, H - CITY_Y))

    // Middenstrepen
    gStraat.lineStyle(0.5, 0xA09050, 0.28)
    HY.forEach(hy => {
      gStraat.beginPath(); gStraat.moveTo(0, hy); gStraat.lineTo(W, hy); gStraat.strokePath()
    })
    VX.forEach(vx => {
      gStraat.beginPath(); gStraat.moveTo(vx, CITY_Y); gStraat.lineTo(vx, BOS_Y); gStraat.strokePath()
    })
    gStraat.lineStyle(0, 0, 0)

    // ── ONAFHANKELIJKHEIDSPLEIN GROEN PARK ────────────────────
    const gPlein = this.add.graphics()
    gPlein.fillStyle(0x4A9A3C, 1)
    gPlein.fillRect(492, 383, 141, 67)
    gPlein.fillStyle(0x5AAC4C, 0.50)
    gPlein.fillRect(498, 389, 129, 55)
    gPlein.lineStyle(1.5, 0x3A8A2C, 0.65)
    gPlein.strokeRect(492, 383, 141, 67)
    gPlein.lineStyle(0, 0, 0)
    // Pad diagonalen
    gPlein.lineStyle(1, 0xC8B850, 0.45)
    gPlein.beginPath(); gPlein.moveTo(492, 383); gPlein.lineTo(633, 450); gPlein.strokePath()
    gPlein.beginPath(); gPlein.moveTo(633, 383); gPlein.lineTo(492, 450); gPlein.strokePath()
    gPlein.lineStyle(0, 0, 0)
    // Bloemen
    gPlein.fillStyle(0xF4D040, 0.65)
    gPlein.fillCircle(506, 397, 4); gPlein.fillCircle(621, 397, 4)
    gPlein.fillCircle(506, 436, 4); gPlein.fillCircle(621, 436, 4)

    // ── PRESIDENTIEEL PALMTUIN ────────────────────────────────
    const gPalmtuin = this.add.graphics()
    gPalmtuin.fillStyle(0x3A8A30, 0.50)
    gPalmtuin.fillRect(319, 383, 150, 67)
    gPalmtuin.fillStyle(0x2A7A20, 0.30)
    gPalmtuin.fillRect(326, 389, 136, 55)

    // Decoratieve gebouwen
    this.tekeningStadsgebouwen(W, H)

    // ── REGENWOUD RAND (zuiden) ───────────────────────────────
    const gBos = this.add.graphics()
    gBos.fillGradientStyle(0x256A20, 0x22601C, 0x1E5618, 0x1A5014, 1)
    gBos.fillRect(0, BOS_Y, W, H - BOS_Y)
    // Grote boomsilhouetten
    gBos.fillStyle(0x185010, 0.85)
    for (let bx = 5; bx < W; bx += 44) {
      const bh = 18 + Math.sin(bx * 0.17) * 11
      gBos.fillEllipse(bx + 20, BOS_Y, 38, bh + 12)
    }
    gBos.fillStyle(0x2E6A26, 0.55)
    for (let bx = 20; bx < W; bx += 62) {
      gBos.fillEllipse(bx + 14, BOS_Y - 5, 28, 18)
    }
    // Lichte randtips
    gBos.fillStyle(0x4A8A3C, 0.30)
    for (let bx = 10; bx < W; bx += 38) {
      gBos.fillEllipse(bx + 16, BOS_Y - 8, 20, 12)
    }

    // Palmen & stadsbomen
    this.tekeningPalmen(W)
    this.tekeningStadsbomen()
  }

  // Palmbomen langs de Waterkant promenade
  tekeningPalmen(W) {
    const palmPosities = [78, 210, 380, 550, 710, 870]
    palmPosities.forEach(px => {
      const g = this.add.graphics().setDepth(PRM_Y + PRM_H + 5)
      const py = PRM_Y + PRM_H - 12

      // Schaduw
      g.fillStyle(0x000000, 0.14)
      g.fillEllipse(px, py + 6, 32, 11)

      // Stam (handmatige kwadratische Bezier)
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

      // Palmbladeren (8 fronds)
      const bladKleuren = [0x2E8B2E, 0x3A9E3A, 0x227022]
      for (let i = 0; i < 8; i++) {
        const hoek = (i / 8) * Math.PI * 2
        g.fillStyle(bladKleuren[i % 3], 1)
        g.fillEllipse(
          px + 5 + Math.cos(hoek) * 15,
          py - 52 + Math.sin(hoek) * 8,
          30, 9
        )
      }
      // Kokosnoten
      g.fillStyle(0x9B7040, 0.85)
      g.fillCircle(px + 5, py - 49, 5)
      g.fillCircle(px + 9, py - 46, 4)
    })
  }

  // Kleine stadsbomen langs straten
  tekeningStadsbomen() {
    const boomPlaatsen = [
      { x: 68,  y: CITY_Y + 14 },
      { x: 220, y: CITY_Y + 14 },
      { x: 575, y: CITY_Y + 14 },
      { x: 718, y: CITY_Y + 14 },
      { x: 878, y: CITY_Y + 14 },
      { x: 68,  y: HY[0] + 14 },
      { x: 392, y: HY[0] + 14 },
      { x: 704, y: HY[0] + 14 },
      { x: 888, y: HY[0] + 14 },
      { x: 222, y: HY[1] + 14 },
      { x: 704, y: HY[1] + 14 },
      { x: 68,  y: HY[2] + 14 },
      { x: 392, y: HY[2] + 14 },
      { x: 888, y: HY[2] + 14 },
    ]
    boomPlaatsen.forEach(({ x, y }) => {
      const g = this.add.graphics().setDepth(y + 5)
      // Schaduw
      g.fillStyle(0x000000, 0.11)
      g.fillEllipse(x, y + 4, 32, 12)
      // Stam
      g.fillStyle(0x7B5020, 1)
      g.fillRect(x - 5, y, 9, 18)
      // Bladkroon
      g.fillStyle(0x3A8020, 1)
      g.fillCircle(x, y - 12, 18)
      g.fillStyle(0x4A9030, 0.72)
      g.fillCircle(x - 8, y - 18, 13)
      g.fillCircle(x + 7, y - 18, 12)
      g.fillStyle(0x5AAA40, 0.35)
      g.fillCircle(x + 2, y - 24, 9)
    })
  }

  // Decoratieve koloniale gebouwtjes in de stadsblokken
  tekeningStadsgebouwen(W, H) {
    const gebouwtjes = [
      // Rij 1 (y≈207-291)
      { x: 54,  y: 262, w: 72, h: 38, k: 0xEAC250, dk: 0xC09030 },
      { x: 104, y: 262, w: 40, h: 33, k: 0xD4E870, dk: 0x88B038 },
      { x: 198, y: 253, w: 66, h: 40, k: 0xF0D060, dk: 0xC8A040 },
      { x: 262, y: 255, w: 40, h: 36, k: 0xE0CA48, dk: 0xB89028 },
      { x: 358, y: 258, w: 74, h: 38, k: 0xDAEA70, dk: 0x9AC040 },
      { x: 432, y: 249, w: 40, h: 36, k: 0xF0C860, dk: 0xC09030 },
      { x: 668, y: 255, w: 69, h: 36, k: 0xEABA48, dk: 0xB89028 },
      { x: 736, y: 259, w: 42, h: 33, k: 0xF0D060, dk: 0xC0A030 },
      // Rij 2 (y≈291-375)
      { x: 57,  y: 338, w: 78, h: 38, k: 0xE0C040, dk: 0xAE9020 },
      { x: 86,  y: 343, w: 42, h: 33, k: 0xDADA68, dk: 0xA0A830 },
      { x: 203, y: 333, w: 66, h: 38, k: 0xF0CA58, dk: 0xC09030 },
      { x: 836, y: 338, w: 77, h: 36, k: 0xEAC248, dk: 0xB89028 },
      { x: 878, y: 330, w: 60, h: 42, k: 0xF0D060, dk: 0xC0A030 },
      // Rij 3 (y≈375-459)
      { x: 54,  y: 426, w: 74, h: 38, k: 0xDAC040, dk: 0xA69020 },
      { x: 105, y: 421, w: 31, h: 30, k: 0xEACA48, dk: 0xB89028 },
      { x: 836, y: 422, w: 80, h: 38, k: 0xF0CA50, dk: 0xC09030 },
    ]
    gebouwtjes.forEach(({ x, y, w, h, k, dk }) => {
      const g = this.add.graphics().setDepth(y + 5)
      // Schaduw
      g.fillStyle(0x000000, 0.13)
      g.fillRect(x + 3, y + 3, w, h)
      // Muur
      g.fillStyle(k, 1)
      g.fillRect(x, y, w, h)
      // Dak
      g.fillStyle(dk, 1)
      g.fillTriangle(x - 4, y, x + w + 4, y, x + w / 2, y - h * 0.58)
      // Raam(en)
      g.fillStyle(0x88CCEE, 0.70)
      g.fillRect(x + w * 0.18, y + h * 0.18, w * 0.24, h * 0.38)
      if (w > 50) g.fillRect(x + w * 0.56, y + h * 0.18, w * 0.24, h * 0.38)
      // Vensterframe
      g.lineStyle(0.8, 0xA09040, 0.55)
      g.strokeRect(x + w * 0.18, y + h * 0.18, w * 0.24, h * 0.38)
      if (w > 50) g.strokeRect(x + w * 0.56, y + h * 0.18, w * 0.24, h * 0.38)
      g.lineStyle(0, 0, 0)
    })
  }

  // ═══════════════════════════════════════════════════════════
  //  HOTSPOTS
  // ═══════════════════════════════════════════════════════════

  maakHotspots() {
    LOCATIONS.forEach(locatie => {
      const { x, y } = locatie.wereldPositie

      const gebouw = this.add.graphics().setDepth(y - 5)
      this.tekenGebouw(gebouw, x, y, locatie)

      const spot = this.add.graphics().setDepth(y + 50)
      spot.fillStyle(0xf4d03f, 1)
      spot.fillCircle(x, y - 52, 10)
      spot.fillStyle(0xffffff, 0.8)
      spot.fillCircle(x - 3, y - 56, 3)

      const label = this.add.text(x, y - 70, locatie.naam, {
        fontFamily: "'Fredoka One', cursive",
        fontSize:   '13px',
        color:      '#ffee88',
        stroke:     '#000',
        strokeThickness: 3,
        backgroundColor: 'rgba(0,0,0,0.60)',
        padding:    { x: 7, y: 3 },
      }).setOrigin(0.5, 1).setDepth(y + 60)

      this.tweens.add({
        targets:  spot,
        scaleX:   1.35, scaleY: 1.35, alpha: 0.55,
        yoyo: true, repeat: -1,
        duration: 1100, ease: 'Sine.easeInOut',
      })

      const zone = this.add.zone(x, y, 96, 96)
      this.physics.add.existing(zone, true)

      this.hotspots.push({ zone, locatieId: locatie.id, label, spot })
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

  // Fort Zeelandia — stervormig fort aan de oostkant bij de rivier
  tekenFortZeelandia(g, x, y) {
    const cy = y - 49

    // Schaduw
    g.fillStyle(0x000000, 0.22)
    g.fillEllipse(x, y + 3, 104, 23)

    // Witte rand
    g.fillStyle(0xF2E4B4, 1)
    this._ster(g, x, cy, 59, 29)

    // Rode bakstenen muren
    g.fillStyle(0x8B2020, 1)
    this._ster(g, x, cy, 54, 26)

    // Baksteentextuur
    g.lineStyle(0.7, 0x000000, 0.12)
    for (let row = cy - 47; row < cy + 21; row += 7) {
      g.beginPath(); g.moveTo(x - 54, row); g.lineTo(x + 54, row); g.strokePath()
    }
    for (let col = x - 50; col < x + 50; col += 11) {
      g.beginPath(); g.moveTo(col, cy - 47); g.lineTo(col, cy + 21); g.strokePath()
    }
    g.lineStyle(0, 0, 0)

    // Geel zand binnenhof
    g.fillStyle(0xD4A830, 1)
    g.fillCircle(x, cy, 25)
    g.fillStyle(0xE0C050, 0.45)
    g.fillCircle(x - 5, cy - 5, 15)

    // Koloniaal binnengebouwtje
    g.fillStyle(0xF8F5EC, 1)
    g.fillRect(x - 12, cy - 12, 25, 16)
    // Oranje dak
    g.fillStyle(0xCC5515, 1)
    g.fillTriangle(x - 16, cy - 12, x + 16, cy - 12, x, cy - 27)
    g.fillStyle(0xAA4010, 0.6)
    g.fillRect(x - 16, cy - 14, 33, 3)
    // Ramen
    g.fillStyle(0x88CCEE, 0.88)
    g.fillRect(x - 10, cy - 10, 7, 7)
    g.fillRect(x + 4,  cy - 10, 7, 7)
    // Deur
    g.fillStyle(0x5A2A0A, 1)
    g.fillRoundedRect(x - 3, cy, 7, 9, 1)

    // Vlaggestok + vlag
    g.fillStyle(0x8B6040, 1)
    g.fillRect(x + 16, cy - 30, 3, 33)
    this._vlag(g, x + 19, cy - 30, 23, 15)
  }

  // Waterkant — geel koloniaal houten huis
  tekenWaterkant(g, x, y) {
    // Schaduw
    g.fillStyle(0x000000, 0.22)
    g.fillEllipse(x, y + 3, 98, 24)

    // Houten muren
    g.fillStyle(0xE8C240, 1)
    g.fillRect(x - 41, y - 61, 82, 61)

    // Plankentextuur (verticaal)
    g.fillStyle(0xF0D060, 0.34)
    for (let i = 0; i < 82; i += 10) {
      g.fillRect(x - 41 + i, y - 61, 4, 61)
    }
    // Horizontale naden
    g.lineStyle(0.5, 0xB89020, 0.28)
    for (let row = y - 61; row < y; row += 8) {
      g.beginPath(); g.moveTo(x - 41, row); g.lineTo(x + 41, row); g.strokePath()
    }
    g.lineStyle(0, 0, 0)

    // Veranda vloer
    g.fillStyle(0xD4A820, 1)
    g.fillRect(x - 44, y - 21, 88, 21)
    // Veranda overkapping (groen)
    g.fillStyle(0x367A36, 1)
    g.fillRect(x - 47, y - 32, 94, 11)
    // Veranda palen
    g.fillStyle(0xB89020, 1)
    ;[-30, -10, 12, 30].forEach(px => {
      g.fillRect(x + px, y - 32, 5, 32)
    })

    // Ramen met groene luiken
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

    // Voordeur
    g.fillStyle(0x8B4513, 1)
    g.fillRoundedRect(x - 7, y - 27, 14, 27, { tl: 4, tr: 4, bl: 0, br: 0 })
    g.fillStyle(0xF4C430, 1)
    g.fillCircle(x + 4, y - 14, 1.5)

    // Groen puntdak
    g.fillStyle(0x367A36, 1)
    g.fillTriangle(x - 47, y - 61, x + 47, y - 61, x, y - 93)
    g.fillStyle(0x48A048, 0.38)
    g.fillTriangle(x - 24, y - 61, x, y - 91, x + 8, y - 61)
    g.fillStyle(0x285A28, 0.82)
    g.fillRect(x - 47, y - 62, 94, 4)
  }

  // Onafhankelijkheidsplein — wit monument met Surinaamse vlaggen
  tekenOnafhankelijkheidsplein(g, x, y) {
    // Schaduw
    g.fillStyle(0x000000, 0.22)
    g.fillEllipse(x, y + 3, 108, 24)

    // Betegeld plein
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

    // Sokkel
    g.fillStyle(0xE8E8E8, 1)
    g.fillRect(x - 15, y - 37, 30, 11)
    g.fillStyle(0xD0D0D0, 1)
    g.fillRect(x - 15, y - 29, 30, 3)

    // Marmeren zuil
    g.fillStyle(0xF5F5F5, 1)
    g.fillRect(x - 7, y - 85, 14, 48)
    g.fillStyle(0xFFFFFF, 0.55)
    g.fillRect(x - 4, y - 85, 4, 48)
    g.fillStyle(0xD8D8D8, 0.40)
    g.fillRect(x + 3, y - 85, 4, 48)
    g.fillStyle(0xE8E8E8, 1)
    g.fillRect(x - 11, y - 88, 22, 5)

    // Gouden ster bovenop
    g.fillStyle(0xF4C430, 1)
    this._ster(g, x, y - 97, 11, 5)
    g.fillStyle(0xE8B020, 0.52)
    this._ster(g, x + 1, y - 99, 7, 3)

    // Vlagpalen + Surinaamse vlaggen
    g.fillStyle(0x7A6040, 1)
    g.fillRect(x - 40, y - 29, 3, 45)
    this._vlag(g, x - 37, y - 74, 19, 12)
    g.fillRect(x + 37, y - 29, 3, 45)
    this._vlag(g, x + 40, y - 74, 19, 12)

    // Struiken rondom
    g.fillStyle(0x3A8A3A, 1)
    g.fillEllipse(x - 60, y - 13, 30, 20)
    g.fillEllipse(x + 60, y - 13, 30, 20)
    g.fillStyle(0x2D7D2D, 0.78)
    g.fillEllipse(x - 48, y - 21, 23, 16)
    g.fillEllipse(x + 48, y - 21, 23, 16)
  }

  // Anton de Kom Straat — rood koloniaal houten huis (woonhuis stijl)
  tekenAntonDeKom(g, x, y) {
    // Schaduw
    g.fillStyle(0x000000, 0.22)
    g.fillEllipse(x, y + 3, 90, 22)

    // Houten zijwanden
    g.fillStyle(0xC84040, 1)
    g.fillRect(x - 36, y - 58, 72, 58)

    // Plankentextuur
    g.fillStyle(0xD85050, 0.38)
    for (let i = 0; i < 72; i += 9) g.fillRect(x - 36 + i, y - 58, 4, 58)
    g.lineStyle(0.5, 0x901818, 0.25)
    for (let row = y - 58; row < y; row += 7) {
      g.beginPath(); g.moveTo(x - 36, row); g.lineTo(x + 36, row); g.strokePath()
    }
    g.lineStyle(0, 0, 0)

    // Veranda
    g.fillStyle(0xA03020, 1)
    g.fillRect(x - 40, y - 20, 80, 20)
    // Veranda overkapping
    g.fillStyle(0x702010, 1)
    g.fillRect(x - 42, y - 30, 84, 10)
    // Palen
    g.fillStyle(0x902818, 1)
    ;[-24, 0, 22].forEach(px => g.fillRect(x + px, y - 30, 4, 30))

    // Ramen
    ;[-22, 14].forEach(wx => {
      g.fillStyle(0xA8D8EE, 0.75)
      g.fillRect(x + wx, y - 52, 16, 15)
      g.lineStyle(0.8, 0x901818, 0.55)
      g.strokeRect(x + wx, y - 52, 16, 15)
      g.lineStyle(0, 0, 0)
    })

    // Deur
    g.fillStyle(0x5A1A0A, 1)
    g.fillRoundedRect(x - 6, y - 28, 12, 28, { tl: 4, tr: 4, bl: 0, br: 0 })

    // Donker dak
    g.fillStyle(0x701010, 1)
    g.fillTriangle(x - 42, y - 58, x + 42, y - 58, x, y - 88)
    g.fillStyle(0x501010, 0.6)
    g.fillRect(x - 42, y - 60, 84, 4)

    // Naambordje
    g.fillStyle(0xF4C430, 0.9)
    g.fillRect(x - 22, y - 47, 44, 8)
  }

  // Cultureel Centrum Suriname — paars/groen gebouw met decoratieve boog
  tekenCultuurhuis(g, x, y) {
    // Schaduw
    g.fillStyle(0x000000, 0.22)
    g.fillEllipse(x, y + 3, 100, 22)

    // Sokkel
    g.fillStyle(0x4A2870, 1)
    g.fillRect(x - 44, y - 60, 88, 60)

    // Muurpatroon (sierlijk)
    g.fillStyle(0x6A3890, 0.35)
    for (let i = 0; i < 88; i += 11) g.fillRect(x - 44 + i, y - 60, 5, 60)
    g.lineStyle(0.5, 0x8A58B0, 0.20)
    for (let row = y - 60; row < y; row += 8) {
      g.beginPath(); g.moveTo(x - 44, row); g.lineTo(x + 44, row); g.strokePath()
    }
    g.lineStyle(0, 0, 0)

    // Gewelfde ingang (boog)
    g.fillStyle(0x2A5A40, 1)
    g.fillRect(x - 44, y - 28, 88, 28)
    g.fillStyle(0x3A7A58, 0.4)
    g.fillEllipse(x, y - 38, 60, 24)

    // Boogdeur
    g.fillStyle(0x3A1A60, 1)
    g.fillRect(x - 10, y - 32, 20, 32)
    g.fillStyle(0x4A2870, 1)
    g.fillEllipse(x, y - 32, 20, 10)

    // Ramen links en rechts
    ;[-28, 20].forEach(wx => {
      g.fillStyle(0xF4C430, 0.55)
      g.fillRect(x + wx, y - 52, 14, 18)
      g.fillStyle(0xF4C430, 0.80)
      g.fillEllipse(x + wx + 7, y - 52, 14, 7)
      g.lineStyle(0.8, 0x8A58B0, 0.50)
      g.strokeRect(x + wx, y - 52, 14, 18)
      g.lineStyle(0, 0, 0)
    })

    // Dak met traptop (sierlijk)
    g.fillStyle(0x2A1A50, 1)
    g.fillRect(x - 44, y - 65, 88, 7)
    g.fillRect(x - 36, y - 72, 72, 7)
    g.fillRect(x - 24, y - 79, 48, 7)
    // Decoratief midden-torentje
    g.fillStyle(0x6A3890, 1)
    g.fillRect(x - 8, y - 94, 16, 15)
    g.fillStyle(0xF4C430, 1)
    g.fillTriangle(x - 10, y - 94, x + 10, y - 94, x, y - 108)
  }

  // Hendrikschool — klassiek schoolgebouw, lichtblauw met witte details
  tekenHendrikschool(g, x, y) {
    // Schaduw
    g.fillStyle(0x000000, 0.22)
    g.fillEllipse(x, y + 3, 100, 22)

    // Hoofdgebouw
    g.fillStyle(0x4A88C4, 1)
    g.fillRect(x - 44, y - 58, 88, 58)

    // Horizontale banden
    g.fillStyle(0xFFFFFF, 0.18)
    g.fillRect(x - 44, y - 38, 88, 5)
    g.fillRect(x - 44, y - 20, 88, 3)

    // Vier ramen in rij
    ;[-30, -10, 10, 28].forEach(wx => {
      g.fillStyle(0xB8E0F8, 0.80)
      g.fillRect(x + wx, y - 52, 12, 12)
      g.lineStyle(0.8, 0xFFFFFF, 0.55)
      g.strokeRect(x + wx, y - 52, 12, 12)
      // Kruisroede
      g.beginPath(); g.moveTo(x + wx + 6, y - 52); g.lineTo(x + wx + 6, y - 40); g.strokePath()
      g.beginPath(); g.moveTo(x + wx, y - 46); g.lineTo(x + wx + 12, y - 46); g.strokePath()
      g.lineStyle(0, 0, 0)
    })

    // Twee ramen benedenrij
    ;[-20, 10].forEach(wx => {
      g.fillStyle(0xB8E0F8, 0.75)
      g.fillRect(x + wx, y - 32, 16, 14)
      g.lineStyle(0.8, 0xFFFFFF, 0.50)
      g.strokeRect(x + wx, y - 32, 16, 14)
      g.lineStyle(0, 0, 0)
    })

    // Brede voordeur (midden)
    g.fillStyle(0x2A5A8A, 1)
    g.fillRoundedRect(x - 8, y - 30, 16, 30, { tl: 6, tr: 6, bl: 0, br: 0 })
    g.fillStyle(0xFFFFFF, 0.3)
    g.fillRect(x - 7, y - 29, 6, 12)

    // Driehoekig fronton boven deur
    g.fillStyle(0xFFFFFF, 1)
    g.fillTriangle(x - 14, y - 58, x + 14, y - 58, x, y - 72)

    // Plat dak met balustrade
    g.fillStyle(0x2A5A8A, 1)
    g.fillRect(x - 48, y - 62, 96, 5)
    // Kleine balusters
    for (let bx = x - 44; bx < x + 48; bx += 8) {
      g.fillStyle(0xFFFFFF, 0.75)
      g.fillRect(bx, y - 70, 3, 8)
    }

    // Vlaggenmast met Surinaamse vlag
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

  // ═══════════════════════════════════════════════════════════
  //  MOBIELE TOUCH KNOPPEN
  // ═══════════════════════════════════════════════════════════

  maakTouchKnoppen(W, H) {
    const btnSize = 50
    const cx = 88
    const cy = H - 82

    const dirs = [
      { label: '▲', key: 'up',    offX: 0,              offY: -(btnSize + 6) },
      { label: '▼', key: 'down',  offX: 0,              offY:  (btnSize + 6) },
      { label: '◄', key: 'left',  offX: -(btnSize + 6), offY: 0              },
      { label: '►', key: 'right', offX:  (btnSize + 6), offY: 0              },
    ]

    dirs.forEach(({ label, key, offX, offY }) => {
      const bx = cx + offX
      const by = cy + offY

      const bg = this.add.graphics().setScrollFactor(0).setDepth(1000)
      const teken = (actief) => {
        bg.clear()
        bg.fillStyle(actief ? 0xffffff : 0x000000, actief ? 0.25 : 0.42)
        bg.lineStyle(2, actief ? 0x7ec98f : 0xffffff, actief ? 0.75 : 0.22)
        bg.fillRoundedRect(bx - btnSize / 2, by - btnSize / 2, btnSize, btnSize, 12)
        bg.strokeRoundedRect(bx - btnSize / 2, by - btnSize / 2, btnSize, btnSize, 12)
      }
      teken(false)

      this.add.text(bx, by, label, {
        fontSize: '18px',
        color:    'rgba(255,255,255,0.80)',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1001)

      const zone = this.add.zone(bx, by, btnSize, btnSize)
        .setScrollFactor(0).setDepth(1002)
        .setInteractive()

      zone.on('pointerdown',  () => { this.touchInput[key] = true;  teken(true)  })
      zone.on('pointerup',    () => { this.touchInput[key] = false; teken(false) })
      zone.on('pointerout',   () => { this.touchInput[key] = false; teken(false) })
    })
  }

  // ═══════════════════════════════════════════════════════════
  //  UPDATE LOOP
  // ═══════════════════════════════════════════════════════════

  update() {
    const t = this.touchInput
    const combined = {
      left:  { isDown: this.cursors.left.isDown  || this.wasd.left.isDown  || t.left  },
      right: { isDown: this.cursors.right.isDown || this.wasd.right.isDown || t.right },
      up:    { isDown: this.cursors.up.isDown    || this.wasd.up.isDown    || t.up    },
      down:  { isDown: this.cursors.down.isDown  || this.wasd.down.isDown  || t.down  },
    }
    const leeg = {
      left: {isDown:false}, right: {isDown:false},
      up:   {isDown:false}, down:  {isDown:false},
    }
    this.player.update(combined, leeg)

    this.activeHotspot = null
    const { x: px, y: py } = this.player.getPosition()

    this.hotspots.forEach(({ zone, locatieId }) => {
      const dist = Phaser.Math.Distance.Between(px, py, zone.x, zone.y)
      if (dist < 90) {
        this.activeHotspot = locatieId
        if (this.interactBubble) {
          this.interactBubble.setPosition(px, py - 75).setVisible(true).setDepth(py + 100)
        }
      }
    })

    if (!this.activeHotspot && this.interactBubble) {
      this.interactBubble.setVisible(false)
    }

    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.activeHotspot) {
      this.gaanNaarLocatie(this.activeHotspot)
    }
  }

  maakInteractieBubble() {
    const bubble = this.add.container(0, 0).setVisible(false)
    const bg = this.add.graphics()
    bg.fillStyle(0xffffff, 0.92)
    bg.fillRoundedRect(-52, -20, 104, 26, 10)
    const tekst = this.add.text(0, -7, '[E] / Tik hier', {
      fontFamily: "'Fredoka One', cursive",
      fontSize:   '13px',
      color:      '#1a3a22',
    }).setOrigin(0.5)

    const zone = this.add.zone(0, -7, 104, 26)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        if (this.activeHotspot) this.gaanNaarLocatie(this.activeHotspot)
      })

    bubble.add([bg, tekst, zone])
    return bubble
  }

  gaanNaarLocatie(locatieId) {
    this.cameras.main.fadeOut(300, 0, 0, 0)
    this.time.delayedCall(300, () => {
      this.scene.start('LocationScene', {
        locatieId,
        speler: this.spelerData,
      })
    })
  }
}
