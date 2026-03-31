'use client';

import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={`${styles.inner} container`}>
        <Link href="/" className={styles.logo}>
          HOME
        </Link>
        <ul className={styles.links}>
          <li>
            <Link href="/photos" className={styles.link}>PHOTOS</Link>
          </li>
          <li>
            <Link href="/portfolio" className={styles.link}>PORTFOLIO</Link>
          </li>
          <li>
            <Link href="/about" className={styles.link}>ABOUT</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
