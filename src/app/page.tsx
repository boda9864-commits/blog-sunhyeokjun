import { getSortedPostsData } from '@/lib/posts';
import PostCard from '@/components/PostCard';

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', letterSpacing: '-1px' }}>
          순혁준의 공간<span style={{ color: 'var(--primary)' }}>.</span>
        </h1>
        <p style={{ fontSize: '1.25rem', opacity: 0.7, maxWidth: '600px', margin: '0 auto' }}>
          개인적인 생각과 코드, 그리고 일상의 기록들을 담는 디지털 정원입니다.
        </p>
      </header>

      <section>
        {allPostsData.map(({ slug, date, title, excerpt }) => (
          <PostCard 
            key={slug}
            slug={slug}
            date={date}
            title={title}
            excerpt={excerpt}
          />
        ))}
      </section>
    </div>
  );
}
