/**
 * 文章ログ（厩舎にストック、掲示板に写像）
 */
export interface Post {
  id: string;
  /** 投稿者の眼鏡ID */
  glassesId: string;
  /** 投稿者の眼鏡名 */
  glassesName: string;
  /** 本文（最大20,000字） */
  content: string;
  /** 投稿確定時刻（UTC） */
  postedAt: string;
  /** 下書きか */
  isDraft: boolean;
  /** 削除済みか */
  isDeleted: boolean;
}

/**
 * 投稿制限
 */
export const POST_LIMITS = {
  /** 最大文字数 */
  MAX_CONTENT_LENGTH: 20000,
  /** 連投制限（ミリ秒） */
  RATE_LIMIT_MS: 60 * 1000, // 1分
} as const;

/**
 * 掲示板の写像（1週間で消える）
 */
export interface BoardPost {
  id: string;
  postId: string;
  /** 写像された日付（UTC、YYYY-MM-DD形式） */
  boardDate: string;
  /** 消滅予定日時（UTC） */
  expiresAt: string;
}

/**
 * 掲示板設定
 */
export const BOARD_CONFIG = {
  /** 掲示板保持日数 */
  RETENTION_DAYS: 7,
} as const;
