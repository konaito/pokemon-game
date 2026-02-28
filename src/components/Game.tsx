"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useGameState, useGameDispatch } from "./GameProvider";
import { TitleScreen } from "./screens/TitleScreen";
import { StarterSelect, type StarterOption } from "./screens/StarterSelect";
import { OverworldScreen } from "./screens/OverworldScreen";
import { BattleScreen, type BattleAction as BattleScreenAction } from "./screens/BattleScreen";
import { MenuScreen } from "./screens/MenuScreen";
import { PartyScreen, type PartyMemberInfo } from "./screens/PartyScreen";
import { BagScreen, type BagItemInfo } from "./screens/BagScreen";
import { PokedexScreen, type PokedexEntry } from "./screens/PokedexScreen";
import { MessageWindow } from "./ui/MessageWindow";
import { SceneTransition, useSceneTransition } from "./ui/SceneTransition";
import { useAudio } from "./AudioProvider";
import { resolveEnvironment } from "./ui/BattleBackgrounds";
import type { MonsterInstance } from "@/types";
import { BattleEngine } from "@/engine/battle/engine";
import type { BattleAction } from "@/engine/battle/state-machine";
import {
  calculateLossPenalty,
  resolveTrainerClass,
  setGymLeaderNames,
} from "@/engine/battle/prize-money";
import { processEncounter, generateWildMonster } from "@/engine/map/encounter";
import { useHealingCenter as healAtCenter } from "@/engine/map/healing";
import { calcAllStats } from "@/engine/monster/stats";
import { getLearnableMoves, learnMove, replaceMove } from "@/engine/monster/moves";
import { swapPartyOrder } from "@/engine/monster/party";
import { addItem, removeItem, useHealItem as applyHealItem } from "@/engine/item/bag";
import { executeCaptureFlow } from "@/engine/capture/capture-flow";
import { ALL_SPECIES, getSpeciesById } from "@/data/monsters";
import { expProgressPercent, expToNextLevel, expForLevel } from "@/engine/battle/experience";
import { saveGame, loadGame } from "@/engine/state/save-data";
import { checkFlagRequirement } from "@/engine/state/story-flags";
import {
  createSpeciesResolver,
  createMoveResolver,
  createItemResolver,
  createMapResolver,
} from "@/engine/resolvers";
import { resolveCommands, type EventOutput } from "@/engine/event/event-script";
import { createGymBattleScript, canChallengeGym } from "@/engine/event/gym";
import { GYM_LEADERS } from "@/data/gyms/gym-leaders";
import { OBLIVION_EVENTS } from "@/engine/event/oblivion-events";
import {
  ELITE_FOUR,
  CHAMPION,
  createEliteFourScript,
  createChampionScript,
} from "@/engine/event/elite-four";
import { createEndingScript } from "@/engine/event/ending";

/** スターター定義 */
const STARTERS: StarterOption[] = [
  {
    speciesId: "himori",
    name: "ヒモリ",
    type: "fire",
    description: "背中に小さな炎を灯す子ヤモリのモンスター。情熱的で勇敢な性格。",
  },
  {
    speciesId: "shizukumo",
    name: "シズクモ",
    type: "water",
    description: "水滴をまとう蜘蛛のモンスター。冷静で穏やかな知性派。",
  },
  {
    speciesId: "konohana",
    name: "コノハナ",
    type: "grass",
    description: "木の葉のような耳を持つ小さな精霊。好奇心旺盛で元気いっぱい。",
  },
];

function createStarterInstance(speciesId: string): MonsterInstance {
  const species = getSpeciesById(speciesId)!;
  const ivs = { hp: 20, atk: 20, def: 20, spAtk: 20, spDef: 20, speed: 20 };
  const evs = { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 };
  const maxHp = calcAllStats(species.baseStats, ivs, evs, 5, "hardy").hp;
  return {
    uid: crypto.randomUUID(),
    speciesId,
    level: 5,
    exp: expForLevel(5, species.expGroup),
    nature: "hardy",
    ivs,
    evs,
    currentHp: maxHp,
    moves: species.learnset
      .filter((e) => e.level <= 5)
      .slice(-4)
      .map((e) => {
        const moveDef = moveResolver(e.moveId);
        return { moveId: e.moveId, currentPp: moveDef.pp };
      }),
    status: null,
  };
}

// Resolvers（モジュールスコープで一度だけ生成）
const speciesResolver = createSpeciesResolver();
const moveResolver = createMoveResolver();
const itemResolver = createItemResolver();
const mapResolver = createMapResolver();

// ジムリーダー名を賞金計算モジュールに登録
setGymLeaderNames(GYM_LEADERS.map((g) => g.leaderName));

/** maxHp計算ヘルパー */
function getMaxHp(monster: MonsterInstance): number {
  const species = speciesResolver(monster.speciesId);
  return calcAllStats(species.baseStats, monster.ivs, monster.evs, monster.level, monster.nature)
    .hp;
}

/** 前の画面を記録するためのタイプ */
type OverlayScreen = "menu" | "party" | "bag" | "pokedex" | null;

export function Game() {
  const state = useGameState();
  const dispatch = useGameDispatch();

  // --- セーブデータ存在チェック（ハイドレーション対策：マウント後に判定） ---
  const [hasSaveData, setHasSaveData] = useState(false);
  useEffect(() => {
    setHasSaveData(localStorage.getItem("pokemon_save_1") !== null);
  }, []);

  // --- バトル状態 ---
  const [battleEngine, setBattleEngine] = useState<BattleEngine | null>(null);
  const [battleMessages, setBattleMessages] = useState<string[]>([]);
  const [isBattleProcessing, setIsBattleProcessing] = useState(false);
  const [wildMonster, setWildMonster] = useState<MonsterInstance | null>(null);

  // --- オーバーレイ画面（メニュー系） ---
  const [overlayScreen, setOverlayScreen] = useState<OverlayScreen>(null);
  const [, setReturnScreen] = useState<"overworld" | "battle">("overworld");

  // --- メッセージウィンドウ ---
  const [pendingMessages, setPendingMessages] = useState<string[] | null>(null);
  const [messageCallback, setMessageCallback] = useState<(() => void) | null>(null);

  // --- 技習得UI ---
  const [learnMoveState, setLearnMoveState] = useState<{
    monster: MonsterInstance;
    moveId: string;
    moveName: string;
  } | null>(null);

  // バトル中のバッグ選択用
  const [battleBagMode, setBattleBagMode] = useState(false);
  const [battlePartyMode, setBattlePartyMode] = useState(false);

  // --- 画面遷移アニメーション ---
  const { transitionActive, transitionType, transitionDuration, startTransition, handleComplete } =
    useSceneTransition();

  // --- オーディオ ---
  const { playBgm, stopBgm, fadeOutBgm, playSe } = useAudio();

  // --- イベントスクリプトキュー ---
  const eventQueueRef = useRef<EventOutput[]>([]);
  const isEventRunningRef = useRef(false);
  const [isTrainerBattle, setIsTrainerBattle] = useState(false);
  const [trainerBattleName, setTrainerBattleName] = useState<string | null>(null);

  // 画面ごとのBGM切り替え
  useEffect(() => {
    switch (state.screen) {
      case "title":
        playBgm("title");
        break;
      case "overworld":
        playBgm("overworld-default");
        break;
      case "battle":
        if (isTrainerBattle) {
          playBgm("battle-trainer");
        } else {
          playBgm("battle-wild");
        }
        break;
      default:
        break;
    }
  }, [state.screen, isTrainerBattle, playBgm]);

  // ジムリーダーNPC ID → GymDefinition マッピング
  const gymLeaderNpcMap = useMemo(() => {
    const map: Record<string, (typeof GYM_LEADERS)[number]> = {};
    // NPC IDパターン: npc-gym{N}-leader → GYM_LEADERS[N-1]
    for (const gym of GYM_LEADERS) {
      map[`npc-gym${gym.gymNumber}-leader`] = gym;
    }
    return map;
  }, []);

  // 四天王・チャンピオンNPC ID マッピング
  const leagueNpcMap = useMemo(() => {
    const map: Record<string, { type: "elite"; index: number } | { type: "champion" }> = {};
    for (let i = 0; i < ELITE_FOUR.length; i++) {
      map[`npc-league-elite${i + 1}`] = { type: "elite", index: i };
    }
    map["npc-league-champion"] = { type: "champion" };
    return map;
  }, []);

  /** メッセージを表示してコールバックを待つ */
  const showMessages = useCallback((msgs: string[], callback?: () => void) => {
    setPendingMessages(msgs);
    setMessageCallback(() => callback ?? null);
  }, []);

  /**
   * イベントキューから次のイベントを処理する
   * dialogue → メッセージ表示、battle → トレーナーバトル開始、
   * heal → パーティ回復、give_item → アイテム付与、set_flag → フラグ設定、
   * move_player → マップ遷移、wait → 遅延
   */
  const processNextEvent = useCallback(() => {
    const queue = eventQueueRef.current;
    if (queue.length === 0) {
      isEventRunningRef.current = false;
      return;
    }

    const event = queue.shift()!;

    switch (event.type) {
      case "dialogue": {
        const lines = event.speaker
          ? event.lines.map((l) => `${event.speaker}「${l}」`)
          : event.lines;
        showMessages(lines, () => processNextEvent());
        break;
      }
      case "set_flag":
        dispatch({ type: "SET_STORY_FLAG", flag: event.flag, value: event.value });
        // バッジ追加（gymN_clearedフラグの場合）
        if (event.flag.startsWith("gym") && event.flag.endsWith("_cleared") && event.value) {
          const gymNum = parseInt(event.flag.replace("gym", "").replace("_cleared", ""));
          const gym = GYM_LEADERS.find((g) => g.gymNumber === gymNum);
          if (gym && state.player) {
            const newBadges = [...state.player.badges, gym.badgeName];
            dispatch({ type: "UPDATE_PLAYER", updates: { badges: newBadges } });
          }
        }
        processNextEvent();
        break;
      case "heal":
        if (state.player) {
          for (const monster of state.player.partyState.party) {
            monster.currentHp = getMaxHp(monster);
            monster.status = null;
            for (const move of monster.moves) {
              const moveDef = moveResolver(move.moveId);
              move.currentPp = moveDef.pp;
            }
          }
          dispatch({
            type: "UPDATE_PLAYER",
            updates: { partyState: { ...state.player.partyState } },
          });
        }
        processNextEvent();
        break;
      case "give_item":
        if (state.player) {
          const item = itemResolver(event.itemId);
          addItem(state.player.bag, event.itemId, event.quantity);
          dispatch({
            type: "UPDATE_PLAYER",
            updates: { bag: { ...state.player.bag } },
          });
          showMessages([`${item.name}を${event.quantity}個手に入れた！`], () => processNextEvent());
        }
        break;
      case "battle": {
        if (!state.player) break;
        // トレーナーバトル開始: パーティを生成してBattleEngineを起動
        const trainerParty: MonsterInstance[] = event.party.map((p) => {
          const entry = {
            speciesId: p.speciesId,
            minLevel: p.level,
            maxLevel: p.level,
            weight: 100,
          };
          return generateWildMonster(entry, speciesResolver, moveResolver);
        });

        setIsTrainerBattle(true);
        setTrainerBattleName(event.trainerName);
        setBattleMessages([`${event.trainerName}が勝負を仕掛けてきた！`]);
        setIsBattleProcessing(true);

        const trainerClass = resolveTrainerClass(event.trainerName);
        const engine = new BattleEngine(
          state.player.partyState.party,
          trainerParty,
          "trainer",
          speciesResolver,
          moveResolver,
          undefined,
          event.trainerName,
          trainerClass,
        );
        setBattleEngine(engine);
        dispatch({ type: "CHANGE_SCREEN", screen: "battle" });
        setTimeout(() => setIsBattleProcessing(false), 1500);
        break;
      }
      case "move_player":
        dispatch({
          type: "SET_OVERWORLD",
          overworld: {
            currentMapId: event.mapId,
            playerX: event.x,
            playerY: event.y,
            direction: "down",
          },
        });
        dispatch({ type: "CHANGE_SCREEN", screen: "overworld" });
        processNextEvent();
        break;
      case "wait":
        setTimeout(() => processNextEvent(), event.ms);
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.player, state.storyFlags, dispatch, showMessages]);

  /**
   * イベントスクリプトを開始する
   * コマンド列をresolveしてキューに入れ、順次処理する
   */
  const runEventScript = useCallback(
    (commands: EventOutput[]) => {
      isEventRunningRef.current = true;
      eventQueueRef.current = [...commands];
      processNextEvent();
    },
    [processNextEvent],
  );

  /** メッセージ完了ハンドラ */
  const handleMessageComplete = useCallback(() => {
    setPendingMessages(null);
    const cb = messageCallback;
    setMessageCallback(null);
    cb?.();
  }, [messageCallback]);

  // ==========================
  // オーバーワールド関連
  // ==========================

  const currentMap = useMemo(() => {
    if (!state.overworld) return null;
    try {
      return mapResolver(state.overworld.currentMapId);
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.overworld?.currentMapId]);

  /** マップ遷移処理 */
  const handleMapTransition = useCallback(
    (targetMapId: string, targetX: number, targetY: number) => {
      if (isEventRunningRef.current) return;

      startTransition(
        "fade",
        () => {
          dispatch({
            type: "SET_OVERWORLD",
            overworld: {
              currentMapId: targetMapId,
              playerX: targetX,
              playerY: targetY,
              direction: "down",
            },
          });
        },
        400,
      );

      // マップ遷移時にストーリーイベントをチェック
      if (state.player) {
        // オブリヴィオン団イベント
        for (const event of OBLIVION_EVENTS) {
          if (event.trigger && checkFlagRequirement(state.storyFlags, event.trigger)) {
            // このイベントがまだ未処理かチェック（最初のbranch条件で判定）
            const outputs = resolveCommands(event.commands, state.storyFlags);
            if (outputs.length > 0) {
              // 少し遅延してから表示（マップ遷移後）
              setTimeout(() => runEventScript(outputs), 500);
              break; // 一度に1つのイベントのみ
            }
          }
        }

        // チャンピオン撃破後のエンディング
        if (state.storyFlags["champion_defeated"] && !state.storyFlags["ending_complete"]) {
          const endingScript = createEndingScript(state.player.name);
          const outputs = resolveCommands(endingScript.commands, state.storyFlags);
          setTimeout(() => runEventScript(outputs), 500);
        }

        // オートセーブ
        try {
          saveGame(
            {
              ...state,
              overworld: {
                currentMapId: targetMapId,
                playerX: targetX,
                playerY: targetY,
                direction: "down",
              },
            },
            1,
          );
        } catch {
          // セーブ失敗は無視
        }
      }
    },
    [dispatch, state, runEventScript, startTransition],
  );

  /** NPC会話処理 */
  const handleNpcInteract = useCallback(
    (npcId: string) => {
      if (isEventRunningRef.current) return;
      if (!currentMap || !state.player) return;

      const npc = currentMap.npcs.find((n) => n.id === npcId);
      if (!npc) return;

      // --- ジムリーダーNPC ---
      const gymDef = gymLeaderNpcMap[npcId];
      if (gymDef) {
        // 挑戦可能かチェック
        if (!canChallengeGym(gymDef.gymNumber, state.storyFlags)) {
          showMessages([`まだここに挑むには早いようだ。バッジが${gymDef.gymNumber - 1}個必要だ。`]);
          return;
        }
        const script = createGymBattleScript(gymDef);
        const outputs = resolveCommands(script.commands, state.storyFlags);
        runEventScript(outputs);
        return;
      }

      // --- 四天王・チャンピオンNPC ---
      const leagueEntry = leagueNpcMap[npcId];
      if (leagueEntry) {
        let script;
        if (leagueEntry.type === "elite") {
          // 前の四天王をクリアしているか
          if (leagueEntry.index > 0) {
            const prevFlag = `elite_four_${leagueEntry.index}_cleared`;
            if (!state.storyFlags[prevFlag]) {
              showMessages(["まだ先に進めないようだ。"]);
              return;
            }
          }
          script = createEliteFourScript(ELITE_FOUR[leagueEntry.index], leagueEntry.index);
        } else {
          // チャンピオン: 全四天王クリアが必要
          const allEliteCleared = ELITE_FOUR.every(
            (_, i) => state.storyFlags[`elite_four_${i + 1}_cleared`],
          );
          if (!allEliteCleared) {
            showMessages(["まだ四天王を全員倒していない。"]);
            return;
          }
          script = createChampionScript(CHAMPION);
        }
        const outputs = resolveCommands(script.commands, state.storyFlags);
        runEventScript(outputs);
        return;
      }

      // 条件付きダイアログ
      let dialogue = npc.dialogue;
      if (npc.conditionalDialogues) {
        for (const cd of npc.conditionalDialogues) {
          if (checkFlagRequirement(state.storyFlags, cd.condition)) {
            dialogue = cd.dialogue;
            break;
          }
        }
      }

      // 回復イベント
      if (npc.onInteract?.heal) {
        const result = healAtCenter(state.player.partyState.party, getMaxHp, moveResolver);
        showMessages([...dialogue, result.message]);
        dispatch({
          type: "UPDATE_PLAYER",
          updates: {
            partyState: { ...state.player.partyState },
          },
        });
        return;
      }

      // アイテム付与イベント
      if (npc.onInteract?.giveItem) {
        const { itemId, quantity } = npc.onInteract.giveItem;
        const item = itemResolver(itemId);
        addItem(state.player.bag, itemId, quantity);
        dispatch({
          type: "UPDATE_PLAYER",
          updates: { bag: { ...state.player.bag } },
        });
        showMessages([...dialogue, `${item.name}を${quantity}個もらった！`]);
        return;
      }

      // フラグ設定
      if (npc.onInteract?.setFlags) {
        for (const [flag, value] of Object.entries(npc.onInteract.setFlags)) {
          dispatch({ type: "SET_STORY_FLAG", flag, value });
        }
      }

      showMessages(dialogue);
    },
    [
      currentMap,
      state.player,
      state.storyFlags,
      dispatch,
      showMessages,
      gymLeaderNpcMap,
      leagueNpcMap,
      runEventScript,
    ],
  );

  /** エンカウント処理 */
  const handleEncounter = useCallback(() => {
    if (!currentMap || !state.player) return;

    const wildMon = processEncounter(currentMap, speciesResolver, moveResolver);
    if (!wildMon) return;

    // 図鑑に登録（見た）
    const newSeen = new Set(state.player.pokedexSeen);
    newSeen.add(wildMon.speciesId);
    dispatch({ type: "UPDATE_PLAYER", updates: { pokedexSeen: newSeen } });

    const wildSpecies = speciesResolver(wildMon.speciesId);

    // バトルトランジション演出を開始
    startTransition("battle", () => {
      setWildMonster(wildMon);
      setBattleMessages([`野生の${wildSpecies.name}が飛び出してきた！`]);
      setIsBattleProcessing(true);

      const engine = new BattleEngine(
        state.player!.partyState.party,
        [wildMon],
        "wild",
        speciesResolver,
        moveResolver,
      );
      setBattleEngine(engine);

      dispatch({ type: "CHANGE_SCREEN", screen: "battle" });

      setTimeout(() => setIsBattleProcessing(false), 1500);
    });
  }, [currentMap, state.player, dispatch, startTransition]);

  /** メニューを開く */
  const handleMenuOpen = useCallback(() => {
    setOverlayScreen("menu");
    setReturnScreen("overworld");
  }, []);

  /** プレイヤー位置同期（バトル復帰時に正しい座標を復元するため） */
  const handlePositionChange = useCallback(
    (x: number, y: number, direction: "up" | "down" | "left" | "right") => {
      if (!state.overworld) return;
      dispatch({
        type: "SET_OVERWORLD",
        overworld: {
          currentMapId: state.overworld.currentMapId,
          playerX: x,
          playerY: y,
          direction,
        },
      });
    },
    [state.overworld?.currentMapId, dispatch],
  );

  // ==========================
  // バトル関連
  // ==========================

  /** バトルアクション処理 */
  const handleBattleAction = useCallback(
    (action: BattleScreenAction) => {
      if (!battleEngine || !state.player) return;

      // バッグを開く
      if (action.type === "bag") {
        setBattleBagMode(true);
        setOverlayScreen("bag");
        setReturnScreen("battle");
        return;
      }

      // ポケモン交代画面を開く
      if (action.type === "pokemon") {
        setBattlePartyMode(true);
        setOverlayScreen("party");
        setReturnScreen("battle");
        return;
      }

      setIsBattleProcessing(true);

      let engineAction: BattleAction;
      if (action.type === "fight") {
        engineAction = { type: "fight", moveIndex: action.moveIndex };
      } else {
        engineAction = { type: "run" };
      }

      const messages = battleEngine.executeTurn(engineAction);
      setBattleMessages(messages);

      // バトル終了チェック
      setTimeout(() => {
        if (battleEngine.state.result) {
          handleBattleEnd();
        } else if (battleEngine.state.phase === "force_switch") {
          // 強制交代
          setBattlePartyMode(true);
          setOverlayScreen("party");
          setReturnScreen("battle");
          setIsBattleProcessing(false);
        } else {
          setIsBattleProcessing(false);
        }
      }, 1500);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [battleEngine, state.player],
  );

  /** バトル終了処理 */
  const handleBattleEnd = useCallback(() => {
    if (!battleEngine || !state.player) return;

    const result = battleEngine.state.result;
    const wasTrainerBattle = isTrainerBattle;

    // パーティの状態を反映
    dispatch({
      type: "UPDATE_PLAYER",
      updates: {
        partyState: { ...state.player.partyState },
      },
    });

    // レベルアップ時の技習得チェック
    const checkLevelUpMoves = () => {
      for (const monster of state.player!.partyState.party) {
        const species = speciesResolver(monster.speciesId);
        const learnable = getLearnableMoves(species, monster.level - 1, monster.level);
        for (const entry of learnable) {
          const moveDef = moveResolver(entry.moveId);
          const learnResult = learnMove(monster, entry.moveId, moveDef);
          if (learnResult === "full") {
            setLearnMoveState({
              monster,
              moveId: entry.moveId,
              moveName: moveDef.name,
            });
            return;
          }
        }
      }
    };

    if (result?.type === "win" || result?.type === "run_success" || result?.type === "capture") {
      checkLevelUpMoves();
    }

    // トレーナー戦勝利: 賞金を加算
    if (result?.type === "win" && result.prizeMoney && result.prizeMoney > 0) {
      dispatch({
        type: "UPDATE_PLAYER",
        updates: { money: state.player.money + result.prizeMoney },
      });
    }

    // overworldに復帰
    setBattleEngine(null);
    setWildMonster(null);
    setBattleMessages([]);
    setIsBattleProcessing(false);
    setIsTrainerBattle(false);
    setTrainerBattleName(null);
    dispatch({ type: "CHANGE_SCREEN", screen: "overworld" });

    if (result?.type === "lose") {
      // 全滅 → 町に戻って回復（イベントキューもクリア）
      eventQueueRef.current = [];
      isEventRunningRef.current = false;

      // 所持金ペナルティ
      const penalty = calculateLossPenalty(state.player.money);
      const lossMessages = ["目の前が真っ暗になった…"];
      if (penalty > 0) {
        lossMessages.push(`${penalty}円を落としてしまった…`);
      }
      lossMessages.push("ワスレ町に戻された。");

      dispatch({
        type: "SET_OVERWORLD",
        overworld: {
          currentMapId: "wasuremachi",
          playerX: 4,
          playerY: 4,
          direction: "down",
        },
      });
      for (const monster of state.player.partyState.party) {
        monster.currentHp = getMaxHp(monster);
        monster.status = null;
        for (const move of monster.moves) {
          const moveDef = moveResolver(move.moveId);
          move.currentPp = moveDef.pp;
        }
      }
      dispatch({
        type: "UPDATE_PLAYER",
        updates: {
          partyState: { ...state.player.partyState },
          money: state.player.money - penalty,
        },
      });
      showMessages(lossMessages);
      return;
    }

    // トレーナーバトル勝利後: イベントキューの残りを処理
    if (wasTrainerBattle && result?.type === "win") {
      // チャンピオン撃破時にエンディングを実行
      if (
        state.storyFlags["champion_defeated"] !== true &&
        trainerBattleName?.includes("チャンピオン")
      ) {
        // champion_defeatedフラグは後続のキューで設定される
      }

      setTimeout(() => {
        processNextEvent();
      }, 500);
    }
  }, [
    battleEngine,
    state.player,
    state.storyFlags,
    isTrainerBattle,
    trainerBattleName,
    dispatch,
    showMessages,
    processNextEvent,
  ]);

  // ==========================
  // メニュー系画面処理
  // ==========================

  /** オーバーレイを閉じる */
  const closeOverlay = useCallback(() => {
    setOverlayScreen(null);
    setBattleBagMode(false);
    setBattlePartyMode(false);
  }, []);

  /** メニューからのナビゲーション */
  const handleMenuNavigate = useCallback((screen: string) => {
    setOverlayScreen(screen as OverlayScreen);
  }, []);

  /** セーブ処理 */
  const handleSave = useCallback(() => {
    if (!state.player) return;
    const success = saveGame(state, 1);
    showMessages([success ? "冒険の記録を書きました！" : "セーブに失敗しました…"], closeOverlay);
  }, [state, showMessages, closeOverlay]);

  /** パーティ並び替え */
  const handlePartySwap = useCallback(
    (indexA: number, indexB: number) => {
      if (!state.player) return;
      swapPartyOrder(state.player.partyState, indexA, indexB);
      dispatch({
        type: "UPDATE_PLAYER",
        updates: { partyState: { ...state.player.partyState } },
      });
    },
    [state.player, dispatch],
  );

  /** パーティ選択（バトル中交代） */
  const handlePartySelect = useCallback(
    (index: number) => {
      if (!battleEngine || !state.player) return;

      if (battleEngine.state.phase === "force_switch") {
        const monster = state.player.partyState.party[index];
        if (monster.currentHp <= 0) return;
        const messages = battleEngine.forceSwitch(index);
        setBattleMessages(messages);
        closeOverlay();
        setIsBattleProcessing(true);
        setTimeout(() => setIsBattleProcessing(false), 1000);
        return;
      }

      // 通常交代
      const monster = state.player.partyState.party[index];
      if (monster.currentHp <= 0 || index === battleEngine.state.player.activeIndex) return;

      closeOverlay();
      setIsBattleProcessing(true);

      const messages = battleEngine.executeTurn({ type: "switch", partyIndex: index });
      setBattleMessages(messages);

      setTimeout(() => {
        if (battleEngine.state.result) {
          handleBattleEnd();
        } else {
          setIsBattleProcessing(false);
        }
      }, 1500);
    },
    [battleEngine, state.player, closeOverlay, handleBattleEnd],
  );

  /** バッグからアイテム使用 */
  const handleBagUse = useCallback(
    (itemId: string) => {
      if (!state.player) return;

      const item = itemResolver(itemId);

      // バトル中のアイテム使用
      if (battleBagMode && battleEngine) {
        // ボール使用 → 捕獲フロー
        if (item.effect.type === "ball" && wildMonster) {
          if (!removeItem(state.player.bag, itemId)) return;
          dispatch({
            type: "UPDATE_PLAYER",
            updates: { bag: { ...state.player.bag } },
          });
          closeOverlay();
          setIsBattleProcessing(true);

          const maxHp = getMaxHp(wildMonster);
          const captureResult = executeCaptureFlow(
            {
              maxHp,
              currentHp: wildMonster.currentHp,
              baseCatchRate: 100, // デフォルト捕獲率
              ballModifier: item.effect.catchRateModifier,
              status: wildMonster.status,
            },
            wildMonster,
            state.player.partyState,
            item.name,
          );

          setBattleMessages(captureResult.messages);

          if (captureResult.catchResult.caught) {
            // 図鑑登録
            const newCaught = new Set(state.player.pokedexCaught);
            newCaught.add(wildMonster.speciesId);
            dispatch({
              type: "UPDATE_PLAYER",
              updates: {
                pokedexCaught: newCaught,
                partyState: { ...state.player.partyState },
              },
            });

            battleEngine.state.result = { type: "capture" };
            setTimeout(() => handleBattleEnd(), 2000);
          } else {
            // 捕獲失敗 → 相手ターン
            const msgs = battleEngine.executeTurn({ type: "item", itemId });
            setBattleMessages((prev) => [...prev, ...msgs]);
            setTimeout(() => {
              if (battleEngine.state.result) {
                handleBattleEnd();
              } else {
                setIsBattleProcessing(false);
              }
            }, 1500);
          }
          return;
        }

        // 回復アイテム使用（バトル中）
        if (item.effect.type === "heal_hp" || item.effect.type === "heal_status") {
          const active = battleEngine.playerActive;
          const maxHp = getMaxHp(active);
          const healResult = applyHealItem(item, active, maxHp, moveResolver);
          if (!healResult.used) {
            showMessages([healResult.message]);
            return;
          }
          if (!removeItem(state.player.bag, itemId)) return;
          dispatch({
            type: "UPDATE_PLAYER",
            updates: { bag: { ...state.player.bag } },
          });
          closeOverlay();
          setIsBattleProcessing(true);

          // アイテム使用後、相手ターン
          const msgs = battleEngine.executeTurn({ type: "item", itemId });
          setBattleMessages([healResult.message, ...msgs]);
          setTimeout(() => {
            if (battleEngine.state.result) {
              handleBattleEnd();
            } else {
              setIsBattleProcessing(false);
            }
          }, 1500);
          return;
        }
      }

      // フィールドでの回復アイテム使用
      if (item.effect.type === "heal_hp" || item.effect.type === "heal_status") {
        // 簡易: 先頭のモンスターに使用
        const target = state.player.partyState.party[0];
        if (!target) return;
        const maxHp = getMaxHp(target);
        const healResult = applyHealItem(item, target, maxHp, moveResolver);
        if (!healResult.used) {
          showMessages([healResult.message]);
          return;
        }
        if (!removeItem(state.player.bag, itemId)) return;
        dispatch({
          type: "UPDATE_PLAYER",
          updates: {
            bag: { ...state.player.bag },
            partyState: { ...state.player.partyState },
          },
        });
        showMessages([healResult.message]);
      }
    },
    [
      state.player,
      battleBagMode,
      battleEngine,
      wildMonster,
      dispatch,
      closeOverlay,
      showMessages,
      handleBattleEnd,
    ],
  );

  // ==========================
  // 技習得UI
  // ==========================
  const handleLearnMoveChoice = useCallback(
    (slotIndex: number) => {
      if (!learnMoveState) return;
      const { monster, moveId } = learnMoveState;
      const moveDef = moveResolver(moveId);

      if (slotIndex === -1) {
        // 習得しない
        showMessages([`${moveDef.name}を覚えるのをあきらめた。`]);
      } else {
        const old = moveResolver(monster.moves[slotIndex].moveId);
        replaceMove(monster, slotIndex, moveId, moveDef);
        showMessages([`${old.name}を忘れて${moveDef.name}を覚えた！`]);
        if (state.player) {
          dispatch({
            type: "UPDATE_PLAYER",
            updates: { partyState: { ...state.player.partyState } },
          });
        }
      }
      setLearnMoveState(null);
    },
    [learnMoveState, state.player, dispatch, showMessages],
  );

  // ==========================
  // ロード処理（タイトルから）
  // ==========================
  const handleLoadGame = useCallback(() => {
    const loaded = loadGame(1);
    if (loaded) {
      dispatch({ type: "LOAD_GAME", state: loaded });
    } else {
      showMessages(["セーブデータがありません。"]);
    }
  }, [dispatch, showMessages]);

  // ==========================
  // データ変換ヘルパー
  // ==========================

  const getPartyMemberInfos = useCallback((): PartyMemberInfo[] => {
    if (!state.player) return [];
    return state.player.partyState.party.map((m) => {
      const species = speciesResolver(m.speciesId);
      return {
        speciesId: m.speciesId,
        name: m.nickname ?? species.name,
        level: m.level,
        currentHp: m.currentHp,
        maxHp: getMaxHp(m),
        status: m.status,
        types: species.types as string[],
        expPercent: expProgressPercent(m.exp, m.level, species.expGroup),
        expToNext: expToNextLevel(m.exp, m.level, species.expGroup),
      };
    });
  }, [state.player]);

  const getBagItemInfos = useCallback((): BagItemInfo[] => {
    if (!state.player) return [];
    return state.player.bag.items.map((bi) => {
      const item = itemResolver(bi.itemId);
      return {
        itemId: bi.itemId,
        name: item.name,
        description: item.description,
        category: item.category,
        quantity: bi.quantity,
        usable: item.effect.type !== "none",
      };
    });
  }, [state.player]);

  const getPokedexEntries = useCallback((): PokedexEntry[] => {
    if (!state.player) return [];
    return ALL_SPECIES.map((species) => ({
      id: species.id,
      name: species.name,
      types: species.types as string[],
      description: `${species.types.join("/")}タイプのモンスター。`,
      seen: state.player!.pokedexSeen.has(species.id),
      caught: state.player!.pokedexCaught.has(species.id),
    }));
  }, [state.player]);

  // ==========================
  // レンダリング
  // ==========================

  // 技習得UIを優先表示
  if (learnMoveState) {
    const { monster, moveName } = learnMoveState;
    const species = speciesResolver(monster.speciesId);
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#1a1a2e] p-8">
        <div className="rpg-window max-w-md">
          <div className="rpg-window-inner">
            <h2 className="game-text-shadow mb-4 font-[family-name:var(--font-dotgothic)] text-xl text-white">
              {species.name}は{moveName}を覚えたい！
            </h2>
            <p className="mb-6 font-[family-name:var(--font-dotgothic)] text-gray-400">
              でも技は4つまでしか覚えられない…
            </p>
            <div className="space-y-2">
              {monster.moves.map((m, i) => {
                const md = moveResolver(m.moveId);
                return (
                  <button
                    key={m.moveId}
                    className="block w-full rounded-md border border-[#533483]/30 bg-[#16213e] px-4 py-2 text-left font-[family-name:var(--font-dotgothic)] text-white transition-colors hover:border-[#533483] hover:bg-white/10"
                    onClick={() => handleLearnMoveChoice(i)}
                  >
                    {md.name}（{md.type}）
                  </button>
                );
              })}
              <button
                className="block w-full rounded-md border border-[#e94560]/30 bg-[#16213e] px-4 py-2 text-left font-[family-name:var(--font-dotgothic)] text-gray-300 transition-colors hover:border-[#e94560] hover:text-white"
                onClick={() => handleLearnMoveChoice(-1)}
              >
                {moveName}を覚えない
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // メッセージウィンドウ（オーバーレイ）
  const messageOverlay = pendingMessages && (
    <MessageWindow messages={pendingMessages} onComplete={handleMessageComplete} />
  );

  // 画面遷移アニメーション（最前面）
  const transitionOverlay = (
    <SceneTransition
      active={transitionActive}
      type={transitionType}
      duration={transitionDuration}
      onComplete={handleComplete}
    />
  );

  // オーバーレイ画面（メニュー系）
  const renderOverlay = () => {
    if (!state.player || !overlayScreen) return null;

    let content: React.ReactNode = null;

    switch (overlayScreen) {
      case "menu":
        content = (
          <MenuScreen
            playerName={state.player.name}
            badgeCount={state.player.badges.length}
            onNavigate={handleMenuNavigate}
            onSave={handleSave}
            onBack={closeOverlay}
          />
        );
        break;
      case "party":
        content = (
          <PartyScreen
            party={getPartyMemberInfos()}
            onSwap={battlePartyMode ? undefined : handlePartySwap}
            onSelect={
              battlePartyMode || battleEngine?.state.phase === "force_switch"
                ? handlePartySelect
                : undefined
            }
            onBack={closeOverlay}
            selectMode={battlePartyMode || battleEngine?.state.phase === "force_switch"}
          />
        );
        break;
      case "bag":
        content = (
          <BagScreen items={getBagItemInfos()} onUse={handleBagUse} onBack={closeOverlay} />
        );
        break;
      case "pokedex":
        content = <PokedexScreen entries={getPokedexEntries()} onBack={closeOverlay} />;
        break;
      default:
        return null;
    }

    return <div className="fixed inset-0 z-50">{content}</div>;
  };

  // メイン画面の描画
  switch (state.screen) {
    case "title":
      return (
        <TitleScreen
          onNewGame={(name) => dispatch({ type: "START_NEW_GAME", playerName: name })}
          onContinue={handleLoadGame}
          hasSaveData={hasSaveData}
        />
      );

    case "starter_select":
      return (
        <StarterSelect
          starters={STARTERS}
          onSelect={(speciesId) =>
            dispatch({ type: "SET_STARTER", monster: createStarterInstance(speciesId) })
          }
        />
      );

    case "overworld": {
      if (!currentMap || !state.overworld) {
        return (
          <div className="flex h-full w-full items-center justify-center bg-[#1a1a2e]">
            <p className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-white">
              マップを読み込み中...
            </p>
          </div>
        );
      }

      const inputBlocked =
        overlayScreen !== null || eventQueueRef.current.length > 0 || pendingMessages !== null;

      return (
        <div className="relative h-full w-full">
          <OverworldScreen
            key={state.overworld.currentMapId}
            map={currentMap}
            initialPosition={{
              x: state.overworld.playerX,
              y: state.overworld.playerY,
              direction: state.overworld.direction,
            }}
            storyFlags={state.storyFlags}
            inputBlocked={inputBlocked}
            onMapTransition={handleMapTransition}
            onEncounter={handleEncounter}
            onNpcInteract={handleNpcInteract}
            onMenuOpen={handleMenuOpen}
            onPositionChange={handlePositionChange}
            leadMonster={
              state.player?.partyState.party[0]
                ? (() => {
                    const m = state.player!.partyState.party[0];
                    const sp = speciesResolver(m.speciesId);
                    return {
                      name: m.nickname ?? sp.name,
                      currentHp: m.currentHp,
                      maxHp: getMaxHp(m),
                      level: m.level,
                      speciesId: m.speciesId,
                    };
                  })()
                : null
            }
          />
          {renderOverlay()}
          {messageOverlay}
          {transitionOverlay}
        </div>
      );
    }

    case "battle": {
      if (!battleEngine || !state.player) {
        return (
          <div className="flex h-full w-full items-center justify-center bg-[#1a1a2e]">
            <p className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-white">
              バトル準備中...
            </p>
          </div>
        );
      }

      const playerActive = battleEngine.playerActive;
      const opponentActive = battleEngine.opponentActive;
      const playerSpecies = speciesResolver(playerActive.speciesId);
      const opponentSpecies = speciesResolver(opponentActive.speciesId);

      return (
        <div className="relative h-full w-full">
          <BattleScreen
            inputBlocked={overlayScreen !== null || pendingMessages !== null}
            player={{
              name: playerActive.nickname ?? playerSpecies.name,
              level: playerActive.level,
              currentHp: playerActive.currentHp,
              maxHp: getMaxHp(playerActive),
              isPlayer: true,
              speciesId: playerActive.speciesId,
              types: playerSpecies.types as string[],
              expPercent: expProgressPercent(
                playerActive.exp,
                playerActive.level,
                playerSpecies.expGroup,
              ),
            }}
            opponent={{
              name: opponentSpecies.name,
              level: opponentActive.level,
              currentHp: opponentActive.currentHp,
              maxHp: getMaxHp(opponentActive),
              isPlayer: false,
              speciesId: opponentActive.speciesId,
              types: opponentSpecies.types as string[],
            }}
            moves={playerActive.moves.map((m) => {
              const md = moveResolver(m.moveId);
              return {
                moveId: m.moveId,
                name: md.name,
                type: md.type,
                currentPp: m.currentPp,
                maxPp: md.pp,
              };
            })}
            messages={battleMessages}
            isWild={battleEngine.state.battleType === "wild"}
            onAction={handleBattleAction}
            isProcessing={isBattleProcessing}
            environment={resolveEnvironment(state.overworld?.currentMapId ?? "")}
          />
          {renderOverlay()}
          {messageOverlay}
          {transitionOverlay}
        </div>
      );
    }

    default:
      return (
        <div className="relative h-full w-full">
          <div className="flex h-full w-full items-center justify-center bg-[#1a1a2e]">
            <p className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-white">
              画面: {state.screen}（開発中）
            </p>
          </div>
          {renderOverlay()}
          {messageOverlay}
        </div>
      );
  }
}
