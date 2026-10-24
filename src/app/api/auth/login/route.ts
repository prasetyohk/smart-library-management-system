import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/server/db';
import { verifyPinHash, signSessionToken, SESSION_COOKIE_NAME } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = (body.username || '').trim().toLowerCase().replace(/^@/, '');
    const pin = (body.pin || '').trim();

    if (!username || !pin) {
      return NextResponse.json(
        { success: false, error: 'Username dan Password/PIN wajib diisi.' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const librarian: any = db.prepare('SELECT * FROM librarians WHERE LOWER(username) = ?').get(username);

    if (!librarian) {
      return NextResponse.json(
        { success: false, error: 'Akun pustakawan tidak terdaftar.' },
        { status: 401 }
      );
    }

    // Verify salted hash with timing-safe comparison
    const isValid = verifyPinHash(pin, librarian.pinHash, librarian.salt);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Password atau PIN salah.' },
        { status: 401 }
      );
    }

    // Create secure session token
    const token = signSessionToken({
      id: librarian.id,
      username: librarian.username,
      name: librarian.name,
      role: librarian.role || 'LIBRARIAN',
    });

    // Record login in audit log
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO activity_logs (id, timestamp, category, action, actor, details)
      VALUES (?, ?, 'AUTH', 'LOGIN_PUSTAKAWAN', ?, ?)
    `).run(
      `log-${Date.now().toString(36)}`,
      now,
      librarian.name,
      `Pustakawan ${librarian.name} (@${librarian.username}) berhasil login melalui otentikasi server aman.`
    );

    // Return sanitized librarian data (WITHOUT pinHash or salt)
    const sanitized = {
      id: librarian.id,
      username: librarian.username,
      name: librarian.name,
      role: librarian.role,
      createdAt: librarian.createdAt,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      token,
      librarian: sanitized,
    });

    // Set HTTP-Only Secure Cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 3600, // 24 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Terjadi kesalahan pada server saat login.' },
      { status: 500 }
    );
  }
}
