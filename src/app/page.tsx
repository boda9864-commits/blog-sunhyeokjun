import Link from 'next/link';

export default function Home() {
  return (
    <main className="fade-in">
      <section className="container" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 0'
      }}>
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          
          {/* Rainy Windshield Smoked Glass Card */}
          <div 
            className="rain-glass"
            style={{ 
              maxWidth: '850px', 
              width: '100%',
              padding: '3.5rem 2.5rem',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <h1 style={{ 
              fontSize: 'clamp(3rem, 7vw, 5.5rem)', 
              fontWeight: 700, 
              lineHeight: 1.05, 
              marginBottom: '2.5rem',
              letterSpacing: '-0.03em',
              color: '#ffffff',
              textShadow: '0 0 35px rgba(56, 189, 248, 0.35), 0 0 70px rgba(15, 23, 42, 0.9)',
            }}>
              SUNHYEOKJUN
            </h1>

            {/* Quick Navigation Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '2rem'
            }}>
              <Link href="/portfolio" className="btn-rain">
                PORTFOLIO
              </Link>
              <Link href="/tech" className="btn-rain" style={{ background: 'transparent', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                TECH STACK
              </Link>
            </div>

            {/* Subtle Interactive Hint */}
            <p style={{
              fontSize: '0.75rem',
              color: 'rgba(203, 213, 225, 0.55)',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>💡 화면을 클릭하거나 우측 하단 컨트롤러로 와이퍼를 작동시켜 보세요.</span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
