"use client";

/**
 * HPバー (#61)
 * HP残量に応じたグラデーション + シマーエフェクト
 */

export interface HpBarProps {
  current: number;
  max: number;
  className?: string;
  showNumbers?: boolean;
}

function getHpClass(ratio: number): string {
  if (ratio > 0.5) return "hp-bar-green";
  if (ratio > 0.2) return "hp-bar-yellow";
  return "hp-bar-red";
}

export function HpBar({ current, max, className = "w-32", showNumbers = true }: HpBarProps) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
  const percent = Math.round(ratio * 100);

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2">
        <span className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-[10px] font-bold text-[#e94560]">
          HP
        </span>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full border border-[#533483]/50 bg-[#1a1a2e]">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${getHpClass(ratio)}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      {showNumbers && (
        <div className="mt-0.5 text-right font-[family-name:var(--font-dotgothic)] text-[11px] text-gray-300">
          <span className="text-white">{current}</span>
          <span className="text-gray-500"> / {max}</span>
        </div>
      )}
    </div>
  );
}
