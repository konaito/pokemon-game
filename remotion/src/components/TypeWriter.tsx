/**
 * TypeWriter — タイプライター風テキスト表示
 * useCurrentFrame() ベース（CSS animation禁止）
 */
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export type TypeWriterProps = {
  text: string;
  /** 1文字あたりのフレーム数 */
  charFrames?: number;
  /** 開始フレーム（Sequence内でのローカル） */
  startFrame?: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  showCursor?: boolean;
  textAlign?: React.CSSProperties["textAlign"];
  letterSpacing?: number;
  lineHeight?: number;
};

export const TypeWriter: React.FC<TypeWriterProps> = ({
  text,
  charFrames = 3,
  startFrame = 0,
  fontSize = 48,
  color = "#FFFFFF",
  fontFamily,
  showCursor = true,
  textAlign = "center",
  letterSpacing = 2,
  lineHeight = 1.6,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const elapsed = Math.max(0, frame - startFrame);
  const typedLength = Math.min(text.length, Math.floor(elapsed / charFrames));
  const typedText = text.slice(0, typedLength);

  // カーソル点滅（16フレーム周期）
  const cursorOpacity = showCursor
    ? interpolate(frame % 16, [0, 8, 16], [1, 0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // テキスト完全表示後のフェードイン
  const isComplete = typedLength >= text.length;
  const textOpacity = interpolate(
    elapsed,
    [0, Math.max(1, startFrame > 0 ? fps * 0.3 : 1)],
    [0.8, 1],
    { extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        fontSize,
        color,
        fontFamily,
        textAlign,
        letterSpacing,
        lineHeight,
        opacity: textOpacity,
        whiteSpace: "pre-wrap",
      }}
    >
      <span>{typedText}</span>
      {!isComplete && showCursor && (
        <span style={{ opacity: cursorOpacity }}>▎</span>
      )}
    </div>
  );
};
