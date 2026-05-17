import express from 'express'
import db from '../db.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// GET /api/speler/:uid
router.get('/:uid', verifyToken, async (req, res) => {
  const { uid } = req.params
  if (req.gebruiker.uid !== uid) {
    return res.status(403).json({ fout: 'Geen toegang' })
  }
  try {
    const [rows] = await db.execute(
      `SELECT uid, naam, email, punten, level, avatar,
              locaties_bezoekt, collectibles, quiz_resultaten, badges, completed_locations
       FROM spelers WHERE uid = ?`,
      [uid]
    )
    if (rows.length === 0) return res.status(404).json({ fout: 'Speler niet gevonden' })

    const r = rows[0]
    res.json({
      uid:               r.uid,
      naam:              r.naam,
      email:             r.email,
      punten:            r.punten,
      level:             r.level,
      avatar:            r.avatar,
      locatiesBezoekt:   JSON.parse(r.locaties_bezoekt   || '[]'),
      collectibles:      JSON.parse(r.collectibles        || '[]'),
      quizResultaten:    JSON.parse(r.quiz_resultaten     || '{}'),
      badges:            JSON.parse(r.badges              || '[]'),
      completedLocations:JSON.parse(r.completed_locations || '[]'),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ fout: 'Serverprobleem.' })
  }
})

// PUT /api/speler/:uid
router.put('/:uid', verifyToken, async (req, res) => {
  const { uid } = req.params
  if (req.gebruiker.uid !== uid) {
    return res.status(403).json({ fout: 'Geen toegang' })
  }
  const { punten, level, avatar, locatiesBezoekt, collectibles, quizResultaten, badges, completedLocations } = req.body
  try {
    await db.execute(
      `UPDATE spelers SET
        punten              = COALESCE(?, punten),
        level               = COALESCE(?, level),
        avatar              = COALESCE(?, avatar),
        locaties_bezoekt    = COALESCE(?, locaties_bezoekt),
        collectibles        = COALESCE(?, collectibles),
        quiz_resultaten     = COALESCE(?, quiz_resultaten),
        badges              = COALESCE(?, badges),
        completed_locations = COALESCE(?, completed_locations)
      WHERE uid = ?`,
      [
        punten            ?? null,
        level             ?? null,
        avatar            ?? null,
        locatiesBezoekt   != null ? JSON.stringify(locatiesBezoekt)   : null,
        collectibles      != null ? JSON.stringify(collectibles)       : null,
        quizResultaten    != null ? JSON.stringify(quizResultaten)     : null,
        badges            != null ? JSON.stringify(badges)             : null,
        completedLocations!= null ? JSON.stringify(completedLocations) : null,
        uid,
      ]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ fout: 'Serverprobleem.' })
  }
})

export default router
