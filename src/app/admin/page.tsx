'use client';

import { useState, useEffect, useRef } from 'react';

/* ─── Types ─── */
interface Photo {
  id: number;
  filename: string;
  url: string;
  caption: string;
}

interface Project {
  id: number;
  title: string;
  type: string;
  description: string;
  link: string;
}

/* ─── Constants ─── */
const ADMIN_PASSWORD = '121712';
const AUTH_KEY = 'admin_authed';

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '4px',
  padding: '0.75rem 1rem',
  color: 'var(--foreground)',
  fontSize: '0.9rem',
  outline: 'none',
};

const btnBase: React.CSSProperties = {
  padding: '0.4rem 1rem',
  borderRadius: '3px',
  fontSize: '0.75rem',
  letterSpacing: '1px',
  cursor: 'pointer',
};

/* ─── Password Gate ─── */
function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, '1');
      onAuth();
    } else {
      setError(true);
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2rem' }}>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)}
        }
        .shake{animation:shake 0.5s ease}
      `}</style>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '4px', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>MANAGE</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em' }}>관리자 인증</h1>
      </div>
      <form onSubmit={handleSubmit} className={shake ? 'shake' : ''} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '320px' }}>
        <input
          type="password" value={input} onChange={(e) => { setInput(e.target.value); setError(false); }}
          placeholder="비밀번호를 입력하세요" autoFocus
          style={{ ...inputStyle, border: `1px solid ${error ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.12)'}`, letterSpacing: '4px', textAlign: 'center', transition: 'border-color 0.2s' }}
        />
        {error && <p style={{ color: '#f87171', fontSize: '0.8rem', letterSpacing: '1px', margin: 0 }}>비밀번호가 올바르지 않습니다</p>}
        <button type="submit"
          style={{ width: '100%', padding: '0.85rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'var(--foreground)', fontSize: '0.8rem', letterSpacing: '3px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        >ENTER</button>
      </form>
    </div>
  );
}

/* ─── Main Admin Page ─── */
export default function AdminPage() {
  /* auth */
  const [authed, setAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  /* tab */
  const [tab, setTab] = useState<'photos' | 'portfolio'>('photos');

  /* ── photos state ── */
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [editingPhotoId, setEditingPhotoId] = useState<number | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [deletePhotoId, setDeletePhotoId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── portfolio state ── */
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState({ title: '', type: '', description: '', link: '' });
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* shared */
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  /* ── auth check ── */
  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) === '1') setAuthed(true);
    setAuthChecked(true);
  }, []);

  /* ── fetch on auth ── */
  useEffect(() => {
    if (!authed) return;
    fetchPhotos();
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  if (!authChecked) return null;
  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;

  /* ── helpers ── */
  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  /* ── Photos API ── */
  const fetchPhotos = async () => {
    const res = await fetch('/api/photos');
    setPhotos(await res.json());
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('caption', caption);
    const res = await fetch('/api/photos', { method: 'POST', body: form });
    if (res.ok) { showMessage(`✓ "${file.name}" 업로드 완료`, 'success'); setCaption(''); await fetchPhotos(); }
    else showMessage('업로드 실패', 'error');
    setUploading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    for (const file of Array.from(e.target.files || [])) await uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    for (const file of Array.from(e.dataTransfer.files)) await uploadFile(file);
  };

  const savePhotoEdit = async (id: number) => {
    const res = await fetch(`/api/photos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption: editCaption }) });
    if (res.ok) { showMessage('설명 수정 완료', 'success'); setEditingPhotoId(null); await fetchPhotos(); }
    else showMessage('수정 실패', 'error');
  };

  const confirmDeletePhoto = async () => {
    if (deletePhotoId === null) return;
    const res = await fetch(`/api/photos/${deletePhotoId}`, { method: 'DELETE' });
    if (res.ok) { showMessage('삭제 완료', 'success'); await fetchPhotos(); }
    else showMessage('삭제 실패', 'error');
    setDeletePhotoId(null);
  };

  /* ── Portfolio API ── */
  const fetchProjects = async () => {
    const res = await fetch('/api/portfolio');
    setProjects(await res.json());
  };

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title || !newProject.type) { showMessage('제목과 분류는 필수입니다', 'error'); return; }
    setSubmitting(true);
    const res = await fetch('/api/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newProject) });
    if (res.ok) { showMessage('✓ 프로젝트 추가 완료', 'success'); setNewProject({ title: '', type: '', description: '', link: '' }); await fetchProjects(); }
    else showMessage('추가 실패', 'error');
    setSubmitting(false);
  };

  const saveProjectEdit = async () => {
    if (!editingProject) return;
    const res = await fetch(`/api/portfolio/${editingProject.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingProject) });
    if (res.ok) { showMessage('수정 완료', 'success'); setEditingProject(null); await fetchProjects(); }
    else showMessage('수정 실패', 'error');
  };

  const confirmDeleteProject = async () => {
    if (deleteProjectId === null) return;
    const res = await fetch(`/api/portfolio/${deleteProjectId}`, { method: 'DELETE' });
    if (res.ok) { showMessage('삭제 완료', 'success'); await fetchProjects(); }
    else showMessage('삭제 실패', 'error');
    setDeleteProjectId(null);
  };

  /* ─────────────────────── JSX ─────────────────────── */
  return (
    <main style={{ minHeight: '100vh', padding: '8rem 2rem 4rem', maxWidth: '1000px', margin: '0 auto' }}>

      {/* Header */}
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '0.5rem' }}>MANAGER</h1>
      <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '2.5rem' }}>
        사진과 포트폴리오를 관리하세요
      </p>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {(['photos', 'portfolio'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: '0.75rem 2rem',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--foreground)' : '2px solid transparent',
              color: tab === t ? 'var(--foreground)' : 'var(--foreground-muted)',
              fontSize: '0.75rem',
              letterSpacing: '3px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-1px',
            }}
          >
            {t === 'photos' ? 'PHOTOS' : 'PORTFOLIO'}
          </button>
        ))}
      </div>

      {/* Toast */}
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

      {/* ══════════ PHOTOS TAB ══════════ */}
      {tab === 'photos' && (
        <div>
          {/* Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '8px', padding: '4rem 2rem', textAlign: 'center', cursor: 'pointer',
              marginBottom: '1.5rem', background: dragOver ? 'rgba(255,255,255,0.04)' : 'transparent', transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📁</div>
            <p style={{ fontWeight: 600, letterSpacing: '2px', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              {uploading ? '업로드 중...' : '클릭하거나 파일을 드래그해서 올리세요'}
            </p>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>JPG, PNG, HEIC, WEBP, GIF, TIFF, BMP, AVIF, SVG 등 모든 이미지 형식 지원</p>
          </div>
          <input ref={fileInputRef} type="file" multiple accept="image/*,.heic,.heif,.tiff,.tif,.bmp,.webp,.avif,.svg" onChange={handleFileChange} style={{ display: 'none' }} />

          {/* Caption Input */}
          <div style={{ marginBottom: '3rem' }}>
            <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="업로드할 사진의 설명 (선택사항)" style={inputStyle} />
          </div>

          {/* Photo List */}
          <h2 style={{ fontSize: '0.75rem', letterSpacing: '3px', fontWeight: 700, color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
            등록된 사진 ({photos.length}장)
          </h2>
          {photos.length === 0 ? (
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', padding: '3rem 0' }}>아직 등록된 사진이 없습니다.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {photos.map((photo) => (
                <div key={photo.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt={photo.caption} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '0.3rem', letterSpacing: '1px' }}>{photo.filename}</p>
                    {editingPhotoId === photo.id ? (
                      <input type="text" value={editCaption} onChange={(e) => setEditCaption(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') savePhotoEdit(photo.id); if (e.key === 'Escape') setEditingPhotoId(null); }}
                        autoFocus style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '3px', padding: '0.4rem 0.75rem', color: 'var(--foreground)', fontSize: '0.9rem', outline: 'none' }}
                      />
                    ) : (
                      <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{photo.caption || '(설명 없음)'}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                    {editingPhotoId === photo.id ? (
                      <>
                        <button onClick={() => savePhotoEdit(photo.id)} style={{ ...btnBase, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>저장</button>
                        <button onClick={() => setEditingPhotoId(null)} style={{ ...btnBase, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--foreground-muted)' }}>취소</button>
                      </>
                    ) : (
                      <button onClick={() => { setEditingPhotoId(photo.id); setEditCaption(photo.caption); }} style={{ ...btnBase, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--foreground-muted)' }}>설명 편집</button>
                    )}
                    <button onClick={() => setDeletePhotoId(photo.id)} style={{ ...btnBase, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>삭제</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════ PORTFOLIO TAB ══════════ */}
      {tab === 'portfolio' && (
        <div>
          {/* Add Form */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '2rem', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '0.75rem', letterSpacing: '3px', fontWeight: 700, color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>NEW PROJECT</h2>
            <form onSubmit={addProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} placeholder="프로젝트 제목 *" style={inputStyle} />
                <input value={newProject.type} onChange={(e) => setNewProject({ ...newProject, type: e.target.value })} placeholder="분류 (예: WEB, APP, DESIGN) *" style={inputStyle} />
              </div>
              <textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="프로젝트 설명 (선택사항)" rows={3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
              <input value={newProject.link} onChange={(e) => setNewProject({ ...newProject, link: e.target.value })} placeholder="링크 URL (선택사항, 예: https://github.com/...)" style={inputStyle} />
              <button type="submit" disabled={submitting}
                style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: 'var(--foreground)', fontSize: '0.75rem', letterSpacing: '2px', fontWeight: 700, cursor: 'pointer' }}>
                {submitting ? '추가 중...' : '+ 추가'}
              </button>
            </form>
          </div>

          {/* Project List */}
          <h2 style={{ fontSize: '0.75rem', letterSpacing: '3px', fontWeight: 700, color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
            등록된 프로젝트 ({projects.length}개)
          </h2>
          {projects.length === 0 ? (
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', padding: '3rem 0' }}>아직 등록된 프로젝트가 없습니다.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {projects.map((project) => (
                <div key={project.id} style={{ padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px' }}>
                  {editingProject?.id === project.id ? (
                    /* Edit Mode */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <input value={editingProject.title} onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })} placeholder="제목" style={{ ...inputStyle, padding: '0.6rem 0.75rem' }} />
                        <input value={editingProject.type} onChange={(e) => setEditingProject({ ...editingProject, type: e.target.value })} placeholder="분류" style={{ ...inputStyle, padding: '0.6rem 0.75rem' }} />
                      </div>
                      <textarea value={editingProject.description} onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })} placeholder="설명" rows={2}
                        style={{ ...inputStyle, padding: '0.6rem 0.75rem', resize: 'vertical', fontFamily: 'inherit' }} />
                      <input value={editingProject.link} onChange={(e) => setEditingProject({ ...editingProject, link: e.target.value })} placeholder="링크 URL" style={{ ...inputStyle, padding: '0.6rem 0.75rem' }} />
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={saveProjectEdit} style={{ ...btnBase, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>저장</button>
                        <button onClick={() => setEditingProject(null)} style={{ ...btnBase, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--foreground-muted)' }}>취소</button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--foreground-muted)', marginBottom: '0.3rem' }}>{project.type}</p>
                        <p style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.3rem' }}>{project.title}</p>
                        {project.description && <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{project.description}</p>}
                        {project.link && <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.3rem' }}>{project.link}</p>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                        <button onClick={() => setEditingProject({ ...project })} style={{ ...btnBase, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--foreground-muted)' }}>편집</button>
                        <button onClick={() => setDeleteProjectId(project.id)} style={{ ...btnBase, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>삭제</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Delete Confirm Modal (Photos) ── */}
      {deletePhotoId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100 }}>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: 'var(--foreground)' }}>
            <p style={{ marginBottom: '1.5rem' }}>이 사진을 삭제하시겠습니까?</p>
            <button onClick={confirmDeletePhoto} style={{ marginRight: '1rem', padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', borderRadius: '4px', cursor: 'pointer' }}>삭제</button>
            <button onClick={() => setDeletePhotoId(null)} style={{ padding: '0.5rem 1rem', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ade80', borderRadius: '4px', cursor: 'pointer' }}>취소</button>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal (Portfolio) ── */}
      {deleteProjectId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100 }}>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: 'var(--foreground)' }}>
            <p style={{ marginBottom: '1.5rem' }}>이 프로젝트를 삭제하시겠습니까?</p>
            <button onClick={confirmDeleteProject} style={{ marginRight: '1rem', padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', borderRadius: '4px', cursor: 'pointer' }}>삭제</button>
            <button onClick={() => setDeleteProjectId(null)} style={{ padding: '0.5rem 1rem', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ade80', borderRadius: '4px', cursor: 'pointer' }}>취소</button>
          </div>
        </div>
      )}
    </main>
  );
}
