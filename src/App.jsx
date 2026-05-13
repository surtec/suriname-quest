// src/App.jsx
// Hoofd app — beheert auth state en schakelt tussen Login en Game

import { useState, useEffect } from 'react'
import { onAuthStateChanged }  from 'firebase/auth'
import { auth }                from './firebase/config.js'
import { laadVoortgang, slaVoortgangOp, slaQuizResultaatOp } from './firebase/database.js'
import Login    from './ui/Login.jsx'
import HUD      from './ui/HUD.jsx'
import PhaserGame from './game/PhaserGame.jsx'

export default function App() {
  const [gebruiker, setGebruiker]   = useState(null)   // Firebase user
  const [spelerData, setSpelerData] = useState(null)   // Voortgang uit Firestore
  const [laadStatus, setLaadStatus] = useState('laden') // 'laden' | 'login' | 'spel'
  const [inGame, setInGame]         = useState(false)

  // Luister naar auth veranderingen
  useEffect(() => {
    const stop = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setGebruiker(user)
        // Laad voortgang uit Firestore
        const data = await laadVoortgang(user.uid)
        setSpelerData(data || {
          naam:        user.displayName || 'Speler',
          punten:      0, level: 1,
          collectibles: [],
          quizResultaten: {},
          badges: [],
        })
        setLaadStatus('spel')
        setInGame(true)
      } else {
        setGebruiker(null)
        setSpelerData(null)
        setLaadStatus('login')
        setInGame(false)
      }
    })
    return () => stop()
  }, [])

  async function handleIngelogd(user) {
    const data = await laadVoortgang(user.uid)
    setGebruiker(user)
    setSpelerData(data)
    setLaadStatus('spel')
    setInGame(true)
  }

  function handlePuntenUpdate(update) {
    setSpelerData(prev => {
      const nieuw = { ...prev, ...update }
      // Automatisch opslaan
      if (gebruiker) slaVoortgangOp(gebruiker.uid, nieuw)
      return nieuw
    })
  }

  async function handleQuizGedaan({ locatieId, score, sterren, speler }) {
    setSpelerData(speler)
    if (gebruiker) {
      await slaQuizResultaatOp(gebruiker.uid, locatieId, score, sterren)
    }
  }

  // ── LAADSCHERM ─────────────────────────────────────────────
  if (laadStatus === 'laden') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100vh', gap: '16px',
      }}>
        <div style={{
          fontFamily: "'Fredoka One', cursive",
          fontSize: '42px', color: '#f4c430',
          textShadow: '2px 2px 0 #8B4513',
        }}>SuriQuest 2060</div>
        <div style={{ color: '#7ec98f', fontFamily: "'Nunito', sans-serif", fontSize: '14px' }}>
          Even laden...
        </div>
      </div>
    )
  }

  // ── LOGIN SCHERM ───────────────────────────────────────────
  if (laadStatus === 'login') {
    return (
      <div style={{
        background: 'linear-gradient(160deg, #0d2818 0%, #1a4a2e 50%, #0d1b12 100%)',
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative',
      }}>
        {/* Drijvende decoratie */}
        {['🌿','⭐','🏛️','📜','🌺'].map((e, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${10 + i * 18}%`,
            top: `${20 + (i % 3) * 25}%`,
            fontSize: '24px', opacity: 0.2,
            animation: `floatUp ${8 + i}s infinite linear`,
            animationDelay: `${i * 1.5}s`,
          }}>{e}</div>
        ))}
        <Login onIngelogd={handleIngelogd} />
      </div>
    )
  }

  // ── GAME SCHERM ────────────────────────────────────────────
  return (
    <div style={{
      background: 'linear-gradient(160deg, #071410 0%, #0d2018 50%, #071410 100%)',
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      {/* Titel */}
      <div style={{
        fontFamily: "'Fredoka One', cursive",
        fontSize: '28px',
        color: '#f4c430',
        textShadow: '0 2px 8px rgba(244,196,48,0.4)',
        letterSpacing: '2px',
        marginBottom: '10px',
        userSelect: 'none',
      }}>
        🌿 SuriQuest 2060 🌿
      </div>

      {/* Game wrapper */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '960px',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 0 2px rgba(244,196,48,0.25)',
      }}>
        <PhaserGame
          spelerData={spelerData}
          onPuntenUpdate={handlePuntenUpdate}
          onQuizGedaan={handleQuizGedaan}
        />
        <HUD speler={spelerData} zichtbaar={inGame} />
      </div>
    </div>
  )
}
