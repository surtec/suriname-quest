const API_URL = '/api'
let modus = 'login'

function getToken()     { return localStorage.getItem('token') }
function getGebruiker() { const g = localStorage.getItem('gebruiker'); if (!g || g === 'undefined') return null; try { return JSON.parse(g) } catch { return null } }

function logUit() {
  localStorage.removeItem('token')
  localStorage.removeItem('gebruiker')
  toonLogin()
}

async function toonMenu() {
  document.getElementById('login-sectie').style.display = 'none'
  document.getElementById('menu-sectie').style.display  = 'block'

  const g = getGebruiker()
  if (g) document.getElementById('menu-naam').textContent = `Welkom terug, ${g.naam}! 👋`

  try {
    const res = await fetch(`${API_URL}/speler/${g.uid}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    if (res.ok) {
      const speler = await res.json()
      document.getElementById('menu-stats').textContent =
        `${speler.punten} punten · ${speler.completedLocations.length} van 5 locaties voltooid`
    } else {
      document.getElementById('menu-stats').textContent = ''
    }
  } catch {
    document.getElementById('menu-stats').textContent = ''
  }
}

function toonLogin() {
  document.getElementById('login-sectie').style.display = 'block'
  document.getElementById('menu-sectie').style.display  = 'none'
}

localStorage.removeItem('token')
localStorage.removeItem('gebruiker')

function verderSpelen() {
  window.location.href = '/map.html'
}

function nieuwSpel() {
  document.getElementById('bevestig-overlay').classList.add('actief')
}

function sluitOverlay() {
  document.getElementById('bevestig-overlay').classList.remove('actief')
}

async function bevestigNieuwSpel() {
  sluitOverlay()
  const g = getGebruiker()
  if (!g) return
  try {
    await fetch(`${API_URL}/speler/${g.uid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        punten: 0,
        level: 1,
        locatiesBezoekt: [],
        collectibles: [],
        quizResultaten: {},
        badges: [],
        completedLocations: []
      })
    })
  } catch { /* doorgaan ook als het mislukt */ }
  window.location.href = '/map.html'
}

function wisselModus() {
  modus = modus === 'login' ? 'register' : 'login'
  const naamVeld   = document.getElementById('naam-veld')
  const submitKnop = document.getElementById('submit-knop')
  const wisselKnop = document.querySelector('.knop-secundair')

  if (modus === 'register') {
    naamVeld.classList.add('zichtbaar')
    submitKnop.textContent = 'Account aanmaken ✨'
    wisselKnop.textContent = '← Terug naar inloggen'
  } else {
    naamVeld.classList.remove('zichtbaar')
    submitKnop.textContent = 'Spelen! 🚀'
    wisselKnop.textContent = 'Nieuw account aanmaken →'
  }
  document.getElementById('fout-bericht').textContent = ''
}

async function submitForm() {
  const email      = document.getElementById('email').value.trim()
  const wachtwoord = document.getElementById('wachtwoord').value
  const foutEl     = document.getElementById('fout-bericht')
  const knop       = document.getElementById('submit-knop')

  foutEl.textContent = ''
  knop.disabled = true
  knop.textContent = 'Even wachten...'

  try {
    let res, data
    if (modus === 'login') {
      res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, wachtwoord })
      })
    } else {
      const naam = document.getElementById('naam').value.trim()
      if (!naam) {
        foutEl.textContent = 'Wat is jouw naam?'
        knop.disabled = false
        knop.textContent = 'Account aanmaken ✨'
        return
      }
      res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naam, email, wachtwoord })
      })
    }

    data = await res.json()
    if (!res.ok) throw new Error(data.fout || 'Er ging iets fout.')

    localStorage.setItem('token', data.token)
    localStorage.setItem('gebruiker', JSON.stringify(data.gebruiker))
    toonMenu()
  } catch (err) {
    foutEl.textContent = err.message
    knop.disabled = false
    knop.textContent = modus === 'login' ? 'Spelen! 🚀' : 'Account aanmaken ✨'
  }
}

document.addEventListener('keydown', e => { if (e.key === 'Enter') submitForm() })
