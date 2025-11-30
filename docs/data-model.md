# データモデル

## ER図（概念）

```
┌─────────┐       ┌─────────┐       ┌─────────┐
│  users  │───┬───│ glasses │───┬───│ gambits │
└─────────┘   │   └─────────┘   │   └─────────┘
              │                 │
              │   ┌─────────┐   │   ┌─────────────┐
              └───│  posts  │   └───│ interaction │
                  └────┬────┘       │    _logs    │
                       │            └─────────────┘
                  ┌────┴────┐
                  │ board_  │
                  │ posts   │
                  └─────────┘
```

## テーブル定義

### users（ユーザー）

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,                    -- UUID
  screening_passed INTEGER DEFAULT 0,     -- スクリーニング通過
  screening_lock_until TEXT,              -- ロック解除時刻
  last_access_at TEXT NOT NULL,           -- 最終アクセス
  created_at TEXT NOT NULL                -- 作成日時
);
```

### glasses（眼鏡アバター）

```sql
CREATE TABLE glasses (
  id TEXT PRIMARY KEY,                    -- UUID
  user_id TEXT NOT NULL,                  -- 所有者
  name TEXT NOT NULL,                     -- 仮名
  degree REAL NOT NULL,                   -- 度数 (-1.0 〜 -8.0)
  frame_color TEXT NOT NULL,              -- フレーム色
  lens_state TEXT DEFAULT 'clear',        -- clear | foggy
  rarity TEXT DEFAULT 'common',           -- 進化段階
  friendship_points INTEGER DEFAULT 0,    -- 親密度
  energy INTEGER DEFAULT 100,             -- エネルギー
  last_active_at TEXT NOT NULL,           -- 最終活動
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

フレーム色: `black`, `brown`, `silver`, `gold`, `blue`, `red`, `green`, `purple`, `transparent`

レアリティ: `common`, `uncommon`, `rare`, `epic`, `legendary`

### gambits（ガンビット設定）

```sql
CREATE TABLE gambits (
  id TEXT PRIMARY KEY,
  glasses_id TEXT NOT NULL,
  condition_type TEXT NOT NULL,           -- 条件タイプ
  condition_data TEXT,                    -- 条件パラメータ (JSON)
  action_type TEXT NOT NULL,              -- 行動タイプ
  probability INTEGER DEFAULT 50,         -- 発生確率 (0-100)
  enabled INTEGER DEFAULT 1,              -- 有効/無効
  priority INTEGER DEFAULT 0,             -- 優先順位
  FOREIGN KEY (glasses_id) REFERENCES glasses(id)
);
```

条件タイプ:
- `degree_close` - 度数が近い
- `same_frame_color` - フレーム色が同じ
- `target_foggy` - 相手が曇っている
- `high_friendship` - 親密度が高い
- `random` - 常に

行動タイプ:
- `greet` - 挨拶
- `encourage` - 励ます
- `exchange_item` - アイテム交換
- `play` - 一緒に遊ぶ

### posts（厩舎の投稿）

```sql
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  glasses_id TEXT NOT NULL,
  content TEXT NOT NULL,                  -- 本文 (最大20,000字)
  posted_at TEXT NOT NULL,                -- 投稿日時
  is_draft INTEGER DEFAULT 0,             -- 下書きか
  is_deleted INTEGER DEFAULT 0,           -- 削除済みか
  FOREIGN KEY (glasses_id) REFERENCES glasses(id)
);
```

### board_posts（掲示板の写像）

```sql
CREATE TABLE board_posts (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  board_date TEXT NOT NULL,               -- 日付 (YYYY-MM-DD)
  expires_at TEXT NOT NULL,               -- 消滅日時 (7日後)
  FOREIGN KEY (post_id) REFERENCES posts(id)
);
```

### interaction_logs（交流ログ）

```sql
CREATE TABLE interaction_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  actor_glasses_id TEXT NOT NULL,
  actor_glasses_name TEXT NOT NULL,
  target_glasses_id TEXT NOT NULL,
  target_glasses_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  friendship_delta INTEGER DEFAULT 0,
  FOREIGN KEY (actor_glasses_id) REFERENCES glasses(id),
  FOREIGN KEY (target_glasses_id) REFERENCES glasses(id)
);
```

### affinity_vectors（趣味ベクトル）

```sql
CREATE TABLE affinity_vectors (
  glasses_id TEXT PRIMARY KEY,
  vector TEXT NOT NULL,                   -- JSON配列
  updated_at TEXT NOT NULL,
  FOREIGN KEY (glasses_id) REFERENCES glasses(id)
);
```

## 重要な定数

| 定数 | 値 | 説明 |
|------|-----|------|
| EXTINCTION_DAYS | 90 | 眼鏡消滅までの日数 |
| BOARD_RETENTION_DAYS | 7 | 掲示板保持日数 |
| MAX_CONTENT_LENGTH | 20,000 | 投稿の最大文字数 |
| RATE_LIMIT_MS | 60,000 | 連投制限（1分） |
| AFFINITY_BONUS_CAP | 25 | 趣味ベクトルによる交流確率上限（%） |
| SCREENING_LOCK_HOURS | 24 | スクリーニング失敗後のロック時間 |

## インデックス

```sql
CREATE INDEX idx_glasses_user_id ON glasses(user_id);
CREATE INDEX idx_glasses_last_active_at ON glasses(last_active_at);
CREATE INDEX idx_posts_glasses_id ON posts(glasses_id);
CREATE INDEX idx_posts_posted_at ON posts(posted_at);
CREATE INDEX idx_board_posts_board_date ON board_posts(board_date);
CREATE INDEX idx_board_posts_expires_at ON board_posts(expires_at);
CREATE INDEX idx_interaction_logs_timestamp ON interaction_logs(timestamp);
```
