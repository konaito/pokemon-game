"use client";

/**
 * HPバー (#61)
 * HP残量に応じて色が変化（緑→黄→赤）
 */

export interface HpBarProps {
  current: number;
  max: number;
  /** バーの幅クラス */
  className?: string;
}

function getHpColor(ratio: number): string {
  if (ratio > 0.5) return "bg-emerald-500";
  if (ratio > 0.2) return "bg-yellow-500";
  return "bg-red-500";
}

export function HpBar({ current, max, className = "w-32" }: HpBarProps) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
  const percent = Math.round(ratio * 100);

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-gray-400">HP</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-700">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getHpColor(ratio)}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <div className="mt-0.5 text-right font-mono text-xs text-gray-300">
        {current} / {max}
      </div>
    </div>
  );
}
