import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import db from '../db.js'

const router = express.Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { naam, email, wachtwoord } = req.body
  if (!naam || !email || !wachtwoord) {
    return res.status(400).json({ fout: 'Naam, e-mail en wachtwoord zijn verplicht' })
  }
  if (wachtwoord.length < 6) {
    return res.status(400).json({ fout: 'Wachtwoord moet minstens 6 tekens zijn.' })
  }
  try {
    const [bestaand] = await db.execute(
      'SELECT id FROM spelers WHERE email = ?',
      [email]
    )
    if (bestaand.length > 0) {
      return res.status(400).json({ fout: 'Dit e-mailadres is al in gebruik.' })
    }

    const uid = uuidv4()
    const hash = await bcrypt.hash(wachtwoord, 10)

    await db.execute(
      `INSERT INTO spelers
        (uid, naam, email, wachtwoord_hash, punten, level, avatar,
         locaties_bezoekt, collectibles, quiz_resultaten, badges, completed_locations, aangemeld_op)
       VALUES (?, ?, ?, ?, 0, 1, 'karakter_1', '[]', '[]', '{}', '[]', '[]', NOW())`,
      [uid, naam, email, hash]
    )

    const token = jwt.sign({ uid, naam, email }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, gebruiker: { uid, naam, email } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ fout: 'Serverprobleem. Probeer opnieuw.' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, wachtwoord } = req.body
  if (!email || !wachtwoord) {
    return res.status(400).json({ fout: 'E-mail en wachtwoord zijn verplicht' })
  }
  try {
    const [rows] = await db.execute(
      'SELECT * FROM spelers WHERE email = ?',
      [email]
    )
    if (rows.length === 0) {
      return res.status(401).json({ fout: 'Dit account bestaat niet. Maak een nieuw account aan!' })
    }

    const speler = rows[0]
    const klopt = await bcrypt.compare(wachtwoord, speler.wachtwoord_hash)
    if (!klopt) {
      return res.status(401).json({ fout: 'Verkeerd wachtwoord. Probeer opnieuw!' })
    }

    const token = jwt.sign(
      { uid: speler.uid, naam: speler.naam, email: speler.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ token, gebruiker: { uid: speler.uid, naam: speler.naam, email: speler.email } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ fout: 'Serverprobleem. Probeer opnieuw.' })
  }
})

export default router
