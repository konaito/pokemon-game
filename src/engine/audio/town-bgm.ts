/**
 * 街BGMの個別化とサウンドスケープ (#201)
 * 各街に固有のBGMテーマを割り当て、雰囲気を演出する
 */

/** 街BGMテーマ */
export interface TownBgmTheme {
  /** マップID */
  mapId: string;
  /** BGMトラックID */
  trackId: string;
  /** テーマ名 */
  themeName: string;
  /** テンポ（BPM概算） */
  tempo: "slow" | "moderate" | "fast";
  /** 雰囲気 */
  mood: string;
  /** 使用楽器のイメージ */
  instruments: string[];
}

/** サウンドスケープ定義（環境音） */
export interface Soundscape {
  mapId: string;
  /** 環境音の種別 */
  ambientSounds: AmbientSound[];
}

/** 環境音 */
export interface AmbientSound {
  id: string;
  name: string;
  /** 音量 (0.0-1.0) */
  volume: number;
  /** ループ再生するか */
  loop: boolean;
}

/** 全街のBGMテーマ定義 */
export const TOWN_BGM_THEMES: TownBgmTheme[] = [
  {
    mapId: "wasuremachi",
    trackId: "bgm-wasuremachi",
    themeName: "忘却の村 〜 やすらぎの風",
    tempo: "slow",
    mood: "穏やかで懐かしい、故郷の安心感",
    instruments: ["アコースティックギター", "オカリナ", "ストリングス"],
  },
  {
    mapId: "tsuchigumo-village",
    trackId: "bgm-tsuchigumo",
    themeName: "蜘蛛の糸 〜 森の囁き",
    tempo: "moderate",
    mood: "自然に包まれた素朴な村の朝",
    instruments: ["木琴", "フルート", "鳥の声サンプル"],
  },
  {
    mapId: "morinoha-town",
    trackId: "bgm-morinoha",
    themeName: "葉擦れのワルツ",
    tempo: "moderate",
    mood: "緑豊かな農村の穏やかな午後",
    instruments: ["アコーディオン", "バイオリン", "ピッコロ"],
  },
  {
    mapId: "kawasemi-city",
    trackId: "bgm-kawasemi",
    themeName: "水面の記憶",
    tempo: "moderate",
    mood: "水辺の都市の清涼感と活気",
    instruments: ["ピアノ", "ハープ", "波の音サンプル"],
  },
  {
    mapId: "raimei-pass",
    trackId: "bgm-raimei",
    themeName: "雷鳴の道",
    tempo: "fast",
    mood: "険しい峠道の緊張感と力強さ",
    instruments: ["エレキギター", "ドラム", "シンセサイザー"],
  },
  {
    mapId: "tsukiyomi-village",
    trackId: "bgm-tsukiyomi",
    themeName: "月読 〜 祈りの調べ",
    tempo: "slow",
    mood: "神秘的で幻想的な月の里",
    instruments: ["琴", "笙", "鈴"],
  },
  {
    mapId: "kurogane-city",
    trackId: "bgm-kurogane",
    themeName: "鋼鉄の鼓動",
    tempo: "moderate",
    mood: "鍛冶の音が響く力強い街",
    instruments: ["アンビル打撃音", "チェロ", "ティンパニ"],
  },
  {
    mapId: "yaminomori-village",
    trackId: "bgm-yaminomori",
    themeName: "闇の子守唄",
    tempo: "slow",
    mood: "暗く静かだが、どこか温かみのある村",
    instruments: ["オルゴール", "チェレスタ", "低弦"],
  },
  {
    mapId: "seirei-mountain",
    trackId: "bgm-seirei",
    themeName: "精霊の嘆き",
    tempo: "slow",
    mood: "荘厳で神聖な霊山の静寂",
    instruments: ["パイプオルガン", "合唱", "ベル"],
  },
  {
    mapId: "pokemon-league",
    trackId: "bgm-pokemon-league",
    themeName: "栄光への道",
    tempo: "fast",
    mood: "壮大で力強い、決戦の場の高揚感",
    instruments: ["フルオーケストラ", "ブラス", "スネアドラム"],
  },
];

/** 全街のサウンドスケープ定義 */
export const TOWN_SOUNDSCAPES: Soundscape[] = [
  {
    mapId: "wasuremachi",
    ambientSounds: [
      { id: "amb-wind-gentle", name: "穏やかな風", volume: 0.3, loop: true },
      { id: "amb-birds-morning", name: "小鳥のさえずり", volume: 0.2, loop: true },
    ],
  },
  {
    mapId: "tsuchigumo-village",
    ambientSounds: [
      { id: "amb-forest", name: "森の環境音", volume: 0.4, loop: true },
      { id: "amb-insects", name: "虫の鳴き声", volume: 0.2, loop: true },
    ],
  },
  {
    mapId: "morinoha-town",
    ambientSounds: [
      { id: "amb-leaves-rustle", name: "葉擦れの音", volume: 0.3, loop: true },
      { id: "amb-birds-afternoon", name: "午後の鳥の声", volume: 0.15, loop: true },
    ],
  },
  {
    mapId: "kawasemi-city",
    ambientSounds: [
      { id: "amb-water-stream", name: "川のせせらぎ", volume: 0.4, loop: true },
      { id: "amb-city-bustle", name: "街の喧騒", volume: 0.15, loop: true },
    ],
  },
  {
    mapId: "raimei-pass",
    ambientSounds: [
      { id: "amb-wind-strong", name: "強い風", volume: 0.5, loop: true },
      { id: "amb-thunder-distant", name: "遠雷", volume: 0.3, loop: true },
    ],
  },
  {
    mapId: "tsukiyomi-village",
    ambientSounds: [
      { id: "amb-night-crickets", name: "夜虫の声", volume: 0.2, loop: true },
      { id: "amb-wind-chime", name: "風鈴", volume: 0.15, loop: true },
    ],
  },
  {
    mapId: "kurogane-city",
    ambientSounds: [
      { id: "amb-hammering", name: "鍛冶のハンマー音", volume: 0.25, loop: true },
      { id: "amb-steam", name: "蒸気の音", volume: 0.15, loop: true },
    ],
  },
  {
    mapId: "yaminomori-village",
    ambientSounds: [
      { id: "amb-owl-hoot", name: "フクロウの鳴き声", volume: 0.2, loop: true },
      { id: "amb-wind-whisper", name: "囁くような風", volume: 0.3, loop: true },
    ],
  },
  {
    mapId: "seirei-mountain",
    ambientSounds: [
      { id: "amb-mountain-wind", name: "山の風", volume: 0.4, loop: true },
      { id: "amb-spirit-echo", name: "霊的な反響", volume: 0.1, loop: true },
    ],
  },
  {
    mapId: "pokemon-league",
    ambientSounds: [
      { id: "amb-crowd-murmur", name: "群衆のざわめき", volume: 0.2, loop: true },
      { id: "amb-flags-flapping", name: "旗のはためき", volume: 0.15, loop: true },
    ],
  },
];

/**
 * マップIDからBGMテーマを取得
 */
export function getTownBgmTheme(mapId: string): TownBgmTheme | undefined {
  return TOWN_BGM_THEMES.find((t) => t.mapId === mapId);
}

/**
 * マップIDからサウンドスケープを取得
 */
export function getTownSoundscape(mapId: string): Soundscape | undefined {
  return TOWN_SOUNDSCAPES.find((s) => s.mapId === mapId);
}

/**
 * マップIDからBGMトラックIDを解決する
 * 街BGMが定義されていない場合はデフォルトのoverworldを返す
 */
export function resolveBgmTrackId(mapId: string): string {
  const theme = getTownBgmTheme(mapId);
  return theme?.trackId ?? "bgm-overworld";
}

/**
 * BGMテーマ定義済みの街数
 */
export function getBgmThemeCount(): number {
  return TOWN_BGM_THEMES.length;
}
