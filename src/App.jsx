// src/App.jsx
// Hoofd app — beheert auth state en schakelt tussen Login en Game

import { useState, useEffect } from 'react'
import { getOpgeslagenGebruiker, logUit } from './api/auth.js'
import { laadVoortgang, slaVoortgangOp, slaQuizResultaatOp } from './api/database.js'
import Login    from './ui/Login.jsx'
import HUD      from './ui/HUD.jsx'
import PhaserGame from './game/PhaserGame.jsx'

export default function App() {
  const [gebruiker, setGebruiker]   = useState(null)
  const [spelerData, setSpelerData] = useState(null)
  const [laadStatus, setLaadStatus] = useState('laden') // 'laden' | 'login' | 'spel'
  const [inGame, setInGame]         = useState(false)

  // Controleer bij opstarten of er een opgeslagen sessie is
  useEffect(() => {
    async function checkSessie() {
      const opgeslagen = getOpgeslagenGebruiker()
      if (opgeslagen) {
        const data = await laadVoortgang(opgeslagen.uid)
        if (data) {
          setGebruiker(opgeslagen)
          setSpelerData(data)
          setLaadStatus('spel')
          setInGame(true)
          return
        }
      }
      logUit()
      setLaadStatus('login')
    }
    checkSessie()
  }, [])

  async function handleIngelogd(user) {
    const data = await laadVoortgang(user.uid)
    setGebruiker(user)
    setSpelerData(data || {
      naam: user.naam || 'Speler',
      punten: 0, level: 1,
      collectibles: [],
      quizResultaten: {},
      badges: [],
    })
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
      await slaVoortgangOp(gebruiker.uid, {
        completedLocations: speler.completedLocations || [],
        punten: speler.punten || 0,
        level:  speler.level  || 1,
      })
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
        background: 'linear-gradient(160deg, #050E28 0%, #0A1E48 50%, #050E28 100%)',
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
      background: 'linear-gradient(160deg, #040C20 0%, #080E28 50%, #040C20 100%)',
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
        boxShadow: '0 8px 40px rgba(0,0,0,0.8), 0 0 0 2px rgba(244,196,48,0.40), 0 0 40px rgba(64,170,255,0.12)',
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
