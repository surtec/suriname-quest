// ────────────────────────────────────────────────────────────────
//  routes_genormaliseerd/speler.js
//  Aangepaste GET/PUT voor het genormaliseerde schema.
//
//  Belangrijk: de API-vorm blijft EXACT hetzelfde als de
//  originele versie, zodat de frontend (HTML/JS) onaangetast
//  blijft. We bouwen het oude object weer op uit de losse
//  tabellen (locaties, quiz_resultaten, badges, speler_badges,
//  collectibles).
// ────────────────────────────────────────────────────────────────
import express from 'express'
import db from '../db.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// ─── Hulpfunctie: speler-id (int) ophalen uit uid (uuid) ──────
async function spelerIdVanUid(uid) {
  const [rows] = await db.execute(
    'SELECT id FROM spelers WHERE uid = ?',
    [uid]
  )
  return rows.length ? rows[0].id : null
}

// ───────────────────────────────────────────────────────────────
//  GET /api/speler/:uid
//  Geeft hetzelfde object terug als de oude versie:
//    {
//      uid, naam, email, punten, level, avatar,
//      locatiesBezoekt:    [ 'fort_zeelandia', ... ],
//      collectibles:       [ { type, locatie, gevondenOp }, ... ],
//      quizResultaten:     { fort_zeelandia: { score, totaal, ... } },
//      badges:             [ 'eerste_stap', ... ],
//      completedLocations: [ 'fort_zeelandia', ... ],
//    }
// ───────────────────────────────────────────────────────────────
router.get('/:uid', verifyToken, async (req, res) => {
  const { uid } = req.params
  if (req.gebruiker.uid !== uid) {
    return res.status(403).json({ fout: 'Geen toegang' })
  }
  try {
    // 1) Basis-spelerdata
    const [spelers] = await db.execute(
      `SELECT id, uid, naam, email, punten, level, avatar
       FROM spelers WHERE uid = ?`,
      [uid]
    )
    if (spelers.length === 0) {
      return res.status(404).json({ fout: 'Speler niet gevonden' })
    }
    const s = spelers[0]

    // 2) Alle quiz-resultaten + locatie-code via JOIN
    const [qrRows] = await db.execute(
      `SELECT l.code AS locatie_code, qr.score, qr.sterren,
              qr.voltooid, qr.voltooid_op, qr.bijgewerkt
       FROM quiz_resultaten qr
       JOIN locaties l ON l.id = qr.locatie_id
       WHERE qr.speler_id = ?`,
      [s.id]
    )

    // Bouw het oude quizResultaten-object en completedLocations-array
    const quizResultaten = {}
    const completedLocations = []
    const locatiesBezoekt = []

    qrRows.forEach(r => {
      quizResultaten[r.locatie_code] = {
        score:     r.score,
        sterren:   r.sterren,
        gespeeldOp: r.bijgewerkt ? new Date(r.bijgewerkt).toISOString() : null,
      }
      locatiesBezoekt.push(r.locatie_code)
      if (r.voltooid) completedLocations.push(r.locatie_code)
    })

    // 3) Badges
    const [badgeRows] = await db.execute(
      `SELECT b.code
       FROM speler_badges sb
       JOIN badges b ON b.id = sb.badge_id
       WHERE sb.speler_id = ?`,
      [s.id]
    )
    const badges = badgeRows.map(b => b.code)

    // 4) Collectibles
    const [colRows] = await db.execute(
      `SELECT l.code AS locatie_code, c.type, c.gevonden_op
       FROM collectibles c
       JOIN locaties l ON l.id = c.locatie_id
       WHERE c.speler_id = ?`,
      [s.id]
    )
    const collectibles = colRows.map(c => ({
      type:       c.type,
      locatie:    c.locatie_code,
      gevondenOp: c.gevonden_op ? new Date(c.gevonden_op).toISOString() : null,
    }))

    res.json({
      uid:                s.uid,
      naam:               s.naam,
      email:              s.email,
      punten:             s.punten,
      level:              s.level,
      avatar:             s.avatar,
      locatiesBezoekt,
      collectibles,
      quizResultaten,
      badges,
      completedLocations,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ fout: 'Serverprobleem.' })
  }
})

// ───────────────────────────────────────────────────────────────
//  PUT /api/speler/:uid
//  Verwacht (alle velden optioneel):
//    {
//      punten, level, avatar,
//      locatiesBezoekt:    [...],
//      collectibles:       [...],
//      quizResultaten:     { code: { score, totaal, ... } },
//      badges:             [ code, ... ],
//      completedLocations: [ code, ... ],
//    }
//
//  Semantiek (zoals in de oude JSON-versie): elk veld dat wordt
//  meegestuurd, vervangt de huidige inhoud volledig.
// ───────────────────────────────────────────────────────────────
router.put('/:uid', verifyToken, async (req, res) => {
  const { uid } = req.params
  if (req.gebruiker.uid !== uid) {
    return res.status(403).json({ fout: 'Geen toegang' })
  }

  const {
    punten, level, avatar,
    locatiesBezoekt,  // (informatief — wordt afgeleid uit quiz_resultaten bij GET)
    collectibles,
    quizResultaten,
    badges,
    completedLocations,
  } = req.body

  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    const spelerId = await spelerIdVanUid(uid)
    if (!spelerId) {
      await conn.rollback()
      conn.release()
      return res.status(404).json({ fout: 'Speler niet gevonden' })
    }

    // ─── 1. Basisvelden in `spelers` ──────────────────────
    if (punten != null || level != null || avatar != null) {
      await conn.execute(
        `UPDATE spelers SET
           punten = COALESCE(?, punten),
           level  = COALESCE(?, level),
           avatar = COALESCE(?, avatar)
         WHERE id = ?`,
        [punten ?? null, level ?? null, avatar ?? null, spelerId]
      )
    }

    // ─── 2. Quiz-resultaten + voltooide locaties ──────────
    //   Als EEN van de twee velden is meegestuurd, behandelen
    //   we beide als waarheid. Dit matcht het oude JSON-gedrag.
    if (quizResultaten !== undefined || completedLocations !== undefined) {
      const qr = quizResultaten ?? {}
      const voltooidSet = new Set(completedLocations ?? [])

      // Verzamel alle locatie-codes die we straks gaan opslaan
      const alleCodes = new Set([...Object.keys(qr), ...voltooidSet])

      // Eerst alles wissen voor deze speler — replace-semantiek
      await conn.execute(
        'DELETE FROM quiz_resultaten WHERE speler_id = ?',
        [spelerId]
      )

      if (alleCodes.size > 0) {
        // Map codes → ids in één query
        const [locRows] = await conn.execute(
          `SELECT id, code FROM locaties WHERE code IN (${
            Array.from(alleCodes).map(() => '?').join(',')
          })`,
          Array.from(alleCodes)
        )
        const codeNaarId = Object.fromEntries(locRows.map(r => [r.code, r.id]))

        for (const code of alleCodes) {
          const locId = codeNaarId[code]
          if (!locId) continue  // onbekende code → overslaan
          const data = qr[code] || {}
          const score   = Number(data.score   ?? 0)
          const sterren = Number(data.sterren ?? data.score ?? 0)
          const voltooid = voltooidSet.has(code) ? 1 : 0
          const voltooidOp = voltooid ? new Date() : null

          await conn.execute(
            `INSERT INTO quiz_resultaten
              (speler_id, locatie_id, score, sterren, voltooid, voltooid_op)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [spelerId, locId, score, sterren, voltooid, voltooidOp]
          )
        }
      }
    }

    // ─── 3. Badges ────────────────────────────────────────
    if (badges !== undefined) {
      await conn.execute(
        'DELETE FROM speler_badges WHERE speler_id = ?',
        [spelerId]
      )
      if (badges.length > 0) {
        const [bRows] = await conn.execute(
          `SELECT id, code FROM badges WHERE code IN (${
            badges.map(() => '?').join(',')
          })`,
          badges
        )
        for (const b of bRows) {
          await conn.execute(
            `INSERT INTO speler_badges (speler_id, badge_id)
             VALUES (?, ?)`,
            [spelerId, b.id]
          )
        }
      }
    }

    // ─── 4. Collectibles ──────────────────────────────────
    if (collectibles !== undefined) {
      await conn.execute(
        'DELETE FROM collectibles WHERE speler_id = ?',
        [spelerId]
      )
      if (collectibles.length > 0) {
        // Verzamel unieke locatie-codes en map naar id's
        const codes = [...new Set(
          collectibles.map(c => (typeof c === 'string' ? c : c.locatie)).filter(Boolean)
        )]
        let codeNaarId = {}
        if (codes.length) {
          const [locRows] = await conn.execute(
            `SELECT id, code FROM locaties WHERE code IN (${
              codes.map(() => '?').join(',')
            })`,
            codes
          )
          codeNaarId = Object.fromEntries(locRows.map(r => [r.code, r.id]))
        }
        for (const item of collectibles) {
          // Ondersteun zowel string als object: { locatie, type }
          const locCode = typeof item === 'string' ? item : item.locatie
          const type    = typeof item === 'string' ? 'item' : (item.type || 'item')
          const locId = codeNaarId[locCode]
          if (!locId) continue
          await conn.execute(
            `INSERT INTO collectibles (speler_id, locatie_id, type)
             VALUES (?, ?, ?)`,
            [spelerId, locId, type]
          )
        }
      }
    }

    // (locatiesBezoekt wordt bij GET afgeleid uit quiz_resultaten,
    //  dus we hoeven er bij PUT niets mee te doen.)

    await conn.commit()
    res.json({ ok: true })
  } catch (err) {
    await conn.rollback()
    console.error(err)
    res.status(500).json({ fout: 'Serverprobleem.' })
  } finally {
    conn.release()
  }
})

export default router
