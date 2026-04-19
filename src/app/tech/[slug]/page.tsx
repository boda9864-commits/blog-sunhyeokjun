import { techStackData } from "@/data/tech-stack";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function TechDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tech = techStackData.find((t) => t.slug === slug);

  if (!tech) {
    notFound();
  }

  return (
    <main className="fade-in container" style={{ padding: '12rem 3rem' }}>
      <header style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '3rem' }}>
        <Link href="/tech" style={{ 
          color: 'var(--foreground-muted)', 
          marginBottom: '2rem', 
          display: 'inline-block',
          fontSize: '0.9rem'
        }}>
          ← 기술 스택 목록으로 돌아가기
        </Link>
      </header>
      
      <article style={{ maxWidth: '800px', margin: '0 auto' }}>
        <p style={{ 
          fontSize: '0.8rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.2em', 
          color: 'var(--primary)',
          marginBottom: '1rem' 
        }}>
          {tech.category}
        </p>
        
        <h1 style={{ 
          fontSize: 'clamp(3rem, 10vw, 5rem)', 
          fontWeight: 800, 
          lineHeight: 1.1, 
          marginBottom: '3rem',
          letterSpacing: '-0.03em' 
        }}>
          {tech.name}
        </h1>

        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px)',
          padding: '4rem 3rem',
          borderRadius: '24px',
          lineHeight: '1.8',
          fontSize: '1.2rem',
          color: 'var(--foreground-muted)'
        }}>
          <p>{tech.description}</p>
          <div style={{ marginTop: '3rem', paddingTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.1rem' }}>개인적인 견해</h3>
            <p style={{ fontSize: '1rem' }}>
              저는 {tech.name}이(가) 현대 개발의 초석이라고 생각합니다. 
              다양한 프로젝트를 통해 이 기술의 깊이를 탐구하면서 성능과 개발자 경험 사이의 복잡한 균형을 이해할 수 있었습니다.
            </p>
            <p style={{ fontSize: '1rem', marginTop: '1.5rem' }}>
              현재 저의 기술 스택 맥락에서 {tech.name}은(는) 안정적이고 확장 가능한 디지털 경험을 구축하는 데 필요한 핵심 역량을 제공합니다. 
              앞으로도 이 {tech.category} 기술의 더 발전된 기능들을 마스터하는 것을 목표로 하고 있습니다.
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}

export async function generateStaticParams() {
  return techStackData.map((tech) => ({
    slug: tech.slug,
  }));
}
