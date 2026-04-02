'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <nav className={styles.nav}>
      <div className={`${styles.inner} container`}>
        <div className={styles.navContent}>
          <Link href="/" className={styles.siteHeader}>JUN.</Link>
          
          <button 
            className={`${styles.hamburger} ${isOpen ? styles.active : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`${styles.menuOverlay} ${isOpen ? styles.menuVisible : ''}`}>
            <ul className={styles.links}>
              <li>
                <Link href="/" className={styles.link}>HOME</Link>
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
                <Link href="/admin" className={styles.link} style={{ opacity: 0.5 }}>MANAGE</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
