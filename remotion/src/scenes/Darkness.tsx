/**
 * ACT 4: 闇の勢力 (0:50〜1:05 / 450フレーム)
 * オブリヴィオン団 → カゲロウ → 忘却の遺跡
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Easing,
} from "remotion";
import { TypeWriter } from "../components/TypeWriter";
import { Particles } from "../components/Particles";
import { GlowEffect, Vignette } from "../components/GlowEffect";
import { COLORS } from "../styles";
import { fontBody } from "../fonts";

/** オブリヴィオン団員シルエット */
const ShadowFigures: React.FC<{ count: number; opacity: number }> = ({ count, opacity }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: 60,
      opacity,
    }}
  >
    {Array.from({ length: count }, (_, i) => {
      const h = 160 + (i % 3) * 20;
      return (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* 頭 */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "#0a0a0a",
              border: "1px solid #1a1a3e",
            }}
          />
          {/* 体 */}
          <div
            style={{
              width: 50,
              height: h,
              backgroundColor: "#0a0a0a",
              borderRadius: "4px 4px 20px 20px",
              border: "1px solid #1a1a3e",
              marginTop: -4,
            }}
          />
        </div>
      );
    })}
  </div>
);

/** 壁画風 — 人とモンスターが共に暮らす */
const Mural: React.FC<{ crackProgress: number }> = ({ crackProgress }) => (
  <div style={{ position: "relative", width: 800, height: 300 }}>
    <svg viewBox="0 0 800 300" width={800} height={300}>
      {/* 背景パネル */}
      <rect width={800} height={300} fill="#2a1a0e" rx={8} />
      <rect x={10} y={10} width={780} height={280} fill="#3a2a1e" rx={4} />

      {/* 人のシルエット */}
      <circle cx={200} cy={140} r={25} fill="#8B7355" />
      <rect x={185} y={165} width={30} height={60} fill="#8B7355" rx={4} />

      {/* モンスターのシルエット（四足動物風） */}
      <ellipse cx={350} cy={180} rx={40} ry={25} fill="#6B8E55" />
      <circle cx={375} cy={160} r={18} fill="#6B8E55" />
      <rect x={320} y={200} width={8} height={25} fill="#6B8E55" />
      <rect x={340} y={200} width={8} height={25} fill="#6B8E55" />
      <rect x={355} y={200} width={8} height={25} fill="#6B8E55" />
      <rect x={375} y={200} width={8} height={25} fill="#6B8E55" />

      {/* 太陽 */}
      <circle cx={600} cy={80} r={35} fill="#D4A030" opacity={0.8} />

      {/* 手を繋ぐ線 */}
      <line x1={215} y1={185} x2={310} y2={180} stroke="#8B7355" strokeWidth={3} />

      {/* 花 */}
      <circle cx={500} cy={220} r={8} fill="#CC6688" />
      <circle cx={530} cy={230} r={6} fill="#88CC66" />
      <circle cx={560} cy={215} r={7} fill="#CC6688" />

      {/* ヒビ割れ */}
      {crackProgress > 0 && (
        <g opacity={crackProgress}>
          <line
            x1={400}
            y1={0}
            x2={350}
            y2={150}
            stroke="#0a0a0a"
            strokeWidth={3}
            strokeDasharray={`${crackProgress * 200}`}
          />
          <line
            x1={350}
            y1={150}
            x2={380}
            y2={300}
            stroke="#0a0a0a"
            strokeWidth={3}
            strokeDasharray={`${crackProgress * 200}`}
          />
          <line
            x1={350}
            y1={150}
            x2={280}
            y2={250}
            stroke="#0a0a0a"
            strokeWidth={2}
            strokeDasharray={`${crackProgress * 150}`}
          />
          <line
            x1={350}
            y1={150}
            x2={450}
            y2={220}
            stroke="#0a0a0a"
            strokeWidth={2}
            strokeDasharray={`${crackProgress * 150}`}
          />

          {/* 崩れる破片 */}
          <rect
            x={340}
            y={130}
            width={20}
            height={30}
            fill="#3a2a1e"
            transform={`rotate(${crackProgress * 15}, 350, 145) translate(${crackProgress * 10}, ${crackProgress * 20})`}
            opacity={1 - crackProgress * 0.5}
          />
          <rect
            x={360}
            y={160}
            width={15}
            height={20}
            fill="#3a2a1e"
            transform={`rotate(${-crackProgress * 20}, 367, 170) translate(${-crackProgress * 8}, ${crackProgress * 25})`}
            opacity={1 - crackProgress * 0.5}
          />
        </g>
      )}
    </svg>
  </div>
);

export const Darkness: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeOut = interpolate(frame, [420, 450], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#050510", opacity: fadeOut }}>
      {/* 暗い背景 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, #0a0a2e 0%, #050510 100%)",
        }}
      />

      {/* ダークパーティクル */}
      <Particles count={15} color="#200020" baseSize={15} mode="float" opacity={0.3} seed={66} />

      {/* セクション1: オブリヴィオン団 (0〜170f) */}
      <Sequence durationInFrames={170} premountFor={15}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 60,
          }}
        >
          <ShadowFigures
            count={5}
            opacity={interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp" })}
          />
          <TypeWriter
            text="「モンスターとの共存など幻想です！」"
            charFrames={2}
            startFrame={50}
            fontSize={44}
            color="#e94560"
            fontFamily={fontBody}
            letterSpacing={3}
          />
          <div
            style={{
              fontSize: 28,
              color: COLORS.textMuted,
              fontFamily: fontBody,
              opacity: interpolate(frame, [120, 140], [0, 1], { extrapolateRight: "clamp" }),
              letterSpacing: 6,
              textAlign: "center",
            }}
          >
            — オブリヴィオン団
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* セクション2: カゲロウ (170〜300f) */}
      <Sequence from={170} durationInFrames={130} premountFor={20}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 40,
          }}
        >
          {/* カゲロウのシルエット */}
          <div
            style={{
              width: 200,
              height: 280,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transform: `scale(${spring({ frame: Math.max(0, frame - 170), fps, config: { damping: 200 } })})`,
            }}
          >
            {/* 頭部 */}
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                backgroundColor: "#0a0a0a",
                border: "2px solid #1a1a3e",
                position: "relative",
              }}
            >
              {/* 金色の目 */}
              {(() => {
                const localFrame = Math.max(0, frame - 170);
                const eyeGlow = 0.5 + 0.5 * Math.sin(localFrame * 0.1);
                const eyeOpacity = interpolate(localFrame, [20, 40], [0, 1], {
                  extrapolateRight: "clamp",
                });
                return (
                  <div
                    style={{
                      position: "absolute",
                      top: 20,
                      left: 10,
                      display: "flex",
                      gap: 16,
                      opacity: eyeOpacity,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#FFD700",
                        boxShadow: `0 0 ${10 + eyeGlow * 20}px #FFD700`,
                      }}
                    />
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#FFD700",
                        boxShadow: `0 0 ${10 + eyeGlow * 20}px #FFD700`,
                      }}
                    />
                  </div>
                );
              })()}
            </div>
            {/* 体 */}
            <div
              style={{
                width: 70,
                height: 180,
                backgroundColor: "#0a0a0a",
                borderRadius: "4px 4px 30px 30px",
                border: "2px solid #1a1a3e",
                marginTop: -4,
              }}
            />
            {/* コート裾 */}
            <div
              style={{
                width: 90,
                height: 40,
                backgroundColor: "#0a0a0a",
                borderRadius: "0 0 45px 45px",
                marginTop: -4,
              }}
            />
          </div>

          <TypeWriter
            text={`「記憶とは…呪いではなかったのか」`}
            charFrames={3}
            startFrame={50}
            fontSize={40}
            color="#C0C0C0"
            fontFamily={fontBody}
            letterSpacing={3}
          />
        </AbsoluteFill>
      </Sequence>

      {/* セクション3: 忘却の遺跡壁画 (300〜450f) */}
      <Sequence from={300} durationInFrames={150} premountFor={20}>
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {(() => {
            const localFrame = Math.max(0, frame - 300);
            const crackProgress = interpolate(localFrame, [60, 130], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.inOut(Easing.quad),
            });
            const muralOpacity = interpolate(localFrame, [0, 30], [0, 1], {
              extrapolateRight: "clamp",
            });

            return (
              <div style={{ opacity: muralOpacity }}>
                <Mural crackProgress={crackProgress} />
              </div>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      <Vignette intensity={0.9} />
    </AbsoluteFill>
  );
};
