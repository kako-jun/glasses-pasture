import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../stores/userStore';
import { screeningApi, glassesApi } from '../api/client';
import { SCREENING_CONFIG } from '@glasses-pasture/shared';
import styles from './ScreeningPage.module.css';

type ScreeningState = 'intro' | 'questions' | 'passed' | 'failed' | 'locked';

function ScreeningPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId, screeningPassed, setScreeningPassed, setGlasses } = useUserStore();

  const [state, setState] = useState<ScreeningState>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Array<{ questionId: number; answer: 'A' | 'B' }>>([]);
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (screeningPassed) {
      navigate('/pasture');
    }
  }, [screeningPassed, navigate]);

  const handleStart = () => {
    setState('questions');
  };

  const handleAnswer = async (answer: 'A' | 'B') => {
    // Prevent double-clicks
    if (isProcessing) return;
    setIsProcessing(true);

    const questionId = currentQuestion + 1;
    const newAnswers = [...answers, { questionId, answer }];
    setAnswers(newAnswers);

    // Show feedback
    setFeedback(t('screening.wipeLens'));
    await new Promise((resolve) => setTimeout(resolve, 800));
    setFeedback('');
    setIsProcessing(false);

    if (currentQuestion < SCREENING_CONFIG.QUESTION_COUNT - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Check if userId exists
      if (!userId) {
        console.error('userId is null - user creation may have failed');
        setState('failed');
        return;
      }

      // Submit answers
      const result = await screeningApi.submit(userId, newAnswers);

      if (result.data?.passed) {
        setState('passed');
        setScreeningPassed(true);

        // Create glasses
        const glassesResult = await glassesApi.create(userId!);
        if (glassesResult.data) {
          setGlasses(glassesResult.data as any);
        }
      } else if (result.data?.locked) {
        setState('locked');
      } else {
        setState('failed');
      }
    }
  };

  const handleProceed = () => {
    navigate('/pasture');
  };

  const handleExit = () => {
    // Redirect to external site (placeholder)
    window.open('https://example.com', '_blank');
  };

  // Render based on state
  if (state === 'intro') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.intro}>{t('screening.intro')}</p>
          <button className={styles.primaryButton} onClick={handleStart}>
            {t('screening.start')}
          </button>
        </div>
      </div>
    );
  }

  if (state === 'questions') {
    const questionKey = `screening.q${currentQuestion + 1}_question`;
    const optionAKey = `screening.q${currentQuestion + 1}_optionA`;
    const optionBKey = `screening.q${currentQuestion + 1}_optionB`;

    return (
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Progress */}
          <div className={styles.progress}>
            {t('screening.progress', {
              current: currentQuestion + 1,
              total: SCREENING_CONFIG.QUESTION_COUNT,
            })}
          </div>

          {/* Progress bar */}
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${((currentQuestion + 1) / SCREENING_CONFIG.QUESTION_COUNT) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className={styles.questionCard}>
            {currentQuestion === 0 && (
              <div className={styles.eyeChart}>
                <span className={styles.eyeChartLetter}>E</span>
              </div>
            )}
            <p className={styles.question}>{t(questionKey)}</p>
          </div>

          {/* Options */}
          <div className={styles.options}>
            <button
              className={styles.optionButton}
              onClick={() => handleAnswer('A')}
              disabled={isProcessing}
            >
              {t(optionAKey)}
            </button>
            <button
              className={styles.optionButton}
              onClick={() => handleAnswer('B')}
              disabled={isProcessing}
            >
              {t(optionBKey)}
            </button>
          </div>

          {/* Feedback */}
          {feedback && <p className={styles.feedback}>{feedback}</p>}
        </div>
      </div>
    );
  }

  if (state === 'passed') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.resultIcon}>👓</div>
          <p className={styles.resultText}>{t('screening.passed')}</p>
          <button className={styles.primaryButton} onClick={handleProceed}>
            {t('common.confirm')}
          </button>
        </div>
      </div>
    );
  }

  if (state === 'failed' || state === 'locked') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.resultIcon}>🌅</div>
          <p className={styles.resultText}>{t('screening.failed')}</p>
          {state === 'locked' && (
            <p className={styles.lockedText}>{t('screening.locked')}</p>
          )}
          <button className={styles.secondaryButton} onClick={handleExit}>
            {t('common.close')}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default ScreeningPage;
