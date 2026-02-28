# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev              # Next.js 開発サーバー起動
bun run build            # プロダクションビルド
bun run test             # ユニットテスト実行（全件, vitest）
bun run test:watch       # ユニットテスト実行（ウォッチモード）
bun run test <path>      # 単一テストファイル実行（例: bun run test src/engine/battle/__tests__/damage.test.ts）
bun run type-check       # TypeScript 型チェック
bun run lint             # ESLint
bun run format           # Prettier フォーマット適用
bun run format:check     # Prettier フォーマットチェック（CIと同じ）
bun run test:e2e                            # E2Eテスト全件（Playwright）
bun run test:e2e --project=desktop-chromium  # デスクトップのみ
bun run test:e2e --project=mobile-chrome     # モバイルのみ
bun run test:e2e e2e/tests/25-full-playthrough.spec.ts  # 単一E2Eテスト
```

**CI は `type-check` → `lint` → `format:check` → `test` → `build` → `e2e`（desktop-chromiumのみ）の順で実行される。コミット前に `bun run format` を必ず実行すること。**

## Architecture

レイヤード構成。上位が下位に依存する一方向のフロー。

```
src/types/index.ts          ← 全グローバル型定義（MonsterSpecies, MoveDefinition, etc.）
src/data/                   ← マスターデータ（monsters/, moves/, gyms/, items/, maps/, sprites/）
src/engine/                 ← 純粋なゲームロジック（副作用なし、React非依存）
src/engine/state/           ← GameState / GameAction / gameReducer
src/components/GameProvider ← useReducer + Context で状態配信
src/components/Game.tsx     ← screen に応じた画面切り替え + マップ遷移時のイベント処理
src/components/screens/     ← 各画面コンポーネント
```

### パスエイリアス

`@/` → `./src/`（tsconfig.json + vitest.config.ts で設定済み）。常に `@/` を使い、相対パスは避ける。E2Eテスト（`e2e/`）は `src/` 外なので `@/` は使わず相対パスを使う。

### ゲーム状態管理

`GameProvider` が `useReducer(gameReducer)` を保持し、`useGameState()` / `useGameDispatch()` で各コンポーネントに配信する。画面遷移は `dispatch({ type: "CHANGE_SCREEN", screen: "battle" })` で行う。状態更新はイミュータブル（スプレッド構文でコピー）。

### エンジン層の設計パターン

- **純関数 + DI**: エンジン関数は `random?: () => number` を引数に取り、テスト時に乱数を固定できる
- **Resolver パターン**: `SpeciesResolver = (id: string) => MonsterSpecies`。BattleEngine がデータ層に直接依存せず、コンストラクタで注入する
- **フラグベース進行**: `storyFlags: Record<string, boolean>` でストーリー進行を管理。`gym1_cleared`, `elite_four_1_cleared` 等

### バトルエンジン (`src/engine/battle/`)

`BattleEngine` クラスが中心。`executeTurn(action)` でターンを処理し、メッセージ配列を返す。

- `state-machine.ts`: BattleState / BattlePhase の定義。`BattlerState` に `statStages` を含む
- `damage.ts`: ダメージ計算。`DamageContext` に `attackerStages` / `defenderStages` を渡す
- `move-executor.ts`: 技実行フロー。`MoveExecutionResult` に `statChanges` を含む
- `stat-stage.ts`: 能力変化ステージ（-6〜+6）の管理
- `turn-order.ts`: 行動順決定。`TurnAction` に `statStages` を含む
- `experience.ts`: 経験値計算。`expForLevel(level, expGroup)` で経験値カーブを管理

### イベントスクリプト (`src/engine/event/`)

`EventScript` = `EventCommand[]`。コマンド種別: `dialogue`, `set_flag`, `branch`, `heal`, `give_item`, `battle`, `move_player`, `wait`。`branch` コマンドで `storyFlags` の条件分岐を行う。

**重要**: `Game.tsx` の `handleMapTransition` で `OBLIVION_EVENTS` を順にチェックし、最初に `outputs.length > 0` のイベントで `break` する。完了済みイベントの `then` ブランチは必ず空配列 `[]` を返すこと（非空だと後続イベントがブロックされる）。

### マップ定義 (`src/data/maps/`)

`MapDefinition` 型: `tiles[][]`（"wall"|"ground"|"grass"|"water"|"ledge"|"door"|"sign"）、`connections[]`（マップ遷移）、`encounters[]`（野生テーブル）、`npcs[]`。

- 町は10×10、ルートは12×10（route-1のみ15×10）が基本
- 接続は南北で2マス幅のペア。`requirement` で条件付き通過、`blockedMessage` で条件未達メッセージ
- `wasuremachi.ts`, `route-1.ts`, `hajimari-forest.ts` は個別ファイル、残りは `all-maps.ts` に統合
- `ALL_MAPS` レコードで `getMapById()` 検索

### モンスターデータ (`src/data/monsters/`)

`starters.ts`, `early-monsters.ts`, `mid-monsters.ts`, `late-monsters.ts`, `legendary.ts` に分割。`index.ts` の `ALL_SPECIES` で統合、`getSpeciesById()` で検索。現在50種。

### スプライト (`src/data/sprites/`)

`PixelSpriteData` = `{ palette: Record<string, string>, grid: string[] }`。20×20グリッド文字列でピクセルアート定義。`'.'`=透明, `'1'`=主色, `'2'`=副色, `'3'`=暗色, `'w'`=白, `'-'`=黒, `'4'`〜`'f'`=固有色（palette定義）。`getSpriteData(speciesId)` で取得。

### セーブ/ロード (`src/engine/state/save-data.ts`)

`localStorage["pokemon_save_{slot}"]` にJSON保存（slot 0-2）。`SAVE_DATA_VERSION = 1`。Set→string[]変換でシリアライズ。高レベルAPI: `saveGame(state, slot, playTime)` / `loadGame(slot)`。オートセーブはslot 0、5秒デバウンス、トリガー: `battle_end`, `map_transition`, `healing`, `starter_selected`, `item_obtained`。

### オーディオ (`src/engine/audio/`)

`createBgmManager()` / `createSeManager()` でファクトリ生成。マネージャーはロジック（イベントログ発行）のみ担当し、実際のオーディオ再生はUIコンポーネント層が `getEventLog()` を監視して実装する。BGMコンテキスト: `title`, `overworld`, `battle_*`, `victory`, `healing`, `evolution`, `event`。SE定数: `SE.ATTACK_NORMAL`, `SE.DAMAGE`, `SE.CURSOR_MOVE` 等。

## E2E テスト (`e2e/`)

### GamePage カスタムfixture (`e2e/fixtures/game-fixture.ts`)

全テストの基盤。主要メソッド: `goto()`, `startNewGame(name)`, `continueGame()`, `selectStarter(index)`, `move(direction, steps)`, `selectFight(moveIndex)`, `selectRun()`, `openMenu()`, `advanceMessage()`, `injectSaveData(data, slot)`, `seedRandom(seed)`。

### セーブデータファクトリ (`e2e/fixtures/save-data.ts`)

テスト用セーブデータ生成関数: `createNewGameSave()`, `createBattleReadySave()`, `createMidGameSave()`, `createPreLeagueSave()` 等。

### テスト規約

- `beforeEach` でセーブデータ注入 + `seedRandom()` 設定が標準パターン
- 確率依存テストは `test.skip()` でスキップ
- 画面状態確認に `aria-label` を使用（例: `[aria-label^="バトル:"]`）
- Playwright設定: Desktop 960×640, Mobile iPhone 12 375×667。CI環境で2回リトライ、4 workers

## Data Model Quick Reference

```typescript
MonsterSpecies; // 種族データ（baseStats, learnset, evolvesTo?[]）
MonsterInstance; // 個体データ（uid, level, nature, ivs, evs, moves, status）
MoveDefinition; // 技定義（type, category, power, accuracy, effect?）
MoveEffect; // 追加効果（statusCondition?, statChanges?）
TypeId; // 18タイプ union
NatureId; // 25性格 union
ExpGroup; // "fast" | "medium_fast" | "medium_slow" | "slow"
```

`evolvesTo` は配列（分岐進化対応）。`statChanges` は `Partial<Record<keyof BaseStats, number>>` で能力変化を表現。
