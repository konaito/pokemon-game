/**
 * PV.tsx — メインPVコンポーネント
 * 全ACTをTransitionSeriesで統合（シーン間フェードトランジション付き）
 *
 * 合計: 2700フレーム = 90秒 @ 30fps
 * トランジション考慮: 各シーンの実効フレーム + オーバーラップ分
 */
import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

import { Prologue } from "./scenes/Prologue";
import { ForgottenWorld } from "./scenes/ForgottenWorld";
import { Encounter } from "./scenes/Encounter";
import { Adventure } from "./scenes/Adventure";
import { Darkness } from "./scenes/Darkness";
import { Climax } from "./scenes/Climax";
import { TitleCall } from "./scenes/TitleCall";

/**
 * シーン構成（トランジション込み）
 *
 * ACT0 Prologue:       210f
 * -- fade 15f --
 * ACT1 ForgottenWorld: 390f
 * -- fade 15f --
 * ACT2 Encounter:      450f
 * -- fade 15f --
 * ACT3 Adventure:      450f
 * -- fade 15f --
 * ACT4 Darkness:       450f
 * -- fade 15f --
 * ACT5 Climax:         450f
 * -- fade 10f --  (ホワイトアウト接続のため短め)
 * ACT6 TitleCall:      300f
 *
 * 合計: 210+390+450+450+450+450+300 = 2700
 * トランジション: -15*5 -10 = -85
 * 実効: 2700 - 85 = 2615f ≈ 87.2秒
 * → シーンを少し延長して90秒に合わせる
 *
 * 調整: ACT6を385fに延長 → 合計2785 - 85 = 2700f = 90秒
 */

const FADE_DURATION = 15;
const FADE_SHORT = 10;

export const PV: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* BGM — チップチューンシンセで生成した90秒トラック */}
      <Audio src={staticFile("audio/pv-bgm.wav")} volume={0.8} />
      {/* SE — タイミング同期済みの効果音トラック */}
      <Audio src={staticFile("audio/pv-se.wav")} volume={1.0} />

      <TransitionSeries>
        {/* ACT 0: プロローグ */}
        <TransitionSeries.Sequence durationInFrames={210}>
          <Prologue />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_DURATION })}
        />

        {/* ACT 1: 忘却の世界 */}
        <TransitionSeries.Sequence durationInFrames={390}>
          <ForgottenWorld />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_DURATION })}
        />

        {/* ACT 2: 出会い — 御三家 */}
        <TransitionSeries.Sequence durationInFrames={450}>
          <Encounter />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_DURATION })}
        />

        {/* ACT 3: 冒険のモンタージュ */}
        <TransitionSeries.Sequence durationInFrames={450}>
          <Adventure />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_DURATION })}
        />

        {/* ACT 4: 闇の勢力 */}
        <TransitionSeries.Sequence durationInFrames={450}>
          <Darkness />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_DURATION })}
        />

        {/* ACT 5: 対決と絆 */}
        <TransitionSeries.Sequence durationInFrames={450}>
          <Climax />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_SHORT })}
        />

        {/* ACT 6: タイトルコール（延長してぴったり90秒に） */}
        <TransitionSeries.Sequence durationInFrames={385}>
          <TitleCall />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
