import { NextRequest, NextResponse } from 'next/server';
import { executeBorrowTransaction, executeReturnTransaction } from '@/lib/server/db';
import { getAuthenticatedSession } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const librarianName = session ? session.name : 'Pustakawan Bertugas';

    const body = await req.json();
    const action = body.action; // 'BORROW' | 'RETURN'

    if (action === 'BORROW') {
      const { memberId, itemBarcodes, loanPeriodDays, notes } = body;
      if (!memberId || !itemBarcodes || !Array.isArray(itemBarcodes) || itemBarcodes.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Data anggota dan daftar barcode buku wajib disertakan.' },
          { status: 400 }
        );
      }

      const result = executeBorrowTransaction({
        memberId,
        itemBarcodes,
        loanPeriodDays: loanPeriodDays || 7,
        librarianName,
        notes,
      });

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'Transaksi peminjaman buku berhasil diproses dengan ACID transaction.',
        loanId: result.loanId,
      });
    }

    if (action === 'RETURN') {
      const { barcode, conditionNote, isFinePaid } = body;
      if (!barcode) {
        return NextResponse.json(
          { success: false, error: 'Barcode buku wajib disertakan.' },
          { status: 400 }
        );
      }

      const result = executeReturnTransaction({
        barcode,
        conditionNote,
        librarianName,
        finePaid: isFinePaid,
      });

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Pengembalian buku '${result.bookTitle}' berhasil diproses.`,
        fineAmount: result.fineAmount,
        isOverdue: result.isOverdue,
        bookTitle: result.bookTitle,
        memberName: result.memberName,
      });
    }

    return NextResponse.json({ success: false, error: 'Aksi sirkulasi tidak valid.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
