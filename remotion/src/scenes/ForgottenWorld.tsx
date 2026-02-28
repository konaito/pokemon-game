/**
 * ACT 1: 忘却の世界 (0:07〜0:20 / 390フレーム)
 * 深紺の空 → 灰色の町並みシルエット → ワスレヌのシルエット（金色の目）
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  Sequence,
  spring,
} from "remotion";
import { TypeWriter } from "../components/TypeWriter";
import { Particles } from "../components/Particles";
import { Vignette } from "../components/GlowEffect";
import { PixelSprite } from "../components/PixelSprite";
import { COLORS, TYPE_HEX } from "../styles";
import { fontBody } from "../fonts";

/** 町並みシルエット（SVG） */
const TownSilhouette: React.FC<{ opacity: number }> = ({ opacity }) => (
  <svg
    viewBox="0 0 1920 400"
    width={1920}
    height={400}
    style={{ position: "absolute", bottom: 0, opacity }}
  >
    {/* 建物シルエット */}
    <rect x={100} y={150} width={120} height={250} fill="#1a1a2e" rx={4} />
    <rect x={250} y={100} width={80} height={300} fill="#16213e" rx={4} />
    <rect x={360} y={180} width={100} height={220} fill="#1a1a2e" rx={4} />
    <rect x={500} y={80} width={140} height={320} fill="#0f1a2e" rx={4} />
    <polygon points="500,80 570,20 640,80" fill="#0f1a2e" />
    <rect x={680} y={160} width={90} height={240} fill="#16213e" rx={4} />
    <rect x={810} y={120} width={110} height={280} fill="#1a1a2e" rx={4} />
    <rect x={960} y={90} width={150} height={310} fill="#0f1a2e" rx={4} />
    <polygon points="960,90 1035,30 1110,90" fill="#0f1a2e" />
    <rect x={1150} y={170} width={100} height={230} fill="#16213e" rx={4} />
    <rect x={1290} y={130} width={120} height={270} fill="#1a1a2e" rx={4} />
    <rect x={1450} y={100} width={80} height={300} fill="#0f1a2e" rx={4} />
    <rect x={1570} y={160} width={130} height={240} fill="#16213e" rx={4} />
    <rect x={1740} y={140} width={100} height={260} fill="#1a1a2e" rx={4} />
  </svg>
);

export const ForgottenWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // フェーズ1: 町並み (0〜195f)
  // フェーズ2: ワスレヌ登場 (195〜390f)

  const townOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ワスレヌフェーズ
  const wasurenPhase = Math.max(0, frame - 195);
  const wasurenScale = spring({
    frame: wasurenPhase,
    fps,
    config: { damping: 200 },
  });

  // 金色の目の脈動
  const eyeGlow = 0.5 + 0.5 * Math.sin(frame * 0.08);

  // 全体フェードアウト
  const fadeOut = interpolate(frame, [360, 390], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a1a" }}>
      {/* 深紺の空グラデーション */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, #0a0a1a 0%, #1a1a3e 60%, #2a1a4e 100%)",
        }}
      />

      {/* 暗い霧パーティクル */}
      <Particles
        count={25}
        color="#1a0a2e"
        baseSize={10}
        mode="float"
        opacity={0.4}
        seed={21}
      />

      {/* フェーズ1: 町並み + テロップ */}
      <Sequence durationInFrames={195} premountFor={15}>
        <AbsoluteFill style={{ opacity: fadeOut }}>
          <TownSilhouette opacity={townOpacity * 0.8} />

          <AbsoluteFill
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: 300,
            }}
          >
            <TypeWriter
              text="モンスターは恐れられ、人々は絆を忘れた"
              charFrames={3}
              startFrame={40}
              fontSize={46}
              color={COLORS.textSecondary}
              fontFamily={fontBody}
              letterSpacing={3}
            />
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>

      {/* フェーズ2: ワスレヌ登場 */}
      <Sequence from={195} durationInFrames={195} premountFor={30}>
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: fadeOut,
          }}
        >
          {/* ワスレヌのシルエット */}
          <div style={{ transform: `scale(${wasurenScale})` }}>
            <PixelSprite
              speciesId="wasurenu"
              types={["psychic", "dark"]}
              size={320}
              silhouetteColor="#0a0a1a"
              glowColor={`rgba(255, 200, 0, ${eyeGlow * 0.6})`}
              glowIntensity={15}
            />
          </div>

          {/* 金色の目（スプライトの上にオーバーレイ） */}
          <div
            style={{
              position: "absolute",
              display: "flex",
              gap: 40,
              opacity: interpolate(wasurenPhase, [20, 50], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: "#FFD700",
                boxShadow: `0 0 ${20 + eyeGlow * 30}px #FFD700, 0 0 ${40 + eyeGlow * 60}px #FFD70080`,
              }}
            />
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: "#FFD700",
                boxShadow: `0 0 ${20 + eyeGlow * 30}px #FFD700, 0 0 ${40 + eyeGlow * 60}px #FFD70080`,
              }}
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      <Vignette intensity={0.8} />
    </AbsoluteFill>
  );
};
