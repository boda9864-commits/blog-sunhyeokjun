import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'content');
const JSON_PATH = path.join(DATA_DIR, 'portfolio.json');

function readProjects() {
  if (!fs.existsSync(JSON_PATH)) return [];
  return JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
}

function writeProjects(projects: object[]) {
  fs.writeFileSync(JSON_PATH, JSON.stringify(projects, null, 2));
}

// PUT /api/portfolio/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const projects = readProjects();
  const idx = projects.findIndex((p: { id: number }) => p.id === Number(id));

  if (idx === -1) return NextResponse.json({ error: '없음' }, { status: 404 });

  projects[idx] = { ...projects[idx], ...body };
  writeProjects(projects);
  return NextResponse.json(projects[idx]);
}

// DELETE /api/portfolio/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projects = readProjects();
  const filtered = projects.filter((p: { id: number }) => p.id !== Number(id));

  if (filtered.length === projects.length) {
    return NextResponse.json({ error: '없음' }, { status: 404 });
  }

  writeProjects(filtered);
  return NextResponse.json({ ok: true });
}
