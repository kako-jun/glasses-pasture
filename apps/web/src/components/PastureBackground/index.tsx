import { useMemo } from 'react';
import styles from './PastureBackground.module.css';

// 時間帯の判定
type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 17) return 'day';
  if (hour >= 17 && hour < 19) return 'dusk';
  return 'night';
}

// 天気の判定（日付ベースのハッシュ）
type Weather = 'clear' | 'cloudy' | 'rain' | 'fog';

function getWeather(): Weather {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  // 簡易ハッシュ
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    hash = hash & hash;
  }

  const weatherIndex = Math.abs(hash) % 100;

  // 確率分布: 晴れ50%, 曇り25%, 雨15%, 霧10%
  if (weatherIndex < 50) return 'clear';
  if (weatherIndex < 75) return 'cloudy';
  if (weatherIndex < 90) return 'rain';
  return 'fog';
}

// 雲コンポーネント
function Cloud({ style, size = 'medium' }: { style?: React.CSSProperties; size?: 'small' | 'medium' | 'large' }) {
  const sizeClass = styles[`cloud${size.charAt(0).toUpperCase() + size.slice(1)}`];
  return (
    <div className={`${styles.cloud} ${sizeClass}`} style={style}>
      <div className={styles.cloudPart} />
      <div className={styles.cloudPart} />
      <div className={styles.cloudPart} />
    </div>
  );
}

// 雨粒コンポーネント
function Rain() {
  const drops = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${0.5 + Math.random() * 0.5}s`,
    }));
  }, []);

  return (
    <div className={styles.rain}>
      {drops.map((drop) => (
        <div
          key={drop.id}
          className={styles.raindrop}
          style={{
            left: drop.left,
            animationDelay: drop.delay,
            animationDuration: drop.duration,
          }}
        />
      ))}
    </div>
  );
}

// 柵コンポーネント
function Fence() {
  return (
    <div className={styles.fence}>
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} className={styles.fencePost} />
      ))}
      <div className={styles.fenceRail} style={{ top: '20%' }} />
      <div className={styles.fenceRail} style={{ top: '60%' }} />
    </div>
  );
}

// 草コンポーネント
function Grass() {
  const blades = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${(i / 30) * 100 + Math.random() * 3}%`,
      height: 8 + Math.random() * 12,
      delay: `${Math.random() * 2}s`,
    }));
  }, []);

  return (
    <div className={styles.grassContainer}>
      {blades.map((blade) => (
        <div
          key={blade.id}
          className={styles.grassBlade}
          style={{
            left: blade.left,
            height: `${blade.height}px`,
            animationDelay: blade.delay,
          }}
        />
      ))}
    </div>
  );
}

export function PastureBackground() {
  const timeOfDay = getTimeOfDay();
  const weather = getWeather();

  const skyClass = `${styles.sky} ${styles[`sky${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}`]}`;
  const weatherClass = styles[`weather${weather.charAt(0).toUpperCase() + weather.slice(1)}`];

  return (
    <div className={`${styles.background} ${weatherClass}`}>
      {/* 空 */}
      <div className={skyClass}>
        {/* 雲 */}
        {(weather === 'clear' || weather === 'cloudy') && (
          <div className={styles.clouds}>
            <Cloud style={{ top: '10%', left: '-10%' }} size="large" />
            <Cloud style={{ top: '20%', left: '30%' }} size="medium" />
            <Cloud style={{ top: '5%', left: '60%' }} size="small" />
            {weather === 'cloudy' && (
              <>
                <Cloud style={{ top: '15%', left: '10%' }} size="medium" />
                <Cloud style={{ top: '25%', left: '45%' }} size="large" />
                <Cloud style={{ top: '8%', left: '80%' }} size="medium" />
              </>
            )}
          </div>
        )}

        {/* 雨 */}
        {weather === 'rain' && <Rain />}

        {/* 霧 */}
        {weather === 'fog' && <div className={styles.fog} />}
      </div>

      {/* 地平線 */}
      <div className={styles.horizon} />

      {/* 草原 */}
      <div className={styles.ground}>
        <Fence />
        <Grass />
      </div>
    </div>
  );
}

export default PastureBackground;
