import { techStackData } from "@/data/tech-stack";
import Link from 'next/link';

export default function TechPage() {
  const categories = Array.from(new Set(techStackData.map(t => t.category)));
  
  return (
    <main className="fade-in container" style={{ padding: '12rem 3rem' }}>
      <header style={{ marginBottom: '6rem' }}>
        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 8vw, 6rem)', 
          fontWeight: 800, 
          lineHeight: 1, 
          marginBottom: '2rem',
          letterSpacing: '-0.05em' 
        }}>
          TECH STACK<span style={{ color: 'var(--foreground-muted)' }}>.</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--foreground-muted)', maxWidth: '600px' }}>
          50가지의 다양한 도구와 개념을 통해 기록한 저의 기술 여정입니다.
        </p>
      </header>
      
      <div style={{ 
        display: 'grid', 
        gap: '4rem',
        gridTemplateColumns: '1fr'
      }}>
        {categories.map((category, idx) => (
          <section key={idx}>
            <h2 style={{ 
              fontSize: '1rem', 
              fontWeight: 600, 
              marginBottom: '2rem', 
              color: 'var(--primary)',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              paddingBottom: '1rem'
            }}>
              {category}
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {techStackData.filter(t => t.category === category).map((tech, sIdx) => (
                <Link 
                  href={`/tech/${tech.slug}`} 
                  key={sIdx} 
                  className="tech-card"
                  style={{
                    padding: '2rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    display: 'block'
                  }}
                >
                  <h3 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 500, 
                    color: '#fff',
                    marginBottom: '0.5rem'
                  }}>
                    {tech.name}
                  </h3>
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--foreground-muted)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.5'
                  }}>
                    {tech.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
