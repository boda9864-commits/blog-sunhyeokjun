'use client';

import { useEffect, useState } from 'react';
import styles from './Portfolio.module.css';

interface Project {
  id: number;
  title: string;
  type: string;
  description: string;
  link?: string;
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portfolio')
      .then((r) => r.json())
      .then((data) => { setProjects(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className={`${styles.container} container`}>
      <header className={styles.header}>
        <h1 className={styles.title}>PORTFOLIO</h1>
        <p className={styles.subtitle}>
          개발 프로젝트와 창작물들을 기록하는 공간입니다.<br />
          본질에 집중한 단순함과 기능의 조화를 탐구합니다.
        </p>
      </header>

      <div className={styles.grid}>
        {loading ? (
          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', padding: '3rem 0' }}>
            불러오는 중...
          </p>
        ) : projects.length === 0 ? (
          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', padding: '3rem 0', gridColumn: '1/-1' }}>
            아직 등록된 프로젝트가 없습니다.
          </p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className={styles.projectCard}
              style={project.link ? { cursor: 'pointer' } : {}}
              onClick={() => project.link && window.open(project.link, '_blank')}
            >
              <div className={styles.cardContent}>
                <p className={styles.projectType}>{project.type}</p>
                <h3 className={styles.projectTitle}>{project.title}</h3>
                {project.description && (
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                    {project.description}
                  </p>
                )}
                {project.link && (
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.75rem', letterSpacing: '1px' }}>
                    VISIT →
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
