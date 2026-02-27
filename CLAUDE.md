# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev              # Next.js 開発サーバー起動
bun run build            # プロダクションビルド
bun run test             # テスト実行（全件）
bun run test:watch       # テスト実行（ウォッチモード）
bun run test <path>      # 単一テストファイル実行（例: bun run test src/engine/battle/__tests__/damage.test.ts）
bun run type-check       # TypeScript 型チェック
bun run lint             # ESLint
bun run format           # Prettier フォーマット適用
bun run format:check     # Prettier フォーマットチェック（CIと同じ）
```

**CI は `type-check` → `lint` → `format:check` → `test` → `build` の順で実行される。コミット前に `bun run format` を必ず実行すること。**

## Architecture

レイヤード構成。上位が下位に依存する一方向のフロー。

```
src/types/index.ts          ← 全グローバル型定義（MonsterSpecies, MoveDefinition, etc.）
src/data/                   ← マスターデータ（monsters/, moves/, gyms/, items/）
src/engine/                 ← 純粋なゲームロジック（副作用なし、React非依存）
src/engine/state/           ← GameState / GameAction / gameReducer
src/components/GameProvider ← useReducer + Context で状態配信
src/components/Game.tsx     ← screen に応じた画面切り替え
src/components/screens/     ← 各画面コンポーネント
```

### パスエイリアス

`@/` → `./src/`（tsconfig.json + vitest.config.ts で設定済み）。常に `@/` を使い、相対パスは避ける。

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

### モンスターデータ (`src/data/monsters/`)

`starters.ts`, `early-monsters.ts`, `mid-monsters.ts`, `late-monsters.ts`, `legendary.ts` に分割。`index.ts` の `ALL_SPECIES` で統合、`getSpeciesById()` で検索。現在50種。

### イベントスクリプト (`src/engine/event/`)

`EventScript` = `EventCommand[]`。コマンド種別: `dialogue`, `set_flag`, `branch`, `heal`, `give_item`, `battle`, `move_player`, `wait`。`branch` コマンドで `storyFlags` の条件分岐を行う。

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
