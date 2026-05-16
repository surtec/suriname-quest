import { API_URL } from './config.js'
import { getToken } from './auth.js'

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  }
}

export async function laadVoortgang(userId) {
  const res = await fetch(`${API_URL}/speler/${userId}`, {
    headers: authHeaders(),
  })
  if (!res.ok) return null
  return res.json()
}

export async function slaVoortgangOp(userId, data) {
  await fetch(`${API_URL}/speler/${userId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
}

export async function voegCollectibleToe(userId, collectibleId) {
  const speler = await laadVoortgang(userId)
  if (!speler) return
  const nieuweLijst = [...new Set([...speler.collectibles, collectibleId])]
  await slaVoortgangOp(userId, {
    collectibles: nieuweLijst,
    punten: (speler.punten || 0) + 50,
  })
}

export async function slaQuizResultaatOp(userId, locatieId, score, sterren) {
  const speler = await laadVoortgang(userId)
  if (!speler) return
  const quizResultaten = speler.quizResultaten || {}
  quizResultaten[locatieId] = { score, sterren, gespeeldOp: new Date().toISOString() }
  const puntBonus = sterren * 100
  await slaVoortgangOp(userId, {
    quizResultaten,
    punten: (speler.punten || 0) + puntBonus,
  })
}
