/**
 * ACT 6: タイトルコール (1:20〜1:30 / 300フレーム)
 * パーティクル収束 → タイトル表示 → テーマテロップ → 御三家シルエット
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  Sequence,
} from "remotion";
import { TypeWriter } from "../components/TypeWriter";
import { Particles } from "../components/Particles";
import { PixelSprite } from "../components/PixelSprite";
import { Vignette } from "../components/GlowEffect";
import { COLORS } from "../styles";
import { fontTitle, fontBody } from "../fonts";

export const TitleCall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // フェーズ分割
  // 0-60: ホワイトアウトから暗転
  // 60-150: パーティクル収束 → タイトル出現
  // 150-220: テーマテロップ
  // 220-300: 御三家シルエット + 夜明け

  // ホワイトアウトからの復帰
  const whiteout = interpolate(frame, [0, 30], [1, 0], {
    extrapolateRight: "clamp",
  });

  // タイトル出現
  const titleProgress = spring({
    frame: Math.max(0, frame - 80),
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const titleScale = interpolate(titleProgress, [0, 1], [0.5, 1]);
  const titleOpacity = titleProgress;

  // テーマテロップ
  const themeOpacity = interpolate(frame, [150, 170], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 夜明けグラデーション
  const dawnProgress = interpolate(frame, [200, 280], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* 背景 — 暗転 → 夜明け */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg,
            #000000 0%,
            ${interpolateColor(dawnProgress, "#000000", "#0a0a2e")} 30%,
            ${interpolateColor(dawnProgress, "#000000", "#1a1040")} 60%,
            ${interpolateColor(dawnProgress, "#000000", "#4a2060")} 80%,
            ${interpolateColor(dawnProgress, "#000000", "#e94560")} 95%,
            ${interpolateColor(dawnProgress, "#000000", "#FFB347")} 100%)`,
        }}
      />

      {/* パーティクル収束（アクセントカラー） */}
      <Particles
        count={50}
        color={COLORS.accent}
        baseSize={3}
        mode="converge"
        convergeX={960}
        convergeY={400}
        opacity={interpolate(frame, [30, 80, 150, 180], [0, 0.8, 0.8, 0.2], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
        seed={111}
      />

      {/* パーティクル収束（紫） */}
      <Particles
        count={30}
        color={COLORS.purple}
        baseSize={4}
        mode="converge"
        convergeX={960}
        convergeY={400}
        opacity={interpolate(frame, [30, 80, 150, 180], [0, 0.6, 0.6, 0.1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
        seed={222}
      />

      {/* タイトル: MONSTER CHRONICLE */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
        }}
      >
        <div
          style={{
            fontSize: 90,
            fontFamily: fontTitle,
            color: COLORS.white,
            letterSpacing: 16,
            textShadow: `0 0 40px ${COLORS.accent}80, 0 0 80px ${COLORS.accent}40, 0 4px 8px rgba(0,0,0,0.5)`,
            lineHeight: 1.3,
            textAlign: "center",
          }}
        >
          MONSTER
        </div>
        <div
          style={{
            fontSize: 90,
            fontFamily: fontTitle,
            color: COLORS.white,
            letterSpacing: 16,
            textShadow: `0 0 40px ${COLORS.accent}80, 0 0 80px ${COLORS.accent}40, 0 4px 8px rgba(0,0,0,0.5)`,
            lineHeight: 1.3,
            textAlign: "center",
          }}
        >
          CHRONICLE
        </div>
      </AbsoluteFill>

      {/* テーマテロップ */}
      <Sequence from={150} durationInFrames={150} premountFor={15}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 200,
            opacity: themeOpacity,
          }}
        >
          <TypeWriter
            text="記憶を失った世界で、それでも繋がりを信じられるか？"
            charFrames={3}
            startFrame={5}
            fontSize={34}
            color={COLORS.textSecondary}
            fontFamily={fontBody}
            letterSpacing={3}
            showCursor={false}
          />
        </AbsoluteFill>
      </Sequence>

      {/* 御三家シルエット（夜明け） */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 60,
          opacity: interpolate(frame, [220, 260], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {[
          { id: "himori", types: ["fire"] },
          { id: "shizukumo", types: ["water"] },
          { id: "konohana", types: ["grass"] },
        ].map((starter, i) => {
          const delay = i * 10;
          const entrance = spring({
            frame: Math.max(0, frame - 230 - delay),
            fps,
            config: { damping: 200 },
          });
          return (
            <div
              key={starter.id}
              style={{
                transform: `translateY(${(1 - entrance) * 30}px)`,
                opacity: entrance,
              }}
            >
              <PixelSprite
                speciesId={starter.id}
                types={starter.types}
                size={100}
                silhouetteColor="#1a0a2e"
              />
            </div>
          );
        })}
      </div>

      {/* ホワイトアウトオーバーレイ */}
      {whiteout > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#FFFFFF",
            opacity: whiteout,
          }}
        />
      )}

      <Vignette intensity={0.6} />
    </AbsoluteFill>
  );
};

/** 2色間の線形補間 */
function interpolateColor(t: number, from: string, to: string): string {
  const fr = parseInt(from.slice(1, 3), 16);
  const fg = parseInt(from.slice(3, 5), 16);
  const fb = parseInt(from.slice(5, 7), 16);
  const tr = parseInt(to.slice(1, 3), 16);
  const tg = parseInt(to.slice(3, 5), 16);
  const tb = parseInt(to.slice(5, 7), 16);
  const r = Math.round(fr + (tr - fr) * t);
  const g = Math.round(fg + (tg - fg) * t);
  const b = Math.round(fb + (tb - fb) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
