import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { boardApi } from '../api/client';
import styles from './BoardPage.module.css';

interface BoardDate {
  date: string;
  postCount: number;
}

interface BoardPost {
  id: string;
  glassesId: string;
  glassesName: string;
  content: string;
  postedAt: string;
}

function BoardPage() {
  const { t } = useTranslation();
  const [dates, setDates] = useState<BoardDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadPosts(selectedDate);
    }
  }, [selectedDate]);

  async function loadDates() {
    try {
      const result = await boardApi.getDates();
      if (result.data) {
        setDates(result.data.dates);
        if (result.data.dates.length > 0) {
          setSelectedDate(result.data.dates[0].date);
        }
      }
    } catch (error) {
      console.error('Failed to load dates:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPosts(date: string) {
    setLoading(true);
    try {
      const result = await boardApi.getByDate(date);
      if (result.data) {
        setPosts(result.data.posts);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return t('board.today');
    }
    if (dateString === yesterday.toISOString().split('T')[0]) {
      return t('board.yesterday');
    }

    const diff = Math.floor(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    return t('board.daysAgo', { days: diff });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('board.title')}</h1>
      </header>

      {/* Date tabs */}
      <div className={styles.dateTabs}>
        {dates.map((d) => (
          <button
            key={d.date}
            className={`${styles.dateTab} ${selectedDate === d.date ? styles.dateTabActive : ''}`}
            onClick={() => setSelectedDate(d.date)}
          >
            <span className={styles.dateLabel}>{formatDateLabel(d.date)}</span>
            <span className={styles.dateCount}>{d.postCount}</span>
          </button>
        ))}
      </div>

      {/* Board - fence with papers */}
      <div className={styles.fence}>
        {loading ? (
          <p className={styles.empty}>{t('common.loading')}</p>
        ) : posts.length === 0 ? (
          <p className={styles.empty}>{t('board.empty')}</p>
        ) : (
          <div className={styles.papers}>
            {posts.map((post, index) => (
              <article
                key={post.id}
                className={styles.paper}
                style={{
                  transform: `rotate(${(index % 3 - 1) * 2}deg)`,
                }}
              >
                <p className={styles.paperContent}>
                  {post.content.length > 200
                    ? post.content.slice(0, 200) + '...'
                    : post.content}
                </p>
                <footer className={styles.paperFooter}>
                  <Link
                    to={`/stable/${post.glassesId}`}
                    className={styles.paperAuthor}
                  >
                    {post.glassesName}
                  </Link>
                  <time className={styles.paperTime}>
                    {formatTime(post.postedAt)}
                  </time>
                </footer>
                <Link
                  to={`/stable/${post.glassesId}`}
                  className={styles.readMore}
                >
                  {t('board.readOriginal')}
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BoardPage;
