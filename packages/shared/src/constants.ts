/**
 * 眼鏡アバター関連の定数
 */
export const GLASSES_CONFIG = {
  /** 消滅までの日数 */
  EXTINCTION_DAYS: 90,
  /** 初期エネルギー */
  INITIAL_ENERGY: 100,
  /** 初期親密度 */
  INITIAL_FRIENDSHIP: 0,
} as const;

/**
 * 交流関連の定数
 */
export const INTERACTION_CONFIG = {
  /** 趣味ベクトルによる交流確率上限（%） */
  AFFINITY_BONUS_CAP: 25,
} as const;

/**
 * スクリーニング関連の定数
 */
export const SCREENING_CONFIG = {
  /** 問題数 */
  QUESTION_COUNT: 10,
  /** 合格に必要な正答数（全問正解必須） */
  REQUIRED_CORRECT: 10,
  /** 失敗後のロック時間（時間） */
  LOCK_HOURS: 24,
} as const;

/**
 * 名前生成用の単語リスト
 */
export const NAME_WORDS = {
  prefixes: [
    'Glass', 'Lens', 'Frame', 'Mist', 'Echo',
    'Shadow', 'Silent', 'Foggy', 'Clear', 'Dim',
    'Hazy', 'Blurry', 'Sharp', 'Soft', 'Quiet',
  ],
  suffixes: [
    'Sight', 'Vision', 'Eye', 'Gaze', 'View',
    'Focus', 'Blur', 'Haze', 'Mist', 'Fog',
  ],
} as const;
