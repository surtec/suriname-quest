// src/firebase/auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from './config'
import { maakNieuwSpelerProfiel } from './database'

// Account aanmaken
export async function registreer(naam, email, wachtwoord) {
  const result = await createUserWithEmailAndPassword(auth, email, wachtwoord)
  // Sla naam op in Firebase Auth
  await updateProfile(result.user, { displayName: naam })
  // Maak nieuw speler profiel in Firestore
  await maakNieuwSpelerProfiel(result.user.uid, naam, email)
  return result.user
}

// Inloggen
export async function logIn(email, wachtwoord) {
  const result = await signInWithEmailAndPassword(auth, email, wachtwoord)
  return result.user
}

// Uitloggen
export async function logUit() {
  await signOut(auth)
}
