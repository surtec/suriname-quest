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

  const completed = (speler.completedLocations || []).length
  const voortgang = Math.round((completed / TOTAL) * 100)
  const level     = speler.level || 1
  const xpNaarVolgend = level * 300
  const xpHuidig  = Math.min((speler.punten || 0) % xpNaarVolgend, xpNaarVolgend)
  const xpPct     = Math.round((xpHuidig / xpNaarVolgend) * 100)

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      pointerEvents: 'none', zIndex: 10,
    }}>
      {/* ── Hoofd HUD balk ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        height: '68px',
        background: 'linear-gradient(180deg, rgba(5,18,10,0.96) 0%, rgba(8,24,14,0.88) 100%)',
        borderBottom: '2px solid rgba(244,196,48,0.35)',
        gap: '10px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.55)',
      }}>

        {/* ── Avatar + Level ring ── */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {/* Level ring (SVG) */}
          <svg width="58" height="58" style={{ position: 'absolute', top: 0, left: 0 }}>
            <circle cx="29" cy="29" r="26" fill="none" stroke="rgba(244,196,48,0.18)" strokeWidth="3.5"/>
            <circle cx="29" cy="29" r="26" fill="none"
              stroke="#f4c430" strokeWidth="3.5"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - xpPct / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 29 29)"
            />
          </svg>
          {/* Avatar cirkel */}
          <div style={{
            width: '58px', height: '58px',
            background: 'linear-gradient(145deg, #9B7050, #5B3010)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px',
          }}>🦸</div>
          {/* Level badge */}
          <div style={{
            position: 'absolute', bottom: -4, right: -4,
            background: 'linear-gradient(145deg, #f4d03f, #e6960e)',
            borderRadius: '8px',
            border: '1.5px solid rgba(0,0,0,0.5)',
            padding: '1px 5px',
            fontFamily: "'Fredoka One', cursive",
            fontSize: '13px',
            color: '#5a3000',
            lineHeight: 1.2,
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          }}>{level}</div>
        </div>

        {/* ── Naam + Voortgangsbalk ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '3px' }}>
            <span style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: '16px',
              color: '#f4c430',
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
              whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis',
              maxWidth: '130px',
            }}>{speler.naam || 'Speler'}</span>
            <span style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: '10px',
              color: 'rgba(126,201,143,0.75)',
            }}>Verkenner</span>
          </div>

          {/* XP-balk */}
          <div style={{ marginBottom: '5px' }}>
            <div style={{
              height: '6px',
              background: 'rgba(255,255,255,0.10)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${xpPct}%`,
                background: 'linear-gradient(90deg, #7ec98f, #4aaa6a)',
                borderRadius: '3px',
                transition: 'width 0.5s ease',
              }}/>
            </div>
            <div style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: '9px',
              color: 'rgba(126,201,143,0.55)',
              marginTop: '1px',
            }}>XP naar level {level + 1}</div>
          </div>

          {/* Locaties voortgang */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{
              height: '5px',
              flex: 1,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${voortgang}%`,
                background: 'linear-gradient(90deg, #f4c430, #e8a010)',
                borderRadius: '3px',
                transition: 'width 0.5s ease',
              }}/>
            </div>
            <span style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: '11px',
              color: '#f4c430',
              flexShrink: 0,
            }}>{completed}/{TOTAL}</span>
          </div>
        </div>

        {/* ── Score pill ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0,0,0,0.45)',
          border: '1.5px solid rgba(244,196,48,0.30)',
          borderRadius: '24px',
          padding: '5px 14px',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '20px', lineHeight: 1 }}>⭐</span>
          <div>
            <div style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: '22px',
              color: '#f4c430',
              lineHeight: 1,
              textShadow: '0 1px 6px rgba(244,196,48,0.45)',
            }}>{speler.punten || 0}</div>
            <div style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: '9px',
              color: 'rgba(255,255,255,0.38)',
              textAlign: 'center',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>punten</div>
          </div>
        </div>

        {/* ── Geluid knop ── */}
        <button
          onClick={toggleMute}
          style={{
            pointerEvents: 'auto',
            background: gedempt ? 'rgba(180,30,30,0.55)' : 'rgba(20,60,36,0.55)',
            border: `1.5px solid ${gedempt ? 'rgba(255,80,80,0.45)' : 'rgba(126,201,143,0.40)'}`,
            borderRadius: '10px',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            width: '38px', height: '38px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0, flexShrink: 0,
            transition: 'background 0.2s',
          }}
          title={gedempt ? 'Geluid aan' : 'Geluid uit'}
        >
          {gedempt ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  )
}
