"use client";

/**
 * 経験値バー（BW風）
 * 青いグラデーションバー、HPバーより細い
 */

export interface ExpBarProps {
  percent: number;
  className?: string;
  showLabel?: boolean;
  expToNext?: number;
}

export function ExpBar({ percent, className = "w-32", showLabel = false, expToNext }: ExpBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <span className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-[10px] font-bold text-[#3b82f6]">
          EXP
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full border border-[#533483]/50 bg-[#1a1a2e]">
          <div
            className="exp-bar h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${clamped}%` }}
          />
        </div>
      </div>
      {showLabel && expToNext !== undefined && (
        <div className="mt-0.5 text-right font-[family-name:var(--font-dotgothic)] text-[10px] text-gray-400">
          つぎのLv.まで <span className="text-gray-300">{expToNext}</span>
        </div>
      )}
    </div>
  );
}
