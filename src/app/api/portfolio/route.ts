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
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(JSON_PATH, JSON.stringify(projects, null, 2));
}

// GET /api/portfolio
export async function GET() {
  const projects = readProjects();
  return NextResponse.json(projects);
}

// POST /api/portfolio
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, type, description, link } = body;

  if (!title || !type) {
    return NextResponse.json({ error: '제목과 분류는 필수입니다.' }, { status: 400 });
  }

  const projects = readProjects();
  const newId =
    projects.length > 0
      ? Math.max(...projects.map((p: { id: number }) => p.id)) + 1
      : 1;

  const newProject = { id: newId, title, type, description: description || '', link: link || '' };
  projects.push(newProject);
  writeProjects(projects);

  return NextResponse.json(newProject);
}
