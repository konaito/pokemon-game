"use client";

import { useCallback, useRef } from "react";
import type { Direction } from "@/engine/map/player-movement";

/**
 * バーチャルパッド (#147)
 * タッチデバイス用の方向パッド + A/B/メニューボタン
 */

export interface VirtualPadProps {
  onDirection: (direction: Direction) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onMenu: () => void;
  disabled?: boolean;
}

/** D-Pad方向ボタン */
function DPad({
  onDirection,
  disabled,
}: {
  onDirection: (d: Direction) => void;
  disabled?: boolean;
}) {
  const repeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRepeat = useCallback(
    (dir: Direction) => {
      if (disabled) return;
      onDirection(dir);
      repeatRef.current = setInterval(() => onDirection(dir), 200);
    },
    [onDirection, disabled],
  );

  const stopRepeat = useCallback(() => {
    if (repeatRef.current) {
      clearInterval(repeatRef.current);
      repeatRef.current = null;
    }
  }, []);

  const btnClass =
    "flex items-center justify-center bg-[#16213e]/90 border border-[#533483]/50 active:bg-[#533483]/60 transition-colors select-none touch-none";

  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-0.5" style={{ width: 96, height: 96 }}>
      <div />
      <button
        className={`${btnClass} rounded-t-lg`}
        onTouchStart={() => startRepeat("up")}
        onTouchEnd={stopRepeat}
        onTouchCancel={stopRepeat}
        onMouseDown={() => startRepeat("up")}
        onMouseUp={stopRepeat}
        onMouseLeave={stopRepeat}
        aria-label="上に移動"
      >
        <span className="text-sm text-white/80">▲</span>
      </button>
      <div />
      <button
        className={`${btnClass} rounded-l-lg`}
        onTouchStart={() => startRepeat("left")}
        onTouchEnd={stopRepeat}
        onTouchCancel={stopRepeat}
        onMouseDown={() => startRepeat("left")}
        onMouseUp={stopRepeat}
        onMouseLeave={stopRepeat}
        aria-label="左に移動"
      >
        <span className="text-sm text-white/80">◀</span>
      </button>
      <div className="flex items-center justify-center rounded bg-[#0f3460]/60 border border-[#533483]/30">
        <span className="text-[8px] text-gray-600">+</span>
      </div>
      <button
        className={`${btnClass} rounded-r-lg`}
        onTouchStart={() => startRepeat("right")}
        onTouchEnd={stopRepeat}
        onTouchCancel={stopRepeat}
        onMouseDown={() => startRepeat("right")}
        onMouseUp={stopRepeat}
        onMouseLeave={stopRepeat}
        aria-label="右に移動"
      >
        <span className="text-sm text-white/80">▶</span>
      </button>
      <div />
      <button
        className={`${btnClass} rounded-b-lg`}
        onTouchStart={() => startRepeat("down")}
        onTouchEnd={stopRepeat}
        onTouchCancel={stopRepeat}
        onMouseDown={() => startRepeat("down")}
        onMouseUp={stopRepeat}
        onMouseLeave={stopRepeat}
        aria-label="下に移動"
      >
        <span className="text-sm text-white/80">▼</span>
      </button>
      <div />
    </div>
  );
}

/** アクションボタン（A/B） */
function ActionButtons({
  onConfirm,
  onCancel,
  disabled,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
}) {
  const baseClass =
    "flex items-center justify-center rounded-full border-2 select-none touch-none transition-colors font-[family-name:var(--font-pressstart)] text-xs";

  return (
    <div className="flex items-end gap-2">
      <button
        className={`${baseClass} h-10 w-10 border-[#533483]/60 bg-[#533483]/40 text-gray-400 active:bg-[#533483]/80`}
        onClick={() => !disabled && onCancel()}
        aria-label="キャンセル (B)"
      >
        B
      </button>
      <button
        className={`${baseClass} h-12 w-12 border-[#e94560]/60 bg-[#e94560]/40 text-white active:bg-[#e94560]/80`}
        onClick={() => !disabled && onConfirm()}
        aria-label="決定 (A)"
      >
        A
      </button>
    </div>
  );
}

export function VirtualPad({
  onDirection,
  onConfirm,
  onCancel,
  onMenu,
  disabled = false,
}: VirtualPadProps) {
  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 flex items-end justify-between px-3 pb-3 sm:hidden">
      {/* 左: 方向パッド */}
      <DPad onDirection={onDirection} disabled={disabled} />

      {/* 右: A/Bボタン + メニュー */}
      <div className="flex flex-col items-end gap-2">
        <button
          className="flex h-7 items-center rounded-full border border-[#533483]/40 bg-[#16213e]/80 px-3 font-[family-name:var(--font-dotgothic)] text-[10px] text-gray-400 active:bg-[#533483]/60 select-none touch-none"
          onClick={() => !disabled && onMenu()}
          aria-label="メニューを開く"
        >
          MENU
        </button>
        <ActionButtons onConfirm={onConfirm} onCancel={onCancel} disabled={disabled} />
      </div>
    </div>
  );
}
