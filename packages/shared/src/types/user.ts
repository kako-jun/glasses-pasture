/**
 * ユーザー識別情報
 */
export interface User {
  /** UUID（匿名識別子） */
  id: string;
  /** スクリーニング通過済みか */
  screeningPassed: boolean;
  /** スクリーニング失敗後のロック解除時刻（UTC） */
  screeningLockUntil: string | null;
  /** 最終アクセス時刻（UTC） */
  lastAccessAt: string;
  /** 作成時刻（UTC） */
  createdAt: string;
}

/**
 * スクリーニング問題
 */
export interface ScreeningQuestion {
  id: number;
  /** 問題文キー（i18n） */
  questionKey: string;
  /** 選択肢Aキー（i18n） */
  optionAKey: string;
  /** 選択肢Bキー（i18n） */
  optionBKey: string;
  /** 正解（陰キャ寄りの選択肢） */
  correctAnswer: 'A' | 'B';
}

/**
 * スクリーニング回答
 */
export interface ScreeningAnswer {
  questionId: number;
  answer: 'A' | 'B';
}

/**
 * スクリーニング結果
 */
export interface ScreeningResult {
  passed: boolean;
  /** 失敗時のロック解除時刻（UTC） */
  lockUntil: string | null;
}
