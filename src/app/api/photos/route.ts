import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';

// GET /api/photos
export async function GET() {
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'images', 'photos', 'photos.json');
    if (fs.existsSync(jsonPath)) {
      const fileContents = fs.readFileSync(jsonPath, 'utf8');
      const photos = JSON.parse(fileContents);
      // 최신순으로 보여주기
      return NextResponse.json(photos.reverse());
    }
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error reading photos.json:', error);
    return NextResponse.json({ error: '사진을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// POST /api/photos (upload) - Vercel Blob 로직은 그대로 유지 (업로드가 필요할 경우)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const caption = (formData.get('caption') as string) || '';

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    console.log(`Uploading file: ${file.name}, size: ${file.size}`);

    // 1. Upload to Vercel Blob
    // We use the file name as the pathname. Vercel Blob will handle unique naming if needed or overwrite.
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true, // Adds a suffix to prevent filename collisions
    });

    console.log(`Blob uploaded successfully: ${blob.url}`);

    // 2. Save metadata to Postgres
    const result = await sql`
      INSERT INTO photos (filename, url, caption)
      VALUES (${file.name}, ${blob.url}, ${caption})
      RETURNING *;
    `;

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error in photo upload API:', error);
    return NextResponse.json({ 
      error: '업로드 중 오류가 발생했습니다.', 
      details: error.message 
    }, { status: 500 });
  }
}
