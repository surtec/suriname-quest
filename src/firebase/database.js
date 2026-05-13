// src/firebase/database.js
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from './config'

// Maak nieuw speler profiel aan bij registratie
export async function maakNieuwSpelerProfiel(userId, naam, email) {
  await setDoc(doc(db, 'spelers', userId), {
    naam,
    email,
    punten:             0,
    level:              1,
    avatar:             'karakter_1',
    locatiesBezoekt:    [],
    collectibles:       [],
    quizResultaten:     {},
    badges:             [],
    aangemeldOp:        new Date().toISOString(),
  })
}

// Laad voortgang van speler
export async function laadVoortgang(userId) {
  const snap = await getDoc(doc(db, 'spelers', userId))
  if (snap.exists()) return snap.data()
  return null
}

// Sla voortgang op (merge = overschrijft alleen de meegegeven velden)
export async function slaVoortgangOp(userId, data) {
  await setDoc(doc(db, 'spelers', userId), data, { merge: true })
}

// Voeg een collectible toe
export async function voegCollectibleToe(userId, collectibleId) {
  const speler = await laadVoortgang(userId)
  if (!speler) return
  const nieuweLijst = [...new Set([...speler.collectibles, collectibleId])]
  await updateDoc(doc(db, 'spelers', userId), {
    collectibles: nieuweLijst,
    punten:       (speler.punten || 0) + 50,
  })
}

// Sla quiz resultaat op
export async function slaQuizResultaatOp(userId, locatieId, score, sterren) {
  const speler = await laadVoortgang(userId)
  if (!speler) return
  const quizResultaten = speler.quizResultaten || {}
  quizResultaten[locatieId] = { score, sterren, gespeeldOp: new Date().toISOString() }
  const puntBonus = sterren * 100
  await updateDoc(doc(db, 'spelers', userId), {
    quizResultaten,
    punten: (speler.punten || 0) + puntBonus,
  })
}
