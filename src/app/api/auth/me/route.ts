import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession, SESSION_COOKIE_NAME } from '@/lib/server/auth';
import { getDatabase } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) {
      return NextResponse.json({ authenticated: false, librarian: null }, { status: 401 });
    }

    const db = getDatabase();
    const librarian: any = db.prepare('SELECT id, username, name, role, createdAt FROM librarians WHERE id = ?').get(session.id);

    if (!librarian) {
      return NextResponse.json({ authenticated: false, librarian: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      librarian,
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logout berhasil. Sesi otentikasi telah dihapus.',
  });

  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
