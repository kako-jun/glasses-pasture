/**
 * ガンビット（条件＋行動）
 */
export interface Gambit {
  id: string;
  /** 所有者の眼鏡ID */
  glassesId: string;
  /** 条件 */
  condition: GambitCondition;
  /** 行動 */
  action: GambitAction;
  /** 発生確率（0-100） */
  probability: number;
  /** 有効/無効 */
  enabled: boolean;
  /** 優先順位（小さいほど優先） */
  priority: number;
}

export type GambitCondition =
  | { type: 'degree_close'; threshold: number }      // 度数が近い
  | { type: 'same_frame_color' }                     // フレーム色が同じ
  | { type: 'target_foggy' }                         // 相手が曇っている
  | { type: 'high_friendship'; threshold: number }   // 親密度が高い
  | { type: 'random' };                              // 常に（ランダム判定のみ）

export type GambitAction =
  | { type: 'greet' }           // 挨拶する
  | { type: 'encourage' }       // 励ます
  | { type: 'exchange_item' }   // アイテム交換
  | { type: 'play' };           // 一緒に遊ぶ

/**
 * デフォルトガンビットセット
 */
export const DEFAULT_GAMBITS: Omit<Gambit, 'id' | 'glassesId'>[] = [
  {
    condition: { type: 'degree_close', threshold: 0.5 },
    action: { type: 'greet' },
    probability: 70,
    enabled: true,
    priority: 1,
  },
  {
    condition: { type: 'target_foggy' },
    action: { type: 'encourage' },
    probability: 60,
    enabled: true,
    priority: 2,
  },
  {
    condition: { type: 'same_frame_color' },
    action: { type: 'exchange_item' },
    probability: 50,
    enabled: true,
    priority: 3,
  },
  {
    condition: { type: 'high_friendship', threshold: 50 },
    action: { type: 'play' },
    probability: 80,
    enabled: true,
    priority: 4,
  },
];
