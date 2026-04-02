import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';

// GET /api/photos
export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM photos ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({ error: '사진을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// POST /api/photos (upload)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const caption = (formData.get('caption') as string) || '';

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    // 1. Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // 2. Save metadata to Postgres
    const result = await sql`
      INSERT INTO photos (filename, url, caption)
      VALUES (${file.name}, ${blob.url}, ${caption})
      RETURNING *;
    `;

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json({ error: '업로드 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
