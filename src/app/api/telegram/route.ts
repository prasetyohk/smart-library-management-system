import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let clientBotToken = '';
    let clientChatId = '';
    let message = '';
    let action = '';
    let file: File | null = null;

    if (contentType.includes('application/json')) {
      const body = await req.json();
      clientBotToken = body.botToken || '';
      clientChatId = body.chatId || '';
      message = body.message || '';
      action = body.action || '';
    } else {
      const formData = await req.formData();
      clientBotToken = (formData.get('botToken') as string) || '';
      clientChatId = (formData.get('chatId') as string) || '';
      message = (formData.get('message') as string) || '';
      action = (formData.get('action') as string) || '';
      file = formData.get('file') as File | null;
    }

    // Keamanan 1: Prioritaskan token dari Server Environment Variables (.env.local)
    // agar token rahasia tidak pernah terekspos di browser F12 client
    const serverBotToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const serverChatId = process.env.TELEGRAM_CHAT_ID?.trim();

    // Gunakan server token jika tersedia; jika tidak, gunakan token client yang tervalidasi
    const botToken = serverBotToken || clientBotToken.trim();
    const chatId = serverChatId || clientChatId.trim();

    if (!botToken || !chatId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Bot Token dan Chat ID belum dikonfigurasi. Silakan isi di file .env.local server atau di menu Pengaturan Telegram.' 
        },
        { status: 400 }
      );
    }

    // Keamanan 2: Anti-Open Relay. Cegah request sembarangan jika bukan dari localhost atau tanpa session terverifikasi
    const host = req.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    if (!isLocalhost) {
      const session = await getAuthenticatedSession(req);
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Akses ditolak. Sesi otentikasi pustakawan diperlukan untuk mengirim pesan Telegram.' },
          { status: 401 }
        );
      }
    }

    // 1. Action: Test Connection
    if (action === 'TEST') {
      const testUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const res = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🤖 *Koneksi Bot Perpustakaan SBTH Berhasil!* ✅\n\n🛡️ *Status Keamanan:* Terhubung melalui Server Next.js (${serverBotToken ? 'Kunci Server .env.local Terproteksi' : 'Kredensial Dinamis Terverifikasi'}).\n\nBot siap menerima pengiriman laporan dan file backup otomatis (.xlsx & database).`,
          parse_mode: 'Markdown',
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        return NextResponse.json({ 
          success: false, 
          error: data.description || 'Gagal mengirim pesan test ke Telegram.' 
        });
      }
      return NextResponse.json({ 
        success: true, 
        message: 'Koneksi Telegram berhasil terhubung secara aman!',
        isServerConfigured: Boolean(serverBotToken)
      });
    }

    // 2. Action: Send Document + Caption
    if (file) {
      const docUrl = `https://api.telegram.org/bot${botToken}/sendDocument`;
      const docForm = new FormData();
      docForm.append('chat_id', chatId);
      docForm.append('document', file, file.name);
      if (message) {
        docForm.append('caption', message.slice(0, 1024)); // Telegram caption limit 1024 chars
      }

      const res = await fetch(docUrl, {
        method: 'POST',
        body: docForm,
      });

      const data = await res.json();
      if (!data.ok) {
        return NextResponse.json({ success: false, error: data.description || 'Gagal mengirim file dokumen ke Telegram.' });
      }

      // If message is longer than 1024 characters, send remainder
      if (message && message.length > 1024) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
          }),
        });
      }

      return NextResponse.json({ success: true, message: 'Laporan dan file Excel backup berhasil dikirim ke Telegram!' });
    }

    // 3. Action: Send Text Message only
    const sendUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(sendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      return NextResponse.json({ success: false, error: data.description || 'Gagal mengirim pesan ke Telegram.' });
    }

    return NextResponse.json({ success: true, message: 'Laporan berhasil dikirim ke Telegram!' });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Terjadi kesalahan pada server saat menghubungi Telegram.' },
      { status: 500 }
    );
  }
}
