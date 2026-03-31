'use client';

import { useState, useEffect, useRef } from 'react';

interface Photo {
  id: number;
  filename: string;
  url: string;
  caption: string;
}

export default function AdminPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchPhotos = async () => {
    const res = await fetch('/api/photos');
    const data = await res.json();
    setPhotos(data);
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const uploadFile = async (file: File) => {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('caption', caption);
    const res = await fetch('/api/photos', { method: 'POST', body: form });
    if (res.ok) {
      showMessage(`✓ "${file.name}" 업로드 완료`, 'success');
      setCaption('');
      await fetchPhotos();
    } else {
      showMessage('업로드 실패', 'error');
    }
    setUploading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      await uploadFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      await uploadFile(file);
    }
  };

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const confirmDelete = async (id: number) => {
    const res = await fetch(`/api/photos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showMessage('삭제 완료', 'success');
      await fetchPhotos();
    } else {
      showMessage('삭제 실패', 'error');
    }
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // ... later in JSX, after the photo list
  {showDeleteConfirm && (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100,
    }}>
      <div style={{
        background: '#111', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: 'var(--foreground)',
      }}>
        <p style={{ marginBottom: '1.5rem' }}>이 사진을 삭제하시겠습니까?</p>
        <button onClick={() => confirmDelete(deleteId!)} style={{
          marginRight: '1rem', padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', borderRadius: '4px', cursor: 'pointer'
        }}>삭제</button>
        <button onClick={() => { setShowDeleteConfirm(false); setDeleteId(null); }} style={{
          padding: '0.5rem 1rem', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ade80', borderRadius: '4px', cursor: 'pointer'
        }}>취소</button>
      </div>
    </div>
  )}
  const startEdit = (photo: Photo) => {
    setEditingId(photo.id);
    setEditCaption(photo.caption);
  };

  const saveEdit = async (id: number) => {
    const res = await fetch(`/api/photos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption: editCaption }),
    });
    if (res.ok) {
      showMessage('설명 수정 완료', 'success');
      setEditingId(null);
      await fetchPhotos();
    } else {
      showMessage('수정 실패', 'error');
    }
  };

  return (
    <main style={{ minHeight: '100vh', padding: '8rem 2rem 4rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '0.5rem' }}>
        PHOTO MANAGER
      </h1>
      <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '3rem' }}>
        사진을 업로드하고 관리하세요
      </p>

      {/* 메시지 알림 */}
      {message && (
        <div style={{
          position: 'fixed', top: '5rem', right: '2rem', zIndex: 1000,
          padding: '0.75rem 1.5rem',
          background: message.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
          borderRadius: '4px', fontSize: '0.85rem',
          color: message.type === 'success' ? '#4ade80' : '#f87171',
        }}>
          {message.text}
        </div>
      )}

      {/* 업로드 영역 */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)'}`,
          borderRadius: '8px',
          padding: '4rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '1.5rem',
          background: dragOver ? 'rgba(255,255,255,0.04)' : 'transparent',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📁</div>
        <p style={{ fontWeight: 600, letterSpacing: '2px', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          {uploading ? '업로드 중...' : '클릭하거나 파일을 드래그해서 올리세요'}
        </p>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>
          JPG, PNG, HEIC, WEBP, GIF, TIFF, BMP, AVIF, SVG 등 모든 이미지 형식 지원
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.heic,.heif,.tiff,.tif,.bmp,.webp,.avif,.svg"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* 설명 입력 */}
      <div style={{ marginBottom: '3rem', display: 'flex', gap: '1rem' }}>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="업로드할 사진의 설명 (선택사항)"
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '4px',
            padding: '0.75rem 1rem',
            color: 'var(--foreground)',
            fontSize: '0.9rem',
            outline: 'none',
          }}
        />
      </div>

      {/* 사진 목록 */}
      <div>
        <h2 style={{ fontSize: '0.75rem', letterSpacing: '3px', fontWeight: 700, color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
          등록된 사진 ({photos.length}장)
        </h2>

        {photos.length === 0 ? (
          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', padding: '3rem 0' }}>
            아직 등록된 사진이 없습니다.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {photos.map((photo) => (
              <div key={photo.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                padding: '1rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
              }}>
                {/* 썸네일 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption}
                  style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                />

                {/* 파일명 + 설명 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '0.3rem', letterSpacing: '1px' }}>
                    {photo.filename}
                  </p>
                  {editingId === photo.id ? (
                    <input
                      type="text"
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(photo.id); if (e.key === 'Escape') setEditingId(null); }}
                      autoFocus
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '3px',
                        padding: '0.4rem 0.75rem',
                        color: 'var(--foreground)',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{photo.caption || '(설명 없음)'}</p>
                  )}
                </div>

                {/* 버튼 */}
                <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                  {editingId === photo.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(photo.id)}
                        style={{
                          padding: '0.4rem 1rem',
                          background: 'rgba(34,197,94,0.15)',
                          border: '1px solid rgba(34,197,94,0.3)',
                          borderRadius: '3px',
                          color: '#4ade80',
                          fontSize: '0.75rem',
                          letterSpacing: '1px',
                          cursor: 'pointer',
                        }}
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{
                          padding: '0.4rem 1rem',
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '3px',
                          color: 'var(--foreground-muted)',
                          fontSize: '0.75rem',
                          letterSpacing: '1px',
                          cursor: 'pointer',
                        }}
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit(photo)}
                      style={{
                        padding: '0.4rem 1rem',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '3px',
                        color: 'var(--foreground-muted)',
                        fontSize: '0.75rem',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                      }}
                    >
                      설명 편집
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(photo.id)}
                    style={{
                      padding: '0.4rem 1rem',
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '3px',
                      color: '#f87171',
                      fontSize: '0.75rem',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
        {showDeleteConfirm && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100,
          }}>
            <div style={{
              background: '#111', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: 'var(--foreground)',
            }}>
              <p style={{ marginBottom: '1.5rem' }}>이 사진을 삭제하시겠습니까?</p>
              <button onClick={() => confirmDelete(deleteId!)} style={{
                marginRight: '1rem', padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', borderRadius: '4px', cursor: 'pointer'
              }}>삭제</button>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteId(null); }} style={{
                padding: '0.5rem 1rem', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ade80', borderRadius: '4px', cursor: 'pointer'
              }}>취소</button>
            </div>
          </div>
        )}
      </main>
  );
}
