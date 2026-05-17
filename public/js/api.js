const API_URL = 'http://localhost:3001/api'

function getToken()     { return localStorage.getItem('token') }
function getGebruiker() { const g = localStorage.getItem('gebruiker'); return g ? JSON.parse(g) : null }

function checkAuth() {
  if (!getToken() || !getGebruiker()) window.location.href = '/index.html'
}

function logUit() {
  localStorage.removeItem('token')
  localStorage.removeItem('gebruiker')
  window.location.href = '/index.html'
}

async function laadSpeler() {
  const g = getGebruiker()
  if (!g) return null
  const res = await fetch(`${API_URL}/speler/${g.uid}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  })
  if (!res.ok) return null
  return res.json()
}

async function slaVoortgangOp(data) {
  const g = getGebruiker()
  if (!g) return
  await fetch(`${API_URL}/speler/${g.uid}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  })
}

async function toonSpelerBalk() {
  const g = getGebruiker()
  if (!g) return
  const nameEl   = document.getElementById('player-name')
  const pointsEl = document.getElementById('player-points')
  if (nameEl)   nameEl.textContent   = g.naam
  if (pointsEl) pointsEl.textContent = '...'
  const speler = await laadSpeler()
  if (speler && pointsEl) pointsEl.textContent = speler.punten + ' punten'
}
