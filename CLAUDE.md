# CLAUDE.md - メガネ牧場 開発ガイド

このファイルはClaude Codeがプロジェクトを理解するためのガイドです。

## プロジェクト概要

**陰キャ近視専用SNS「メガネ牧場」**

- 眼鏡アバターが自動で交流するSNS
- 登録不要・匿名・自然消滅
- 承認欲求を排除した蓄積型設計

## ドキュメント目次

詳細な設計ドキュメントは `docs/` を参照：

- [設計思想](docs/design-philosophy.md) - コンセプトと世界観
- [技術アーキテクチャ](docs/architecture.md) - システム構成と技術選定
- [データモデル](docs/data-model.md) - DB設計とスキーマ
- [API仕様](docs/api.md) - エンドポイント一覧

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | React + Vite + PWA |
| 状態管理 | Zustand |
| 国際化 | i18next |
| バックエンド | Cloudflare Workers + Hono |
| データベース | Cloudflare D1 (SQLite) |
| パッケージ管理 | pnpm (workspaces) |

## モノレポ構成

```
glasses-pasture/
├── apps/
│   ├── web/        # フロントエンド (React)
│   └── worker/     # バックエンド (Cloudflare Workers)
├── packages/
│   ├── shared/     # 共通型定義・定数
│   └── i18n/       # 多言語辞書
└── docs/           # 設計ドキュメント
```

### なぜpnpmか

- フロントとバックエンドで依存を分離するため
- `workspace:*` で内部パッケージを参照
- 各appのビルドに不要な依存が混入しない

## 開発コマンド

```bash
# 依存インストール
pnpm install

# フロントエンド開発サーバー
pnpm dev:web

# バックエンド開発サーバー
pnpm dev:worker

# ビルド
pnpm build
```

## 主要な設計決定

| 項目 | 決定 | 理由 |
|------|------|------|
| DB | D1のみ | シンプル。KVやDurable Objectsは不要 |
| 眼鏡消滅期間 | 90日 | 30日は短すぎる |
| スクリーニング | 10問固定・全問正解必須 | ランダム化なし |
| ロック期間 | 24時間 | 失敗後の再挑戦制限 |
| 交流確率キャップ | +25% | 趣味ベクトルによるボーナス上限 |
| 文章上限 | 20,000字 | 長文も許容 |
| 連投制限 | 1分1件 | スパム防止 |
| 掲示板保持 | 7日 | 日毎の板、1週間で消える |

## コーディング規約

- TypeScript strict mode
- 関数コンポーネント + hooks
- CSS Modules for styling
- 日本語コメント可
