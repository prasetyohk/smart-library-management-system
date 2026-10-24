import { NextRequest, NextResponse } from 'next/server';
import { getAllDatabaseData, saveBulkDatabaseData } from '@/lib/server/db';

export async function GET() {
  try {
    const data = getAllDatabaseData();
    return NextResponse.json({
      success: true,
      data,
      storageEngine: 'SQLite (Node.js Native WAL Mode)',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = saveBulkDatabaseData(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      message: `Berhasil menyimpan ${result.count} data ke database SQLite lokal PC.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
