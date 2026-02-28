/**
 * ACT 2: 出会い — 御三家 (0:20〜0:35 / 450フレーム)
 * 光が差し込む → 御三家登場 → 博士のセリフ
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
import { PixelSprite } from "../components/PixelSprite";
import { GlowEffect, Vignette, WhiteFlash } from "../components/GlowEffect";
import { COLORS, TYPE_HEX } from "../styles";
import { fontBody } from "../fonts";

const STARTERS = [
  { id: "himori", name: "ヒモリ", types: ["fire"], color: TYPE_HEX.fire },
  { id: "shizukumo", name: "シズクモ", types: ["water"], color: TYPE_HEX.water },
  { id: "konohana", name: "コノハナ", types: ["grass"], color: TYPE_HEX.grass },
] as const;

export const Encounter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // フェーズ分割
  // 0-60: 光が差し込む + テロップ「だが、まだ——」
  // 60-240: 御三家が順に登場
  // 240-340: 「人を信じるモンスターがいた」
  // 340-450: 博士のセリフ

  // 光の差し込み
  const lightBeam = interpolate(frame, [0, 60], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // 全体フェードアウト
  const fadeOut = interpolate(frame, [420, 450], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a1a", opacity: fadeOut }}>
      {/* 背景グラデーション — 暗→少し明るく */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, #0a0a1a 0%, #1a1a3e ${100 - lightBeam * 40}%, #2a2a5e 100%)`,
        }}
      />

      {/* 光の筋 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "40%",
          width: "20%",
          height: "100%",
          background: `linear-gradient(180deg, rgba(255,255,200,${lightBeam * 0.3}) 0%, transparent 80%)`,
          filter: "blur(40px)",
        }}
      />

      {/* フェーズ1: テロップ */}
      <Sequence durationInFrames={80} premountFor={10}>
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TypeWriter
            text="だが、まだ——"
            charFrames={5}
            startFrame={10}
            fontSize={56}
            color={COLORS.white}
            fontFamily={fontBody}
            letterSpacing={6}
          />
        </AbsoluteFill>
      </Sequence>

      {/* フェーズ2: 御三家登場 */}
      <Sequence from={60} durationInFrames={180} premountFor={30}>
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 100,
          }}
        >
          {STARTERS.map((starter, i) => {
            const delay = i * 50;
            const localFrame = Math.max(0, frame - 60 - delay);
            const entrance = spring({
              frame: localFrame,
              fps,
              config: { damping: 12, stiffness: 100 },
            });
            const y = interpolate(entrance, [0, 1], [100, 0]);
            const scale = entrance;

            return (
              <div
                key={starter.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  transform: `translateY(${y}px) scale(${scale})`,
                  opacity: entrance,
                }}
              >
                <PixelSprite
                  speciesId={starter.id}
                  types={[...starter.types]}
                  size={180}
                  glowColor={starter.color}
                  glowIntensity={12}
                />
                {/* タイプ色のパーティクル光 */}
                <div
                  style={{
                    width: 180,
                    height: 8,
                    borderRadius: 4,
                    background: `radial-gradient(ellipse, ${starter.color}80 0%, transparent 70%)`,
                    filter: "blur(4px)",
                  }}
                />
              </div>
            );
          })}
        </AbsoluteFill>

        {/* 光パーティクル */}
        <Particles count={20} color="#FFFDE0" baseSize={3} mode="rise" opacity={0.5} seed={33} />
      </Sequence>

      {/* フェーズ3: テロップ「人を信じるモンスターがいた」 */}
      <Sequence from={240} durationInFrames={100} premountFor={15}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TypeWriter
            text="人を信じるモンスターがいた"
            charFrames={3}
            startFrame={10}
            fontSize={48}
            color={COLORS.white}
            fontFamily={fontBody}
            letterSpacing={4}
          />
        </AbsoluteFill>
      </Sequence>

      {/* フェーズ4: 博士のセリフ */}
      <Sequence from={340} durationInFrames={110} premountFor={15}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              padding: "24px 40px",
              backgroundColor: `${COLORS.bgPanel}e0`,
              border: `2px solid ${COLORS.purple}`,
              borderRadius: 16,
            }}
          >
            <TypeWriter
              text={`「この子たちは人間を恐れていない。\n  昔は…全てのモンスターがそうだったはずなんだ」`}
              charFrames={2}
              startFrame={10}
              fontSize={34}
              color={COLORS.textSecondary}
              fontFamily={fontBody}
              letterSpacing={2}
              lineHeight={1.8}
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      <Vignette intensity={0.5} />
      <WhiteFlash startFrame={60} duration={8} />
    </AbsoluteFill>
  );
};
