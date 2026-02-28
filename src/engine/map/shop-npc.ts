/**
 * ショップNPCと買い物フロー (#199)
 * 各街のショップNPC定義、品揃え管理、買い物セッション
 */

import type { ItemId } from "@/types";

/** ショップNPC定義 */
export interface ShopNpcDefinition {
  /** ショップNPC ID */
  npcId: string;
  /** 所属マップID */
  mapId: string;
  /** ショップ名 */
  shopName: string;
  /** 挨拶メッセージ */
  greeting: string;
  /** 購入完了メッセージ */
  purchaseMessage: string;
  /** 退出メッセージ */
  exitMessage: string;
  /** 固定品揃え（バッジ解禁と別に常に売る特産品） */
  specialItems?: ItemId[];
}

/** 買い物セッション状態 */
export type ShopSessionPhase = "greeting" | "menu" | "buy" | "sell" | "exit";

/** 買い物セッション */
export interface ShopSession {
  shopNpc: ShopNpcDefinition;
  phase: ShopSessionPhase;
  badgeCount: number;
}

/** 全街のショップNPC定義 */
export const SHOP_NPCS: ShopNpcDefinition[] = [
  {
    npcId: "npc-shopkeeper-wasuremachi",
    mapId: "wasuremachi",
    shopName: "ワスレ町フレンドリィショップ",
    greeting: "いらっしゃいませ！ワスレ町のフレンドリィショップへようこそ！",
    purchaseMessage: "まいどあり！ よい旅を！",
    exitMessage: "またのお越しをお待ちしています！",
  },
  {
    npcId: "npc-shopkeeper-tsuchigumo",
    mapId: "tsuchigumo-village",
    shopName: "ツチグモ村よろず屋",
    greeting: "やあ！ ツチグモ村のよろず屋だよ。何が必要かな？",
    purchaseMessage: "ありがとう！ ジム戦がんばってね！",
    exitMessage: "また来てね！",
  },
  {
    npcId: "npc-shopkeeper-morinoha",
    mapId: "morinoha-town",
    shopName: "モリノハの雑貨店",
    greeting: "いらっしゃい。モリノハの雑貨店です。森の恵みを取り揃えていますよ。",
    purchaseMessage: "ありがとうございます。よい冒険を！",
    exitMessage: "お気をつけて。",
  },
  {
    npcId: "npc-shopkeeper-kawasemi",
    mapId: "kawasemi-city",
    shopName: "カワセミマート",
    greeting: "いらっしゃいませ！ カワセミマートです。水辺の町ならではの品揃えですよ！",
    purchaseMessage: "まいど！ 水モンスターの捕獲にはネットボールがオススメですよ！",
    exitMessage: "またのお越しを！",
  },
  {
    npcId: "npc-shopkeeper-raimei",
    mapId: "raimei-pass",
    shopName: "ライメイ峠売店",
    greeting: "こんな峠にようこそ。必要なものはあるかい？",
    purchaseMessage: "雷に気をつけてな！",
    exitMessage: "無事に峠を越えられるよう祈ってるよ。",
  },
  {
    npcId: "npc-shopkeeper-kurogane",
    mapId: "kurogane-city",
    shopName: "クロガネ鍛冶堂",
    greeting: "ようこそクロガネ鍛冶堂へ。頑丈なアイテムを揃えていますよ。",
    purchaseMessage: "鋼のように強くなれ！",
    exitMessage: "また来い。",
  },
  {
    npcId: "npc-shopkeeper-yaminomori",
    mapId: "yaminomori-village",
    shopName: "闇市",
    greeting: "…いらっしゃい。暗いところだけど、品物は確かだよ。",
    purchaseMessage: "…気をつけて使いな。",
    exitMessage: "…また来るといい。",
  },
];

/**
 * マップIDからショップNPCを取得
 */
export function getShopNpcByMapId(mapId: string): ShopNpcDefinition | undefined {
  return SHOP_NPCS.find((s) => s.mapId === mapId);
}

/**
 * NPC IDからショップNPCを取得
 */
export function getShopNpcById(npcId: string): ShopNpcDefinition | undefined {
  return SHOP_NPCS.find((s) => s.npcId === npcId);
}

/**
 * 買い物セッションを開始
 */
export function startShopSession(shopNpc: ShopNpcDefinition, badgeCount: number): ShopSession {
  return {
    shopNpc,
    phase: "greeting",
    badgeCount,
  };
}

/**
 * セッションフェーズを進める
 */
export function advanceShopSession(
  session: ShopSession,
  action: "buy" | "sell" | "exit",
): ShopSession {
  switch (action) {
    case "buy":
      return { ...session, phase: "buy" };
    case "sell":
      return { ...session, phase: "sell" };
    case "exit":
      return { ...session, phase: "exit" };
  }
}

/**
 * 現在のフェーズに応じたメッセージを取得
 */
export function getShopMessage(session: ShopSession): string {
  switch (session.phase) {
    case "greeting":
      return session.shopNpc.greeting;
    case "menu":
      return "何をなさいますか？";
    case "buy":
      return "何をお求めですか？";
    case "sell":
      return "何をお売りになりますか？";
    case "exit":
      return session.shopNpc.exitMessage;
  }
}

/**
 * ショップNPC数を取得
 */
export function getShopNpcCount(): number {
  return SHOP_NPCS.length;
}
