import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../stores/userStore';
import { boardApi, interactionsApi } from '../api/client';
import styles from './PasturePage.module.css';

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

interface InteractionLog {
  id: string;
  timestamp: string;
  actorGlassesId: string;
  actorGlassesName: string;
  targetGlassesId: string;
  targetGlassesName: string;
  actionType: string;
  friendshipDelta: number;
}

function PasturePage() {
  const { t } = useTranslation();
  const { glasses } = useUserStore();

  // Board state
  const [dates, setDates] = useState<BoardDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [boardLoading, setBoardLoading] = useState(true);

  // Interactions state
  const [interactions, setInteractions] = useState<InteractionLog[]>([]);
  const [interactionsLoading, setInteractionsLoading] = useState(true);

  // Load board dates
  useEffect(() => {
    loadDates();
  }, []);

  // Load posts when date changes
  useEffect(() => {
    if (selectedDate) {
      loadPosts(selectedDate);
    }
  }, [selectedDate]);

  // Load interactions
  useEffect(() => {
    if (glasses?.id) {
      loadInteractions();
    } else {
      setInteractionsLoading(false);
    }
  }, [glasses?.id]);

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
      setBoardLoading(false);
    }
  }

  async function loadPosts(date: string) {
    setBoardLoading(true);
    try {
      const result = await boardApi.getByDate(date);
      if (result.data) {
        setPosts(result.data.posts);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setBoardLoading(false);
    }
  }

  async function loadInteractions() {
    try {
      const result = await interactionsApi.getByGlasses(glasses!.id);
      if (result.data) {
        setInteractions(result.data.logs);
      }
    } catch (error) {
      console.error('Failed to load interactions:', error);
    } finally {
      setInteractionsLoading(false);
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

  const getInteractionMessage = (log: InteractionLog) => {
    const isActor = log.actorGlassesId === glasses?.id;
    const otherName = isActor ? log.targetGlassesName : log.actorGlassesName;

    switch (log.actionType) {
      case 'greet':
        return t('interaction.greeted', { target: otherName });
      case 'encourage':
        return t('interaction.encouraged', { target: otherName });
      case 'exchange_item':
        return t('interaction.exchangedItem', { target: otherName });
      case 'play':
        return t('interaction.played', { target: otherName });
      default:
        return '';
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('time.justNow');
    if (minutes < 60) return t('time.minutesAgo', { minutes });
    if (hours < 24) return t('time.hoursAgo', { hours });
    return t('time.daysAgo', { days });
  };

  return (
    <div className={styles.container}>
      {/* My glasses card */}
      {glasses && (
        <div className={styles.glassesCard}>
          <div className={styles.glassesEmoji}>👓</div>
          <div className={styles.glassesInfo}>
            <h2 className={styles.glassesName}>{glasses.name}</h2>
            <div className={styles.glassesStats}>
              <span>{t('glasses.degree')}: {glasses.degree}</span>
              <span>{t('glasses.friendship')}: {glasses.friendshipPoints}</span>
              <span>
                {t('glasses.lensState')}:{' '}
                {glasses.lensState === 'clear'
                  ? t('glasses.clear')
                  : t('glasses.foggy')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Board section - the fence with papers */}
      <section className={styles.boardSection}>
        <h2 className={styles.sectionTitle}>{t('board.title')}</h2>

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

        {/* Fence with papers */}
        <div className={styles.fence}>
          {boardLoading ? (
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
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Interaction logs */}
      {glasses && (
        <section className={styles.logsSection}>
          <h3 className={styles.sectionTitle}>{t('pasture.interactionLog')}</h3>
          {interactionsLoading ? (
            <p className={styles.loading}>{t('common.loading')}</p>
          ) : interactions.length === 0 ? (
            <p className={styles.empty}>{t('pasture.noInteractions')}</p>
          ) : (
            <ul className={styles.logsList}>
              {interactions.slice(0, 10).map((log) => (
                <li key={log.id} className={styles.logItem}>
                  <p className={styles.logMessage}>{getInteractionMessage(log)}</p>
                  <span className={styles.logTime}>{formatRelativeTime(log.timestamp)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

export default PasturePage;
