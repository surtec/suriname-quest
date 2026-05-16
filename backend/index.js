import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import spelerRoutes from './routes/speler.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/speler', spelerRoutes)

app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`)
})
