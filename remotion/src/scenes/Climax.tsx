/**
 * ACT 5: 対決と絆 (1:05〜1:20 / 450フレーム)
 * ソウマ対決 → 四天王フラッシュ → チャンピオン → オモイデ降臨
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
import { FlashCut } from "../components/FlashCut";
import { Particles } from "../components/Particles";
import { PixelSprite } from "../components/PixelSprite";
import { GlowEffect, Vignette, WhiteFlash } from "../components/GlowEffect";
import { COLORS, TYPE_HEX } from "../styles";
import { fontBody, fontTitle } from "../fonts";

const ELITE_FOUR = [
  { name: "ツバサ", type: "flying", title: "四天王" },
  { name: "クロガネ", type: "steel", title: "四天王" },
  { name: "ミヤビ", type: "fairy", title: "四天王" },
  { name: "ゲンブ", type: "rock", title: "四天王" },
];

/** 四天王カード */
const EliteFourCard: React.FC<{ name: string; type: string }> = ({
  name,
  type,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const color = TYPE_HEX[type] ?? "#A8A878";

  const entrance = spring({ frame, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${color}15 0%, #050510 30%, ${color}10 70%, #050510 100%)`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* タイプ色のワイドストライプ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `repeating-linear-gradient(90deg, transparent, transparent 200px, ${color}08 200px, ${color}08 204px)`,
        }}
      />

      {/* 名前表示 */}
      <div
        style={{
          transform: `scale(${entrance}) translateY(${(1 - entrance) * 50}px)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color,
            fontFamily: fontBody,
            letterSpacing: 12,
            textShadow: `0 0 40px ${color}80, 0 0 80px ${color}40`,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 24,
            color: `${color}80`,
            fontFamily: fontBody,
            letterSpacing: 8,
            marginTop: 16,
            textAlign: "center",
          }}
        >
          ── 四天王 ──
        </div>
      </div>

      {/* タイプ色パーティクル */}
      <Particles
        count={15}
        color={color}
        baseSize={3}
        mode="rise"
        opacity={0.4}
        seed={name.charCodeAt(0)}
      />
    </AbsoluteFill>
  );
};

export const Climax: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const fadeOut = interpolate(frame, [420, 450], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#050510", opacity: fadeOut }}>
      {/* セクション1: ソウマとの対決 (0〜110f) */}
      <Sequence durationInFrames={110} premountFor={15}>
        <AbsoluteFill
          style={{
            background: "linear-gradient(180deg, #0a0a2e, #050510)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 40,
          }}
        >
          {/* 向き合うシルエット */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              gap: 200,
            }}
          >
            {/* 主人公シルエット */}
            <div
              style={{
                opacity: spring({ frame, fps, config: { damping: 200 } }),
                transform: `translateX(${interpolate(frame, [0, 30], [-100, 0], { extrapolateRight: "clamp" })}px)`,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#1a1a3e" }} />
                <div style={{ width: 50, height: 120, backgroundColor: "#1a1a3e", borderRadius: "4px 4px 15px 15px", marginTop: -2 }} />
              </div>
            </div>

            {/* VS */}
            <div
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: COLORS.accent,
                fontFamily: fontTitle,
                opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" }),
                textShadow: `0 0 30px ${COLORS.accent}80`,
              }}
            >
              VS
            </div>

            {/* ソウマシルエット */}
            <div
              style={{
                opacity: spring({ frame, fps, config: { damping: 200 } }),
                transform: `translateX(${interpolate(frame, [0, 30], [100, 0], { extrapolateRight: "clamp" })}px)`,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#2a2a4e" }} />
                <div style={{ width: 50, height: 120, backgroundColor: "#2a2a4e", borderRadius: "4px 4px 15px 15px", marginTop: -2 }} />
              </div>
            </div>
          </div>

          <TypeWriter
            text="「認めたくなかったんだ——」"
            charFrames={3}
            startFrame={50}
            fontSize={42}
            color={COLORS.textSecondary}
            fontFamily={fontBody}
            letterSpacing={3}
          />
        </AbsoluteFill>
      </Sequence>

      {/* セクション2: 四天王フラッシュ (110〜230f) */}
      <Sequence from={110} durationInFrames={120} premountFor={15}>
        <FlashCut interval={30}>
          {ELITE_FOUR.map((member) => (
            <EliteFourCard
              key={member.name}
              name={member.name}
              type={member.type}
            />
          ))}
        </FlashCut>
      </Sequence>

      {/* セクション3: チャンピオン・アカツキ (230〜350f) */}
      <Sequence from={230} durationInFrames={120} premountFor={20}>
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at center, ${COLORS.purple}20, #050510)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 30,
          }}
        >
          {/* チャンピオンタイトル */}
          <div
            style={{
              fontSize: 24,
              color: `${COLORS.purple}cc`,
              fontFamily: fontBody,
              letterSpacing: 10,
              textAlign: "center",
              opacity: interpolate(Math.max(0, frame - 230), [0, 20], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            ── CHAMPION ──
          </div>

          {/* 名前 */}
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: COLORS.white,
              fontFamily: fontBody,
              letterSpacing: 16,
              textAlign: "center",
              textShadow: `0 0 40px ${COLORS.purple}80, 0 0 80px ${COLORS.purple}40`,
              transform: `scale(${spring({ frame: Math.max(0, frame - 230), fps, config: { damping: 15 } })})`,
            }}
          >
            アカツキ
          </div>

          {/* セリフ */}
          <div style={{ maxWidth: 1000, padding: "16px 32px" }}>
            <TypeWriter
              text={`「全力で来い。\n  私が間違っていたのか、確かめさせてくれ」`}
              charFrames={2}
              startFrame={40}
              fontSize={36}
              color={COLORS.textSecondary}
              fontFamily={fontBody}
              letterSpacing={2}
              lineHeight={1.8}
            />
          </div>

          {/* 荘厳な紫グロー */}
          <GlowEffect
            color={COLORS.purple}
            pulseSpeed={2}
            intensity={0.3}
            mode="edge"
          />
        </AbsoluteFill>
      </Sequence>

      {/* セクション4: オモイデ降臨 (350〜450f) */}
      <Sequence from={350} durationInFrames={100} premountFor={20}>
        <AbsoluteFill
          style={{
            background: "#050510",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* 虹色の光が増幅 */}
          {(() => {
            const localFrame = Math.max(0, frame - 350);
            const lightIntensity = interpolate(localFrame, [0, 80], [0, 1], {
              extrapolateRight: "clamp",
              easing: Easing.in(Easing.quad),
            });

            return (
              <>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(ellipse at center,
                      ${TYPE_HEX.fairy}${Math.round(lightIntensity * 40).toString(16).padStart(2, "0")} 0%,
                      ${TYPE_HEX.psychic}${Math.round(lightIntensity * 20).toString(16).padStart(2, "0")} 40%,
                      transparent 70%)`,
                  }}
                />

                <div
                  style={{
                    transform: `scale(${spring({ frame: localFrame, fps, config: { damping: 12 } })})`,
                  }}
                >
                  <PixelSprite
                    speciesId="omoide"
                    types={["psychic", "fairy"]}
                    size={350}
                    glowColor={TYPE_HEX.fairy}
                    glowIntensity={20}
                    opacity={lightIntensity}
                  />
                </div>

                {/* 虹色パーティクル */}
                <Particles
                  count={40}
                  color={TYPE_HEX.fairy}
                  baseSize={4}
                  mode="rise"
                  opacity={lightIntensity * 0.7}
                  seed={99}
                />
                <Particles
                  count={20}
                  color={TYPE_HEX.psychic}
                  baseSize={3}
                  mode="rise"
                  opacity={lightIntensity * 0.5}
                  seed={77}
                />

                {/* ホワイトアウト */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "#FFFFFF",
                    opacity: interpolate(localFrame, [80, 100], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                  }}
                />
              </>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      <WhiteFlash startFrame={110} duration={5} />
    </AbsoluteFill>
  );
};
