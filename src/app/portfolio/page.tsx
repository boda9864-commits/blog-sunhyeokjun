import styles from './Portfolio.module.css';

interface Project {
  id: number;
  title: string;
  type: string;
  description: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: 'PROJECT 01',
    type: 'Visual Experience',
    description: 'A study in minimalist interface design.'
  },
  {
    id: 2,
    title: 'PROJECT 02',
    type: 'Digital Archive',
    description: 'Documenting the intersection of technology and art.'
  },
  // Add more as needed
];

export default function PortfolioPage() {
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
        {projects.map((project) => (
          <div key={project.id} className={styles.projectCard}>
            <div className={styles.cardContent}>
              <p className={styles.projectType}>{project.type}</p>
              <h3 className={styles.projectTitle}>{project.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                {project.description}
              </p>
            </div>
          </div>
        ))}
        
        {/* Placeholder for "Add more" */}
        <div 
          className={styles.projectCard} 
          style={{ 
            borderStyle: 'dashed', 
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--foreground-muted)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>+</p>
            <p style={{ fontSize: '0.75rem', letterSpacing: '2px' }}>NEW PROJECT</p>
          </div>
        </div>
      </div>
    </div>
  );
}
