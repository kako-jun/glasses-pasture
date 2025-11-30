import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../stores/userStore';
import { glassesApi } from '../api/client';
import styles from './GambitPage.module.css';

interface Gambit {
  id: string;
  glassesId: string;
  condition: { type: string; threshold?: number };
  action: { type: string };
  probability: number;
  enabled: boolean;
  priority: number;
}

function GambitPage() {
  const { t } = useTranslation();
  const { glasses } = useUserStore();
  const [gambits, setGambits] = useState<Gambit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGambits();
  }, [glasses?.id]);

  async function loadGambits() {
    if (!glasses?.id) return;

    try {
      const result = await glassesApi.getGambits(glasses.id);
      if (result.data) {
        setGambits(result.data.gambits);
      }
    } catch (error) {
      console.error('Failed to load gambits:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(gambit: Gambit) {
    if (!glasses?.id) return;

    const newEnabled = !gambit.enabled;
    await glassesApi.updateGambit(glasses.id, gambit.id, { enabled: newEnabled });

    setGambits(
      gambits.map((g) =>
        g.id === gambit.id ? { ...g, enabled: newEnabled } : g
      )
    );
  }

  async function handleProbabilityChange(gambit: Gambit, probability: number) {
    if (!glasses?.id) return;

    await glassesApi.updateGambit(glasses.id, gambit.id, { probability });

    setGambits(
      gambits.map((g) =>
        g.id === gambit.id ? { ...g, probability } : g
      )
    );
  }

  const getConditionLabel = (condition: { type: string; threshold?: number }) => {
    const key = `gambit.conditions.${condition.type}` as const;
    return t(key);
  };

  const getActionLabel = (action: { type: string }) => {
    const key = `gambit.actions.${action.type}` as const;
    return t(key);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.loading}>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('gambit.title')}</h1>
      </header>

      <p className={styles.description}>
        眼鏡が他の眼鏡と交流するときの行動パターンを設定できます。
        条件が成立したとき、設定した確率で行動が実行されます。
      </p>

      <div className={styles.gambitList}>
        {gambits.map((gambit) => (
          <div
            key={gambit.id}
            className={`${styles.gambitCard} ${!gambit.enabled ? styles.disabled : ''}`}
          >
            <div className={styles.gambitHeader}>
              <label className={styles.enableToggle}>
                <input
                  type="checkbox"
                  checked={gambit.enabled}
                  onChange={() => handleToggle(gambit)}
                />
                <span className={styles.toggleSlider} />
              </label>
              <span className={styles.priority}>#{gambit.priority}</span>
            </div>

            <div className={styles.gambitBody}>
              <div className={styles.rule}>
                <span className={styles.ruleLabel}>{t('gambit.condition')}:</span>
                <span className={styles.ruleValue}>
                  {getConditionLabel(gambit.condition)}
                </span>
              </div>

              <div className={styles.arrow}>→</div>

              <div className={styles.rule}>
                <span className={styles.ruleLabel}>{t('gambit.action')}:</span>
                <span className={styles.ruleValue}>
                  {getActionLabel(gambit.action)}
                </span>
              </div>
            </div>

            <div className={styles.gambitFooter}>
              <label className={styles.probabilityLabel}>
                {t('gambit.probability')}: {gambit.probability}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={gambit.probability}
                onChange={(e) =>
                  handleProbabilityChange(gambit, parseInt(e.target.value))
                }
                className={styles.probabilitySlider}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GambitPage;
