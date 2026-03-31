import Link from 'next/link';

export default function Home() {
  return (
    <main className="fade-in">
      <section className="container" style={{ 
        height: 'calc(100vh - 80px)', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        padding: '0 2rem 10vh 2rem'
      }}>
        <div style={{ marginLeft: '5%' }}> {/* Slightly more shift to the right as requested */}
          <h2 style={{ 
            fontSize: 'clamp(3rem, 10vw, 8rem)', 
            fontWeight: 800, 
            lineHeight: 0.9, 
            marginBottom: '2rem',
            letterSpacing: '-0.05em' 
          }}>
            SUNHYEOK<br/>JUN<span style={{ color: 'var(--foreground-muted)' }}>.</span>
          </h2>
          <div style={{ maxWidth: '600px' }}>
            <p style={{ 
              fontSize: '1.25rem', 
              color: 'var(--foreground-muted)', 
              marginBottom: '3rem',
              fontWeight: 400,
              lineHeight: 1.6
            }}>
              시각적 기록과 코드, 그리고 일상의 조각들을 담아내는 공간입니다.<br/>
              단순함의 미학과 본질적인 가치를 탐구합니다.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link href="/photos" className="btn-primary">
                VIEW PHOTOS
              </Link>
              <Link href="/about" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: '0.8rem', 
                fontWeight: 700, 
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}>
                ABOUT ME →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured visual element or minimal list can go here if needed later */}
    </main>
  );
}
