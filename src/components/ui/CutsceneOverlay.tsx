"use client";

import { useState, useEffect } from "react";

/**
 * カットシーン演出 (#153)
 * バッジ取得、殿堂入り、スタッフロール
 */

// ─── バッジ取得アニメーション ─────────────────────

export interface BadgeGetProps {
  badgeName: string;
  gymLeaderName: string;
  badgeNumber: number;
  onComplete: () => void;
}

export function BadgeGetAnimation({
  badgeName,
  gymLeaderName,
  badgeNumber,
  onComplete,
}: BadgeGetProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 800);
    const t3 = setTimeout(() => setPhase(3), 2000);
    const t4 = setTimeout(() => onComplete(), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  // バッジの色をジムナンバーで変化
  const badgeColors = [
    "#B8B8D0",
    "#e94560",
    "#5b9bd5",
    "#5cb85c",
    "#F8D030",
    "#533483",
    "#ff6b81",
    "#F0C040",
  ];
  const color = badgeColors[(badgeNumber - 1) % badgeColors.length];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: "rgba(10, 10, 26, 0.95)" }}
      role="alert"
      aria-label={`${badgeName}を手に入れた！`}
    >
      {/* バッジSVG */}
      <div
        className="mb-6 transition-all duration-700"
        style={{
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "scale(1) rotate(0deg)" : "scale(0.3) rotate(-180deg)",
        }}
      >
        <svg viewBox="0 0 64 64" width={120} height={120}>
          {/* 光芒 */}
          {phase >= 2 &&
            Array.from({ length: 8 }).map((_, i) => (
              <line
                key={i}
                x1="32"
                y1="32"
                x2={32 + Math.cos((i * Math.PI) / 4) * 30}
                y2={32 + Math.sin((i * Math.PI) / 4) * 30}
                stroke={color}
                strokeWidth="1"
                opacity="0.5"
              />
            ))}
          {/* バッジ本体（八角形） */}
          <polygon
            points="32,6 44,12 50,24 50,40 44,52 32,58 20,52 14,40 14,24 20,12"
            fill={color}
            stroke="#fff"
            strokeWidth="1.5"
          />
          {/* 内部装飾 */}
          <polygon
            points="32,14 40,18 44,28 44,36 40,46 32,50 24,46 20,36 20,28 24,18"
            fill="none"
            stroke="#fff"
            strokeWidth="0.8"
            opacity="0.4"
          />
          {/* 中央の星 */}
          <polygon
            points="32,20 35,28 44,28 37,33 39,42 32,37 25,42 27,33 20,28 29,28"
            fill="#fff"
            opacity="0.6"
          />
          {/* ナンバー */}
          <text
            x="32"
            y="36"
            textAnchor="middle"
            fill="#fff"
            fontSize="10"
            fontFamily="'Press Start 2P', monospace"
          >
            {badgeNumber}
          </text>
        </svg>
      </div>

      {/* テキスト */}
      <p
        className="game-text-shadow mb-2 font-[family-name:var(--font-dotgothic)] text-xl text-white transition-all duration-500"
        style={{
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "translateY(0)" : "translateY(10px)",
        }}
      >
        {badgeName}を手に入れた！
      </p>
      <p
        className="font-[family-name:var(--font-dotgothic)] text-sm text-gray-400 transition-all duration-500"
        style={{
          opacity: phase >= 3 ? 1 : 0,
        }}
      >
        {gymLeaderName}を倒した！
      </p>
    </div>
  );
}

// ─── 殿堂入り演出 ─────────────────────────────

export interface HallOfFameEntry {
  speciesId: string;
  name: string;
  level: number;
}

export interface HallOfFameProps {
  playerName: string;
  party: HallOfFameEntry[];
  onComplete: () => void;
}

export function HallOfFameScreen({ playerName, party, onComplete }: HallOfFameProps) {
  const [phase, setPhase] = useState(0);
  const [shownIndex, setShownIndex] = useState(-1);

  useEffect(() => {
    const partyLen = party.length;
    const t0 = setTimeout(() => setPhase(1), 500);
    // 各モンスターを順番に表示
    const timers = party.map((_, i) => setTimeout(() => setShownIndex(i), 1500 + i * 800));
    const tFinal = setTimeout(() => setPhase(2), 1500 + partyLen * 800 + 500);
    const tEnd = setTimeout(() => onComplete(), 1500 + partyLen * 800 + 3000);
    return () => {
      clearTimeout(t0);
      timers.forEach(clearTimeout);
      clearTimeout(tFinal);
      clearTimeout(tEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [party.length, onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at 50% 30%, #1a1a4e, #0a0a1a)",
      }}
      role="alert"
      aria-label="殿堂入り"
    >
      {/* タイトル */}
      <h1
        className="game-text-shadow mb-8 text-center font-[family-name:var(--font-pressstart)] text-xl tracking-wider text-[#F8D030] transition-all duration-1000"
        style={{
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "translateY(0)" : "translateY(-20px)",
          textShadow: "0 0 20px rgba(248,208,48,0.5), 1px 1px 0 rgba(0,0,0,0.8)",
        }}
      >
        HALL OF FAME
      </h1>

      {/* パーティ一覧 */}
      <div className="grid grid-cols-3 gap-4">
        {party.map((member, i) => (
          <div
            key={i}
            className="flex flex-col items-center transition-all duration-500"
            style={{
              opacity: i <= shownIndex ? 1 : 0,
              transform: i <= shownIndex ? "scale(1)" : "scale(0.5)",
            }}
          >
            {/* モンスターシルエット→カラー化 */}
            <div
              className="mb-2 flex h-16 w-16 items-center justify-center rounded-lg"
              style={{
                background: "radial-gradient(ellipse, rgba(83,52,131,0.4), transparent)",
                boxShadow: "0 0 15px rgba(233,69,96,0.2)",
              }}
            >
              <span className="font-[family-name:var(--font-pressstart)] text-2xl text-[#e94560]">
                ★
              </span>
            </div>
            <p className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-sm text-white">
              {member.name}
            </p>
            <p className="font-[family-name:var(--font-dotgothic)] text-[10px] text-gray-500">
              Lv.{member.level}
            </p>
          </div>
        ))}
      </div>

      {/* プレイヤー名 */}
      <p
        className="game-text-shadow mt-8 font-[family-name:var(--font-dotgothic)] text-lg text-white transition-all duration-700"
        style={{
          opacity: phase >= 2 ? 1 : 0,
        }}
      >
        トレーナー {playerName} と仲間たち
      </p>
      <p
        className="mt-2 font-[family-name:var(--font-dotgothic)] text-sm text-[#F8D030] transition-all duration-700"
        style={{
          opacity: phase >= 2 ? 1 : 0,
        }}
      >
        おめでとう！
      </p>
    </div>
  );
}

// ─── スタッフロール ─────────────────────────────

export interface StaffRollProps {
  onComplete: () => void;
}

const CREDITS = [
  { role: "Director", name: "Monster Chronicle Team" },
  { role: "Game Design", name: "Monster Chronicle Team" },
  { role: "Programming", name: "AI-Assisted Development" },
  { role: "Art Direction", name: "Pixel Art Generator" },
  { role: "Music", name: "Chiptune Synthesizer" },
  { role: "Story", name: "Monster Chronicle Team" },
  { role: "", name: "" },
  { role: "Special Thanks", name: "You, the Player!" },
  { role: "", name: "" },
  { role: "", name: "MONSTER CHRONICLE" },
  { role: "", name: "― FIN ―" },
];

export function StaffRoll({ onComplete }: StaffRollProps) {
  const [scrollY, setScrollY] = useState(0);
  const totalHeight = CREDITS.length * 80 + 400;

  useEffect(() => {
    const startTime = Date.now();
    const speed = 40; // px per second
    let frameId: number;

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const y = elapsed * speed;
      setScrollY(y);

      if (y < totalHeight) {
        frameId = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [totalHeight, onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ backgroundColor: "#0a0a1a" }}
      role="region"
      aria-label="スタッフロール"
    >
      {/* 星空背景 */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              left: `${(i * 13 + 7) % 100}%`,
              top: `${(i * 17 + 3) % 100}%`,
              opacity: 0.3 + (i % 5) * 0.1,
              animation: `blink ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* スクロールするクレジット */}
      <div
        className="absolute left-0 right-0 flex flex-col items-center"
        style={{
          top: `calc(100% - ${scrollY}px)`,
        }}
      >
        {CREDITS.map((credit, i) => (
          <div key={i} className="mb-10 text-center" style={{ minHeight: 60 }}>
            {credit.role && (
              <p className="mb-1 font-[family-name:var(--font-dotgothic)] text-xs tracking-widest text-[#533483]">
                {credit.role}
              </p>
            )}
            <p
              className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-lg text-white"
              style={
                credit.name === "― FIN ―"
                  ? {
                      fontFamily: "var(--font-pressstart)",
                      color: "#F8D030",
                      textShadow: "0 0 15px rgba(248,208,48,0.4)",
                    }
                  : credit.name === "MONSTER CHRONICLE"
                    ? {
                        fontFamily: "var(--font-pressstart)",
                        fontSize: "1.5rem",
                        color: "#e94560",
                        textShadow: "0 0 20px rgba(233,69,96,0.5)",
                      }
                    : undefined
              }
            >
              {credit.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
