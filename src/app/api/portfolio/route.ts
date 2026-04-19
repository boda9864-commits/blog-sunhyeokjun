import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET /api/portfolio
export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM portfolio ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching portfolio (returning dummy data):', error);
    // 개발 환경에서 데이터베이스 연결이 안 될 때 화면이 깨지는 것을 방지하기 위한 더미 데이터 반환
    return NextResponse.json([
      {
        id: 1,
        title: "임시 프로젝트 (디자인용)",
        type: "Web Design",
        description: "데이터베이스가 연결되지 않아 임시로 표시되는 항목입니다.",
        link: "#"
      }
    ]);
  }
}

// POST /api/portfolio
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, type, description, link } = body;

    if (!title || !type) {
      return NextResponse.json({ error: '제목과 분류는 필수입니다.' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO portfolio (title, type, description, link)
      VALUES (${title}, ${type}, ${description || ''}, ${link || ''})
      RETURNING *;
    `;

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json({ error: '포트폴리오 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
