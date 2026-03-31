import Link from 'next/link';

export default function Home() {
  return (
    <main className="fade-in">
      <section className="container" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        padding: '120px 0'
      }}>
        <div style={{ position: 'relative', width: '100%' }}>
          {/* Subtle background accent */}
          <div style={{ 
            position: 'absolute', 
            top: '-10%', 
            left: '-5%', 
            width: '40%', 
            height: '120%', 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
            zIndex: -1,
            borderRadius: '2px'
          }} />

          <div style={{ maxWidth: '900px' }}>
            <p style={{ 
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem', 
              fontWeight: 600, 
              color: 'var(--foreground-muted)', 
              letterSpacing: '4px',
              textTransform: 'uppercase',
              marginBottom: '2.5rem'
            }}>
              BLOG
            </p>
            
            <h1 style={{ 
              fontSize: 'clamp(4rem, 15vw, 11rem)', 
              fontWeight: 800, 
              lineHeight: 0.85, 
              marginBottom: '4rem',
              letterSpacing: '-0.06em',
              marginLeft: '-0.05em'
            }}>
              SUNHYEOK<br/>
              <span style={{ color: 'transparent', WebkitTextStroke: '1px var(--foreground)', opacity: 0.8 }}>JUN</span>
              <span style={{ color: 'var(--foreground-muted)', fontSize: '0.4em', verticalAlign: 'bottom' }}>.</span>
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}>
              <div style={{ gridColumn: 'span 7' }}>
                <p style={{ 
                  fontSize: '1.4rem', 
                  color: 'var(--foreground)', 
                  marginBottom: '3.5rem',
                  fontWeight: 300,
                  lineHeight: 1.5,
                  letterSpacing: '-0.02em'
                }}>
                  저의 블로그에 오신걸 환영합니다. 이 곳은 저의 포트폴리오, 일상사진등이 올라오는 곳입니다.
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                  <Link href="/portfolio" className="btn-primary">
                    PORTFOLIO
                  </Link>
                  <Link href="/photos" style={{ 
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid var(--glass-border)',
                    paddingBottom: '4px'
                  }}>
                    VIEW PHOTOS →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subtle decorative elements could be added here */}
    </main>
  );
}
