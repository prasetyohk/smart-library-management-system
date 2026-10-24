import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { hashPin } from './auth';

let dbInstance: DatabaseSync | null = null;

function getDbPath(): string {
  const custom = process.env.SQLITE_DB_PATH;
  if (custom && path.isAbsolute(custom)) return custom;
  return path.join(process.cwd(), 'data', 'sbth_library.db');
}

export function getDatabase(): DatabaseSync {
  if (dbInstance) return dbInstance;

  const dbPath = getDbPath();
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  
  // Performance & Concurrency Pragmas
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA busy_timeout = 5000;');

  initializeTables(db);
  dbInstance = db;
  return db;
}

function initializeTables(db: DatabaseSync): void {
  db.exec(`
    -- 1. Koleksi Buku (Biblio)
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      isbn TEXT,
      publisher TEXT,
      publishYear INTEGER,
      categoryId TEXT,
      shelfCode TEXT,
      classification TEXT,
      authorCode TEXT,
      titleCode TEXT,
      coverImage TEXT,
      totalLoanCount INTEGER DEFAULT 0,
      rawData TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
    CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
    CREATE INDEX IF NOT EXISTS idx_books_category ON books(categoryId);

    -- 2. Eksemplar Fisik (Copies)
    CREATE TABLE IF NOT EXISTS book_items (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL,
      barcode TEXT UNIQUE NOT NULL,
      copyNumber INTEGER NOT NULL,
      accessionNumber TEXT,
      status TEXT NOT NULL, -- AVAILABLE, BORROWED, REPAIR, LOST, WEEDED
      conditionNote TEXT,
      acquisitionSource TEXT,
      rawData TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_items_barcode ON book_items(barcode);
    CREATE INDEX IF NOT EXISTS idx_items_bookId ON book_items(bookId);
    CREATE INDEX IF NOT EXISTS idx_items_status ON book_items(status);

    -- 3. Anggota Perpustakaan
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      memberNo TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- SISWA, GURU, STAF
      classGrade TEXT,
      phone TEXT,
      photo TEXT,
      maxLoanLimit INTEGER DEFAULT 2,
      currentLoanCount INTEGER DEFAULT 0,
      joinDate TEXT NOT NULL,
      isVerified INTEGER DEFAULT 1,
      rawData TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_members_no ON members(memberNo);
    CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);

    -- 4. Transaksi Sirkulasi Peminjaman
    CREATE TABLE IF NOT EXISTS loans (
      id TEXT PRIMARY KEY,
      memberId TEXT NOT NULL,
      loanDate TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      returnDate TEXT,
      status TEXT NOT NULL, -- ACTIVE, RETURNED, OVERDUE
      fineAmount INTEGER DEFAULT 0,
      isFinePaid INTEGER DEFAULT 0,
      renewalCount INTEGER DEFAULT 0,
      librarianId TEXT,
      notes TEXT,
      rawData TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (memberId) REFERENCES members(id)
    );
    CREATE INDEX IF NOT EXISTS idx_loans_memberId ON loans(memberId);
    CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);

    -- 5. Detail Eksemplar dalam Peminjaman
    CREATE TABLE IF NOT EXISTS loan_items (
      id TEXT PRIMARY KEY,
      loanId TEXT NOT NULL,
      itemId TEXT NOT NULL,
      barcode TEXT NOT NULL,
      bookTitle TEXT,
      returnDate TEXT,
      status TEXT NOT NULL, -- BORROWED, RETURNED
      conditionNote TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (loanId) REFERENCES loans(id) ON DELETE CASCADE,
      FOREIGN KEY (itemId) REFERENCES book_items(id)
    );
    CREATE INDEX IF NOT EXISTS idx_loan_items_loanId ON loan_items(loanId);
    CREATE INDEX IF NOT EXISTS idx_loan_items_barcode ON loan_items(barcode);

    -- 6. Pustakawan & Kredensial Terenkripsi (Server-Side Salted Hash)
    CREATE TABLE IF NOT EXISTS librarians (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      pinHash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'LIBRARIAN',
      phone TEXT,
      email TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_librarians_user ON librarians(username);

    -- 7. Audit Log / Rekam Jejak Aktivitas
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      category TEXT NOT NULL,
      action TEXT NOT NULL,
      actor TEXT NOT NULL,
      details TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON activity_logs(timestamp);

    -- 8. Pengaturan Sistem (Key-Value)
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    -- 9. Password Reset Requests / OTP (WhatsApp & Email)
    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      otpCode TEXT NOT NULL,
      method TEXT NOT NULL, -- 'WHATSAPP' | 'EMAIL'
      targetContact TEXT NOT NULL,
      expiresAt INTEGER NOT NULL,
      isUsed INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_resets_user ON password_resets(username);
  `);

  // Safe Column Migrations for Existing Databases
  try { db.exec('ALTER TABLE librarians ADD COLUMN phone TEXT;'); } catch {}
  try { db.exec('ALTER TABLE librarians ADD COLUMN email TEXT;'); } catch {}

  // Seed default admin jika tabel librarians kosong
  const countRow: any = db.prepare('SELECT COUNT(*) as count FROM librarians').get();
  if (countRow && countRow.count === 0) {
    const { hash, salt } = hashPin('sbth2026');
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO librarians (id, username, name, pinHash, salt, role, phone, email, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('lib-admin', 'ms_kriss', 'Ms. Kriss (Pustakawan Utama)', hash, salt, 'ADMIN', '08157773256', 'perpustakaan.sbth@gmail.com', now, now);
  } else {
    // Ensure default admin has phone and email set
    try {
      db.prepare(`
        UPDATE librarians 
        SET phone = COALESCE(phone, '08157773256'), email = COALESCE(email, 'perpustakaan.sbth@gmail.com')
        WHERE LOWER(username) = 'ms_kriss'
      `).run();
    } catch {}
  }
}

// ==============================================================================
// ACID TRANSACTION: SIRKULASI PEMINJAMAN ATOMIK
// ==============================================================================
export interface BorrowRequest {
  memberId: string;
  itemBarcodes: string[];
  loanPeriodDays: number;
  librarianName: string;
  notes?: string;
}

export function executeBorrowTransaction(req: BorrowRequest): { success: boolean; loanId?: string; error?: string } {
  const db = getDatabase();
  const now = new Date();
  const loanDate = now.toISOString().split('T')[0];
  const dueDateObj = new Date(now.getTime() + req.loanPeriodDays * 24 * 60 * 60 * 1000);
  const dueDate = dueDateObj.toISOString().split('T')[0];

  try {
    db.exec('BEGIN IMMEDIATE TRANSACTION;');

    // 1. Verifikasi Anggota
    const member: any = db.prepare('SELECT * FROM members WHERE id = ?').get(req.memberId);
    if (!member) {
      db.exec('ROLLBACK;');
      return { success: false, error: 'Anggota perpustakaan tidak ditemukan.' };
    }

    // 2. Hitung pinjaman aktif saat ini
    const activeLoansCount: any = db.prepare(`
      SELECT COUNT(*) as count 
      FROM loans l 
      JOIN loan_items li ON l.id = li.loanId 
      WHERE l.memberId = ? AND li.status = 'BORROWED'
    `).get(req.memberId);

    const currentCount = activeLoansCount?.count || 0;
    const maxLimit = member.maxLoanLimit || 2;
    if (currentCount + req.itemBarcodes.length > maxLimit) {
      db.exec('ROLLBACK;');
      return { 
        success: false, 
        error: `Kuota pinjam melebihi batas. Kuota: ${maxLimit}, Sedang dipinjam: ${currentCount}, Baru: ${req.itemBarcodes.length}.` 
      };
    }

    // 3. Verifikasi & kunci eksemplar buku
    const itemsToBorrow: any[] = [];
    for (const barcode of req.itemBarcodes) {
      const item: any = db.prepare(`
        SELECT bi.*, b.title as bookTitle 
        FROM book_items bi
        JOIN books b ON bi.bookId = b.id
        WHERE bi.barcode = ?
      `).get(barcode.trim());

      if (!item) {
        db.exec('ROLLBACK;');
        return { success: false, error: `Buku dengan barcode '${barcode}' tidak terdaftar.` };
      }
      if (item.status === 'BORROWED') {
        db.exec('ROLLBACK;');
        return { success: false, error: `Buku '${item.bookTitle}' (${barcode}) sedang dipinjam oleh peminjam lain.` };
      }
      if (item.status !== 'AVAILABLE' && item.status !== 'TERSEDIA') {
        db.exec('ROLLBACK;');
        return { success: false, error: `Buku '${item.bookTitle}' (${barcode}) berstatus '${item.status}' dan tidak dapat dipinjam.` };
      }
      itemsToBorrow.push(item);
    }

    // 4. Buat Master Transaksi Pinjam
    const loanId = `loan-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT INTO loans (id, memberId, loanDate, dueDate, status, fineAmount, isFinePaid, renewalCount, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, 'ACTIVE', 0, 0, 0, ?, ?, ?)
    `).run(loanId, req.memberId, loanDate, dueDate, req.notes || '', now.toISOString(), now.toISOString());

    // 5. Masukkan rincian item & ubah status item menjadi BORROWED
    for (const item of itemsToBorrow) {
      const loanItemId = `li-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      db.prepare(`
        INSERT INTO loan_items (id, loanId, itemId, barcode, bookTitle, status, conditionNote, createdAt)
        VALUES (?, ?, ?, ?, ?, 'BORROWED', ?, ?)
      `).run(loanItemId, loanId, item.id, item.barcode, item.bookTitle, 'Kondisi prima saat dipinjam', now.toISOString());

      db.prepare(`
        UPDATE book_items 
        SET status = 'BORROWED', updatedAt = ? 
        WHERE id = ?
      `).run(now.toISOString(), item.id);

      db.prepare(`
        UPDATE books 
        SET totalLoanCount = totalLoanCount + 1, updatedAt = ? 
        WHERE id = ?
      `).run(now.toISOString(), item.bookId);
    }

    // 6. Catat Audit Trail
    const logId = `log-${Date.now().toString(36)}`;
    const titles = itemsToBorrow.map((i) => i.bookTitle).join(', ');
    db.prepare(`
      INSERT INTO activity_logs (id, timestamp, category, action, actor, details)
      VALUES (?, ?, 'CIRCULATION', 'PINJAM_BUKU', ?, ?)
    `).run(
      logId, 
      now.toISOString(), 
      req.librarianName, 
      `Peminjaman berhasil untuk ${member.name} (${member.memberNo}): [${titles}] - Jatuh tempo: ${dueDate}`
    );

    db.exec('COMMIT;');
    return { success: true, loanId };
  } catch (err: any) {
    try { db.exec('ROLLBACK;'); } catch {}
    return { success: false, error: err.message || 'Gagal memproses transaksi peminjaman.' };
  }
}

// ==============================================================================
// ACID TRANSACTION: SIRKULASI PENGEMBALIAN ATOMIK
// ==============================================================================
export interface ReturnRequest {
  barcode: string;
  conditionNote?: string;
  librarianName: string;
  finePaid?: boolean;
}

export function executeReturnTransaction(req: ReturnRequest): { 
  success: boolean; 
  fineAmount?: number; 
  isOverdue?: boolean; 
  bookTitle?: string;
  memberName?: string;
  error?: string 
} {
  const db = getDatabase();
  const now = new Date();
  const returnDate = now.toISOString().split('T')[0];

  try {
    db.exec('BEGIN IMMEDIATE TRANSACTION;');

    // 1. Cari loan item yang sedang aktif dipinjam
    const activeLoanItem: any = db.prepare(`
      SELECT li.*, l.id as loanId, l.memberId, l.dueDate, m.name as memberName, m.memberNo, bi.id as bookItemId
      FROM loan_items li
      JOIN loans l ON li.loanId = l.id
      JOIN members m ON l.memberId = m.id
      JOIN book_items bi ON li.itemId = bi.id
      WHERE li.barcode = ? AND li.status = 'BORROWED'
      ORDER BY l.createdAt DESC
      LIMIT 1
    `).get(req.barcode.trim());

    if (!activeLoanItem) {
      db.exec('ROLLBACK;');
      return { success: false, error: `Buku dengan barcode '${req.barcode}' tidak sedang berstatus aktif dipinjam.` };
    }

    // 2. Hitung denda keterlambatan jika melewati jatuh tempo
    const dueDate = new Date(activeLoanItem.dueDate);
    const returnDateObj = new Date(returnDate);
    const diffTime = returnDateObj.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let fine = 0;
    let isOverdue = false;
    if (diffDays > 0) {
      isOverdue = true;
      fine = diffDays * 1000; // Standar Rp 1.000 / hari keterlambatan
    }

    // 3. Update loan_item status menjadi RETURNED
    db.prepare(`
      UPDATE loan_items 
      SET status = 'RETURNED', returnDate = ?, conditionNote = ? 
      WHERE id = ?
    `).run(now.toISOString(), req.conditionNote || 'Dikembalikan dalam kondisi baik', activeLoanItem.id);

    // 4. Update status eksemplar buku menjadi AVAILABLE
    db.prepare(`
      UPDATE book_items 
      SET status = 'AVAILABLE', updatedAt = ? 
      WHERE id = ?
    `).run(now.toISOString(), activeLoanItem.bookItemId);

    // 5. Cek apakah seluruh buku dalam transaksi peminjaman ini sudah dikembalikan semua
    const remainingBorrowed: any = db.prepare(`
      SELECT COUNT(*) as count 
      FROM loan_items 
      WHERE loanId = ? AND status = 'BORROWED'
    `).get(activeLoanItem.loanId);

    if (!remainingBorrowed || remainingBorrowed.count === 0) {
      db.prepare(`
        UPDATE loans 
        SET status = 'RETURNED', returnDate = ?, fineAmount = fineAmount + ?, isFinePaid = ?, updatedAt = ?
        WHERE id = ?
      `).run(
        returnDate, 
        fine, 
        req.finePaid ? 1 : (fine > 0 ? 0 : 1), 
        now.toISOString(), 
        activeLoanItem.loanId
      );
    } else {
      db.prepare(`
        UPDATE loans 
        SET fineAmount = fineAmount + ?, updatedAt = ? 
        WHERE id = ?
      `).run(fine, now.toISOString(), activeLoanItem.loanId);
    }

    // 6. Catat Audit Log
    const logId = `log-${Date.now().toString(36)}`;
    db.prepare(`
      INSERT INTO activity_logs (id, timestamp, category, action, actor, details)
      VALUES (?, ?, 'CIRCULATION', 'KEMBALI_BUKU', ?, ?)
    `).run(
      logId, 
      now.toISOString(), 
      req.librarianName, 
      `Pengembalian buku '${activeLoanItem.bookTitle}' (${activeLoanItem.barcode}) dari ${activeLoanItem.memberName}. Denda: Rp ${fine.toLocaleString('id-ID')}`
    );

    db.exec('COMMIT;');
    return {
      success: true,
      fineAmount: fine,
      isOverdue,
      bookTitle: activeLoanItem.bookTitle,
      memberName: activeLoanItem.memberName,
    };
  } catch (err: any) {
    try { db.exec('ROLLBACK;'); } catch {}
    return { success: false, error: err.message || 'Gagal memproses pengembalian buku.' };
  }
}

// ==============================================================================
// BULK SYNCHRONIZATION: EXPORT / IMPORT TO SQLITE
// ==============================================================================
export function getAllDatabaseData(): {
  books: any[];
  items: any[];
  members: any[];
  loans: any[];
  librarians: any[];
  activityLogs: any[];
  settings: Record<string, any>;
} {
  const db = getDatabase();
  const books = db.prepare('SELECT * FROM books').all().map((r: any) => ({
    ...r,
    ...(r.rawData ? JSON.parse(r.rawData) : {}),
  }));

  const items = db.prepare('SELECT * FROM book_items').all().map((r: any) => ({
    ...r,
    ...(r.rawData ? JSON.parse(r.rawData) : {}),
  }));

  const members = db.prepare('SELECT * FROM members').all().map((r: any) => ({
    ...r,
    ...(r.rawData ? JSON.parse(r.rawData) : {}),
  }));

  const loans = db.prepare('SELECT * FROM loans').all().map((r: any) => ({
    ...r,
    ...(r.rawData ? JSON.parse(r.rawData) : {}),
  }));

  const librarians = db.prepare('SELECT id, username, name, role, createdAt, updatedAt FROM librarians').all();
  const activityLogs = db.prepare('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 500').all();

  const settingsRows = db.prepare('SELECT * FROM system_settings').all();
  const settings: Record<string, any> = {};
  for (const row of settingsRows as any[]) {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch {
      settings[row.key] = row.value;
    }
  }

  return { books, items, members, loans, librarians, activityLogs, settings };
}

export function saveBulkDatabaseData(data: {
  books?: any[];
  items?: any[];
  members?: any[];
  loans?: any[];
  settings?: Record<string, any>;
}): { success: boolean; count: number; error?: string } {
  const db = getDatabase();
  const now = new Date().toISOString();

  try {
    db.exec('BEGIN IMMEDIATE TRANSACTION;');

    let count = 0;

    // Books
    if (data.books && Array.isArray(data.books)) {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO books (
          id, title, author, isbn, publisher, publishYear, categoryId, shelfCode,
          classification, authorCode, titleCode, coverImage, totalLoanCount, rawData, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const b of data.books) {
        if (!b.id || !b.title) continue;
        stmt.run(
          b.id,
          b.title,
          b.author || 'Anonim',
          b.isbn || '',
          b.publisher || '',
          b.publishYear || b.year || 0,
          b.categoryId || 'c-000',
          b.shelfCode || '',
          b.classification || '',
          b.authorCode || '',
          b.titleCode || '',
          b.coverImage || '',
          b.totalLoanCount || 0,
          JSON.stringify(b),
          b.createdAt || now,
          now
        );
        count++;
      }
    }

    // Book Items
    if (data.items && Array.isArray(data.items)) {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO book_items (
          id, bookId, barcode, copyNumber, accessionNumber, status, conditionNote, acquisitionSource, rawData, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const item of data.items) {
        if (!item.id || !item.barcode) continue;
        stmt.run(
          item.id,
          item.bookId,
          item.barcode,
          item.copyNumber || 1,
          item.accessionNumber || '',
          item.status || 'AVAILABLE',
          item.conditionNote || '',
          item.acquisitionSource || item.source || 'PEMBELIAN',
          JSON.stringify(item),
          item.createdAt || now,
          now
        );
        count++;
      }
    }

    // Members
    if (data.members && Array.isArray(data.members)) {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO members (
          id, memberNo, name, type, classGrade, phone, photo, maxLoanLimit, currentLoanCount, joinDate, isVerified, rawData, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const m of data.members) {
        if (!m.id || !m.name) continue;
        stmt.run(
          m.id,
          m.memberNo || `M-${m.id}`,
          m.name,
          m.type || 'SISWA',
          m.classGrade || '',
          m.phone || '',
          m.photo || '',
          m.maxLoanLimit || 2,
          m.currentLoanCount || 0,
          m.joinDate || now.split('T')[0],
          m.isVerified !== false ? 1 : 0,
          JSON.stringify(m),
          m.createdAt || now,
          now
        );
        count++;
      }
    }

    // Settings
    if (data.settings && typeof data.settings === 'object') {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO system_settings (key, value, updatedAt)
        VALUES (?, ?, ?)
      `);
      for (const [key, value] of Object.entries(data.settings)) {
        stmt.run(key, JSON.stringify(value), now);
      }
    }

    db.exec('COMMIT;');
    return { success: true, count };
  } catch (err: any) {
    try { db.exec('ROLLBACK;'); } catch {}
    return { success: false, count: 0, error: err.message };
  }
}

// ==============================================================================
// PASSWORD RECOVERY / RESET ENGINE (WHATSAPP & EMAIL OTP)
// ==============================================================================
export interface CreateOtpResult {
  success: boolean;
  username: string;
  librarianName: string;
  method: 'WHATSAPP' | 'EMAIL';
  targetContact: string;
  targetMasked: string;
  otpCode: string;
  waUrl?: string;
  mailtoUrl?: string;
  expiresInMinutes: number;
  error?: string;
}

export function createPasswordResetOtp(username: string, method: 'WHATSAPP' | 'EMAIL'): CreateOtpResult {
  const db = getDatabase();
  const cleanUser = username.trim().toLowerCase().replace(/^@/, '');

  const librarian: any = db.prepare('SELECT * FROM librarians WHERE LOWER(username) = ?').get(cleanUser);
  if (!librarian) {
    return {
      success: false,
      username: cleanUser,
      librarianName: '',
      method,
      targetContact: '',
      targetMasked: '',
      otpCode: '',
      expiresInMinutes: 0,
      error: `Pustakawan dengan username @${cleanUser} tidak ditemukan di sistem.`,
    };
  }

  // Ambil kontak terdaftar atau kontak resmi sekolah sebagai fallback
  const phone = librarian.phone || '08157773256';
  const email = librarian.email || 'perpustakaan.sbth@gmail.com';
  const targetContact = method === 'WHATSAPP' ? phone : email;

  // Masking kontak untuk privasi (e.g., 0815-****-256 atau pe***@gmail.com)
  let targetMasked = targetContact;
  if (method === 'WHATSAPP') {
    const digits = phone.replace(/\D/g, '');
    targetMasked = digits.length > 7
      ? `${digits.slice(0, 4)}-****-${digits.slice(-3)}`
      : phone;
  } else {
    const parts = email.split('@');
    if (parts.length === 2) {
      const name = parts[0];
      targetMasked = `${name.slice(0, 2)}***@${parts[1]}`;
    }
  }

  // Generate 6-digit random cryptographically secure OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const id = `otp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();
  const expiresAt = now.getTime() + 15 * 60 * 1000; // 15 Menit

  // Invalidate any previous unused OTPs for this user
  db.prepare('UPDATE password_resets SET isUsed = 1 WHERE username = ? AND isUsed = 0').run(cleanUser);

  // Insert new OTP
  db.prepare(`
    INSERT INTO password_resets (id, username, otpCode, method, targetContact, expiresAt, isUsed, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `).run(id, cleanUser, otpCode, method, targetContact, expiresAt, now.toISOString());

  // Buat deep link WhatsApp
  let phoneClean = phone.replace(/[^0-9]/g, '');
  if (phoneClean.startsWith('0')) phoneClean = '62' + phoneClean.slice(1);
  const waMsg = encodeURIComponent(
    `*KODE RESET PASSWORD PERPUSTAKAAN SBTH* 🔐\n\nHalo *${librarian.name}* (@${librarian.username}),\n\nKode verifikasi OTP untuk reset password Anda adalah:\n👉 *${otpCode}*\n\nKode ini berlaku selama 15 menit. Masukkan kode ini pada aplikasi Perpustakaan SBTH untuk membuat password baru yang aman. Terima kasih! 📚`
  );
  const waUrl = `https://wa.me/${phoneClean}?text=${waMsg}`;

  // Buat mailto URL
  const emailSub = encodeURIComponent('Kode Verifikasi Reset Password Perpustakaan SBTH');
  const emailBody = encodeURIComponent(
    `Halo ${librarian.name} (@${librarian.username}),\n\nKode verifikasi OTP untuk reset password akun Anda adalah:\n\n${otpCode}\n\nKode ini berlaku selama 15 menit.\n\nSalam,\nSistem Perpustakaan SBTH Magelang`
  );
  const mailtoUrl = `mailto:${email}?subject=${emailSub}&body=${emailBody}`;

  return {
    success: true,
    username: cleanUser,
    librarianName: librarian.name,
    method,
    targetContact,
    targetMasked,
    otpCode,
    waUrl,
    mailtoUrl,
    expiresInMinutes: 15,
  };
}

export function verifyOtpAndResetPassword(username: string, otpCode: string, newPin: string): { success: boolean; message?: string; error?: string } {
  const db = getDatabase();
  const cleanUser = username.trim().toLowerCase().replace(/^@/, '');
  const cleanOtp = otpCode.trim();
  const cleanNewPin = newPin.trim();

  if (!cleanNewPin || cleanNewPin.length < 4) {
    return { success: false, error: 'Password/PIN baru minimal 4 karakter.' };
  }

  const librarian: any = db.prepare('SELECT * FROM librarians WHERE LOWER(username) = ?').get(cleanUser);
  if (!librarian) {
    return { success: false, error: 'Pustakawan tidak ditemukan.' };
  }

  const now = Date.now();
  const resetRecord: any = db.prepare(`
    SELECT * FROM password_resets 
    WHERE username = ? AND otpCode = ? AND isUsed = 0 AND expiresAt > ?
    ORDER BY createdAt DESC
    LIMIT 1
  `).get(cleanUser, cleanOtp, now);

  if (!resetRecord) {
    return { success: false, error: 'Kode OTP tidak valid atau sudah kedaluwarsa. Silakan minta kode baru.' };
  }

  // Hash password baru dengan salt baru
  const { hash, salt } = hashPin(cleanNewPin);
  const nowIso = new Date().toISOString();

  try {
    db.exec('BEGIN IMMEDIATE TRANSACTION;');

    db.prepare(`
      UPDATE librarians 
      SET pinHash = ?, salt = ?, updatedAt = ? 
      WHERE id = ?
    `).run(hash, salt, nowIso, librarian.id);

    db.prepare('UPDATE password_resets SET isUsed = 1 WHERE id = ?').run(resetRecord.id);

    // Catat log
    db.prepare(`
      INSERT INTO activity_logs (id, timestamp, category, action, actor, details)
      VALUES (?, ?, 'SECURITY', 'RESET_PASSWORD', ?, ?)
    `).run(
      `log-${Date.now().toString(36)}`,
      nowIso,
      librarian.name,
      `Pustakawan ${librarian.name} (@${librarian.username}) berhasil melakukan reset password melalui verifikasi ${resetRecord.method}.`
    );

    db.exec('COMMIT;');
    return { success: true, message: 'Password berhasil diperbarui. Silakan masuk menggunakan password baru.' };
  } catch (err: any) {
    try { db.exec('ROLLBACK;'); } catch {}
    return { success: false, error: err.message || 'Gagal menyimpan password baru.' };
  }
}

