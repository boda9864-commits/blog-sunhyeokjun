import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PHOTOS_DIR = path.join(process.cwd(), 'public', 'images', 'photos');
const JSON_PATH = path.join(PHOTOS_DIR, 'photos.json');

function readPhotos() {
  if (!fs.existsSync(JSON_PATH)) return [];
  return JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
}

function writePhotos(photos: object[]) {
  fs.writeFileSync(JSON_PATH, JSON.stringify(photos, null, 2));
}

// GET /api/photos
export async function GET() {
  const photos = readPhotos();
  return NextResponse.json(photos);
}

// POST /api/photos (upload)
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const caption = (formData.get('caption') as string) || '';

  if (!file) {
    return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
  }

  const filename = file.name;
  const filepath = path.join(PHOTOS_DIR, filename);
  fs.writeFileSync(filepath, buffer);

  const photos = readPhotos();
  const newId = photos.length > 0 ? Math.max(...photos.map((p: {id: number}) => p.id)) + 1 : 1;
  const newPhoto = {
    id: newId,
    filename,
    url: `/images/photos/${filename}`,
    caption,
  };

  photos.push(newPhoto);
  writePhotos(photos);

  return NextResponse.json(newPhoto);
}
