import jwt from 'jsonwebtoken'

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ fout: 'Niet ingelogd' })
  }
  const token = authHeader.split(' ')[1]
  try {
    req.gebruiker = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ fout: 'Sessie verlopen, log opnieuw in' })
  }
}
