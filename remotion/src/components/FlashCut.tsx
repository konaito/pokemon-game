/**
 * FlashCut — 高速カット演出
 * 子コンポーネントを指定フレーム間隔で切り替え + 白フラッシュ
 */
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

export type FlashCutProps = {
  /** 各カットの表示フレーム数 */
  interval: number;
  /** 白フラッシュのフレーム数 */
  flashFrames?: number;
  children: React.ReactNode[];
};

export const FlashCut: React.FC<FlashCutProps> = ({ interval, flashFrames = 3, children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const totalItems = children.length;
  if (totalItems === 0) return null;

  const currentIndex = Math.min(Math.floor(frame / interval), totalItems - 1);

  // カット切り替わり直後のフレーム
  const frameInCut = frame - currentIndex * interval;
  const flashOpacity =
    frameInCut < flashFrames
      ? interpolate(frameInCut, [0, flashFrames], [0.9, 0], {
          extrapolateRight: "clamp",
        })
      : 0;

  return (
    <div style={{ position: "relative", width, height }}>
      <div style={{ position: "absolute", inset: 0 }}>{children[currentIndex]}</div>
      {/* 白フラッシュオーバーレイ */}
      {flashOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#FFFFFF",
            opacity: flashOpacity,
          }}
        />
      )}
    </div>
  );
};
