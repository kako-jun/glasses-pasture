/**
 * 交流ログ
 */
export interface InteractionLog {
  id: string;
  /** 交流発生時刻（UTC） */
  timestamp: string;
  /** 発信側眼鏡ID */
  actorGlassesId: string;
  /** 発信側眼鏡名 */
  actorGlassesName: string;
  /** 対象眼鏡ID */
  targetGlassesId: string;
  /** 対象眼鏡名 */
  targetGlassesName: string;
  /** 実行された行動 */
  actionType: InteractionActionType;
  /** 親密度変化 */
  friendshipDelta: number;
}

export type InteractionActionType =
  | 'greet'
  | 'encourage'
  | 'exchange_item'
  | 'play'
  | 'fog_cleared'     // 曇り解除
  | 'evolved';        // 進化

/**
 * イベント種別
 */
export type EventType =
  | 'interaction'     // 交流イベント
  | 'evolution'       // 進化イベント
  | 'fog'             // 曇りイベント
  | 'extinction';     // 消滅イベント

/**
 * 消滅イベント
 */
export interface ExtinctionEvent {
  id: string;
  glassesId: string;
  glassesName: string;
  timestamp: string;
  reason: 'inactivity';  // 90日間アクセスなし
}
