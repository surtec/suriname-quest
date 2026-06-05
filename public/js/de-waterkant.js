checkAuth()
toonSpelerBalk()

var LOCATIE_ID = 'waterkant'
var TOTAAL     = 4

;(function () {
  const CW = 600, CH = 580
  let canvas, ctx, running = false, animId
  let bsScore, bsLevens, bsTimer, bsTimerInterval
  let boat, items, keys, btnL, btnR, lastSpawn

  const GOOD = ['📦','🌾','☕','🍬','👥','🎁']
  const BAD  = ['⛓️','💣']
  const FEITEN = [
    'De Waterkant was eeuwenlang het kloppende hart van Paramaribo. Schepen uit Europa, Afrika en Azië meerden hier aan.',
    'Op 1 mei 1873 meerde de Lalla Rookh aan. Ruim 400 Hindostanen stapten voor het eerst op Surinaamse bodem.',
    'In 1890 kwamen de eerste Javanen op het schip Willem II aan. Zij brachten de wayang kulit-traditie mee naar Suriname.',
  ]

  function init() {
    canvas = document.getElementById('bootCanvas')
    canvas.width = CW; canvas.height = CH
    ctx = canvas.getContext('2d')
    drawWacht()
  }

  function drawWacht() {
    ctx.fillStyle = '#030c14'
    ctx.fillRect(0, 0, CW, CH)
    ctx.font = '52px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('⛵', CW / 2, CH / 2 - 24)
    ctx.font = "bold 17px 'Nunito', sans-serif"
    ctx.fillStyle = 'rgba(72,180,220,0.7)'
    ctx.fillText('Druk op ▶ Speel!', CW / 2, CH / 2 + 32)
  }

  window.startBootSpel = function () {
    bsScore = 0; bsLevens = 3; bsTimer = 40; lastSpawn = 0
    boat = { x: CW / 2 - 32, y: CH - 56, w: 64, h: 28, spd: 7 }
    items = []; keys = {}; btnL = false; btnR = false
    running = true
    const startBtn = document.getElementById('bs-start-btn')
    startBtn.textContent = '⏸ Bezig'; startBtn.disabled = true
    document.getElementById('bootspel-klaar').style.display = 'none'
    updateHud()

    document.addEventListener('keydown', onKey)
    document.addEventListener('keyup', offKey)
    document.getElementById('bs-left-btn').onpointerdown  = () => btnL = true
    document.getElementById('bs-left-btn').onpointerup    = () => btnL = false
    document.getElementById('bs-right-btn').onpointerdown = () => btnR = true
    document.getElementById('bs-right-btn').onpointerup   = () => btnR = false
    canvas.addEventListener('pointerdown', onCanvasTap)

    bsTimerInterval = setInterval(() => {
      bsTimer--
      document.getElementById('bs-timer').textContent = bsTimer
      if (bsTimer <= 0) eindSpel()
    }, 1000)
    requestAnimationFrame(loop)
  }

  function onKey(e)  { keys[e.key] = true;  if (['ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault() }
  function offKey(e) { delete keys[e.key] }
  function onCanvasTap(e) {
    const r = canvas.getBoundingClientRect()
    if ((e.clientX - r.left) < r.width / 2) btnL = true; else btnR = true
    setTimeout(() => { btnL = false; btnR = false }, 140)
  }

  function loop(ts) {
    if (!running) return
    animId = requestAnimationFrame(loop)

    if (keys['ArrowLeft']  || keys['a'] || keys['A'] || btnL) boat.x = Math.max(0, boat.x - boat.spd)
    if (keys['ArrowRight'] || keys['d'] || keys['D'] || btnR) boat.x = Math.min(CW - boat.w, boat.x + boat.spd)

    const gap = Math.max(600, 1100 - (40 - bsTimer) * 18)
    if (!lastSpawn || ts - lastSpawn > gap) { spawn(); lastSpawn = ts }

    items = items.filter(it => {
      it.y += it.spd
      if (it.y > CH + 20) return false
      if (it.y + 16 >= boat.y && it.y - 16 <= boat.y + boat.h &&
          it.x + 16 >= boat.x && it.x - 16 <= boat.x + boat.w) {
        if (it.good) {
          bsScore += 10
          document.getElementById('bs-score').textContent = bsScore
          speelGeluid('hit')
        } else {
          bsLevens--
          document.getElementById('bs-levens').textContent = bsLevens
          speelGeluid('mis')
          if (bsLevens <= 0) { eindSpel(); return false }
        }
        return false
      }
      return true
    })
    draw()
  }

  function spawn() {
    const good = Math.random() > 0.32
    items.push({
      x: 22 + Math.random() * (CW - 44), y: -22,
      spd: 2.2 + Math.random() * 2.2 + (40 - bsTimer) * 0.07,
      good,
      emoji: good ? GOOD[Math.floor(Math.random() * GOOD.length)]
                  : BAD[Math.floor(Math.random() * BAD.length)]
    })
  }

  function draw() {
    ctx.fillStyle = '#030c14'; ctx.fillRect(0, 0, CW, CH)

    for (let y = 18; y < CH - 52; y += 22) {
      ctx.strokeStyle = `rgba(72,180,220,0.05)`; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke()
    }

    ctx.fillStyle = 'rgba(60,40,20,0.4)'; ctx.fillRect(0, CH - 50, CW, 50)
    ctx.fillStyle = 'rgba(72,180,220,0.18)'; ctx.fillRect(0, CH - 52, CW, 3)

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    items.forEach(it => {
      ctx.beginPath(); ctx.arc(it.x, it.y, 18, 0, Math.PI * 2)
      ctx.fillStyle   = it.good ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)'; ctx.fill()
      ctx.strokeStyle = it.good ? 'rgba(34,197,94,0.5)'  : 'rgba(239,68,68,0.5)';
      ctx.lineWidth = 1.5; ctx.stroke()
      ctx.font = '22px serif'; ctx.fillText(it.emoji, it.x, it.y)
    })

    const bx = boat.x, by = boat.y, bw = boat.w
    ctx.fillStyle = '#5a3010'
    ctx.beginPath()
    ctx.moveTo(bx - 4, by + boat.h); ctx.lineTo(bx + bw + 4, by + boat.h)
    ctx.lineTo(bx + bw - 2, by + 4); ctx.lineTo(bx + 2, by + 4); ctx.closePath(); ctx.fill()
    ctx.font = '34px serif'; ctx.fillText('⛵', bx + bw / 2, by - 2)

    ctx.textAlign = 'left'; ctx.font = '16px serif'
    for (let i = 0; i < bsLevens; i++) ctx.fillText('❤️', 8 + i * 22, 18)

    if (bsTimer <= 10) {
      ctx.font = "bold 13px 'Nunito', sans-serif"
      ctx.fillStyle = `rgba(239,68,68,${0.6 + Math.sin(Date.now() / 200) * 0.4})`
      ctx.textAlign = 'right'; ctx.fillText(bsTimer + 's', CW - 8, 20)
    }
  }

  function updateHud() {
    document.getElementById('bs-score').textContent  = bsScore
    document.getElementById('bs-levens').textContent = bsLevens
    document.getElementById('bs-timer').textContent  = bsTimer
  }

  function eindSpel() {
    speelGeluid('klaar')
    running = false
    clearInterval(bsTimerInterval); cancelAnimationFrame(animId)
    document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', offKey)
    canvas.removeEventListener('pointerdown', onCanvasTap)
    const startBtn = document.getElementById('bs-start-btn')
    startBtn.textContent = '▶ Speel!'; startBtn.disabled = false
    document.getElementById('bootspel-klaar').style.display = 'block'
    const icon  = bsScore >= 120 ? '🏆' : bsScore >= 60 ? '⚓' : '🌊'
    const titel = bsScore >= 120 ? 'Geweldig Kapitein!' : bsScore >= 60 ? 'Goed gedaan!' : 'Oefenen maar!'
    document.getElementById('bsk-icon').textContent       = icon
    document.getElementById('bsk-titel').textContent      = titel
    document.getElementById('bsk-score-tekst').textContent = `Score: ${bsScore} punten`
    document.getElementById('bsk-feit').textContent       = FEITEN[Math.floor(Math.random() * FEITEN.length)]
  }

  window.resetBootSpel = function () {
    document.getElementById('bootspel-klaar').style.display = 'none'
    startBootSpel()
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
