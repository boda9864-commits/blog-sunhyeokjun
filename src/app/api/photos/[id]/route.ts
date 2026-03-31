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

// PUT /api/photos/[id] (caption 수정)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { caption } = await req.json();
  const photos = readPhotos();
  const idx = photos.findIndex((p: { id: number }) => p.id === Number(id));
  if (idx === -1) return NextResponse.json({ error: '사진을 찾을 수 없습니다.' }, { status: 404 });
  photos[idx].caption = caption;
  writePhotos(photos);
  return NextResponse.json(photos[idx]);
}

// DELETE /api/photos/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photos = readPhotos();
  const idx = photos.findIndex((p: { id: number }) => p.id === Number(id));
  if (idx === -1) return NextResponse.json({ error: '사진을 찾을 수 없습니다.' }, { status: 404 });

  const photo = photos[idx] as { filename: string };
  const filepath = path.join(PHOTOS_DIR, photo.filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }

  photos.splice(idx, 1);
  writePhotos(photos);
  return NextResponse.json({ success: true });
}
