import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nexa-default-jwt-secret-key-super-secure';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'nexa-default-refresh-secret-key-super-secure';

export interface TokenPayload {
  userId: string;
  email: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: '1h' };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: '7d' };
  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}
