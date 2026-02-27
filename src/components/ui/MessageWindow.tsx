"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * メッセージウィンドウ (#81)
 * RPG風ウィンドウフレーム + タイプライター演出
 */

export interface MessageWindowProps {
  messages: string[];
  onComplete?: () => void;
  charDelay?: number;
  choices?: { label: string; value: string }[];
  onChoice?: (value: string) => void;
  speaker?: string;
}

export function MessageWindow({
  messages,
  onComplete,
  charDelay = 30,
  choices,
  onChoice,
  speaker,
}: MessageWindowProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showChoices, setShowChoices] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(0);

  const currentMessage = messages[pageIndex] ?? "";
  const isLastPage = pageIndex >= messages.length - 1;

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    setShowChoices(false);

    let charIndex = 0;
    const timer = setInterval(() => {
      charIndex++;
      if (charIndex >= currentMessage.length) {
        setDisplayedText(currentMessage);
        setIsTyping(false);
        clearInterval(timer);
        if (isLastPage && choices && choices.length > 0) {
          setShowChoices(true);
        }
      } else {
        setDisplayedText(currentMessage.slice(0, charIndex));
      }
    }, charDelay);

    return () => clearInterval(timer);
  }, [pageIndex, currentMessage, charDelay, isLastPage, choices]);

  const handleAdvance = useCallback(() => {
    if (isTyping) {
      setDisplayedText(currentMessage);
      setIsTyping(false);
      if (isLastPage && choices && choices.length > 0) {
        setShowChoices(true);
      }
      return;
    }

    if (showChoices) return;

    if (!isLastPage) {
      setPageIndex((prev) => prev + 1);
    } else {
      onComplete?.();
    }
  }, [isTyping, isLastPage, showChoices, currentMessage, choices, onComplete]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter" || e.key === "z") {
        if (showChoices && choices) {
          onChoice?.(choices[selectedChoice].value);
          return;
        }
        handleAdvance();
      }
      if (showChoices && choices) {
        if (e.key === "ArrowUp" || e.key === "w") {
          setSelectedChoice((prev) => (prev - 1 + choices.length) % choices.length);
        }
        if (e.key === "ArrowDown" || e.key === "s") {
          setSelectedChoice((prev) => (prev + 1) % choices.length);
        }
      }
    },
    [showChoices, choices, selectedChoice, onChoice, handleAdvance],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-2xl p-3"
      onClick={handleAdvance}
      role="dialog"
      aria-label="メッセージウィンドウ"
    >
      {/* 話者名タグ */}
      {speaker && (
        <div className="animate-fade-in mb-[-1px] ml-3 inline-block rounded-t-md border-2 border-b-0 border-[#533483] bg-[#16213e] px-4 py-1">
          <span className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-sm text-[#e94560]">
            {speaker}
          </span>
        </div>
      )}

      {/* メインウィンドウ */}
      <div className="rpg-window animate-slide-up">
        <div className="rpg-window-inner">
          <p className="game-text-shadow min-h-[3.5rem] font-[family-name:var(--font-dotgothic)] text-lg leading-relaxed text-white">
            {displayedText}
            {isTyping && <span className="cursor-blink ml-0.5 text-[#e94560]">▌</span>}
          </p>

          {/* ページ送りインジケーター */}
          {!isTyping && !showChoices && (
            <div className="mt-1 flex justify-end">
              <span className="animate-bounce text-sm text-[#e94560]">▼</span>
            </div>
          )}

          {/* 選択肢 */}
          {showChoices && choices && (
            <div className="mt-3 space-y-1">
              {choices.map((choice, i) => (
                <button
                  key={choice.value}
                  className={`game-text-shadow block w-full rounded-md px-4 py-1.5 text-left font-[family-name:var(--font-dotgothic)] text-white transition-all ${
                    i === selectedChoice
                      ? "bg-white/15 shadow-[0_0_10px_rgba(233,69,96,0.15)]"
                      : "bg-transparent hover:bg-white/5"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChoice?.(choice.value);
                  }}
                >
                  <span
                    className="mr-2 inline-block text-[#e94560] transition-opacity"
                    style={{ opacity: i === selectedChoice ? 1 : 0 }}
                  >
                    ▶
                  </span>
                  {choice.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
