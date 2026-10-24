import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'sbth_session';
const DEFAULT_SECRET = 'sbth-library-production-secure-auth-secret-key-2026-bth-magelang';

function getSecret(): string {
  return process.env.SESSION_SECRET || DEFAULT_SECRET;
}

export interface SessionData {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'LIBRARIAN';
  exp: number; // UNIX timestamp
}

/**
 * Hash PIN or password using PBKDF2 with a cryptographically secure random salt
 */
export function hashPin(pin: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(pin.trim(), salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Verify a PIN against a stored hash and salt with timing-safe comparison
 */
export function verifyPinHash(pin: string, storedHash: string, salt: string): boolean {
  try {
    const calculatedHash = crypto.pbkdf2Sync(pin.trim(), salt, 10000, 64, 'sha512').toString('hex');
    const a = Buffer.from(calculatedHash, 'hex');
    const b = Buffer.from(storedHash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Generate a signed session token
 */
export function signSessionToken(data: Omit<SessionData, 'exp'>, expiresInHours: number = 24): string {
  const secret = getSecret();
  const payload: SessionData = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + expiresInHours * 3600,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

/**
 * Verify and decode session token
 */
export function verifySessionToken(token: string): SessionData | null {
  try {
    if (!token || !token.includes('.')) return null;
    const [encodedPayload, signature] = token.split('.');
    const secret = getSecret();
    const expectedSignature = crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url');
    
    // Timing-safe signature check
    const sigA = Buffer.from(signature);
    const sigB = Buffer.from(expectedSignature);
    if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
      return null;
    }

    const json = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const payload: SessionData = JSON.parse(json);

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extract authenticated session from incoming NextRequest or cookies
 */
export async function getAuthenticatedSession(req?: NextRequest): Promise<SessionData | null> {
  let token: string | undefined;

  if (req) {
    const cookieHeader = req.cookies.get(SESSION_COOKIE_NAME);
    token = cookieHeader?.value;
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      // Not in server component context
    }
  }

  if (!token) return null;
  return verifySessionToken(token);
}

export { SESSION_COOKIE_NAME };
