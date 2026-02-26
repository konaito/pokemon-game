# ゲームデータのスキーマ管理方針

## 決定: TypeScript定数 + JSON（ファイルベース）

### 選定理由

| 方式                       | メリット                      | デメリット                       | 採否                       |
| -------------------------- | ----------------------------- | -------------------------------- | -------------------------- |
| **TypeScript定数（採用）** | 型安全、IDE補完、ビルド時検証 | ランタイムでの動的変更不可       | **採用**                   |
| JSON                       | 汎用的、外部ツールと連携可能  | 型安全性なし                     | サブ採用（エクスポート用） |
| DB (SQLite/Supabase)       | 動的クエリ、大量データ向き    | オーバーキル、セットアップコスト | 不採用                     |
| CMS (Contentful等)         | 非エンジニアも編集可能        | 外部依存、レイテンシ             | 不採用                     |

### 方針

1. **ゲームマスターデータ**（モンスター種族、技、アイテム、タイプ相性）は `src/data/` にTypeScript定数として定義
2. **型定義**は `src/types/` に分離し、データとロジックの両方から参照
3. **プレイヤーデータ**（セーブデータ）は `localStorage` / `IndexedDB` で永続化（Epic 10で実装）
4. `as const satisfies` パターンで型安全性とリテラル型推論を両立

### データフロー

```
[src/types/]          型定義（Monster, Move, Item 等）
      ↓
[src/data/]           マスターデータ（as const satisfies で定義）
      ↓
[src/engine/]         ロジック（型を参照して処理）
      ↓
[src/components/]     表示（データをpropsとして受取）
```

### 例: モンスターデータの定義パターン

```typescript
// src/types/monster.ts
export interface MonsterSpecies {
  id: string;
  name: string;
  types: [TypeId] | [TypeId, TypeId];
  baseStats: BaseStats;
  evolvesTo?: { id: string; level: number };
}

// src/data/monsters/starters.ts
import type { MonsterSpecies } from "@/types/monster";

export const starters = [
  {
    id: "starter-fire",
    name: "（未定）",
    types: ["fire"],
    baseStats: { hp: 39, atk: 52, def: 43, spAtk: 60, spDef: 50, speed: 65 },
  },
  // ...
] as const satisfies readonly MonsterSpecies[];
```

### ファイル規約

- `src/data/` 配下は**純粋なデータのみ**（ロジック禁止）
- 1ファイル1エクスポート原則（`default export` は使わない）
- ファイル名はケバブケース（`fire-monsters.ts`）
