import jwt from 'jsonwebtoken'
import type { NextApiRequest } from 'next'

const SECRET = process.env.JWT_SECRET!

export interface TokenPayload {
  userId: number
  email: string
  role: string
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as TokenPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(req: NextApiRequest): TokenPayload | null {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return null
  return verifyToken(auth.slice(7))
}
