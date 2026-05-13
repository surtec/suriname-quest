// src/ui/Login.jsx
// Login en registratie scherm

import { useState } from 'react'
import { logIn, registreer } from '../firebase/auth.js'

const stijl = {
  wrapper: {
    width: '100%', maxWidth: '420px', margin: '0 auto',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '2rem 1rem',
  },
  logo: {
    fontFamily: "'Fredoka One', cursive",
    fontSize: '52px', color: '#f4c430',
    textShadow: '3px 3px 0 #8B4513, 0 0 30px rgba(244,196,48,0.3)',
    textAlign: 'center', lineHeight: 1.1,
  },
  subTitel: {
    fontSize: '13px', color: '#7ec98f',
    letterSpacing: '3px', textTransform: 'uppercase',
    marginTop: '4px', textAlign: 'center',
    fontFamily: "'Nunito', sans-serif",
  },
  kaart: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '16px', padding: '1.5rem',
    width: '100%', marginTop: '1.5rem',
  },
  input: {
    width: '100%', padding: '11px 14px',
    borderRadius: '10px',
    border: '1.5px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff', fontFamily: "'Nunito', sans-serif",
    fontSize: '14px', marginBottom: '10px', outline: 'none',
  },
  knopPrimair: {
    width: '100%', padding: '13px',
    background: '#f4c430', border: 'none',
    borderRadius: '10px',
    fontFamily: "'Fredoka One', cursive",
    fontSize: '20px', color: '#1a3a00',
    cursor: 'pointer', marginTop: '4px',
    transition: 'transform 0.1s',
  },
  knopSecundair: {
    width: '100%', padding: '10px',
    background: 'transparent',
    border: '1.5px solid rgba(255,255,255,0.3)',
    borderRadius: '10px',
    fontFamily: "'Nunito', sans-serif",
    fontSize: '14px', color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer', marginTop: '8px',
  },
  fout: {
    color: '#e24b4a', fontSize: '13px',
    textAlign: 'center', marginTop: '8px',
    fontFamily: "'Nunito', sans-serif",
  },
}

export default function Login({ onIngelogd }) {
  const [modus, setModus]         = useState('login')  // 'login' | 'register'
  const [naam, setNaam]           = useState('')
  const [email, setEmail]         = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [laden, setLaden]         = useState(false)
  const [fout, setFout]           = useState('')

  async function handleInloggen(e) {
    e.preventDefault()
    setLaden(true)
    setFout('')
    try {
      const gebruiker = await logIn(email, wachtwoord)
      onIngelogd(gebruiker)
    } catch (err) {
      setFout(foutVertaling(err.code))
    } finally {
      setLaden(false)
    }
  }

  async function handleRegistreren(e) {
    e.preventDefault()
    if (!naam.trim()) { setFout('Wat is jouw naam?'); return }
    setLaden(true)
    setFout('')
    try {
      const gebruiker = await registreer(naam, email, wachtwoord)
      onIngelogd(gebruiker)
    } catch (err) {
      setFout(foutVertaling(err.code))
    } finally {
      setLaden(false)
    }
  }

  function foutVertaling(code) {
    switch (code) {
      case 'auth/user-not-found':      return 'Dit account bestaat niet. Maak een nieuw account aan!'
      case 'auth/wrong-password':      return 'Verkeerd wachtwoord. Probeer opnieuw!'
      case 'auth/email-already-in-use':return 'Dit e-mailadres is al in gebruik.'
      case 'auth/weak-password':       return 'Wachtwoord moet minstens 6 tekens zijn.'
      case 'auth/invalid-email':       return 'Ongeldig e-mailadres.'
      default:                          return 'Er ging iets fout. Probeer opnieuw.'
    }
  }

  return (
    <div style={stijl.wrapper}>
      {/* Zwevende decoratie */}
      <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '8px' }}>🌴</div>

      <div style={stijl.logo}>SuriQuest<br />2060</div>
      <div style={stijl.subTitel}>Ontdek Surinaamse Geschiedenis</div>

      <div style={stijl.kaart}>
        <form onSubmit={modus === 'login' ? handleInloggen : handleRegistreren}>
          {modus === 'register' && (
            <input
              style={stijl.input}
              type="text"
              placeholder="Jouw naam (bijv. Sari)"
              value={naam}
              onChange={e => setNaam(e.target.value)}
              required
            />
          )}
          <input
            style={stijl.input}
            type="email"
            placeholder="E-mailadres"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            style={stijl.input}
            type="password"
            placeholder="Wachtwoord"
            value={wachtwoord}
            onChange={e => setWachtwoord(e.target.value)}
            required
          />
          <button type="submit" style={stijl.knopPrimair} disabled={laden}>
            {laden ? 'Even wachten...' : modus === 'login' ? 'Spelen! 🚀' : 'Account aanmaken ✨'}
          </button>
        </form>

        <button
          style={stijl.knopSecundair}
          onClick={() => { setModus(modus === 'login' ? 'register' : 'login'); setFout('') }}
        >
          {modus === 'login' ? 'Nieuw account aanmaken →' : '← Terug naar inloggen'}
        </button>

        {fout && <p style={stijl.fout}>{fout}</p>}
      </div>

      <p style={{ ...stijl.subTitel, marginTop: '12px', opacity: 0.5 }}>
        Je voortgang wordt opgeslagen ✨
      </p>
    </div>
  )
}
