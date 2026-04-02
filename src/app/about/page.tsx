export default function AboutPage() {
  return (
    <main className={`${"fade-in"} container`} style={{ padding: '12rem 0' }}>
      <h1 style={{ 
        fontSize: 'clamp(2.5rem, 8vw, 6rem)', 
        fontWeight: 800, 
        lineHeight: 1, 
        marginBottom: '4rem',
        letterSpacing: '-0.05em' 
      }}>
        WHO I AM<span style={{ color: 'var(--foreground-muted)' }}>.</span>
      </h1>
      
      <div style={{ 
        maxWidth: '700px', 
        fontSize: '1.25rem', 
        lineHeight: 1.8,
        color: 'var(--foreground)',
        fontWeight: 400
      }}>
        <p style={{ marginBottom: '2rem' }}>
          안녕하세요. 저는 순혁준 입니다.<br />
          원광대학교에서 컴퓨터소프트웨어를 공부하고있습니다.
        </p>

        <div style={{ 
          borderTop: '1px solid var(--glass-border)', 
          paddingTop: '3rem',
          marginTop: '4rem'
        }}>
          <h2 style={{ fontSize: '0.8rem', letterSpacing: '2px', fontWeight: 700, marginBottom: '2rem', color: 'var(--foreground-muted)' }}>
            CONNECT : boda9864@wku.ac.kr
          </h2>
          <p style={{ opacity: 0.6, fontSize: '1rem' }}>
            방문해 주셔서 감사합니다.
          </p>
        </div>
      </div>
    </main>
  );
}
