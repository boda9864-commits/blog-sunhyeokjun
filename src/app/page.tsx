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
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: '20px',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              marginBottom: '1.5rem'
            }}>
              <span style={{ fontSize: '0.75rem' }}>🌧️</span>
              <span style={{ 
                fontFamily: 'var(--font-main)',
                fontSize: '0.75rem', 
                fontWeight: 600, 
                color: 'var(--primary)', 
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}>
                RAINY WINDSHIELD ARCHIVE
              </span>
            </div>
            
            <h1 style={{ 
              fontSize: 'clamp(3rem, 7vw, 5.5rem)', 
              fontWeight: 700, 
              lineHeight: 1.05, 
              marginBottom: '1.5rem',
              letterSpacing: '-0.03em',
              color: '#ffffff',
              textShadow: '0 0 35px rgba(56, 189, 248, 0.35), 0 0 70px rgba(15, 23, 42, 0.9)',
            }}>
              SUNHYEOKJUN
            </h1>

            <p style={{ 
              fontSize: '1.15rem', 
              color: 'var(--foreground-muted)', 
              marginBottom: '2.5rem',
              fontWeight: 400,
              lineHeight: 1.7,
              maxWidth: '580px',
              margin: '0 auto 2.5rem auto'
            }}>
              비 내리는 차창 밖으로 마주하는 생각과 기록들.<br />
              소프트웨어 개발 여정, 포트폴리오, 그리고 일상의 찰나를 담았습니다.
            </p>

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
