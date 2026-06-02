import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';

// GET /api/photos
export async function GET() {
  try {
    // 1. Try to fetch from Postgres database
    const { rows } = await sql`SELECT * FROM photos ORDER BY created_at DESC`;
    if (rows && rows.length > 0) {
      return NextResponse.json(rows);
    }
    
    // 2. If DB is empty, fall back to the static photos.json file as default/seed data
    const jsonPath = path.join(process.cwd(), 'public', 'images', 'photos', 'photos.json');
    if (fs.existsSync(jsonPath)) {
      const fileContents = fs.readFileSync(jsonPath, 'utf8');
      const photos = JSON.parse(fileContents);
      return NextResponse.json(photos.reverse());
    }
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching photos from DB, falling back to photos.json:', error);
    
    // 3. Fallback to static photos.json if database connection or query fails
    const jsonPath = path.join(process.cwd(), 'public', 'images', 'photos', 'photos.json');
    if (fs.existsSync(jsonPath)) {
      const fileContents = fs.readFileSync(jsonPath, 'utf8');
      const photos = JSON.parse(fileContents);
      return NextResponse.json(photos.reverse());
    }
    return NextResponse.json([]);
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
  } catch (error) {
    const err = error as Error;
    console.error('Error in photo upload API:', err);
    return NextResponse.json({ 
      error: '업로드 중 오류가 발생했습니다.', 
      details: err.message 
    }, { status: 500 });
  }
}
