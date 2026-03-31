import Link from 'next/link';
import styles from './PostCard.module.css';

interface PostCardProps {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

export default function PostCard({ slug, title, date, excerpt }: PostCardProps) {
  return (
    <Link href={`/posts/${slug}`} className={`${styles.card} glass`}>
      <span className={styles.date}>{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.excerpt}>{excerpt}</p>
    </Link>
  );
}
