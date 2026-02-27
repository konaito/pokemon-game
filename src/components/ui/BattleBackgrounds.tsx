"use client";

/**
 * バトル背景ドット絵 (#130)
 * 環境別のSVGピクセルアートバトル背景
 */

export type BattleEnvironment =
  | "grassland"
  | "cave"
  | "water"
  | "gym"
  | "elite"
  | "forest"
  | "mountain"
  | "town";

interface BattleBackgroundProps {
  environment: BattleEnvironment;
}

/**
 * バトル背景コンポーネント
 * バトルフィールドの背景にSVGドット絵を表示
 */
export function BattleBackground({ environment }: BattleBackgroundProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        viewBox="0 0 240 160"
        className="h-full w-full"
        style={{ imageRendering: "pixelated" }}
        preserveAspectRatio="xMidYMid slice"
      >
        {BACKGROUNDS[environment] ?? BACKGROUNDS.grassland}
      </svg>
    </div>
  );
}

/**
 * マップIDからバトル環境を推定
 */
export function resolveEnvironment(mapId: string): BattleEnvironment {
  if (mapId.includes("cave") || mapId.includes("tunnel")) return "cave";
  if (mapId.includes("water") || mapId.includes("sea") || mapId.includes("lake")) return "water";
  if (mapId.includes("forest") || mapId.includes("mori")) return "forest";
  if (mapId.includes("mountain") || mapId.includes("yama")) return "mountain";
  if (mapId.includes("gym")) return "gym";
  if (mapId.includes("league") || mapId.includes("elite") || mapId.includes("champion"))
    return "elite";
  if (mapId.includes("town") || mapId.includes("machi") || mapId.includes("city")) return "town";
  return "grassland";
}

// ─── 背景SVG定義 ─────────────────────────────

const BACKGROUNDS: Record<BattleEnvironment, React.ReactNode> = {
  grassland: <GrasslandBg />,
  cave: <CaveBg />,
  water: <WaterBg />,
  gym: <GymBg />,
  elite: <EliteBg />,
  forest: <ForestBg />,
  mountain: <MountainBg />,
  town: <TownBg />,
};

/** 草原 - 青空、緑の草、遠くの山 */
function GrasslandBg() {
  return (
    <>
      {/* 空グラデーション */}
      <rect x="0" y="0" width="240" height="90" fill="#4a8fc4" />
      <rect x="0" y="0" width="240" height="30" fill="#6ab4e8" />
      <rect x="0" y="30" width="240" height="20" fill="#5aa0d8" />
      {/* 雲 */}
      <rect x="20" y="12" width="24" height="4" rx="2" fill="#e8f0f8" opacity="0.8" />
      <rect x="24" y="8" width="16" height="4" rx="2" fill="#e8f0f8" opacity="0.8" />
      <rect x="140" y="18" width="20" height="4" rx="2" fill="#e8f0f8" opacity="0.6" />
      <rect x="144" y="14" width="12" height="4" rx="2" fill="#e8f0f8" opacity="0.6" />
      <rect x="200" y="10" width="16" height="4" rx="2" fill="#e8f0f8" opacity="0.5" />
      {/* 遠景の山 */}
      <polygon
        points="0,90 30,55 60,70 90,50 120,65 150,48 180,62 210,55 240,70 240,90"
        fill="#6b9b5a"
      />
      <polygon points="0,90 40,65 80,78 120,60 160,72 200,58 240,75 240,90" fill="#7daf6a" />
      {/* 草原 */}
      <rect x="0" y="90" width="240" height="70" fill="#7daf6a" />
      <rect x="0" y="95" width="240" height="65" fill="#6b9b5a" />
      {/* バトルフィールドの地面 */}
      <ellipse cx="60" cy="115" rx="50" ry="12" fill="#8bc47a" stroke="#6b9b5a" strokeWidth="1" />
      <ellipse cx="180" cy="115" rx="50" ry="12" fill="#8bc47a" stroke="#6b9b5a" strokeWidth="1" />
      {/* 草のディテール */}
      {[10, 35, 55, 80, 110, 135, 155, 185, 210, 225].map((x, i) => (
        <g key={i}>
          <line
            x1={x}
            y1={130 + (i % 3) * 5}
            x2={x - 2}
            y2={125 + (i % 3) * 5}
            stroke="#5a8a4a"
            strokeWidth="1"
          />
          <line
            x1={x}
            y1={130 + (i % 3) * 5}
            x2={x + 2}
            y2={126 + (i % 3) * 5}
            stroke="#5a8a4a"
            strokeWidth="1"
          />
        </g>
      ))}
    </>
  );
}

/** 洞窟 - 暗い岩壁、鍾乳石 */
function CaveBg() {
  return (
    <>
      {/* 暗い背景 */}
      <rect x="0" y="0" width="240" height="160" fill="#1a1520" />
      <rect x="0" y="0" width="240" height="80" fill="#201828" />
      {/* 天井の鍾乳石 */}
      <polygon points="20,0 25,18 30,0" fill="#3a2840" />
      <polygon points="50,0 54,14 58,0" fill="#352438" />
      <polygon points="90,0 96,22 102,0" fill="#3a2840" />
      <polygon points="130,0 134,12 138,0" fill="#302035" />
      <polygon points="170,0 176,20 182,0" fill="#3a2840" />
      <polygon points="210,0 214,16 218,0" fill="#352438" />
      {/* 岩壁テクスチャ */}
      <rect x="0" y="70" width="30" height="90" fill="#2a1e30" />
      <rect x="210" y="60" width="30" height="100" fill="#2a1e30" />
      <rect x="0" y="75" width="20" height="85" fill="#241a28" />
      <rect x="220" y="65" width="20" height="95" fill="#241a28" />
      {/* 地面 */}
      <rect x="0" y="100" width="240" height="60" fill="#2a1e30" />
      <rect x="0" y="105" width="240" height="55" fill="#241a28" />
      {/* バトルフィールド */}
      <ellipse cx="60" cy="115" rx="45" ry="10" fill="#352438" stroke="#3a2840" strokeWidth="1" />
      <ellipse cx="180" cy="115" rx="45" ry="10" fill="#352438" stroke="#3a2840" strokeWidth="1" />
      {/* 光る結晶 */}
      <rect x="15" y="88" width="3" height="5" fill="#7b5ea0" opacity="0.8" />
      <rect x="16" y="86" width="1" height="2" fill="#a080cc" opacity="0.6" />
      <rect x="222" y="82" width="3" height="4" fill="#7b5ea0" opacity="0.8" />
      <rect x="223" y="80" width="1" height="2" fill="#a080cc" opacity="0.6" />
      {/* 暗い雰囲気のビネット */}
      <rect x="0" y="0" width="240" height="160" fill="url(#cave-vignette)" />
      <defs>
        <radialGradient id="cave-vignette" cx="50%" cy="50%">
          <stop offset="30%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
        </radialGradient>
      </defs>
    </>
  );
}

/** 水辺 - 海・湖のバトル */
function WaterBg() {
  return (
    <>
      {/* 空 */}
      <rect x="0" y="0" width="240" height="70" fill="#5aaad8" />
      <rect x="0" y="0" width="240" height="25" fill="#78c0e8" />
      {/* 雲 */}
      <rect x="30" y="10" width="20" height="4" rx="2" fill="#e8f4ff" opacity="0.7" />
      <rect x="34" y="6" width="12" height="4" rx="2" fill="#e8f4ff" opacity="0.7" />
      <rect x="160" y="14" width="16" height="4" rx="2" fill="#e8f4ff" opacity="0.5" />
      {/* 水平線 */}
      <rect x="0" y="68" width="240" height="2" fill="#4890b8" />
      {/* 水面 */}
      <rect x="0" y="70" width="240" height="90" fill="#3878a8" />
      <rect x="0" y="80" width="240" height="80" fill="#286898" />
      {/* 水面の波紋 */}
      {[20, 60, 100, 140, 180, 220].map((x, i) => (
        <g key={i} opacity={0.3 + (i % 3) * 0.1}>
          <line
            x1={x - 8}
            y1={78 + i * 8}
            x2={x + 8}
            y2={78 + i * 8}
            stroke="#68b8e8"
            strokeWidth="1"
          />
          <line
            x1={x + 15}
            y1={82 + i * 8}
            x2={x + 25}
            y2={82 + i * 8}
            stroke="#68b8e8"
            strokeWidth="1"
          />
        </g>
      ))}
      {/* バトル台（浮島） */}
      <ellipse cx="55" cy="110" rx="40" ry="8" fill="#5a9060" stroke="#487848" strokeWidth="1" />
      <rect x="15" y="110" width="80" height="6" fill="#487848" />
      <ellipse cx="185" cy="110" rx="40" ry="8" fill="#5a9060" stroke="#487848" strokeWidth="1" />
      <rect x="145" y="110" width="80" height="6" fill="#487848" />
      {/* 水の反射 */}
      <rect x="0" y="70" width="240" height="90" fill="url(#water-shine)" />
      <defs>
        <linearGradient id="water-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(120,200,240,0.15)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </>
  );
}

/** ジム - 室内、タイル床、装飾 */
function GymBg() {
  return (
    <>
      {/* 室内の壁 */}
      <rect x="0" y="0" width="240" height="160" fill="#1e1530" />
      <rect x="0" y="0" width="240" height="85" fill="#251a38" />
      {/* 壁のパターン */}
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={i * 20} y="0" width="1" height="85" fill="#2a1e3e" />
      ))}
      <rect x="0" y="82" width="240" height="3" fill="#e94560" />
      {/* タイル床 */}
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 12 }, (_, col) => (
          <rect
            key={`${row}-${col}`}
            x={col * 20}
            y={85 + row * 10}
            width="20"
            height="10"
            fill={(row + col) % 2 === 0 ? "#201535" : "#1a1228"}
            stroke="#2a1e3e"
            strokeWidth="0.5"
          />
        )),
      )}
      {/* バトルフィールドのマーキング */}
      <ellipse
        cx="60"
        cy="115"
        rx="45"
        ry="10"
        fill="none"
        stroke="#e94560"
        strokeWidth="1"
        strokeDasharray="4 2"
        opacity="0.5"
      />
      <ellipse
        cx="180"
        cy="115"
        rx="45"
        ry="10"
        fill="none"
        stroke="#e94560"
        strokeWidth="1"
        strokeDasharray="4 2"
        opacity="0.5"
      />
      {/* 中央のバッジマーク */}
      <rect
        x="115"
        y="88"
        width="10"
        height="10"
        fill="#e94560"
        opacity="0.3"
        transform="rotate(45,120,93)"
      />
      {/* 壁のトーチ照明 */}
      <rect x="38" y="55" width="4" height="12" fill="#3a2840" />
      <rect x="39" y="50" width="2" height="5" fill="#f8c848" opacity="0.8" />
      <circle cx="40" cy="48" r="4" fill="#f8c848" opacity="0.15" />
      <rect x="198" y="55" width="4" height="12" fill="#3a2840" />
      <rect x="199" y="50" width="2" height="5" fill="#f8c848" opacity="0.8" />
      <circle cx="200" cy="48" r="4" fill="#f8c848" opacity="0.15" />
    </>
  );
}

/** 四天王/チャンピオン - 荘厳なホール */
function EliteBg() {
  return (
    <>
      {/* 暗い荘厳な背景 */}
      <rect x="0" y="0" width="240" height="160" fill="#0a0812" />
      {/* 紫の放射グラデーション */}
      <circle cx="120" cy="60" r="100" fill="url(#elite-glow)" />
      <defs>
        <radialGradient id="elite-glow">
          <stop offset="0%" stopColor="rgba(83,52,131,0.4)" />
          <stop offset="60%" stopColor="rgba(83,52,131,0.1)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      {/* 柱 */}
      <rect x="10" y="10" width="12" height="150" fill="#1a1228" />
      <rect x="12" y="10" width="8" height="150" fill="#201535" />
      <rect x="218" y="10" width="12" height="150" fill="#1a1228" />
      <rect x="220" y="10" width="8" height="150" fill="#201535" />
      {/* 柱の装飾 */}
      <rect x="12" y="10" width="8" height="4" fill="#533483" />
      <rect x="220" y="10" width="8" height="4" fill="#533483" />
      <rect x="12" y="20" width="8" height="1" fill="#533483" opacity="0.5" />
      <rect x="220" y="20" width="8" height="1" fill="#533483" opacity="0.5" />
      {/* 豪華な床 */}
      <rect x="0" y="90" width="240" height="70" fill="#120e1c" />
      {Array.from({ length: 12 }, (_, col) => (
        <rect
          key={col}
          x={col * 20}
          y="90"
          width="20"
          height="70"
          fill={col % 2 === 0 ? "#140f1e" : "#100c18"}
          stroke="#1a1228"
          strokeWidth="0.5"
        />
      ))}
      {/* 赤いカーペット（中央） */}
      <rect x="100" y="90" width="40" height="70" fill="#8a2030" opacity="0.4" />
      <rect x="102" y="90" width="36" height="70" fill="#a83040" opacity="0.3" />
      {/* バトルフィールドの魔法陣 */}
      <ellipse
        cx="60"
        cy="115"
        rx="40"
        ry="10"
        fill="none"
        stroke="#533483"
        strokeWidth="1"
        opacity="0.6"
      />
      <ellipse
        cx="60"
        cy="115"
        rx="30"
        ry="7"
        fill="none"
        stroke="#e94560"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <ellipse
        cx="180"
        cy="115"
        rx="40"
        ry="10"
        fill="none"
        stroke="#533483"
        strokeWidth="1"
        opacity="0.6"
      />
      <ellipse
        cx="180"
        cy="115"
        rx="30"
        ry="7"
        fill="none"
        stroke="#e94560"
        strokeWidth="0.5"
        opacity="0.4"
      />
      {/* 浮遊するパーティクル */}
      {[40, 80, 120, 160, 200].map((x, i) => (
        <circle
          key={i}
          cx={x}
          cy={30 + i * 10}
          r="1"
          fill="#a080cc"
          opacity={0.3 + (i % 3) * 0.15}
        />
      ))}
    </>
  );
}

/** 森 - 木々の間 */
function ForestBg() {
  return (
    <>
      {/* 薄暗い空（木漏れ日） */}
      <rect x="0" y="0" width="240" height="90" fill="#2a5a3a" />
      <rect x="0" y="0" width="240" height="40" fill="#1e4830" />
      {/* 遠景の木々 */}
      {[0, 30, 60, 90, 120, 150, 180, 210].map((x, i) => (
        <g key={i}>
          <rect x={x + 8} y={40 + (i % 3) * 5} width="6" height={50 - (i % 3) * 5} fill="#2a4020" />
          <circle
            cx={x + 11}
            cy={35 + (i % 3) * 5}
            r={12 + (i % 2) * 4}
            fill="#3a6030"
            opacity="0.8"
          />
          <circle
            cx={x + 8}
            cy={30 + (i % 3) * 5}
            r={8 + (i % 2) * 3}
            fill="#4a7840"
            opacity="0.6"
          />
        </g>
      ))}
      {/* 地面 */}
      <rect x="0" y="90" width="240" height="70" fill="#3a5830" />
      <rect x="0" y="95" width="240" height="65" fill="#2e4a28" />
      {/* 落ち葉のディテール */}
      {[15, 45, 75, 105, 145, 175, 205, 230].map((x, i) => (
        <rect
          key={i}
          x={x}
          y={105 + (i % 4) * 8}
          width="3"
          height="2"
          fill="#5a8040"
          opacity="0.5"
        />
      ))}
      {/* バトルフィールド */}
      <ellipse cx="60" cy="115" rx="45" ry="10" fill="#4a6838" stroke="#3a5830" strokeWidth="1" />
      <ellipse cx="180" cy="115" rx="45" ry="10" fill="#4a6838" stroke="#3a5830" strokeWidth="1" />
      {/* 木漏れ日 */}
      <rect x="80" y="0" width="15" height="90" fill="#78a860" opacity="0.08" />
      <rect x="160" y="0" width="10" height="90" fill="#78a860" opacity="0.06" />
    </>
  );
}

/** 山 - 岩場、高所 */
function MountainBg() {
  return (
    <>
      {/* 空（高所の青） */}
      <rect x="0" y="0" width="240" height="80" fill="#3888c8" />
      <rect x="0" y="0" width="240" height="30" fill="#5098d8" />
      {/* 遠景の山脈 */}
      <polygon
        points="0,80 40,35 80,55 120,30 160,50 200,25 240,45 240,80"
        fill="#7890a8"
        opacity="0.6"
      />
      <polygon
        points="0,80 60,45 100,60 140,40 180,55 220,38 240,50 240,80"
        fill="#8898a8"
        opacity="0.5"
      />
      {/* 岩場の地面 */}
      <rect x="0" y="80" width="240" height="80" fill="#685848" />
      <rect x="0" y="88" width="240" height="72" fill="#584838" />
      {/* 岩のディテール */}
      <rect x="5" y="92" width="15" height="10" rx="2" fill="#786858" />
      <rect x="220" y="95" width="12" height="8" rx="2" fill="#786858" />
      <rect x="100" y="130" width="8" height="6" rx="1" fill="#786858" />
      <rect x="160" y="135" width="10" height="7" rx="1" fill="#786858" />
      {/* バトルフィールド */}
      <ellipse cx="60" cy="115" rx="45" ry="10" fill="#6a5a48" stroke="#584838" strokeWidth="1" />
      <ellipse cx="180" cy="115" rx="45" ry="10" fill="#6a5a48" stroke="#584838" strokeWidth="1" />
      {/* 風のエフェクト */}
      <line x1="30" y1="25" x2="55" y2="23" stroke="#b8c8d8" strokeWidth="0.5" opacity="0.3" />
      <line x1="140" y1="18" x2="165" y2="16" stroke="#b8c8d8" strokeWidth="0.5" opacity="0.3" />
    </>
  );
}

/** 町中 - 建物の前 */
function TownBg() {
  return (
    <>
      {/* 空 */}
      <rect x="0" y="0" width="240" height="60" fill="#5aaad8" />
      <rect x="0" y="0" width="240" height="20" fill="#78c0e8" />
      {/* 雲 */}
      <rect x="50" y="8" width="18" height="4" rx="2" fill="#e8f4ff" opacity="0.6" />
      <rect x="180" y="12" width="14" height="4" rx="2" fill="#e8f4ff" opacity="0.5" />
      {/* 建物（背景） */}
      <rect x="10" y="25" width="40" height="35" fill="#c8a880" />
      <rect x="12" y="27" width="10" height="10" fill="#88b8d0" opacity="0.6" />
      <rect x="28" y="27" width="10" height="10" fill="#88b8d0" opacity="0.6" />
      <rect x="24" y="42" width="10" height="18" fill="#8a6040" />
      <polygon points="5,25 30,12 55,25" fill="#c05040" />
      <rect x="70" y="30" width="35" height="30" fill="#d0b890" />
      <rect x="74" y="34" width="8" height="8" fill="#88b8d0" opacity="0.6" />
      <rect x="88" y="34" width="8" height="8" fill="#88b8d0" opacity="0.6" />
      <polygon points="65,30 87,18 110,30" fill="#5080a0" />
      <rect x="160" y="20" width="45" height="40" fill="#b8a078" />
      <rect x="164" y="24" width="10" height="10" fill="#88b8d0" opacity="0.6" />
      <rect x="180" y="24" width="10" height="10" fill="#88b8d0" opacity="0.6" />
      <rect x="176" y="40" width="12" height="20" fill="#8a6040" />
      <polygon points="155,20 182,8 210,20" fill="#c05040" />
      {/* 道路 */}
      <rect x="0" y="60" width="240" height="100" fill="#c0a880" />
      <rect x="0" y="65" width="240" height="95" fill="#b09870" />
      {/* 道のディテール */}
      <rect x="0" y="90" width="240" height="2" fill="#a08860" opacity="0.3" />
      {/* バトルフィールド */}
      <ellipse cx="60" cy="115" rx="45" ry="10" fill="#c8b088" stroke="#b09870" strokeWidth="1" />
      <ellipse cx="180" cy="115" rx="45" ry="10" fill="#c8b088" stroke="#b09870" strokeWidth="1" />
    </>
  );
}
