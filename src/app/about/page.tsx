import { gearCategories } from '@/data/gear';
import styles from './About.module.css';

export default function AboutPage() {
  return (
    <main className={`${styles.container} fade-in container`}>
      <h1 className={styles.title}>
        WHO I AM<span style={{ color: 'var(--foreground-muted)' }}>.</span>
      </h1>

      <div className={styles.intro}>
        <p>
          안녕하세요. 저는 순혁준 입니다.<br />
          원광대학교에서 컴퓨터소프트웨어를 공부하고 있습니다.
        </p>
      </div>

      {/* MY GEAR / SETUP SECTION */}
      <section className={styles.gearSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            MY GEAR<span style={{ color: 'var(--primary)' }}>.</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            생산적인 개발과 창작 몰입을 위해 함께하고 있는 장비와 작업 환경입니다.
          </p>
        </div>

        <div>
          {gearCategories.map((cat, idx) => (
            <div key={idx} className={styles.categoryGroup}>
              <div className={styles.categoryHeader}>
                {cat.icon && <span className={styles.categoryIcon}>{cat.icon}</span>}
                <h3 className={styles.categoryTitle}>{cat.category}</h3>
              </div>

              <div className={styles.gearGrid}>
                {cat.items.map((item, itemIdx) => (
                  <div key={itemIdx} className={styles.gearCard}>
                    <div className={styles.cardTop}>
                      {item.role && <span className={styles.roleBadge}>{item.role}</span>}
                      <h4 className={styles.gearName}>{item.name}</h4>
                      {Array.isArray(item.specs) ? (
                        <ul className={styles.gearSpecsList}>
                          {item.specs.map((spec, sIdx) => (
                            <li key={sIdx}>{spec}</li>
                          ))}
                        </ul>
                      ) : item.specs ? (
                        <p className={styles.gearSpecs}>{item.specs}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <div className={styles.contactSection}>
        <h2 className={styles.contactLabel}>
          CONNECT : <a href="mailto:boda9864@wku.ac.kr" className={styles.contactEmail}>boda9864@wku.ac.kr</a>
        </h2>
        <p className={styles.contactNote}>
          방문해 주셔서 감사합니다.
        </p>
      </div>
    </main>
  );
}
