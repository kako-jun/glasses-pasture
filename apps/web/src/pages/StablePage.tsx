import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../stores/userStore';
import { postsApi } from '../api/client';
import styles from './StablePage.module.css';

interface Post {
  id: string;
  glassesId: string;
  glassesName: string;
  content: string;
  postedAt: string;
  isDraft: boolean;
}

function StablePage() {
  const { t } = useTranslation();
  const { glassesId: urlGlassesId } = useParams();
  const { glasses } = useUserStore();

  const targetGlassesId = urlGlassesId || glasses?.id;
  const isOwnStable = !urlGlassesId || urlGlassesId === glasses?.id;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [targetGlassesId]);

  async function loadPosts() {
    if (!targetGlassesId) return;

    setLoading(true);
    try {
      const result = await postsApi.getByGlasses(targetGlassesId, isOwnStable);
      if (result.data) {
        setPosts(result.data.posts);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!glasses?.id || !newContent.trim()) return;

    setSubmitting(true);
    try {
      const result = await postsApi.create(glasses.id, newContent.trim());
      if (result.data) {
        setPosts([result.data, ...posts]);
        setNewContent('');
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setSubmitting(false);
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('stable.title')}</h1>
        {posts.length > 0 && (
          <span className={styles.count}>
            {t('stable.postCount', { count: posts.length })}
          </span>
        )}
      </header>

      {/* Write form (only for own stable) */}
      {isOwnStable && (
        <form className={styles.writeForm} onSubmit={handleSubmit}>
          <textarea
            className={styles.textarea}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder={t('post.placeholder')}
            rows={4}
            maxLength={20000}
          />
          <div className={styles.formActions}>
            <span className={styles.charCount}>
              {newContent.length} / 20,000
            </span>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!newContent.trim() || submitting}
            >
              {t('post.submit')}
            </button>
          </div>
        </form>
      )}

      {/* Posts list */}
      <div className={styles.postsContainer}>
        {loading ? (
          <p className={styles.empty}>{t('common.loading')}</p>
        ) : posts.length === 0 ? (
          <p className={styles.empty}>{t('stable.empty')}</p>
        ) : (
          <ul className={styles.postsList}>
            {posts.map((post) => (
              <li key={post.id} className={styles.postItem}>
                <div className={styles.postPaper}>
                  {post.isDraft && (
                    <span className={styles.draftBadge}>下書き</span>
                  )}
                  <p className={styles.postContent}>{post.content}</p>
                  <time className={styles.postTime}>
                    {formatDate(post.postedAt)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default StablePage;
