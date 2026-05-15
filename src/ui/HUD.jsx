// src/ui/HUD.jsx
import { useState } from 'react'
import { LOCATIONS } from '../game/data/locations.js'

const TOTAL = LOCATIONS.length

export default function HUD({ speler, zichtbaar }) {
  const [gedempt, setGedempt] = useState(false)

  if (!zichtbaar || !speler) return null

  const toggleMute = () => {
    const nieuw = !gedempt
    setGedempt(nieuw)
    window.dispatchEvent(new CustomEvent('suriquest-mute', { detail: { gedempt: nieuw } }))
  }

  const completed    = (speler.completedLocations || []).length
  const level        = speler.level || 1
  const xpNaarVolgend = level * 300
  const xpHuidig     = Math.min((speler.punten || 0) % xpNaarVolgend, xpNaarVolgend)
  const xpPct        = Math.round((xpHuidig / xpNaarVolgend) * 100)
  const punten       = speler.punten || 0

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      pointerEvents: 'none', zIndex: 10,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        height: '64px',
        background: 'linear-gradient(180deg, #0A1E50 0%, #071440 100%)',
        borderBottom: '3px solid #F4C430',
        gap: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
      }}>

        {/* ── Avatar + Level ── */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width="52" height="52" style={{ position: 'absolute', top: 0, left: 0 }}>
            <circle cx="26" cy="26" r="23" fill="none" stroke="rgba(244,196,48,0.20)" strokeWidth="3"/>
            <circle cx="26" cy="26" r="23" fill="none"
              stroke="#F4C430" strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 23}`}
              strokeDashoffset={`${2 * Math.PI * 23 * (1 - xpPct / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 26 26)"
            />
          </svg>
          <div style={{
            width: '52px', height: '52px',
            background: 'radial-gradient(circle at 35% 35%, #C8905A, #5B3010)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px',
          }}>🦸</div>
          <div style={{
            position: 'absolute', bottom: -2, right: -4,
            background: 'linear-gradient(135deg, #FFE040, #F4A010)',
            borderRadius: '6px',
            border: '2px solid #0A1E50',
            padding: '0 5px',
            fontFamily: "'Fredoka One', cursive",
            fontSize: '12px',
            color: '#3A2000',
            lineHeight: '16px',
          }}>{level}</div>
        </div>

        {/* ── Naam + XP balk ── */}
        <div style={{ minWidth: 0, flex: '0 0 auto', width: '140px' }}>
          <div style={{
            fontFamily: "'Fredoka One', cursive",
            fontSize: '15px',
            color: '#F4C430',
            textShadow: '1px 1px 0 #000, 0 0 8px rgba(244,196,48,0.4)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            marginBottom: '2px',
          }}>{speler.naam || 'Speler'}</div>
          {/* XP balk */}
          <div style={{
            height: '8px',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            marginBottom: '2px',
          }}>
            <div style={{
              height: '100%',
              width: `${xpPct}%`,
              background: 'linear-gradient(90deg, #40B0FF, #1060D0)',
              boxShadow: '0 0 6px rgba(64,176,255,0.7)',
              transition: 'width 0.5s ease',
            }}/>
          </div>
          <div style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: '9px',
            color: 'rgba(64,176,255,0.7)',
          }}>XP → LV{level + 1}</div>
        </div>

        {/* ── Locatie harten ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: TOTAL }).map((_, i) => (
              <span key={i} style={{
                fontSize: '16px',
                filter: i < completed ? 'drop-shadow(0 0 4px #F4C430)' : 'grayscale(1) opacity(0.35)',
                transition: 'filter 0.3s ease',
              }}>⭐</span>
            ))}
          </div>
          <div style={{
            fontFamily: "'Fredoka One', cursive",
            fontSize: '10px',
            color: completed === TOTAL ? '#F4C430' : 'rgba(255,255,255,0.5)',
            letterSpacing: '0.5px',
          }}>{completed === TOTAL ? '🏆 VOLTOOID!' : `${completed} / ${TOTAL} locaties`}</div>
        </div>

        {/* ── Score ── */}
        <div style={{
          flexShrink: 0,
          textAlign: 'center',
          background: 'rgba(0,0,0,0.4)',
          border: '2px solid #F4C430',
          borderRadius: '10px',
          padding: '4px 14px',
          boxShadow: '0 0 10px rgba(244,196,48,0.25), inset 0 0 10px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: '8px',
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}>SCORE</div>
          <div style={{
            fontFamily: "'Fredoka One', cursive",
            fontSize: '26px',
            color: '#F4C430',
            lineHeight: 1,
            textShadow: '0 0 10px rgba(244,196,48,0.6), 2px 2px 0 #000',
          }}>{punten.toString().padStart(5, '0')}</div>
        </div>

        {/* ── Mute knop ── */}
        <button
          onClick={toggleMute}
          style={{
            pointerEvents: 'auto',
            background: gedempt ? 'rgba(180,30,30,0.7)' : 'rgba(10,40,80,0.7)',
            border: `2px solid ${gedempt ? '#FF5050' : '#40AAFF'}`,
            borderRadius: '8px',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0, flexShrink: 0,
          }}
          title={gedempt ? 'Geluid aan' : 'Geluid uit'}
        >
          {gedempt ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  )
}
