import type { MonsterInstance, SpeciesResolver, MoveResolver } from "@/types";
import { type BattleState, type BattleAction, initBattle, getActiveMonster } from "./state-machine";
import { determineTurnOrder, type TurnAction } from "./turn-order";
import { executeMove, executeStruggle } from "./move-executor";
import { applyStatusDamage } from "./status";
import { calcExpGain, grantExp } from "./experience";
import { calcAllStats } from "@/engine/monster/stats";
import { checkEvolution, evolve } from "@/engine/monster/evolution";
import { applyStatChanges, createStatStages } from "./stat-stage";
import { type AiLevel, type AiStrategy, getAiStrategy } from "./ai";

/** バトルエンジン */
export class BattleEngine {
  state: BattleState;
  private speciesResolver: SpeciesResolver;
  private moveResolver: MoveResolver;
  private random: () => number;
  private aiStrategy: AiStrategy;

  constructor(
    playerParty: MonsterInstance[],
    opponentParty: MonsterInstance[],
    battleType: "wild" | "trainer",
    speciesResolver: SpeciesResolver,
    moveResolver: MoveResolver,
    random?: () => number,
    aiLevel?: AiLevel,
  ) {
    const hasAlive = playerParty.some((m) => m.currentHp > 0);
    if (!hasAlive) {
      throw new Error("全滅状態でバトルを開始できません");
    }

    this.state = initBattle(playerParty, opponentParty, battleType);
    this.speciesResolver = speciesResolver;
    this.moveResolver = moveResolver;
    this.random = random ?? Math.random;
    this.aiStrategy = getAiStrategy(aiLevel ?? "random");
  }

  /** プレイヤーのアクティブモンスター */
  get playerActive(): MonsterInstance {
    return getActiveMonster(this.state.player);
  }

  /** 相手のアクティブモンスター */
  get opponentActive(): MonsterInstance {
    return getActiveMonster(this.state.opponent);
  }

  /**
   * プレイヤーのアクションを受け取り、ターンを実行する
   * @returns バトルメッセージのリスト
   */
  executeTurn(playerAction: BattleAction): string[] {
    this.state.messages = [];

    // 逃走処理
    if (playerAction.type === "run") {
      // トレーナー戦は逃走不可（ターン消費せず再選択）
      if (this.state.battleType === "trainer") {
        this.state.messages.push("トレーナー戦からは逃げられない！");
        return this.state.messages;
      }

      this.handleRun();
      if (this.state.result) return this.state.messages;

      // 逃走失敗: 相手のターンを実行
      const opponentAction = this.selectOpponentAction();
      if (opponentAction.type === "fight") {
        const opponentSpecies = this.speciesResolver(this.opponentActive.speciesId);
        const move =
          opponentAction.moveIndex >= 0
            ? this.moveResolver(this.opponentActive.moves[opponentAction.moveIndex].moveId)
            : undefined;
        const turnAction: TurnAction = {
          side: "opponent",
          action: opponentAction,
          monster: this.opponentActive,
          species: opponentSpecies,
          move,
        };
        this.executeAction(turnAction);
        this.checkFaint();
      }

      this.applyEndOfTurnEffects();
      this.checkFaint();
      this.state.turnNumber++;
      return this.state.messages;
    }

    // アイテム使用処理（アイテム使用後、相手のターンのみ実行）
    if (playerAction.type === "item") {
      this.state.messages.push(`アイテムを使った！`);

      // 相手のターンを実行
      const opponentAction = this.selectOpponentAction();
      if (opponentAction.type === "fight") {
        const opponentSpecies = this.speciesResolver(this.opponentActive.speciesId);
        const move =
          opponentAction.moveIndex >= 0
            ? this.moveResolver(this.opponentActive.moves[opponentAction.moveIndex].moveId)
            : undefined;
        const turnAction: TurnAction = {
          side: "opponent",
          action: opponentAction,
          monster: this.opponentActive,
          species: opponentSpecies,
          move,
        };
        this.executeAction(turnAction);
        this.checkFaint();
      }

      this.applyEndOfTurnEffects();
      this.checkFaint();
      this.state.turnNumber++;
      return this.state.messages;
    }

    // 交代処理
    if (playerAction.type === "switch") {
      this.state.messages.push(this.handleSwitch("player", playerAction.partyIndex));
    }

    // 相手のアクション決定（AI: ランダム技選択）
    const opponentAction = this.selectOpponentAction();

    // 行動順決定
    const playerSpecies = this.speciesResolver(this.playerActive.speciesId);
    const opponentSpecies = this.speciesResolver(this.opponentActive.speciesId);

    const playerTurnAction: TurnAction = {
      side: "player",
      action: playerAction,
      monster: this.playerActive,
      species: playerSpecies,
      move:
        playerAction.type === "fight" && playerAction.moveIndex >= 0
          ? this.moveResolver(this.playerActive.moves[playerAction.moveIndex].moveId)
          : undefined,
      statStages: this.state.player.statStages,
    };

    const opponentTurnAction: TurnAction = {
      side: "opponent",
      action: opponentAction,
      monster: this.opponentActive,
      species: opponentSpecies,
      move:
        opponentAction.type === "fight" && opponentAction.moveIndex >= 0
          ? this.moveResolver(this.opponentActive.moves[opponentAction.moveIndex].moveId)
          : undefined,
      statStages: this.state.opponent.statStages,
    };

    const [first, second] = determineTurnOrder(playerTurnAction, opponentTurnAction, () =>
      this.random(),
    );

    // 1st action
    this.executeAction(first);
    if (this.state.result) return this.state.messages;

    // 瀕死チェック
    if (this.checkFaint()) return this.state.messages;

    // 2nd action
    this.executeAction(second);
    if (this.state.result) return this.state.messages;

    // 瀕死チェック
    if (this.checkFaint()) return this.state.messages;

    // ターン終了: 状態異常ダメージ
    this.applyEndOfTurnEffects();
    if (this.checkFaint()) return this.state.messages;

    this.state.turnNumber++;
    return this.state.messages;
  }

  /** 技を実行 */
  private executeAction(action: TurnAction): void {
    if (action.action.type !== "fight") return;

    const attackerSpecies = this.speciesResolver(action.monster.speciesId);
    const defenderSide = action.side === "player" ? "opponent" : "player";
    const defender = defenderSide === "player" ? this.playerActive : this.opponentActive;
    const defenderSpecies = this.speciesResolver(defender.speciesId);

    // わるあがき判定（moveIndex === -1 または move が undefined）
    if (action.action.moveIndex === -1 || !action.move) {
      const maxHp = calcAllStats(
        attackerSpecies.baseStats,
        action.monster.ivs,
        action.monster.evs,
        action.monster.level,
        action.monster.nature,
      ).hp;
      const result = executeStruggle(
        action.monster,
        attackerSpecies,
        defender,
        defenderSpecies,
        maxHp,
        () => this.random(),
      );
      this.state.messages.push(...result.messages);
      defender.currentHp = result.defenderHpAfter;
      return;
    }

    const attackerBattler = action.side === "player" ? this.state.player : this.state.opponent;
    const defenderBattler = action.side === "player" ? this.state.opponent : this.state.player;

    const result = executeMove(
      action.monster,
      attackerSpecies,
      defender,
      defenderSpecies,
      action.move,
      () => this.random(),
      attackerBattler.statStages,
      defenderBattler.statStages,
    );

    this.state.messages.push(...result.messages);

    // HP更新
    defender.currentHp = result.defenderHpAfter;

    // 状態異常付与
    if (result.statusApplied) {
      defender.status = result.statusApplied;
    }

    // 能力変化適用
    if (result.statChanges) {
      const attackerSide = action.side === "player" ? this.state.player : this.state.opponent;
      const defenderSide = action.side === "player" ? this.state.opponent : this.state.player;

      if (result.statChanges.target === "self") {
        const targetSpecies = this.speciesResolver(action.monster.speciesId);
        const [newStages, msgs] = applyStatChanges(
          attackerSide.statStages,
          result.statChanges.changes,
          targetSpecies.name,
        );
        attackerSide.statStages = newStages;
        this.state.messages.push(...msgs);
      } else {
        const [newStages, msgs] = applyStatChanges(
          defenderSide.statStages,
          result.statChanges.changes,
          defenderSpecies.name,
        );
        defenderSide.statStages = newStages;
        this.state.messages.push(...msgs);
      }
    }
  }

  /** 野生バトルの逃走処理（結果はthis.state.messages / this.state.resultに書き込み） */
  private handleRun(): void {
    // 逃走成功率: (playerSpeed * 128 / opponentSpeed + 30 * attempts) / 256
    const playerSpecies = this.speciesResolver(this.playerActive.speciesId);
    const opponentSpecies = this.speciesResolver(this.opponentActive.speciesId);
    const playerSpeed = calcAllStats(
      playerSpecies.baseStats,
      this.playerActive.ivs,
      this.playerActive.evs,
      this.playerActive.level,
      this.playerActive.nature,
    ).speed;
    const opponentSpeed = calcAllStats(
      opponentSpecies.baseStats,
      this.opponentActive.ivs,
      this.opponentActive.evs,
      this.opponentActive.level,
      this.opponentActive.nature,
    ).speed;

    const escapeChance = Math.min(
      1,
      (playerSpeed * 128) / (opponentSpeed || 1) / 256 + (30 * this.state.escapeAttempts) / 256,
    );

    if (this.random() < escapeChance) {
      this.state.messages.push("うまく逃げ切れた！");
      this.state.result = { type: "run_success" };
      this.state.phase = "battle_end";
    } else {
      this.state.messages.push("逃げられなかった！");
      this.state.escapeAttempts++;
    }
  }

  /** 交代処理 */
  private handleSwitch(side: "player" | "opponent", partyIndex: number): string {
    const battler = side === "player" ? this.state.player : this.state.opponent;

    if (partyIndex < 0 || partyIndex >= battler.party.length) {
      throw new Error(`無効なパーティインデックス: ${partyIndex}`);
    }
    if (battler.party[partyIndex].currentHp <= 0) {
      throw new Error("瀕死のモンスターには交代できない！");
    }
    if (partyIndex === battler.activeIndex) {
      throw new Error("既にバトルに出ているモンスターです！");
    }

    const oldSpecies = this.speciesResolver(battler.party[battler.activeIndex].speciesId);
    battler.activeIndex = partyIndex;
    battler.statStages = createStatStages(); // 交代時にステージリセット
    const newSpecies = this.speciesResolver(battler.party[partyIndex].speciesId);
    return `${oldSpecies.name}を引っ込めて${newSpecies.name}を繰り出した！`;
  }

  /** 瀕死チェック & 強制交代/バトル終了 */
  private checkFaint(): boolean {
    // 相手が瀕死
    if (this.opponentActive.currentHp <= 0) {
      const species = this.speciesResolver(this.opponentActive.speciesId);
      this.state.messages.push(`${species.name}は倒れた！`);

      // 経験値付与
      const expGain = calcExpGain(
        species,
        this.opponentActive.level,
        this.state.battleType === "trainer",
      );
      const playerSpeciesForExp = this.speciesResolver(this.playerActive.speciesId);
      const { levelsGained } = grantExp(this.playerActive, expGain, playerSpeciesForExp.expGroup);
      const playerSpecies = this.speciesResolver(this.playerActive.speciesId);
      this.state.messages.push(`${playerSpecies.name}は${expGain}の経験値を得た！`);
      if (levelsGained > 0) {
        this.state.messages.push(
          `${playerSpecies.name}はレベル${this.playerActive.level}に上がった！`,
        );

        // 進化チェック
        const evoTarget = checkEvolution(this.playerActive, playerSpecies);
        if (evoTarget) {
          const newSpecies = this.speciesResolver(evoTarget);
          this.state.messages.push(`おや…？ ${playerSpecies.name}のようすが…！`);
          evolve(this.playerActive, playerSpecies, newSpecies);
          this.state.messages.push(`${playerSpecies.name}は${newSpecies.name}に進化した！`);
        }
      }

      // 次のモンスターがいるか
      const nextAlive = this.state.opponent.party.findIndex(
        (m, i) => i !== this.state.opponent.activeIndex && m.currentHp > 0,
      );

      if (nextAlive === -1) {
        this.state.result = { type: "win" };
        this.state.phase = "battle_end";
        this.state.messages.push("バトルに勝利した！");
        return true;
      }

      // トレーナー戦: 相手が次のモンスターを出す
      if (this.state.battleType === "trainer") {
        this.state.opponent.activeIndex = nextAlive;
        const nextSpecies = this.speciesResolver(this.state.opponent.party[nextAlive].speciesId);
        this.state.messages.push(`相手は${nextSpecies.name}を繰り出した！`);
      } else {
        // 野生戦: 勝利
        this.state.result = { type: "win" };
        this.state.phase = "battle_end";
        this.state.messages.push("バトルに勝利した！");
        return true;
      }
    }

    // プレイヤーが瀕死
    if (this.playerActive.currentHp <= 0) {
      const species = this.speciesResolver(this.playerActive.speciesId);
      this.state.messages.push(`${species.name}は倒れた！`);

      const nextAlive = this.state.player.party.findIndex(
        (m, i) => i !== this.state.player.activeIndex && m.currentHp > 0,
      );

      if (nextAlive === -1) {
        this.state.result = { type: "lose" };
        this.state.phase = "battle_end";
        this.state.messages.push("目の前が真っ暗になった...");
        return true;
      }

      // 強制交代フェーズ
      this.state.phase = "force_switch";
    }

    return false;
  }

  /** ターン終了時の状態異常ダメージ */
  private applyEndOfTurnEffects(): void {
    const applyToMonster = (monster: MonsterInstance) => {
      if (!monster.status || monster.currentHp <= 0) return;
      const species = this.speciesResolver(monster.speciesId);
      const maxHp = calcAllStats(
        species.baseStats,
        monster.ivs,
        monster.evs,
        monster.level,
        monster.nature,
      ).hp;
      const hpBefore = monster.currentHp;
      monster.currentHp = applyStatusDamage(monster, maxHp);
      if (monster.currentHp < hpBefore) {
        const statusName = monster.status === "poison" ? "毒" : "やけど";
        this.state.messages.push(`${species.name}は${statusName}のダメージを受けた！`);
      }
    };

    applyToMonster(this.playerActive);
    applyToMonster(this.opponentActive);
  }

  /** 相手のAI: 戦略に基づいて技を選択 */
  private selectOpponentAction(): BattleAction {
    const active = this.opponentActive;
    const usableMoves = active.moves
      .map((m, i) => ({ move: this.moveResolver(m.moveId), index: i, currentPp: m.currentPp }))
      .filter((m) => m.currentPp > 0);

    if (usableMoves.length === 0) {
      return { type: "fight", moveIndex: -1 };
    }

    const selfSpecies = this.speciesResolver(active.speciesId);
    const opponentSpecies = this.speciesResolver(this.playerActive.speciesId);

    return this.aiStrategy.selectAction({
      self: active,
      selfSpecies,
      opponent: this.playerActive,
      opponentSpecies,
      usableMoves,
      selfBattler: this.state.opponent,
      random: () => this.random(),
    });
  }

  /** 強制交代の実行 */
  forceSwitch(partyIndex: number): string[] {
    this.state.messages = [];
    const msg = this.handleSwitch("player", partyIndex);
    this.state.messages.push(msg);
    this.state.phase = "action_select";
    return this.state.messages;
  }
}
