"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * テキストメッセージシステム (#81)
 * タイプライター演出、選択肢表示、ページ送り
 */

export interface MessageWindowProps {
  /** 表示するメッセージ（配列で複数ページ） */
  messages: string[];
  /** 全メッセージ表示完了時のコールバック */
  onComplete?: () => void;
  /** 1文字あたりの表示間隔（ms） */
  charDelay?: number;
  /** 選択肢（最後のメッセージの後に表示） */
  choices?: { label: string; value: string }[];
  /** 選択肢が選ばれた時のコールバック */
  onChoice?: (value: string) => void;
}

export function MessageWindow({
  messages,
  onComplete,
  charDelay = 30,
  choices,
  onChoice,
}: MessageWindowProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showChoices, setShowChoices] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(0);

  const currentMessage = messages[pageIndex] ?? "";
  const isLastPage = pageIndex >= messages.length - 1;

  // タイプライター効果
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
      // タイプ中にクリック→即時全文表示
      setDisplayedText(currentMessage);
      setIsTyping(false);
      if (isLastPage && choices && choices.length > 0) {
        setShowChoices(true);
      }
      return;
    }

    if (showChoices) return; // 選択肢表示中は進まない

    if (!isLastPage) {
      setPageIndex((prev) => prev + 1);
    } else {
      onComplete?.();
    }
  }, [isTyping, isLastPage, showChoices, currentMessage, choices, onComplete]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-2xl p-4"
      onKeyDown={handleKeyDown}
      onClick={handleAdvance}
      tabIndex={0}
      role="dialog"
      aria-label="メッセージウィンドウ"
    >
      <div className="rounded-lg border-4 border-white/30 bg-gray-900/95 p-4 shadow-lg">
        <p className="min-h-[3rem] font-mono text-lg leading-relaxed text-white">
          {displayedText}
          {isTyping && <span className="animate-pulse">▌</span>}
        </p>

        {!isTyping && !showChoices && (
          <div className="mt-2 flex justify-end">
            <span className="animate-bounce text-white">▼</span>
          </div>
        )}

        {showChoices && choices && (
          <div className="mt-3 space-y-1">
            {choices.map((choice, i) => (
              <button
                key={choice.value}
                className={`block w-full rounded px-3 py-1 text-left font-mono text-white transition-colors ${
                  i === selectedChoice ? "bg-white/20" : "bg-transparent hover:bg-white/10"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChoice?.(choice.value);
                }}
              >
                {i === selectedChoice ? "▶ " : "  "}
                {choice.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
