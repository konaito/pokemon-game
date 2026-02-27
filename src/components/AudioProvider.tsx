"use client";

import { createContext, useContext, useEffect, useRef, useCallback } from "react";
import { createChiptuneEngine } from "@/engine/audio/chiptune-synth";

/**
 * オーディオプロバイダー (#75, #79)
 * チップチューンシンセサイザーをReactコンポーネントツリーに提供
 * ユーザー操作後にAudioContextを初期化する
 */

interface AudioContextValue {
  /** BGM再生 */
  playBgm: (trackId: string) => void;
  /** BGM停止 */
  stopBgm: () => void;
  /** BGMフェードアウト */
  fadeOutBgm: (durationMs?: number) => void;
  /** SE再生 */
  playSe: (seId: string) => void;
  /** BGM音量設定 (0-1) */
  setBgmVolume: (vol: number) => void;
  /** SE音量設定 (0-1) */
  setSeVolume: (vol: number) => void;
}

const AudioCtx = createContext<AudioContextValue>({
  playBgm: () => {},
  stopBgm: () => {},
  fadeOutBgm: () => {},
  playSe: () => {},
  setBgmVolume: () => {},
  setSeVolume: () => {},
});

export function useAudio(): AudioContextValue {
  return useContext(AudioCtx);
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const engineRef = useRef<ReturnType<typeof createChiptuneEngine> | null>(null);
  const initializedRef = useRef(false);

  // ユーザー操作でAudioContextを初期化
  useEffect(() => {
    function handleInteraction() {
      if (!initializedRef.current) {
        engineRef.current = createChiptuneEngine();
        engineRef.current.init();
        initializedRef.current = true;
      }
    }

    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      engineRef.current?.dispose();
    };
  }, []);

  const playBgm = useCallback((trackId: string) => {
    engineRef.current?.playBgm(trackId);
  }, []);

  const stopBgm = useCallback(() => {
    engineRef.current?.stopBgm();
  }, []);

  const fadeOutBgm = useCallback((durationMs: number = 500) => {
    engineRef.current?.fadeOut(durationMs);
  }, []);

  const playSe = useCallback((seId: string) => {
    engineRef.current?.playSe(seId);
  }, []);

  const setBgmVolume = useCallback((vol: number) => {
    engineRef.current?.setBgmVolume(vol);
  }, []);

  const setSeVolume = useCallback((vol: number) => {
    engineRef.current?.setSeVolume(vol);
  }, []);

  return (
    <AudioCtx.Provider value={{ playBgm, stopBgm, fadeOutBgm, playSe, setBgmVolume, setSeVolume }}>
      {children}
    </AudioCtx.Provider>
  );
}
