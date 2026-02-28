/**
 * HPExpPanel — ゲーム風 HP/EXP バー UI
 */
import React from "react";
import { useCurrentFrame, interpolate, useVideoConfig } from "remotion";
import { COLORS } from "../styles";

export type HPExpPanelProps = {
  monsterName: string;
  level: number;
  /** HP割合 0-1 */
  hpRatio: number;
  /** EXP割合 0-100 */
  expPercent: number;
  /** HPが減少するアニメーション */
  hpDrain?: { startFrame: number; endFrame: number; targetRatio: number };
  /** EXPが増加するアニメーション */
  expGain?: { startFrame: number; endFrame: number; targetPercent: number };
  isEnemy?: boolean;
};

function getHpColor(ratio: number): string {
  if (ratio > 0.5) return "#34D399";
  if (ratio > 0.2) return "#FBBF24";
  return "#EF4444";
}

export const HPExpPanel: React.FC<HPExpPanelProps> = ({
  monsterName,
  level,
  hpRatio,
  expPercent,
  hpDrain,
  expGain,
  isEnemy = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // HP アニメーション
  let currentHp = hpRatio;
  if (hpDrain) {
    currentHp = interpolate(
      frame,
      [hpDrain.startFrame, hpDrain.endFrame],
      [hpRatio, hpDrain.targetRatio],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
  }

  // EXP アニメーション
  let currentExp = expPercent;
  if (expGain) {
    currentExp = interpolate(
      frame,
      [expGain.startFrame, expGain.endFrame],
      [expPercent, expGain.targetPercent],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
  }

  const panelWidth = isEnemy ? 400 : 440;

  return (
    <div
      style={{
        width: panelWidth,
        padding: "12px 20px",
        backgroundColor: `${COLORS.bgPanel}f0`,
        border: `2px solid ${COLORS.purple}`,
        borderRadius: 12,
        boxShadow: `0 0 20px rgba(83,52,131,0.3)`,
      }}
    >
      {/* 名前 + レベル */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            color: COLORS.white,
            fontSize: 28,
            fontWeight: "bold",
            letterSpacing: 2,
          }}
        >
          {monsterName}
        </span>
        <span style={{ color: COLORS.textSecondary, fontSize: 22 }}>Lv.{level}</span>
      </div>

      {/* HP バー */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#FBBF24", fontSize: 16, fontWeight: "bold" }}>HP</span>
        <div
          style={{
            flex: 1,
            height: 10,
            backgroundColor: "#1a1a2e",
            borderRadius: 5,
            border: `1px solid ${COLORS.purple}80`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.max(0, currentHp * 100)}%`,
              height: "100%",
              backgroundColor: getHpColor(currentHp),
              borderRadius: 5,
            }}
          />
        </div>
      </div>

      {/* EXP バー（味方のみ） */}
      {!isEnemy && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 6,
          }}
        >
          <span
            style={{
              color: COLORS.expBlue,
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            EXP
          </span>
          <div
            style={{
              flex: 1,
              height: 6,
              backgroundColor: "#1a1a2e",
              borderRadius: 3,
              border: `1px solid ${COLORS.purple}50`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(100, currentExp)}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${COLORS.expBlue}, ${COLORS.expBlueBright})`,
                borderRadius: 3,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
