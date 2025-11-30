# API仕様

Base URL: `/api`

## Users

### POST /users
ユーザーの作成または取得（匿名）

**Request:**
```json
{
  "userId": "existing-uuid-or-null"
}
```

**Response:**
```json
{
  "id": "uuid",
  "screeningPassed": false,
  "screeningLockUntil": null,
  "lastAccessAt": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /users/:id
ユーザー情報の取得

---

## Screening

### GET /screening/questions
スクリーニング問題の取得

**Response:**
```json
{
  "questions": [{ "id": 1 }, { "id": 2 }, ...],
  "total": 10,
  "requiredCorrect": 10
}
```

### POST /screening/submit
回答の送信

**Request:**
```json
{
  "userId": "uuid",
  "answers": [
    { "questionId": 1, "answer": "B" },
    { "questionId": 2, "answer": "B" },
    ...
  ]
}
```

**Response (成功):**
```json
{
  "passed": true
}
```

**Response (失敗):**
```json
{
  "passed": false,
  "locked": true,
  "lockUntil": "2024-01-02T00:00:00.000Z"
}
```

### GET /screening/status/:userId
スクリーニング状態の確認

---

## Glasses

### POST /glasses
眼鏡アバターの作成

**Request:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "GlassSight-4821",
  "degree": -2.5,
  "frameColor": "black",
  "lensState": "clear",
  "rarity": "common",
  "friendshipPoints": 0,
  "energy": 100,
  "lastActiveAt": "...",
  "createdAt": "..."
}
```

### GET /glasses/user/:userId
ユーザーの眼鏡を取得

### PUT /glasses/:id/rename
眼鏡のリネーム

**Request:**
```json
{
  "name": "NewName-123"
}
```

### GET /glasses/:id/gambits
ガンビット設定の取得

### PUT /glasses/:glassesId/gambits/:gambitId
ガンビットの更新

**Request:**
```json
{
  "probability": 80,
  "enabled": true,
  "priority": 1
}
```

---

## Posts

### POST /posts
投稿の作成（厩舎へ）

**Request:**
```json
{
  "glassesId": "uuid",
  "content": "本文...",
  "isDraft": false
}
```

**Response:**
```json
{
  "id": "uuid",
  "glassesId": "...",
  "glassesName": "GlassSight-4821",
  "content": "本文...",
  "postedAt": "...",
  "isDraft": false,
  "isDeleted": false
}
```

**Error (Rate Limit):**
```json
{
  "error": "Rate limited",
  "retryAfter": 45000
}
```

### GET /posts/glasses/:glassesId
眼鏡の投稿一覧（厩舎）

Query: `?includeDrafts=true`

### GET /posts/:id
投稿の取得

### PUT /posts/:id
投稿の更新（下書き公開など）

### DELETE /posts/:id
投稿の削除（論理削除）

---

## Board

### GET /board/dates
利用可能な日付一覧（最大7日分）

**Response:**
```json
{
  "dates": [
    { "date": "2024-01-07", "postCount": 15 },
    { "date": "2024-01-06", "postCount": 23 },
    ...
  ]
}
```

### GET /board/date/:date
特定日の掲示板

**Response:**
```json
{
  "date": "2024-01-07",
  "posts": [
    {
      "id": "...",
      "glassesId": "...",
      "glassesName": "GlassSight-4821",
      "content": "本文...",
      "postedAt": "..."
    },
    ...
  ],
  "count": 15
}
```

### GET /board/today
今日の掲示板（リダイレクト）

---

## Interactions

### GET /interactions/glasses/:glassesId
眼鏡の交流ログ

Query: `?limit=50&offset=0`

**Response:**
```json
{
  "logs": [
    {
      "id": "...",
      "timestamp": "...",
      "actorGlassesId": "...",
      "actorGlassesName": "GlassSight-4821",
      "targetGlassesId": "...",
      "targetGlassesName": "MistFrame-12",
      "actionType": "greet",
      "friendshipDelta": 1
    },
    ...
  ],
  "count": 50,
  "offset": 0,
  "limit": 50
}
```

### GET /interactions/recent
最近の交流ログ（牧場全体）

Query: `?limit=20`

---

## エラーレスポンス

```json
{
  "error": "User not found"
}
```

HTTP Status Codes:
- 200: 成功
- 201: 作成成功
- 400: リクエスト不正
- 403: 権限なし
- 404: 見つからない
- 409: 競合（既に存在など）
- 429: レート制限
