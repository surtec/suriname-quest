// src/game/PhaserGame.jsx
// Koppelt Phaser game aan React

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import BootScene     from './scenes/BootScene.js'
import WorldScene    from './scenes/WorldScene.js'
import LocationScene from './scenes/LocationScene.js'
import QuizScene     from './scenes/QuizScene.js'

// Phaser game configuratie
const gameConfig = {
  type:   Phaser.AUTO,   // Kies automatisch WebGL of Canvas
  width:  960,
  height: 560,
  backgroundColor: '#0d1b12',
  physics: {
    default: 'arcade',
    arcade:  { gravity: { y: 0 }, debug: false },
  },
  scene: [BootScene, WorldScene, LocationScene, QuizScene],
  scale: {
    mode:       Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // Mooie pixelart rendering (uitzetten voor waterverf stijl)
  pixelArt:     false,
  antialias:    true,
  roundPixels:  false,
}

export default function PhaserGame({ spelerData, onPuntenUpdate, onQuizGedaan }) {
  const gameRef     = useRef(null)
  const phaserRef   = useRef(null)

  useEffect(() => {
    if (phaserRef.current) return // Al aangemaakt

    // Maak Phaser game aan
    const game = new Phaser.Game({
      ...gameConfig,
      parent: gameRef.current,
    })

    // Start met spelerdata
    game.events.once('ready', () => {
      game.scene.start('BootScene')
    })

    // Luister naar HUD updates vanuit Phaser scenes
    game.events.on('hud-update', data => {
      onPuntenUpdate?.(data)
    })

    game.events.on('item-gevonden', ({ punten }) => {
      onPuntenUpdate?.({ punten })
    })

    game.events.on('sla-quiz-op', async ({ locatieId, score, sterren, speler }) => {
      onQuizGedaan?.({ locatieId, score, sterren, speler })
    })

    phaserRef.current = game

    return () => {
      game.destroy(true)
      phaserRef.current = null
    }
  }, [])

  // Als spelerdata verandert, stuur door naar actieve scene
  useEffect(() => {
    if (!phaserRef.current || !spelerData) return
    const game = phaserRef.current
    const actief = game.scene.getScenes(true)[0]
    if (actief) actief.spelerData = spelerData
  }, [spelerData])

  return (
    <div
      ref={gameRef}
      style={{
        width:  '100%',
        maxWidth: '960px',
        position: 'relative',
      }}
    />
  )
}
