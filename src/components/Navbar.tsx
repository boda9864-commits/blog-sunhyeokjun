'use client';

import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={`${styles.inner} container`}>
        <ul className={styles.links}>
          <li>
            <Link href="/" className={styles.logo}>HOME</Link>
          </li>
          <li>
            <Link href="/tech" className={styles.link}>TECH STACK</Link>
          </li>
          <li>
            <Link href="/portfolio" className={styles.link}>PORTFOLIO</Link>
          </li>
          <li>
            <Link href="/photos" className={styles.link}>PHOTOS</Link>
          </li>
          <li>
            <Link href="/about" className={styles.link}>ABOUT</Link>
          </li>
          <li>
            <Link href="/admin" className={styles.link} style={{ opacity: 0.5, fontSize: '0.65rem' }}>MANAGE</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
