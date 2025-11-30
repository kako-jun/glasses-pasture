# 技術アーキテクチャ

## システム構成

```
┌─────────────────┐     ┌─────────────────┐
│   Browser/PWA   │────▶│ Cloudflare Pages│
│   (React SPA)   │     │   (static host) │
└────────┬────────┘     └─────────────────┘
         │
         │ REST API
         ▼
┌─────────────────┐     ┌─────────────────┐
│    Cloudflare   │────▶│  Cloudflare D1  │
│     Workers     │     │    (SQLite)     │
│     (Hono)      │     └─────────────────┘
└────────┬────────┘
         │
         │ Cron Trigger (毎時)
         ▼
┌─────────────────┐
│   交流シミュ    │
│   レーション    │
└─────────────────┘
```

## 技術選定理由

### フロントエンド

| 技術 | 理由 |
|------|------|
| React | デファクトスタンダード |
| Vite | 高速な開発体験、PWA対応 |
| Zustand | 軽量、ボイラープレート少 |
| i18next | 成熟したi18nエコシステム |
| CSS Modules | スコープされたスタイル |

### バックエンド

| 技術 | 理由 |
|------|------|
| Cloudflare Workers | エッジで高速、無料枠あり |
| Hono | 軽量Webフレームワーク、Workers最適化 |
| D1 | SQLite互換、シンプル |

### なぜD1のみか

当初はD1 + KV + Durable Objectsの3層を検討したが、シンプルさを優先：

- D1だけで全データを管理可能
- 複雑さはバグの温床
- 必要になったら後で追加できる

### パッケージ管理

| 技術 | 理由 |
|------|------|
| pnpm | モノレポでの依存分離に最適 |
| workspaces | フロント/バックで依存を分離 |

#### なぜnpmではなくpnpm

npm workspacesでも可能だが：
- pnpmは依存の分離が厳密
- フロントのビルドにバックエンドの依存が混入しない
- `workspace:*` でローカルパッケージを参照

## モノレポ構成

```
glasses-pasture/
├── apps/
│   ├── web/              # フロントエンド
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── stores/
│   │   │   ├── hooks/
│   │   │   ├── api/
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── package.json  # React, Vite, etc.
│   │   └── vite.config.ts
│   │
│   └── worker/           # バックエンド
│       ├── src/
│       │   ├── routes/
│       │   ├── services/
│       │   └── utils/
│       ├── migrations/
│       ├── package.json  # Hono, Wrangler, etc.
│       └── wrangler.toml
│
├── packages/
│   ├── shared/           # 共通型定義
│   │   └── src/
│   │       ├── types/
│   │       └── constants.ts
│   │
│   └── i18n/             # 多言語辞書
│       └── src/
│           └── locales/
│
├── docs/                 # 設計ドキュメント
├── CLAUDE.md             # Claude Code用ガイド
├── package.json          # ルート（scripts）
└── pnpm-workspace.yaml   # ワークスペース定義
```

## デプロイ

### フロントエンド

Cloudflare Pages:
1. `pnpm build:web` でビルド
2. `apps/web/dist` をデプロイ

### バックエンド

Cloudflare Workers:
1. `wrangler deploy` でデプロイ
2. D1データベースは自動接続

### Cron Trigger

`wrangler.toml` で設定：
- 毎時0分に交流シミュレーション実行
- 期限切れデータのクリーンアップ
