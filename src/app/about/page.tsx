export default function AboutPage() {
  return (
    <div className="fade-in" style={{ padding: '4rem 0', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '2rem', letterSpacing: '-2px' }}>
        안녕하세요, 순혁준입니다<span style={{ color: 'var(--primary)' }}>.</span>
      </h1>
      <div className="prose">
        <p>
          저는 일상의 세밀한 부분에서 영감을 얻는 개발자이자 꿈꾸는 사람입니다. 
          이 블로그는 저의 생각, 발견, 그리고 저를 움직이게 하는 호기심들의 기록입니다.
        </p>
        <p>
          현재는 기술과 창의성의 접점을 탐구하고 있으며, 특히 기능적이면서도 미학적으로 즐거운 경험을 만드는 데 집중하고 있습니다.
        </p>
        
        <h2 style={{ marginTop: '3rem' }}>제가 열정을 가진 것들:</h2>
        <p>
          - **지속적인 학습**: 항상 새로운 구축 방식과 개선 방법을 고민합니다.
          - **의도적인 디자인**: 평온함과 명확함을 주는 공간을 만듭니다.
          - **스토리텔링**: 업무와 개인적인 성장을 통해 배운 교훈들을 나눕니다.
        </p>
        
        <p style={{ marginTop: '3rem', opacity: 0.6 }}>
          방문해 주셔서 감사합니다. 연결을 원하시면 언제든 연락해 주세요!
        </p>
      </div>
    </div>
  );
}
