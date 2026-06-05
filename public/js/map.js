checkAuth()

const mascotvragen = [
  'Wist je dat "barbecue" van de Inheemsen komt?',
  'Columbus vertrok op 3 augustus 1492!',
  'Fort Zeelandia was eerst Fort Willoughby!',
  'Keti Koti betekent "gebroken ketenen"!',
  'De Lalla Rookh bracht de eerste Hindostanen in 1873!',
  'Bauxiet uit Suriname maakte vliegtuigen in WOII!',
  'De vlag werd ontworpen door Jacques Herman Pinas!',
  '25 november 1975 werd Suriname onafhankelijk!',
]
let mascotIdx = 0
const bubbleEl = document.getElementById('speech-bubble')
setInterval(() => {
  bubbleEl.classList.add('fade')
  setTimeout(() => {
    mascotIdx = (mascotIdx + 1) % mascotvragen.length
    bubbleEl.textContent = mascotvragen[mascotIdx]
    bubbleEl.classList.remove('fade')
  }, 500)
}, 5000)

const tmVragen = [
  { tekst: '⛵ Columbus vertrok met zijn drie schepen uit Spanje', jaar: 1492, opties: [1445, 1492, 1512, 1525] },
  { tekst: '🏴 Engelsen onder Francis Willoughby bouwden Fort Willoughby', jaar: 1650, opties: [1620, 1640, 1650, 1680] },
  { tekst: '🏰 Abraham Crijnssen veroverde Suriname voor Nederland', jaar: 1667, opties: [1645, 1660, 1667, 1690] },
  { tekst: '⛓️ Keti Koti! De slavernij werd afgeschaft in Suriname', jaar: 1863, opties: [1834, 1848, 1863, 1873] },
  { tekst: '🚢 De Lalla Rookh bracht de eerste Hindostanen naar Suriname', jaar: 1873, opties: [1853, 1863, 1873, 1890] },
  { tekst: '🚢 De Willem II bracht de eerste Javanen naar Suriname', jaar: 1890, opties: [1873, 1882, 1890, 1900] },
  { tekst: '⛏️ Bauxiet werd ontdekt bij Moengo in Suriname', jaar: 1916, opties: [1900, 1908, 1916, 1925] },
  { tekst: '🇸🇷 Suriname werd onafhankelijk van Nederland!', jaar: 1975, opties: [1963, 1970, 1975, 1980] },
]
let tmIdx = 0, tmScore = 0, tmBezig = false

function shuffleArr(a) { return [...a].sort(() => Math.random() - 0.5) }

function laadTmVraag() {
  if (tmIdx >= tmVragen.length) { toonTmKlaar(); return }
  const v = tmVragen[tmIdx]
  document.getElementById('tm-vraag').textContent = v.tekst
  document.getElementById('tm-voortgang').textContent = `Vraag ${tmIdx + 1} van ${tmVragen.length}`
  document.getElementById('tm-feedback').textContent = ''
  document.getElementById('tm-feedback').className = 'tm-feedback'
  document.getElementById('tm-progress-fill').style.width = (tmIdx / tmVragen.length * 100) + '%'

  const opties = shuffleArr(v.opties)
  const container = document.getElementById('tm-opties')
  container.innerHTML = ''
  opties.forEach(jaar => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'tm-optie'
    btn.textContent = jaar
    btn.onclick = () => tmAnswer(btn, jaar, v.jaar)
    container.appendChild(btn)
  })
  tmBezig = false
}

function tmAnswer(btn, gekozen, correct) {
  if (tmBezig) return
  tmBezig = true
  const alleKnoppen = document.querySelectorAll('.tm-optie')
  alleKnoppen.forEach(b => b.disabled = true)
  const feedbackEl = document.getElementById('tm-feedback')

  if (gekozen === correct) {
    btn.classList.add('goed')
    tmScore++
    document.getElementById('tm-score').textContent = tmScore
    feedbackEl.textContent = '🎉 Goed zo!'
    feedbackEl.className = 'tm-feedback goed'
  } else {
    btn.classList.add('fout')
    alleKnoppen.forEach(b => { if (parseInt(b.textContent) === correct) b.classList.add('goed') })
    feedbackEl.textContent = `❌ Fout! Het goede antwoord was: ${correct}`
    feedbackEl.className = 'tm-feedback fout'
  }

  tmIdx++
  setTimeout(laadTmVraag, 1400)
}

function toonTmKlaar() {
  document.getElementById('tm-opties').innerHTML = ''
  document.getElementById('tm-vraag').textContent = ''
  document.getElementById('tm-voortgang').style.display = 'none'
  document.getElementById('tm-feedback').textContent = ''
  document.getElementById('tm-progress-fill').style.width = '100%'

  let icon, tekst
  if (tmScore >= 7) { icon = '🏆'; tekst = 'Ongelooflijk! Je bent een echte historicus!' }
  else if (tmScore >= 5) { icon = '🎉'; tekst = 'Super goed! Je kent Suriname goed!' }
  else if (tmScore >= 3) { icon = '👍'; tekst = 'Niet slecht! Leer nog meer en probeer opnieuw!' }
  else { icon = '💪'; tekst = 'Oefenen maar! Verken de locaties voor meer info.' }

  const klaar = document.getElementById('tm-klaar')
  document.getElementById('tm-klaar-score').textContent = `${icon} ${tmScore} / ${tmVragen.length} goed!`
  document.getElementById('tm-klaar-tekst').textContent = tekst
  klaar.style.display = 'block'
}

function resetTijdmachine() {
  tmIdx = 0; tmScore = 0; tmBezig = false
  document.getElementById('tm-klaar').style.display = 'none'
  document.getElementById('tm-voortgang').style.display = 'block'
  document.getElementById('tm-score').textContent = '0'
  laadTmVraag()
}

laadTmVraag()

const locatieMap = {
  inheemsen_dorp:          { kaartId: 'kaart-inheemsen', sterrenId: 'sterren-inheemsen', maxSterren: 4 },
  fort_zeelandia:          { kaartId: 'kaart-fort',      sterrenId: 'sterren-fort',      maxSterren: 4 },
  waterkant:               { kaartId: 'kaart-waterkant', sterrenId: 'sterren-waterkant', maxSterren: 4 },
  onafhankelijkheidsplein: { kaartId: 'kaart-plein',     sterrenId: 'sterren-plein',     maxSterren: 4 },
  plantage:                { kaartId: 'kaart-plantage',  sterrenId: 'sterren-plantage',  maxSterren: 5 },
}

function buildSterren(score, max) {
  let s = ''
  for (let i = 1; i <= max; i++) s += i <= score ? '⭐' : '☆'
  return s
}

async function laadPagina() {
  const g = getGebruiker()
  document.getElementById('player-name').textContent = g ? g.naam : ''

  const speler = await laadSpeler()
  if (!speler) return

  document.getElementById('player-points').textContent = speler.punten + ' punten'
  document.getElementById('stat-punten').textContent   = speler.punten
  document.getElementById('stat-level').textContent    = speler.level

  const voltooid = speler.completedLocations || []
  const totaal = Object.keys(locatieMap).length
  document.getElementById('stat-voltooid').textContent = voltooid.length + '/' + totaal

  const pct = Math.round(voltooid.length / totaal * 100)
  document.getElementById('voortgang-fill').style.width = pct + '%'
  document.getElementById('voortgang-pct').textContent  = pct + '%'

  const quizRes = speler.quizResultaten || {}

  voltooid.forEach(id => {
    const info = locatieMap[id]
    if (!info) return
    const kaart = document.getElementById(info.kaartId)
    if (!kaart) return
    kaart.classList.add('voltooid')
    if (!kaart.querySelector('.voltooid-badge')) {
      const badge = document.createElement('div')
      badge.className = 'voltooid-badge'
      badge.textContent = '✓ Klaar!'
      kaart.appendChild(badge)
    }

    const res = quizRes[id]
    if (res) {
      const sterrenEl = document.getElementById(info.sterrenId)
      if (sterrenEl) sterrenEl.textContent = buildSterren(res.score, info.maxSterren)
    }
  })
}

laadPagina()
