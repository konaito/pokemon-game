/**
 * ACT 3: 冒険のモンタージュ (0:35〜0:50 / 450フレーム)
 * ジムリーダー紹介 → 進化シーケンス → バトルシーン
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
import { FlashCut } from "../components/FlashCut";
import { PixelSprite } from "../components/PixelSprite";
import { HPExpPanel } from "../components/HPExpPanel";
import { Particles } from "../components/Particles";
import { WhiteFlash, Vignette } from "../components/GlowEffect";
import { COLORS, TYPE_HEX } from "../styles";
import { fontBody, fontTitle } from "../fonts";

const GYM_LEADERS = [
  { name: "マサキ", type: "normal" },
  { name: "カイコ", type: "bug" },
  { name: "ライゾウ", type: "electric" },
  { name: "カガリ", type: "fire" },
  { name: "？？？", type: "dragon" },
];

const EVOLUTION_LINE = [
  { id: "himori", name: "ヒモリ", types: ["fire"] },
  { id: "hinomori", name: "ヒノモリ", types: ["fire"] },
  { id: "enjuu", name: "エンジュウ", types: ["fire", "fighting"] },
];

/** ジムリーダーシルエットカード */
const GymLeaderCard: React.FC<{
  name: string;
  type: string;
}> = ({ name, type }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const color = TYPE_HEX[type] ?? "#A8A878";

  const entrance = spring({ frame, fps, config: { damping: 15 } });
  const nameOpacity = interpolate(frame, [10, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, #0a0a1a 0%, ${color}30 50%, #0a0a1a 100%)`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* タイプ色の縦線アクセント */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 0,
          width: 4,
          height: `${entrance * 100}%`,
          backgroundColor: color,
          boxShadow: `0 0 20px ${color}`,
        }}
      />

      {/* シルエット円 */}
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: "50%",
          backgroundColor: `${color}20`,
          border: `3px solid ${color}60`,
          transform: `scale(${entrance})`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 80,
            height: 120,
            backgroundColor: `${color}40`,
            borderRadius: "40px 40px 20px 20px",
          }}
        />
      </div>

      {/* 名前 */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          opacity: nameOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: name === "？？？" ? 60 : 64,
            fontWeight: 900,
            color,
            fontFamily: fontBody,
            letterSpacing: 8,
            textShadow: `0 0 30px ${color}80`,
          }}
        >
          {name}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Adventure: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const fadeOut = interpolate(frame, [420, 450], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a1a", opacity: fadeOut }}>
      {/* セクション1: ジムリーダーフラッシュ (0〜125f) */}
      <Sequence durationInFrames={125} premountFor={15}>
        <FlashCut interval={25}>
          {GYM_LEADERS.map((leader) => (
            <GymLeaderCard
              key={leader.name + leader.type}
              name={leader.name}
              type={leader.type}
            />
          ))}
        </FlashCut>
      </Sequence>

      {/* セクション2: 進化シーケンス (125〜340f) */}
      <Sequence from={125} durationInFrames={215} premountFor={20}>
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, #0a0a1a, ${TYPE_HEX.fire}20)`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {EVOLUTION_LINE.map((mon, i) => {
            const localFrame = frame - 125;
            const stageStart = i * 65;
            const stageFrame = Math.max(0, localFrame - stageStart);
            const isActive =
              localFrame >= stageStart &&
              (i === EVOLUTION_LINE.length - 1 || localFrame < (i + 1) * 65);

            const entrance = spring({
              frame: stageFrame,
              fps,
              config: { damping: 10 },
            });

            // 進化フラッシュ
            const showFlash = stageFrame >= 0 && stageFrame < 5 && i > 0;

            return (
              <div
                key={mon.id}
                style={{
                  position: "absolute",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 20,
                  transform: `scale(${isActive ? entrance : 0})`,
                  opacity: isActive ? 1 : 0,
                }}
              >
                <PixelSprite
                  speciesId={mon.id}
                  types={[...mon.types]}
                  size={280}
                  glowColor={TYPE_HEX.fire}
                  glowIntensity={isActive ? 15 : 0}
                />
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 900,
                    color: TYPE_HEX.fire,
                    fontFamily: fontBody,
                    letterSpacing: 4,
                    textAlign: "center",
                    textShadow: `0 0 20px ${TYPE_HEX.fire}80`,
                  }}
                >
                  {mon.name}
                </div>
                {i < EVOLUTION_LINE.length - 1 && (
                  <div
                    style={{
                      fontSize: 20,
                      color: COLORS.textMuted,
                      fontFamily: fontBody,
                      textAlign: "center",
                    }}
                  >
                    ▼
                  </div>
                )}
              </div>
            );
          })}

          {/* 進化の光パーティクル */}
          <Particles
            count={30}
            color={TYPE_HEX.fire}
            baseSize={4}
            mode="rise"
            opacity={0.6}
            seed={55}
          />
        </AbsoluteFill>

        {/* 進化時の白フラッシュ */}
        <WhiteFlash startFrame={0} duration={6} />
        <WhiteFlash startFrame={65} duration={6} />
        <WhiteFlash startFrame={130} duration={6} />
      </Sequence>

      {/* セクション3: バトルシーン風カット (340〜450f) */}
      <Sequence from={340} durationInFrames={110} premountFor={15}>
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, #1a1a3e, ${COLORS.bg})`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 120px",
          }}
        >
          {/* 敵パネル（左上） */}
          <div style={{ position: "absolute", top: 80, left: 80 }}>
            <HPExpPanel
              monsterName="カエンジシ"
              level={32}
              hpRatio={1}
              expPercent={0}
              hpDrain={{
                startFrame: 340 + 30,
                endFrame: 340 + 70,
                targetRatio: 0.35,
              }}
              isEnemy
            />
          </div>

          {/* 味方パネル（右下） */}
          <div style={{ position: "absolute", bottom: 120, right: 80 }}>
            <HPExpPanel
              monsterName="エンジュウ"
              level={36}
              hpRatio={0.8}
              expPercent={45}
              expGain={{
                startFrame: 340 + 70,
                endFrame: 340 + 100,
                targetPercent: 85,
              }}
            />
          </div>

          {/* 敵スプライト */}
          <div style={{ position: "absolute", top: 200, right: 300 }}>
            <PixelSprite
              speciesId="kaenjishi"
              types={["fire"]}
              size={220}
              flip
            />
          </div>

          {/* 味方スプライト */}
          <div style={{ position: "absolute", bottom: 260, left: 200 }}>
            <PixelSprite
              speciesId="enjuu"
              types={["fire", "fighting"]}
              size={220}
            />
          </div>

          {/* ダメージシェイクは interpolate で */}
          {(() => {
            const localFrame = frame - 340;
            const shakeActive = localFrame >= 30 && localFrame < 40;
            if (shakeActive) {
              const shakeX = Math.sin(localFrame * 8) * 8;
              return (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    transform: `translateX(${shakeX}px)`,
                  }}
                />
              );
            }
            return null;
          })()}
        </AbsoluteFill>
      </Sequence>

      <Vignette intensity={0.4} />
    </AbsoluteFill>
  );
};
