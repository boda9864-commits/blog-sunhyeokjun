'use client';

import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={`${styles.nav} glass`}>
      <div className={`${styles.inner} container`}>
        <Link href="/" className={styles.logo}>
          Sunhyeokjun<span>.</span>
        </Link>
        <ul className={styles.links}>
          <li>
            <Link href="/" className={styles.link}>블로그</Link>
          </li>
          <li>
            <Link href="/photos" className={styles.link}>사진</Link>
          </li>
          <li>
            <Link href="/about" className={styles.link}>소개</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
