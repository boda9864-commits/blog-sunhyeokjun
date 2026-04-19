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
      .then((data) => { 
        if (Array.isArray(data)) {
          setProjects(data); 
        } else {
          console.error('API Error:', data);
          setProjects([]);
        }
        setLoading(false); 
      })
      .catch((err) => {
        console.error('Fetch Error:', err);
        setProjects([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className={`${styles.container} container`}>
      <header className={styles.header}>
        <h1 className={styles.title}>PORTFOLIO</h1>
        <p className={styles.subtitle}>
          이곳은 제 포트폴리오를 기록하는 공간입니다.
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
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
                    {project.description}
                  </p>
                )}
                {project.link && (
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.75rem', letterSpacing: '1px' }}>
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
