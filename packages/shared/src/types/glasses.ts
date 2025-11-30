/**
 * 眼鏡アバター
 */
export interface Glasses {
  /** UUID */
  id: string;
  /** 仮名（リネーム可能） */
  name: string;
  /** 近視度数 */
  degree: number;
  /** フレーム色 */
  frameColor: FrameColor;
  /** レンズ状態（曇り/クリア） */
  lensState: LensState;
  /** 進化段階 */
  rarity: Rarity;
  /** 親密度ポイント */
  friendshipPoints: number;
  /** 活動エネルギー */
  energy: number;
  /** 最終活動時刻（UTC） */
  lastActiveAt: string;
  /** 作成時刻（UTC） */
  createdAt: string;
}

export type FrameColor =
  | 'black'
  | 'brown'
  | 'silver'
  | 'gold'
  | 'blue'
  | 'red'
  | 'green'
  | 'purple'
  | 'transparent';

export type LensState = 'clear' | 'foggy';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/**
 * 眼鏡生成時のランダムパラメータ
 */
export interface GlassesCreationParams {
  name: string;
  degree: number;
  frameColor: FrameColor;
}
