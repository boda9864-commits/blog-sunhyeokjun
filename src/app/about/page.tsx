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
          안녕하세요, 순혁준입니다. 저는 일상의 세밀한 부분에서 영감을 얻으며, 
          기술과 창의성의 접점을 탐구하는 사람입니다.
        </p>
        <p style={{ marginBottom: '2rem' }}>
          기능적이면서도 미학적으로 즐거운 경험을 만드는 데 집중하고 있으며, 
          단순함 속에서 본질적인 가치를 찾는 과정을 즐깁니다.
        </p>
        <p style={{ marginBottom: '4rem' }}>
          이곳은 저의 생각, 발견, 그리고 저를 움직이게 하는 호기심들을 기록하는 시각적 보관소입니다.
        </p>

        <div style={{ 
          borderTop: '1px solid var(--glass-border)', 
          paddingTop: '3rem',
          marginTop: '4rem'
        }}>
          <h2 style={{ fontSize: '0.8rem', letterSpacing: '2px', fontWeight: 700, marginBottom: '2rem', color: 'var(--foreground-muted)' }}>
            CONNECT
          </h2>
          <p style={{ opacity: 0.6, fontSize: '1rem' }}>
            새로운 기회와 영감에 대해 이야기하는 것을 좋아합니다.<br/>
            방문해 주셔서 감사합니다.
          </p>
        </div>
      </div>
    </main>
  );
}
