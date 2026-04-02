import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { del } from '@vercel/blob';

// PUT /api/photos/[id] (caption 수정)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { caption } = body;

    const result = await sql`
      UPDATE photos
      SET caption = ${caption}
      WHERE id = ${id}
      RETURNING *;
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: '사진을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating photo:', error);
    return NextResponse.json({ error: '업데이트 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// DELETE /api/photos/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 1. Get photo info from DB to find the URL for deletion from Blob
    const { rows } = await sql`SELECT * FROM photos WHERE id = ${id}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: '사진을 찾을 수 없습니다.' }, { status: 404 });
    }

    const photo = rows[0];

    // 2. Delete from Vercel Blob (if it's a blob URL)
    if (photo.url.startsWith('https://')) {
      await del(photo.url);
    }

    // 3. Delete from Postgres
    await sql`DELETE FROM photos WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
