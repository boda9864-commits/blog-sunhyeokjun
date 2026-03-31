'use client';

import { useState, useEffect } from 'react';
import styles from './Photos.module.css';

interface Photo {
  id: number;
  url: string;
  caption: string;
}

const myPhotos: Photo[] = [
  {
    id: 1,
    url: '/images/photos/651368940_910463718472319_6134888753375171182_n.jpg',
    caption: 'MOMENTS IN TIME'
  },
];

export default function PhotosPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const hasPhotos = myPhotos.length > 0;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPhoto(null);
    };
    
    if (selectedPhoto) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [selectedPhoto]);

  return (
    <div className={`${styles.container} container`}>
      <header>
        <h1 className={styles.title}>VISUALS</h1>
        <p className={styles.subtitle}>
          찰나의 포착, 그리고 기록.
        </p>
      </header>

      {hasPhotos ? (
        <div className={styles.grid}>
          {myPhotos.map((photo) => (
            <div 
              key={photo.id} 
              className={styles.photoCard}
              onClick={() => setSelectedPhoto(photo)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.caption} className={styles.img} />
              <div className={styles.overlay}>
                <p className={styles.caption}>{photo.caption}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          padding: '8rem 0', 
          textAlign: 'center',
          borderTop: '1px solid var(--glass-border)'
        }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1rem', letterSpacing: '2px' }}>NO VISUALS YET</h2>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem' }}>
            첫 번째 기록을 기다리고 있습니다.
          </p>
        </div>
      )}

      {selectedPhoto && (
        <div className={styles.modal} onClick={() => setSelectedPhoto(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setSelectedPhoto(null)}>
              CLOSE
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={selectedPhoto.url} 
              alt={selectedPhoto.caption} 
              className={styles.modalImg} 
            />
            <p className={styles.modalCaption}>{selectedPhoto.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}
