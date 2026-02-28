/**
 * GlowEffect — グロー・発光・ビネット
 */
import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

export type GlowEffectProps = {
  color: string;
  /** パルス（脈動）の速度。0で固定グロー */
  pulseSpeed?: number;
  intensity?: number;
  /** "radial"=中央放射, "edge"=端発光, "fullscreen"=全画面 */
  mode?: "radial" | "edge" | "fullscreen";
  children?: React.ReactNode;
};

export const GlowEffect: React.FC<GlowEffectProps> = ({
  color,
  pulseSpeed = 0,
  intensity = 0.5,
  mode = "radial",
  children,
}) => {
  const frame = useCurrentFrame();

  const pulse =
    pulseSpeed > 0 ? intensity * (0.6 + 0.4 * Math.sin(frame * pulseSpeed * 0.1)) : intensity;

  let background: string;
  switch (mode) {
    case "radial":
      background = `radial-gradient(ellipse at center, ${color}${Math.round(pulse * 255)
        .toString(16)
        .padStart(2, "0")} 0%, transparent 70%)`;
      break;
    case "edge":
      background = `radial-gradient(ellipse at center, transparent 40%, ${color}${Math.round(
        pulse * 255,
      )
        .toString(16)
        .padStart(2, "0")} 100%)`;
      break;
    case "fullscreen":
      background = color;
      break;
  }

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background,
          opacity: mode === "fullscreen" ? pulse : 1,
        }}
      />
      {children}
    </div>
  );
};

/** シンプルなビネット（画面端を暗くする） */
export const Vignette: React.FC<{ intensity?: number }> = ({ intensity = 0.7 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${intensity}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/** 白フラッシュ全画面 */
export const WhiteFlash: React.FC<{
  startFrame: number;
  duration: number;
}> = ({ startFrame, duration }) => {
  const frame = useCurrentFrame();
  if (frame < startFrame || frame > startFrame + duration) return null;
  const opacity = interpolate(frame, [startFrame, startFrame + duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#FFFFFF",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};
