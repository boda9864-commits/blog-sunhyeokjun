import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// PUT /api/portfolio/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, type, description, link } = body;

    const result = await sql`
      UPDATE portfolio
      SET title = COALESCE(${title}, title),
          type = COALESCE(${type}, type),
          description = COALESCE(${description}, description),
          link = COALESCE(${link}, link)
      WHERE id = ${id}
      RETURNING *;
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: '데이터를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json({ error: '업데이트 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// DELETE /api/portfolio/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await sql`
      DELETE FROM portfolio
      WHERE id = ${id};
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: '데이터를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
