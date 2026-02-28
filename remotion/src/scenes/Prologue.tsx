/**
 * ACT 0: 暗転 — プロローグ (0:00〜0:07 / 210フレーム)
 * 真っ暗闇。黒い霧パーティクル。タイプライターテロップ。
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { TypeWriter } from "../components/TypeWriter";
import { Particles } from "../components/Particles";
import { COLORS } from "../styles";
import { fontBody } from "../fonts";

export const Prologue: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 全体フェードイン（最初の15フレーム）
  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // 最後にフェードアウト（残り30フレーム）
  const fadeOut = interpolate(frame, [180, 210], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = fadeIn * fadeOut;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* 黒い霧パーティクル */}
      <Particles
        count={20}
        color="#1a1a2e"
        baseSize={8}
        mode="float"
        opacity={0.3 * opacity}
        seed={7}
      />
      <Particles
        count={15}
        color="#2a1a3e"
        baseSize={12}
        mode="float"
        opacity={0.2 * opacity}
        seed={13}
      />

      {/* 中央テロップ */}
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity,
        }}
      >
        <TypeWriter
          text="50年前、世界はすべてを忘れた——"
          charFrames={4}
          startFrame={30}
          fontSize={52}
          color={COLORS.textSecondary}
          fontFamily={fontBody}
          showCursor={true}
          letterSpacing={4}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
