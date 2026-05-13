// src/ui/HUD.jsx
// In-game HUD overlay (bovenop het Phaser canvas)

import { useState } from 'react'

export default function HUD({ speler, zichtbaar }) {
  const [gedempt, setGedempt] = useState(false)

  if (!zichtbaar || !speler) return null

  const toggleMute = () => {
    const nieuw = !gedempt
    setGedempt(nieuw)
    window.dispatchEvent(new CustomEvent('suriquest-mute', { detail: { gedempt: nieuw } }))
  }

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      pointerEvents: 'none', zIndex: 10,
    }}>
      {/* ── Glazen HUD-balk bovenaan ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        background: 'linear-gradient(180deg, rgba(10,30,18,0.82) 0%, rgba(10,30,18,0.55) 100%)',
        backdropFilter: 'blur(6px)',
        borderBottom: '1px solid rgba(244,196,48,0.20)',
        gap: '12px',
      }}>

        {/* Links: Level badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '120px',
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #f4d03f, #e6960e)',
            borderRadius: '10px',
            border: '2px solid rgba(255,255,255,0.25)',
            boxShadow: '0 2px 10px rgba(244,196,48,0.40)',
            padding: '4px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            lineHeight: 1,
          }}>
            <span style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: '9px',
              color: '#7a4a00',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>Level</span>
            <span style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: '26px',
              color: '#7a4a00',
              lineHeight: 1,
            }}>{speler.level || 1}</span>
          </div>

          {/* Speler naam */}
          <div>
            <div style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: '15px',
              color: '#f4c430',
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
              lineHeight: 1,
            }}>{speler.naam || 'Speler'}</div>
            <div style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: '10px',
              color: 'rgba(126,201,143,0.85)',
            }}>Verkenner</div>
          </div>
        </div>

        {/* Midden: Punten */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid rgba(244,196,48,0.25)',
          borderRadius: '30px',
          padding: '6px 18px',
        }}>
          <span style={{ fontSize: '22px', lineHeight: 1 }}>⭐</span>
          <div>
            <div style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: '24px',
              color: '#f4c430',
              lineHeight: 1,
              textShadow: '0 1px 6px rgba(244,196,48,0.5)',
            }}>{speler.punten || 0}</div>
            <div style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: '9px',
              color: 'rgba(255,255,255,0.45)',
              textAlign: 'center',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>punten</div>
          </div>
        </div>

        {/* Rechts: Avatar + geluid knop */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          minWidth: '120px',
          justifyContent: 'flex-end',
        }}>
          {/* Geluid knop */}
          <button
            onClick={toggleMute}
            style={{
              pointerEvents: 'auto',
              background: gedempt
                ? 'rgba(200,40,40,0.55)'
                : 'rgba(30,80,50,0.55)',
              border: `1.5px solid ${gedempt ? 'rgba(255,100,100,0.5)' : 'rgba(126,201,143,0.45)'}`,
              borderRadius: '10px',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              width: '40px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              transition: 'background 0.2s, border-color 0.2s',
              backdropFilter: 'blur(4px)',
            }}
            title={gedempt ? 'Geluid aan' : 'Geluid uit'}
          >
            {gedempt ? '🔇' : '🔊'}
          </button>

          {/* Avatar */}
          <div style={{
            width: '52px',
            height: '52px',
            background: 'linear-gradient(145deg, #9B7050, #6B3E20)',
            borderRadius: '50%',
            border: '2.5px solid rgba(244,208,63,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            boxShadow: '0 3px 10px rgba(0,0,0,0.45)',
            flexShrink: 0,
          }}>
            🦸
          </div>
        </div>
      </div>
    </div>
  )
}
