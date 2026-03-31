import styles from './Photos.module.css';

/**
 * 📸 사진 올리는 방법 안내:
 * 1. public/images/photos/ 폴더에 직접 찍은 사진 파일을 넣으세요.
 * 2. 아래의 'myPhotos' 배열에 { id: 1, url: '/images/photos/파일이름.jpg', caption: '설명' } 형식으로 추가하세요.
 */
const myPhotos: { id: number; url: string; caption: string }[] = [
  {
    id: 1,
    url: '/images/photos/651368940_910463718472319_6134888753375171182_n.jpg',
    caption: '순혁준님이 직접 올리신 첫 번째 사진 📸'
  },
];

export default function PhotosPage() {
  const hasPhotos = myPhotos.length > 0;

  return (
    <div className={styles.container}>
      <header>
        <h1 className={styles.title}>나의 사진 기록</h1>
        <p className={styles.subtitle}>
          순혁준님이 직접 포착한 아름다운 순간들을 이곳에 담아보세요.
        </p>
      </header>

      {hasPhotos ? (
        <div className={styles.grid}>
          {myPhotos.map((photo) => (
            <div key={photo.id} className={`${styles.photoCard} glass`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.caption} className={styles.img} />
              <div className={styles.overlay}>
                <p className={styles.caption}>{photo.caption}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass" style={{ 
          padding: '4rem', 
          textAlign: 'center', 
          borderRadius: '20px',
          marginTop: '2rem' 
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
          <h2 style={{ marginBottom: '1rem' }}>아직 등록된 사진이 없어요!</h2>
          <p style={{ opacity: 0.7, maxWidth: '400px', margin: '0 auto' }}>
            순혁준님의 카메라에 담긴 특별한 순간들을 이곳에 가장 먼저 기록해 보세요.
          </p>
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--secondary)', borderRadius: '12px', fontSize: '0.9rem', color: '#2D3B2D' }}>
            <strong>도움말:</strong> <code>src/app/photos/page.tsx</code> 파일에서 사진 정보를 입력하면 자동으로 나타납니다.
          </div>
        </div>
      )}
    </div>
  );
}
