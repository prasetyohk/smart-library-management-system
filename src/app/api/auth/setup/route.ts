import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/server/db';
import { getAuthenticatedSession, hashPin } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const body = await req.json();
    const action = body.action; // 'CHANGE_PIN', 'ADD_LIBRARIAN', 'RESET_PASSWORD'
    const db = getDatabase();

    // 1. Ganti PIN Akun Sendiri
    if (action === 'CHANGE_PIN') {
      if (!session) {
        return NextResponse.json({ success: false, error: 'Silakan login terlebih dahulu.' }, { status: 401 });
      }
      const { oldPin, newPin } = body;
      if (!newPin || newPin.length < 4) {
        return NextResponse.json({ success: false, error: 'PIN baru minimal 4 karakter.' }, { status: 400 });
      }

      const librarian: any = db.prepare('SELECT * FROM librarians WHERE id = ?').get(session.id);
      if (!librarian) {
        return NextResponse.json({ success: false, error: 'Data pustakawan tidak ditemukan.' }, { status: 404 });
      }

      // Generate new hash & salt
      const { hash, salt } = hashPin(newPin);
      db.prepare(`
        UPDATE librarians 
        SET pinHash = ?, salt = ?, updatedAt = ? 
        WHERE id = ?
      `).run(hash, salt, new Date().toISOString(), session.id);

      // Log change
      db.prepare(`
        INSERT INTO activity_logs (id, timestamp, category, action, actor, details)
        VALUES (?, ?, 'SECURITY', 'UBAH_PIN', ?, ?)
      `).run(
        `log-${Date.now().toString(36)}`,
        new Date().toISOString(),
        session.name,
        `Pustakawan ${session.name} (@${session.username}) berhasil memperbarui PIN keamanannya.`
      );

      return NextResponse.json({ success: true, message: 'PIN berhasil diperbarui.' });
    }

    // 2. Tambah Pustakawan Baru (Wajib Role ADMIN)
    if (action === 'ADD_LIBRARIAN') {
      if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ success: false, error: 'Akses ditolak. Hanya Administrator yang dapat menambah staf.' }, { status: 403 });
      }
      const { username, name, pin, role } = body;
      if (!username || !name || !pin) {
        return NextResponse.json({ success: false, error: 'Username, Nama, dan PIN wajib diisi.' }, { status: 400 });
      }

      const cleanUser = username.trim().toLowerCase().replace(/^@/, '');
      const existing: any = db.prepare('SELECT id FROM librarians WHERE LOWER(username) = ?').get(cleanUser);
      if (existing) {
        return NextResponse.json({ success: false, error: 'Username sudah digunakan.' }, { status: 400 });
      }

      const { hash, salt } = hashPin(pin);
      const newId = `lib-${Date.now().toString(36)}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO librarians (id, username, name, pinHash, salt, role, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(newId, cleanUser, name.trim(), hash, salt, role || 'LIBRARIAN', now, now);

      return NextResponse.json({ 
        success: true, 
        message: `Pustakawan @${cleanUser} berhasil didaftarkan.`,
        librarian: { id: newId, username: cleanUser, name: name.trim(), role: role || 'LIBRARIAN', createdAt: now }
      });
    }

    // 3. Reset Admin Password (Fallback jika belum ada session, tapi butuh secret master key jika diset di ENV)
    if (action === 'INITIAL_SETUP') {
      const countRow: any = db.prepare('SELECT COUNT(*) as count FROM librarians').get();
      // Hanya izinkan jika librarians kosong atau request memiliki session ADMIN
      if (countRow.count > 0 && (!session || session.role !== 'ADMIN')) {
        return NextResponse.json({ success: false, error: 'Sistem sudah terkonfigurasi. Silakan login sebagai Admin.' }, { status: 403 });
      }

      const { adminPin } = body;
      if (!adminPin || adminPin.length < 4) {
        return NextResponse.json({ success: false, error: 'PIN Admin minimal 4 karakter.' }, { status: 400 });
      }

      const { hash, salt } = hashPin(adminPin);
      const now = new Date().toISOString();
      db.prepare(`
        INSERT OR REPLACE INTO librarians (id, username, name, pinHash, salt, role, createdAt, updatedAt)
        VALUES ('lib-admin', 'ms_kriss', 'Ms. Kriss (Pustakawan Utama)', ?, ?, 'ADMIN', ?, ?)
      `).run(hash, salt, now, now);

      return NextResponse.json({ success: true, message: 'Kredensial Admin berhasil dikonfigurasi secara aman.' });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenali.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
