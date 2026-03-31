import { getPostData, getSortedPostsData } from '@/lib/posts';
import { marked } from 'marked';
import styles from './Post.module.css';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const postData = getPostData(slug);
  const htmlContent = marked(postData.content);

  return (
    <article className={styles.post}>
      <header className={styles.header}>
        <span className={styles.date}>
          {new Date(postData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
        <h1 className={styles.title}>{postData.title}</h1>
      </header>
      <div 
        className="prose"
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </article>
  );
}
