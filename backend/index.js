import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import authRoutes from './routes/auth.js'
import spelerRoutes from './routes/speler.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Serveer de public/ map als statische bestanden
app.use(express.static(join(__dirname, '..', 'public')))

app.use('/api/auth', authRoutes)
app.use('/api/speler', spelerRoutes)

app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`)
})
