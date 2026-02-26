# ポケモンをメタ的に捉える — 「ポケモンを作る」ための設計指針

## 0. このドキュメントの目的

ポケモンを「ゲーム」としてではなく、**構造・システム・体験設計**の視点から分解し、
「自分でポケモン的なものを作る」ために何が本質で、何が表層かを明確にする。

---

## 1. ポケモンとは何か — メタ的な定義

ポケモンは「ゲーム」ではない。ポケモンは以下の**4つのシステムが噛み合った体験装置**である。

| レイヤー                | 本質                                         | 具体例                     |
| ----------------------- | -------------------------------------------- | -------------------------- |
| **収集（Collection）**  | 「世界の全体像」を自分の手で埋めていく充足感 | 図鑑、捕獲、出現率の偏り   |
| **育成（Cultivation）** | 「時間の投資」が目に見える形で返ってくる快感 | レベル、努力値、進化       |
| **交換（Exchange）**    | 「他者との非対称性」が交流の動機になる       | バージョン違い、通信交換   |
| **対戦（Battle）**      | 「知識と判断」の応酬が深い戦略性を生む       | タイプ相性、読み合い、構築 |

**重要な洞察**: この4つは独立していない。収集が育成の動機を生み、育成が対戦の深さを生み、対戦が交換の必要性を生み、交換が収集を加速させる。**循環構造**こそがポケモンの本体である。

---

## 2. ポケモンの「モンスター」とは何か — デザイン哲学

### 2.1 Game Freakの設計原則

ゲームフリークのモンスターデザインには明確な哲学がある:

1. **存在の理由（Why it exists）**: そのモンスターが「なぜその世界に存在するか」を説明できなければ不採用
2. **生態系思考**: どこに住み、何を食べ、なぜその姿なのか — キャラクターではなく「生き物」として設計する
3. **進化の必然性**: 進化は「パワーアップ」ではなく、「なぜその変化が起きたか」に理由がある
4. **視覚的コミュニケーション**: 見た目だけでタイプ・強さ・性格が伝わること

### 2.2 メタ的に言い換えると

モンスターとは**「ゲームメカニクスを人格化したもの」**である。

- 炎タイプ → 攻撃的なステータス分布 → 赤・尖った形状 → 攻めるプレイスタイル
- 岩タイプ → 防御的なステータス分布 → 重厚な形状 → 耐えるプレイスタイル

つまり、**見た目 = 機能 = 遊び方**。この三位一体がポケモンのデザインの核心。

---

## 3. タイプ相性システム — 拡張じゃんけん

### 3.1 構造

ポケモンのバトルは**18タイプの拡張じゃんけん**である。

```
基本ループ:  火 > 草 > 水 > 火
隠れたループ: 悪 > 霊 > 超 > 格 > 悪
```

じゃんけんと違う点:

- **非対称性**: AがBに強いからといって、BがAに弱いとは限らない（ノーマル→ゴースト は無効だが逆は等倍）
- **多重タイプ**: 1体が2タイプを持てるため、「弱点が弱点でなくなる」組み合わせが生まれる
- **4つの技枠**: 自タイプ以外の技を持てるため、見た目の相性だけでは結果が読めない

### 3.2 設計上の教訓

タイプシステムを自作する場合:

- **最低5タイプ**は必要（3だと単純すぎ、20超は認知負荷が高すぎる）
- **完全な循環**を保証する（どのタイプにも「勝てる相手」と「負ける相手」がある）
- **例外・抜け道**を意図的に設ける（完全バランスは退屈。「強すぎるタイプ」があるから環境が生まれる）

---

## 4. コアループ — なぜプレイヤーは止められないのか

### 4.1 ドーパミンループの設計

ポケモンのコアループは神経科学的に見て非常に洗練されている:

```
[探索] → [遭遇（ランダム）] → [捕獲/戦闘（判断）] → [報酬（経験値/新種）] → [図鑑の充足] → [探索]
```

- **変動報酬（Variable Ratio Reinforcement）**: 草むらで「何が出るかわからない」がドーパミンを生む
- **進捗の可視化**: 図鑑の埋まり具合が「あとちょっと」を駆動する
- **損失回避**: レアポケモンを逃したくないから「もう1回」がある

### 4.2 多層的なゴール設計

| ゴールの種類 | 具体例               | 心理的効果     |
| ------------ | -------------------- | -------------- |
| 短期         | 次のジムバッジを取る | 即時の達成感   |
| 中期         | チャンピオンを倒す   | 物語の完結     |
| 長期         | 図鑑を完成させる     | 完璧主義の充足 |
| 無限         | 対戦で最強になる     | 終わりなき挑戦 |

プレイヤーが「どのゴールを追うか」を自分で選べることが重要。

---

## 5. 実装アーキテクチャ — 作るなら何を作るか

### 5.1 最小構成（MVP）

ポケモン的ゲームのMVPに必要なシステムを優先度順に並べる:

```
[必須] モンスターのデータ構造（種族値・タイプ・技）
[必須] タイプ相性テーブル
[必須] ターン制バトルエンジン
[必須] モンスターの捕獲メカニクス
[重要] 進化システム
[重要] マップ/エンカウントシステム
[付加] 図鑑UI
[付加] 対人戦/交換
[付加] ストーリー/NPC
```

### 5.2 データ構造の設計

```typescript
// モンスターの「種族」定義
interface Species {
  id: number;
  name: string;
  types: [Type] | [Type, Type];
  baseStats: Stats;
  learnset: LearnsetEntry[]; // レベルで覚える技
  evolutionChain: Evolution[]; // 進化条件と進化先
  catchRate: number; // 捕獲率 (0-255)
  description: string; // 図鑑テキスト
}

// 個体（実際にプレイヤーが持つ1匹）
interface Monster {
  species: Species;
  nickname?: string;
  level: number;
  experience: number;
  currentHp: number;
  stats: Stats; // 種族値 + 個体値 + 努力値から計算
  individualValues: Stats; // 個体値（生まれつきの才能）
  effortValues: Stats; // 努力値（育成の結果）
  moves: Move[]; // 現在覚えている技（最大4つ）
  status: StatusCondition | null;
}

// ステータス
interface Stats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

// 技
interface Move {
  id: number;
  name: string;
  type: Type;
  category: "physical" | "special" | "status";
  power: number; // 威力
  accuracy: number; // 命中率
  pp: number; // 使用回数
  effect?: MoveEffect; // 追加効果
}

// タイプ
type Type =
  | "normal"
  | "fire"
  | "water"
  | "grass"
  | "electric"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";
```

### 5.3 ダメージ計算の核心

```typescript
function calculateDamage(attacker: Monster, defender: Monster, move: Move): number {
  // ポケモンのダメージ計算式（第5世代以降）
  const level = attacker.level;
  const power = move.power;

  const [attackStat, defenseStat] =
    move.category === "physical"
      ? [attacker.stats.attack, defender.stats.defense]
      : [attacker.stats.specialAttack, defender.stats.specialDefense];

  // 基本ダメージ
  const baseDamage = Math.floor(
    (((2 * level) / 5 + 2) * power * attackStat) / defenseStat / 50 + 2,
  );

  // 乗算修正
  const stab = attacker.species.types.includes(move.type) ? 1.5 : 1.0; // タイプ一致ボーナス
  const typeEffectiveness = getTypeEffectiveness(move.type, defender.species.types);
  const random = (Math.floor(Math.random() * 16) + 85) / 100; // 85-100%の乱数

  return Math.floor(baseDamage * stab * typeEffectiveness * random);
}
```

### 5.4 技術スタック候補

| 選択肢                        | 適用場面               | メリット                         |
| ----------------------------- | ---------------------- | -------------------------------- |
| **TypeScript + Canvas/WebGL** | ブラウザゲーム         | 配布が楽、クロスプラットフォーム |
| **TypeScript + Phaser**       | 2D RPG                 | バトル・マップ・UIの土台が揃う   |
| **TypeScript + React**        | UI重視・カードゲーム風 | コンポーネント設計と相性が良い   |
| **Electron + TypeScript**     | デスクトップアプリ     | オフライン対応、ネイティブ機能   |

---

## 6. オリジナルを作るための「ずらし方」

ポケモンのクローンを作っても意味がない。重要なのは**構造を理解した上で「何をずらすか」**。

### 6.1 ずらせるレイヤー

| レイヤー         | ポケモンの選択       | ずらしの例                        |
| ---------------- | -------------------- | --------------------------------- |
| **世界観**       | ファンタジー×生物学  | SF×ロボット、神話×精霊、現代×細菌 |
| **収集の対象**   | 生き物（151→1000+）  | 武器、言語、料理、音楽            |
| **バトルの形式** | 1vs1ターン制         | チーム戦、リアルタイム、カード式  |
| **進化の条件**   | レベル/アイテム/通信 | 感情、環境、プレイヤーの選択      |
| **交換の動機**   | バージョン違い       | 地域限定、時間限定、条件限定      |

### 6.2 「ポケモンが選ばなかった道」を選ぶ

ポケモンが意図的に避けているデザイン領域がある。ここにオリジナリティのチャンスがある:

- **モンスターの死**: ポケモンは「瀕死」であって「死」ではない → 死のあるシステムは全く違う体験になる
- **モンスター同士の関係**: ポケモンは基本的にトレーナーとの関係だけ → モンスター間の友情・敵対は?
- **環境への影響**: ポケモンの世界は静的 → モンスターが生態系を変える仕組みは?
- **道徳的ジレンマ**: ポケモンは基本的に善悪が明確 → 捕まえること自体が倫理的に問われたら?
- **モンスターのAI**: ポケモンはプレイヤーの命令に完全服従 → 言うことを聞かないモンスターは?

---

## 7. 開発ロードマップ（提案）

### Phase 1: プロトタイプ（コアメカニクス検証）

- タイプ相性テーブルの設計
- ダメージ計算エンジン
- CLIベースの1vs1バトル
- 3-5種のテストモンスター

### Phase 2: ゲームループ（体験の最小単位）

- マップ移動とエンカウント
- 捕獲メカニクス
- パーティ管理（6匹）
- 回復・ショップ

### Phase 3: 深さの追加

- 進化システム
- 技マシン/技の習得
- トレーナー戦AI
- 図鑑UI

### Phase 4: 社会性

- 対人戦（ローカル or オンライン）
- 交換システム
- ランキング/レーティング

---

## 8. まとめ — ポケモンの本質は「関係性のエンジン」

ポケモンの真のイノベーションはモンスターでもバトルでもない。
**「人とモンスター」「人と人」「モンスターとモンスター」の関係性を、ゲームメカニクスで駆動したこと**だ。

田尻智が少年時代に経験した「昆虫採集」「友達との交換」「虫相撲」— この原体験がそのままゲームシステムになっている。

だから「ポケモンを作る」とは、**自分の原体験の中にある「関係性の面白さ」を見つけ、それをシステムとして表現すること**である。

---

## 参考資料

- [Game Design Analysis: Pokemon (core series)](https://www.anuflora.com/game/?p=4748) — ポケモンのゲームデザインレンズ分析
- [Elements of Gameplay: An Analysis of Pokemon](https://flux.blogs.com/game_design_as_cultural_p/2009/09/elements-of-gameplay-an-analysis-of-pokemon.html) — ゲームプレイ要素の分析
- [I Have Some Nice Things To Say About Pokémon's Game Design](https://medium.com/@Urzashottub/i-have-some-nice-things-to-say-about-pok%C3%A9mons-game-design-62ad5d7d9964) — ポケモンのゲームデザイン考察
- [Here's How Game Freak Designs Pokémon Creatures](https://gameinformer.com/b/features/archive/2017/08/10/heres-how-game-freak-designs-pokemon-creatures.aspx) — Game Freakのモンスターデザインプロセス
- [Ken Sugimori Wants Pokémon Designs To Be As Memorable As Possible](https://www.nintendolife.com/news/2018/07/ken_sugimori_wants_pokemon_designs_to_be_as_memorable_as_possible) — 杉森建のデザイン哲学
- [How the Rock Paper Scissors Framework is Used in Pokemon](https://wrpsa.com/how-the-rock-paper-scissors-framework-is-used-in-pokemon/) — タイプ相性の数学的分析
- [Pokémon's progressive revelation: Notes on 20 years of game design](https://www.researchgate.net/publication/312301844_Pokemon_'s_progressive_revelation_Notes_on_20_years_of_game_design) — 20年間のデザイン進化
- [Compulsion Loops & Dopamine in Games and Gamification](https://www.gamedeveloper.com/design/compulsion-loops-dopamine-in-games-and-gamification) — ゲームにおけるドーパミンループ
- [pokemon-js (GitHub)](https://github.com/chase-manning/pokemon-js) — React+TypeScriptによるポケモン再現
- [pokemon-like-game (GitHub)](https://github.com/KUSTIKs/pokemon-like-game) — TypeScript+Canvasによるポケモンライクゲーム
- [PokéSandbox](https://www.pokecommunity.com/threads/misc-engine-pok%C3%A9sandbox-a-create-your-own-discord-pok%C3%A9mon-game-platform.541072/) — TypeScriptフルスタックのポケモンプラットフォーム
- [ポケモンらしさ: デザイン史](https://www.pkmnheight.com/2020/04/301.html) — 初代開発史におけるデザインの変遷
- [CEDEC2023: ポケモンSVのパルデア地方の描き方](https://gamemakers.jp/article/2023_09_12_49637/) — 「ポケモンらしい」表現の追求
