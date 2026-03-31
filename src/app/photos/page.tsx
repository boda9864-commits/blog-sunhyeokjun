'use client';

import { useState, useEffect } from 'react';
import styles from './Photos.module.css';

interface Photo {
  id: number;
  filename: string;
  url: string;
  caption: string;
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    fetch('/api/photos')
      .then((res) => res.json())
      .then((data) => setPhotos(data));
  }, []);

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
        <h1 className={styles.title}>PHOTOS</h1>
        <p className={styles.subtitle}>이곳은 제가 찍은 사진을 올리는 곳입니다.</p>
      </header>

      {photos.length > 0 ? (
        <div className={styles.grid}>
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={styles.photoCard}
              onClick={() => setSelectedPhoto(photo)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.caption} className={styles.img} />
              <div className={styles.overlay}>
                <p className={styles.caption}>{photo.caption || '(설명 없음)'}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          padding: '8rem 0',
          textAlign: 'center',
          borderTop: '1px solid var(--glass-border)',
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
            {selectedPhoto.caption && (
              <p style={{
                textAlign: 'center',
                marginTop: '1rem',
                fontSize: '0.75rem',
                letterSpacing: '3px',
                color: 'var(--foreground-muted)',
              }}>
                {selectedPhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
