import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetOtp, verifyOtpAndResetPassword } from '@/lib/server/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action; // 'REQUEST_OTP' | 'VERIFY_AND_RESET'

    if (action === 'REQUEST_OTP') {
      const username = body.username || '';
      const method = body.method === 'EMAIL' ? 'EMAIL' : 'WHATSAPP';

      if (!username) {
        return NextResponse.json(
          { success: false, error: 'Username pustakawan wajib diisi.' },
          { status: 400 }
        );
      }

      const result = createPasswordResetOtp(username, method);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `Kode verifikasi OTP berhasil dibuat untuk pengiriman via ${method}.`,
        data: result,
      });
    }

    if (action === 'VERIFY_AND_RESET') {
      const { username, otpCode, newPin } = body;
      if (!username || !otpCode || !newPin) {
        return NextResponse.json(
          { success: false, error: 'Username, Kode OTP, dan Password baru wajib diisi.' },
          { status: 400 }
        );
      }

      const result = verifyOtpAndResetPassword(username, otpCode, newPin);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: result.message,
      });
    }

    return NextResponse.json({ success: false, error: 'Aksi pemulihan tidak valid.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
