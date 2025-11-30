-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  screening_passed INTEGER NOT NULL DEFAULT 0,
  screening_lock_until TEXT,
  last_access_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Glasses (avatars) table
CREATE TABLE IF NOT EXISTS glasses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  degree REAL NOT NULL,
  frame_color TEXT NOT NULL,
  lens_state TEXT NOT NULL DEFAULT 'clear',
  rarity TEXT NOT NULL DEFAULT 'common',
  friendship_points INTEGER NOT NULL DEFAULT 0,
  energy INTEGER NOT NULL DEFAULT 100,
  last_active_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_glasses_user_id ON glasses(user_id);
CREATE INDEX IF NOT EXISTS idx_glasses_last_active_at ON glasses(last_active_at);

-- Gambits table
CREATE TABLE IF NOT EXISTS gambits (
  id TEXT PRIMARY KEY,
  glasses_id TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_data TEXT,
  action_type TEXT NOT NULL,
  probability INTEGER NOT NULL DEFAULT 50,
  enabled INTEGER NOT NULL DEFAULT 1,
  priority INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (glasses_id) REFERENCES glasses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_gambits_glasses_id ON gambits(glasses_id);

-- Posts (stable entries) table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  glasses_id TEXT NOT NULL,
  content TEXT NOT NULL,
  posted_at TEXT NOT NULL,
  is_draft INTEGER NOT NULL DEFAULT 0,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (glasses_id) REFERENCES glasses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_posts_glasses_id ON posts(glasses_id);
CREATE INDEX IF NOT EXISTS idx_posts_posted_at ON posts(posted_at);
CREATE INDEX IF NOT EXISTS idx_posts_is_draft ON posts(is_draft);

-- Board posts (projections, expire after 7 days) table
CREATE TABLE IF NOT EXISTS board_posts (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  board_date TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_board_posts_board_date ON board_posts(board_date);
CREATE INDEX IF NOT EXISTS idx_board_posts_expires_at ON board_posts(expires_at);

-- Interaction logs table
CREATE TABLE IF NOT EXISTS interaction_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  actor_glasses_id TEXT NOT NULL,
  actor_glasses_name TEXT NOT NULL,
  target_glasses_id TEXT NOT NULL,
  target_glasses_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  friendship_delta INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (actor_glasses_id) REFERENCES glasses(id) ON DELETE CASCADE,
  FOREIGN KEY (target_glasses_id) REFERENCES glasses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_interaction_logs_timestamp ON interaction_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_actor ON interaction_logs(actor_glasses_id);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_target ON interaction_logs(target_glasses_id);

-- Affinity vectors (for interaction probability boost)
CREATE TABLE IF NOT EXISTS affinity_vectors (
  glasses_id TEXT PRIMARY KEY,
  vector TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (glasses_id) REFERENCES glasses(id) ON DELETE CASCADE
);
