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
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          
          {/* Submerged Deep Ocean Glass Card */}
          <div style={{ 
            maxWidth: '900px', 
            width: '100%',
            padding: '2rem',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontFamily: 'var(--font-main)',
              fontSize: '0.85rem', 
              fontWeight: 500, 
              color: 'var(--foreground-muted)', 
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
              textShadow: '0 0 10px rgba(0, 180, 216, 0.5)'
            }}>
              BLOG
            </p>
            
            <h1 style={{ 
              fontSize: 'clamp(3.5rem, 8vw, 6rem)', 
              fontWeight: 400, 
              lineHeight: 1.05, 
              marginBottom: '2rem',
              letterSpacing: '-0.03em',
              color: '#ffffff',
              textShadow: '0 0 40px rgba(0, 180, 216, 0.4), 0 0 20px rgba(144, 224, 239, 0.2)',
            }}>
              SUNHYEOKJUN
            </h1>

            <p style={{ 
              fontSize: '1.25rem', 
              color: 'var(--foreground-muted)', 
              marginBottom: '0',
              fontWeight: 400,
              lineHeight: 1.5,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              저의 블로그에 오신걸 환영합니다. 이 곳은 저의 포트폴리오, 일상사진, 공부기록등이 올라오는 곳입니다.
            </p>
          </div>
        </div>
      </section>

      {/* Subtle decorative elements could be added here */}
    </main>
  );
}
