import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../stores/userStore';
import { usersApi, glassesApi } from '../api/client';
import styles from './EntrancePage.module.css';

function EntrancePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { screeningPassed } = useUserStore();

  const handleEnter = () => {
    if (screeningPassed) {
      navigate('/pasture');
    } else {
      navigate('/screening');
    }
  };

  return (
    <div className={styles.container}>
      {/* Background - foggy pasture */}
      <div className={styles.background}>
        <div className={styles.sky} />
        <div className={styles.fog} />
        <div className={styles.grass} />
        <div className={styles.fence} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Notice sign */}
        <div className={styles.notice}>
          <span className={styles.noticeText}>{t('entrance.notice')}</span>
        </div>

        {/* Welcome text */}
        <p className={styles.welcome}>{t('entrance.welcome')}</p>

        {/* Enter button */}
        <button className={styles.enterButton} onClick={handleEnter}>
          <span className={styles.glassesEmoji}>👓</span>
        </button>

        {/* Debug links */}
        {import.meta.env.DEV && (
          <button
            className={styles.debugLink}
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{ right: 'auto', left: 'var(--spacing-md)' }}
          >
            [DEV] Reset
          </button>
        )}
        {import.meta.env.DEV && (
          <button
            className={styles.debugLink}
            onClick={async () => {
              // Create real user and glasses via API for debug
              const store = useUserStore.getState();

              // Ensure we have a user
              let userId = store.userId;
              if (!userId) {
                const userResult = await usersApi.createOrGet();
                if (userResult.data) {
                  userId = userResult.data.id;
                  store.setUserId(userId);
                }
              }

              if (!userId) {
                console.error('Failed to create user');
                return;
              }

              // Create glasses
              const glassesResult = await glassesApi.create(userId);
              if (glassesResult.data) {
                store.setGlasses(glassesResult.data as any);
              }

              store.setScreeningPassed(true);
              navigate('/pasture');
            }}
          >
            [DEV] Skip to Pasture
          </button>
        )}
      </div>
    </div>
  );
}

export default EntrancePage;
