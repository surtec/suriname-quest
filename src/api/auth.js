import { API_URL } from './config.js'

export async function registreer(naam, email, wachtwoord) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ naam, email, wachtwoord }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.fout || 'Registratie mislukt')
  localStorage.setItem('token', data.token)
  localStorage.setItem('gebruiker', JSON.stringify(data.gebruiker))
  return data.gebruiker
}

export async function logIn(email, wachtwoord) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, wachtwoord }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.fout || 'Inloggen mislukt')
  localStorage.setItem('token', data.token)
  localStorage.setItem('gebruiker', JSON.stringify(data.gebruiker))
  return data.gebruiker
}

export function logUit() {
  localStorage.removeItem('token')
  localStorage.removeItem('gebruiker')
}

export function getToken() {
  return localStorage.getItem('token')
}

export function getOpgeslagenGebruiker() {
  const g = localStorage.getItem('gebruiker')
  return g ? JSON.parse(g) : null
}
