# マルチプレイヤー設計書 — リアルタイム対戦 & 交換

## 概要

プレイヤー間のリアルタイム対戦とモンスター交換の通信設計。
Next.js App Router + WebSocket (Socket.IO) を基盤とする。

---

## 技術スタック

| 層           | 技術                           | 理由                                |
| ------------ | ------------------------------ | ----------------------------------- |
| サーバー     | Next.js API Routes + Socket.IO | Next.js統合、双方向リアルタイム通信 |
| クライアント | Socket.IO Client               | 自動再接続、イベントベース、型安全  |
| 状態管理     | サーバー側ルーム管理           | 不正防止のためサーバー権威型        |
| マッチング   | メモリ内キュー                 | 初期実装はシンプルに。将来はRedis   |
| レーティング | Elo方式                        | 実績のある計算方式                  |

---

## アーキテクチャ

```
┌─────────────┐     WebSocket      ┌─────────────────────┐
│  Player A   │◄──────────────────►│   Next.js Server    │
│  (Browser)  │                    │                     │
└─────────────┘                    │  ┌───────────────┐  │
                                   │  │ Socket.IO     │  │
┌─────────────┐     WebSocket      │  │ Server        │  │
│  Player B   │◄──────────────────►│  ├───────────────┤  │
│  (Browser)  │                    │  │ Room Manager  │  │
└─────────────┘                    │  ├───────────────┤  │
                                   │  │ Battle Engine │  │
                                   │  │ (Server-side) │  │
                                   │  ├───────────────┤  │
                                   │  │ Match Queue   │  │
                                   │  └───────────────┘  │
                                   └─────────────────────┘
```

### サーバー権威型（Server Authoritative）

- バトルロジックはサーバー側で実行
- クライアントはアクション送信のみ、結果はサーバーから受信
- 不正行為（改ざん）防止

---

## 通信プロトコル

### 接続フロー

```
Client                    Server
  │                         │
  │─── connect ────────────►│
  │                         │
  │◄── authenticated ───────│ (プレイヤーID確認)
  │                         │
  │─── join_matchmaking ───►│ (マッチング開始)
  │                         │
  │◄── match_found ─────────│ (対戦相手発見)
  │                         │
  │◄── room_joined ─────────│ (ルーム参加)
  │                         │
  │─── ready ──────────────►│ (準備完了)
  │                         │
  │◄── battle_start ────────│ (バトル開始)
  │                         │
```

### バトル通信

```
Client A                  Server                  Client B
  │                         │                         │
  │─── select_action ──────►│                         │
  │   {type: "fight",       │                         │
  │    moveIndex: 0}        │◄── select_action ───────│
  │                         │   {type: "fight",       │
  │                         │    moveIndex: 2}        │
  │                         │                         │
  │                    [ターン処理]                    │
  │                         │                         │
  │◄── turn_result ─────────│─── turn_result ────────►│
  │   {actions: [...],      │   {actions: [...],      │
  │    damages: [...],      │    damages: [...],      │
  │    hpChanges: [...]}    │    hpChanges: [...]}    │
  │                         │                         │
```

### イベント一覧

| イベント名           | 方向 | ペイロード                   | 説明                   |
| -------------------- | ---- | ---------------------------- | ---------------------- |
| `connect`            | C→S  | —                            | WebSocket接続          |
| `authenticate`       | C→S  | `{playerId, token}`          | 認証                   |
| `join_matchmaking`   | C→S  | `{ratingRange}`              | マッチング参加         |
| `cancel_matchmaking` | C→S  | —                            | マッチングキャンセル   |
| `match_found`        | S→C  | `{roomId, opponent}`         | 対戦相手発見           |
| `room_joined`        | S→C  | `{roomId, players}`          | ルーム参加完了         |
| `ready`              | C→S  | `{party: MonsterInstance[]}` | パーティ送信・準備完了 |
| `battle_start`       | S→C  | `{turnOrder, opponentLead}`  | バトル開始             |
| `select_action`      | C→S  | `BattleAction`               | アクション選択         |
| `turn_result`        | S→C  | `TurnResult`                 | ターン結果             |
| `switch_monster`     | C→S  | `{index: number}`            | モンスター交代         |
| `battle_end`         | S→C  | `{winner, ratingChange}`     | バトル終了             |
| `forfeit`            | C→S  | —                            | 降参                   |
| `disconnect`         | C→S  | —                            | 切断                   |

---

## バトルルーム

### ルームライフサイクル

```
created → waiting → ready → in_progress → finished → archived
```

### ルーム状態

```typescript
interface BattleRoom {
  id: string;
  players: {
    id: string;
    socketId: string;
    party: MonsterInstance[];
    ready: boolean;
    activeMon: number; // アクティブモンスターのインデックス
  }[];
  state: "waiting" | "ready" | "in_progress" | "finished";
  turnNumber: number;
  pendingActions: Map<string, BattleAction>;
  timer: {
    turnDeadline: number; // ターンタイムアウト（30秒）
    totalTime: number[]; // プレイヤーごとの持ち時間
  };
  createdAt: number;
}
```

### タイムアウト処理

- ターンタイムアウト: 30秒。超過するとランダムアクション（たたかうの1番目の技）
- 持ち時間制: 各10分。切れたら敗北
- 切断: 60秒以内に再接続しなければ敗北

---

## マッチングシステム

### マッチングアルゴリズム

```typescript
interface MatchmakingEntry {
  playerId: string;
  socketId: string;
  rating: number;
  joinedAt: number;
}

// マッチング条件
// 1. レーティング差が許容範囲内
// 2. 待ち時間が長いほど許容範囲を広げる
function canMatch(a: MatchmakingEntry, b: MatchmakingEntry): boolean {
  const waitTimeA = Date.now() - a.joinedAt;
  const waitTimeB = Date.now() - b.joinedAt;
  const maxWait = Math.max(waitTimeA, waitTimeB);

  // 基本許容幅: 100 + 待ち時間に応じた拡大（10秒ごとに+50）
  const tolerance = 100 + Math.floor(maxWait / 10000) * 50;

  return Math.abs(a.rating - b.rating) <= tolerance;
}
```

### マッチングフロー

1. プレイヤーがキューに参加
2. 1秒ごとにキュー内のプレイヤーをスキャン
3. マッチ可能なペアが見つかったらルーム作成
4. 両プレイヤーに`match_found`を送信
5. 5分以内にマッチしなければタイムアウト

---

## モンスター交換

### 交換フロー

```
Player A                  Server                  Player B
  │                         │                         │
  │─── trade_request ──────►│─── trade_request ──────►│
  │   {targetId: "B"}       │   {from: "A"}           │
  │                         │                         │
  │                         │◄── trade_accept ────────│
  │◄── trade_room_created ──│─── trade_room_created ─►│
  │                         │                         │
  │─── offer_monster ──────►│─── show_offer ─────────►│
  │   {monsterUid: "xxx"}   │   {monster: {...}}      │
  │                         │                         │
  │◄── show_offer ──────────│◄── offer_monster ───────│
  │   {monster: {...}}      │   {monsterUid: "yyy"}   │
  │                         │                         │
  │─── confirm_trade ──────►│                         │
  │                         │◄── confirm_trade ───────│
  │                         │                         │
  │                    [交換処理]                      │
  │                         │                         │
  │◄── trade_complete ──────│─── trade_complete ─────►│
  │   {received: {...}}     │   {received: {...}}     │
  │                         │                         │
```

### 交換の安全性

- サーバー側でモンスターの所有権を検証
- 両プレイヤーのconfirmが揃ってから交換実行
- トランザクション処理（片方だけ失敗を防ぐ）
- 交換履歴の記録（ロールバック用）

---

## レーティングシステム

### Elo方式

```typescript
const K_FACTOR = 32; // レーティング変動係数

function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function calculateNewRating(
  rating: number,
  expectedScore: number,
  actualScore: number, // 1 = 勝ち, 0 = 負け, 0.5 = 引き分け
): number {
  return Math.round(rating + K_FACTOR * (actualScore - expectedScore));
}
```

### ランキング

- デフォルトレーティング: 1500
- 最低レーティング: 1000（下限）
- シーズン制（月ごとにソフトリセット: `1500 + (current - 1500) * 0.5`）
- 上位100人をリーダーボードに表示

### ランク分け

| ランク       | レーティング | アイコン |
| ------------ | ------------ | -------- |
| ブロンズ     | 1000-1299    | 🥉       |
| シルバー     | 1300-1499    | 🥈       |
| ゴールド     | 1500-1699    | 🥇       |
| プラチナ     | 1700-1899    | 💎       |
| ダイヤモンド | 1900-2099    | ♦️       |
| マスター     | 2100+        | 👑       |

---

## 型定義（実装時に使用）

```typescript
// --- マッチング ---
interface MatchmakingEntry {
  playerId: string;
  socketId: string;
  rating: number;
  joinedAt: number;
}

// --- バトルルーム ---
interface BattleRoom {
  id: string;
  players: BattleRoomPlayer[];
  state: "waiting" | "ready" | "in_progress" | "finished";
  turnNumber: number;
  pendingActions: Map<string, BattleAction>;
  timer: BattleTimer;
  createdAt: number;
}

interface BattleRoomPlayer {
  id: string;
  socketId: string;
  party: MonsterInstance[];
  ready: boolean;
  activeMon: number;
}

interface BattleTimer {
  turnDeadline: number;
  totalTime: number[];
}

// --- ターン結果 ---
interface TurnResult {
  turnNumber: number;
  actions: { playerId: string; action: BattleAction }[];
  events: TurnEvent[];
  hpChanges: { playerId: string; monIndex: number; newHp: number }[];
  statusChanges: { playerId: string; monIndex: number; status: string | null }[];
  fainted: { playerId: string; monIndex: number }[];
}

type TurnEvent =
  | { type: "move_used"; playerId: string; moveName: string; effectiveness: string }
  | { type: "damage"; playerId: string; amount: number }
  | { type: "faint"; playerId: string; monName: string }
  | { type: "switch"; playerId: string; monName: string }
  | { type: "status"; playerId: string; status: string };

// --- 交換 ---
interface TradeRoom {
  id: string;
  players: { id: string; socketId: string; offeredMon: string | null; confirmed: boolean }[];
  state: "offering" | "confirming" | "complete" | "cancelled";
  createdAt: number;
}

// --- レーティング ---
interface PlayerRating {
  playerId: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  season: number;
}
```

---

## 実装の優先順位

1. **Phase 4a**: Socket.IO サーバー基盤 + 接続管理
2. **Phase 4b**: マッチング + バトルルーム
3. **Phase 4c**: サーバー側バトルエンジン統合
4. **Phase 4d**: モンスター交換
5. **Phase 4e**: レーティング + ランキング

---

## セキュリティ考慮事項

- クライアントからのモンスターデータは信頼しない（サーバー側DB照会）
- アクション送信のバリデーション（技PPチェック、有効な交代先チェック等）
- レート制限（1秒に1アクションまで）
- 切断時の猶予（60秒）と自動敗北処理
