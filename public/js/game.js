var score = 0
var beantwoord = 0
var streak = 0

function naarSectie(naam) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('actief'))
  document.getElementById('page-' + naam).classList.add('actief')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function speelGeluid(type) {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)()
    const o = ac.createOscillator(), g = ac.createGain()
    o.connect(g); g.connect(ac.destination)
    if (type === 'hit') {
      o.frequency.value = 880; g.gain.setValueAtTime(0.3, ac.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15)
      o.start(); o.stop(ac.currentTime + 0.15)
    } else if (type === 'mis') {
      o.type = 'sawtooth'; o.frequency.value = 200; g.gain.setValueAtTime(0.2, ac.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25)
      o.start(); o.stop(ac.currentTime + 0.25)
    } else if (type === 'klaar') {
      [523,659,784].forEach((f,i)=>{const o2=ac.createOscillator(),g2=ac.createGain();o2.connect(g2);g2.connect(ac.destination);o2.frequency.value=f;g2.gain.setValueAtTime(0.25,ac.currentTime+i*0.18);g2.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+i*0.18+0.3);o2.start(ac.currentTime+i*0.18);o2.stop(ac.currentTime+i*0.18+0.3)})
    } else if (type === 'spring') {
      o.frequency.setValueAtTime(300, ac.currentTime)
      o.frequency.exponentialRampToValueAtTime(600, ac.currentTime + 0.1)
      g.gain.setValueAtTime(0.2, ac.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2)
      o.start(); o.stop(ac.currentTime + 0.2)
    }
  } catch(e) {}
}

function floatPunten(btn) {
  const rect = btn.getBoundingClientRect()
  const el = document.createElement('div')
  el.className = 'punten-float'
  el.textContent = '+100'
  el.style.left = (rect.left + rect.width / 2) + 'px'
  el.style.top  = rect.top + 'px'
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 1200)
}

function showStreak(n) {
  const toast = document.getElementById('streak-toast')
  toast.textContent = n >= 4 ? '🔥 Perfecte reeks!' : `🔥 ${n} op rij goed!`
  toast.classList.add('show')
  setTimeout(() => toast.classList.remove('show'), 2000)
}

function launchConfetti() {
  const colors = ['#f4c430', '#22c55e', '#fb923c', '#a855f7', '#ef4444', '#ffffff']
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div')
    el.className = 'confetti-piece'
    const size = 6 + Math.random() * 10
    el.style.left = Math.random() * 100 + 'vw'
    el.style.width = size + 'px'
    el.style.height = size + 'px'
    el.style.background = colors[i % colors.length]
    el.style.animationDelay = Math.random() * 1.5 + 's'
    el.style.animationDuration = (2 + Math.random() * 2) + 's'
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 4500)
  }
}

function answer(btn, isCorrect) {
  const card    = btn.closest('.quiz-card')
  const allBtns = card.querySelectorAll('.quiz-option')
  if (allBtns[0].disabled) return

  allBtns.forEach(b => b.disabled = true)
  btn.classList.add(isCorrect ? 'correct' : 'wrong')

  if (!isCorrect) {
    allBtns.forEach(b => { if (b.onclick.toString().includes('true')) b.classList.add('correct') })
    streak = 0
    card.classList.add('answered-wrong')
  } else {
    score++; streak++
    card.classList.add('answered-correct')
    floatPunten(btn)
    if (streak >= 2) showStreak(streak)
  }
  card.querySelector('.quiz-answer-reveal').style.display = 'block'

  beantwoord++
  document.getElementById('quiz-progress-fill').style.width = Math.round(beantwoord / TOTAAL * 100) + '%'
  document.getElementById('quiz-progress-count').textContent = beantwoord

  if (beantwoord === TOTAAL) setTimeout(toonResultaat, 700)
}

async function toonResultaat() {
  const el = document.getElementById('resultaat')
  el.style.display = 'block'
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })

  let icon, titel, kleur, sterren
  if (score === TOTAAL)      { icon = '🏆'; titel = 'Uitstekend!';   kleur = '#86efac'; sterren = '⭐⭐⭐⭐'; launchConfetti() }
  else if (score >= 3)       { icon = '🎉'; titel = 'Goed gedaan!';  kleur = '#fbbf24'; sterren = '⭐⭐⭐' }
  else if (score >= 2)       { icon = '👍'; titel = 'Kan beter!';    kleur = '#fb923c'; sterren = '⭐⭐' }
  else                       { icon = '💪'; titel = 'Oefenen maar!'; kleur = '#fca5a5'; sterren = '⭐' }

  document.getElementById('resultaat-icon').textContent   = icon
  document.getElementById('resultaat-titel').style.color = kleur
  document.getElementById('resultaat-titel').textContent = titel
  document.getElementById('result-sterren').textContent  = sterren
  document.getElementById('resultaat-tekst').textContent = `${score} van de ${TOTAAL} vragen goed`
  document.getElementById('resultaat-punten').textContent = `+${score * 100} punten!`

  try {
    const speler = await laadSpeler()
    if (!speler) return
    const quizResultaten = speler.quizResultaten || {}
    quizResultaten[LOCATIE_ID] = { score, totaal: TOTAAL, gespeeldOp: new Date().toISOString() }
    const voltooid = [...new Set([...(speler.completedLocations || []), LOCATIE_ID])]
    await slaVoortgangOp({
      quizResultaten,
      punten:             (speler.punten || 0) + score * 100,
      completedLocations: voltooid,
    })
    document.getElementById('player-points').textContent = ((speler.punten || 0) + score * 100) + ' punten'
  } catch (e) { console.error(e) }
}
