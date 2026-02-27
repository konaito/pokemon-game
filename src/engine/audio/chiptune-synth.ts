/**
 * チップチューンシンセサイザー (#75, #79)
 * Web Audio APIベースのレトロサウンド生成
 * 外部音声ファイル不要 - プロシージャル生成
 */

// ─── 音階定義 ─────────────────────────────

/** MIDI番号 → 周波数 */
function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** 音名→MIDI番号（C4 = 60） */
const NOTE_MAP: Record<string, number> = {
  C3: 48,
  "C#3": 49,
  D3: 50,
  "D#3": 51,
  E3: 52,
  F3: 53,
  "F#3": 54,
  G3: 55,
  "G#3": 56,
  A3: 57,
  "A#3": 58,
  B3: 59,
  C4: 60,
  "C#4": 61,
  D4: 62,
  "D#4": 63,
  E4: 64,
  F4: 65,
  "F#4": 66,
  G4: 67,
  "G#4": 68,
  A4: 69,
  "A#4": 70,
  B4: 71,
  C5: 72,
  "C#5": 73,
  D5: 74,
  "D#5": 75,
  E5: 76,
  F5: 77,
  "F#5": 78,
  G5: 79,
  "G#5": 80,
  A5: 81,
  "A#5": 82,
  B5: 83,
  C6: 84,
};

function noteToFreq(note: string): number {
  return midiToFreq(NOTE_MAP[note] ?? 60);
}

// ─── 波形タイプ ─────────────────────────────

type ChipWave = "square" | "triangle" | "sawtooth" | "sine" | "noise";

// ─── ノート定義 ─────────────────────────────

interface ChipNote {
  /** 音名（C4, D#5など）。"_" で休符 */
  note: string;
  /** 拍数（1 = 16分音符） */
  duration: number;
}

/** チャンネル定義 */
interface ChipChannel {
  wave: ChipWave;
  volume: number;
  notes: ChipNote[];
}

/** BGM楽曲定義 */
interface ChipTrack {
  /** BPM */
  bpm: number;
  /** チャンネル（最大4ch: melody, harmony, bass, noise） */
  channels: ChipChannel[];
}

// ─── SE定義 ─────────────────────────────

interface ChipSeNote {
  freq: number;
  duration: number; // seconds
  wave: ChipWave;
  volume: number;
  /** ピッチスライド先（Hz） */
  slideTo?: number;
}

interface ChipSeDefinition {
  notes: ChipSeNote[];
}

// ─── シンセサイザーエンジン ─────────────────────────────

/**
 * チップチューンオーディオエンジン
 * AudioContextを遅延生成し、BGM/SEをWeb Audio APIで再生
 */
export function createChiptuneEngine() {
  let ctx: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let bgmGain: GainNode | null = null;
  let seGain: GainNode | null = null;
  let currentBgmNodes: AudioBufferSourceNode[] = [];
  let bgmLoopTimer: ReturnType<typeof setTimeout> | null = null;
  let bgmVolume = 0.7;
  let seVolume = 0.8;

  function ensureContext(): AudioContext {
    if (!ctx || ctx.state === "closed") {
      ctx = new AudioContext();
      masterGain = ctx.createGain();
      masterGain.gain.value = 1.0;
      masterGain.connect(ctx.destination);

      bgmGain = ctx.createGain();
      bgmGain.gain.value = bgmVolume;
      bgmGain.connect(masterGain);

      seGain = ctx.createGain();
      seGain.gain.value = seVolume;
      seGain.connect(masterGain);
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  }

  /** チャンネルをAudioBufferに変換 */
  function renderChannel(audioCtx: AudioContext, channel: ChipChannel, bpm: number): AudioBuffer {
    const sixteenthDuration = 60 / bpm / 4; // 1/16拍の秒数
    let totalDuration = 0;
    for (const n of channel.notes) {
      totalDuration += n.duration * sixteenthDuration;
    }

    const sampleRate = audioCtx.sampleRate;
    const bufferLength = Math.ceil(totalDuration * sampleRate);
    const buffer = audioCtx.createBuffer(1, bufferLength, sampleRate);
    const data = buffer.getChannelData(0);

    let offset = 0;
    for (const n of channel.notes) {
      const noteDuration = n.duration * sixteenthDuration;
      const noteSamples = Math.floor(noteDuration * sampleRate);

      if (n.note === "_") {
        // 休符
        offset += noteSamples;
        continue;
      }

      const freq = noteToFreq(n.note);
      const vol = channel.volume;

      for (let i = 0; i < noteSamples && offset + i < bufferLength; i++) {
        const t = i / sampleRate;
        const phase = (t * freq) % 1;
        // エンベロープ: 短いアタック、サステイン、短いリリース
        const attackEnd = Math.min(0.005, noteDuration * 0.1);
        const releaseStart = noteDuration - Math.min(0.02, noteDuration * 0.2);
        let envelope = 1;
        if (t < attackEnd) envelope = t / attackEnd;
        else if (t > releaseStart) envelope = (noteDuration - t) / (noteDuration - releaseStart);

        let sample = 0;
        switch (channel.wave) {
          case "square":
            sample = phase < 0.5 ? 1 : -1;
            // 50% duty cycle の矩形波
            sample *= 0.5; // 音量調整
            break;
          case "triangle":
            sample = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
            break;
          case "sawtooth":
            sample = 2 * phase - 1;
            sample *= 0.4;
            break;
          case "sine":
            sample = Math.sin(2 * Math.PI * phase);
            break;
          case "noise":
            sample = Math.random() * 2 - 1;
            sample *= 0.3;
            break;
        }

        data[offset + i] = sample * vol * envelope;
      }
      offset += noteSamples;
    }

    return buffer;
  }

  /** BGM楽曲をレンダリングして再生 */
  function playBgm(trackId: string): void {
    const track = BGM_TRACKS[trackId];
    if (!track) return;

    stopBgm();
    const audioCtx = ensureContext();
    if (!bgmGain) return;

    const buffers = track.channels.map((ch) => renderChannel(audioCtx, ch, track.bpm));

    function startLoop() {
      const sources: AudioBufferSourceNode[] = [];
      for (const buf of buffers) {
        const source = audioCtx.createBufferSource();
        source.buffer = buf;
        source.connect(bgmGain!);
        source.start();
        sources.push(source);
      }
      currentBgmNodes = sources;

      // ループタイマー
      const loopDuration = buffers[0].duration * 1000;
      bgmLoopTimer = setTimeout(() => {
        startLoop();
      }, loopDuration - 50); // 少し早めに次を開始してギャップを防ぐ
    }

    startLoop();
  }

  /** BGM停止 */
  function stopBgm(): void {
    for (const node of currentBgmNodes) {
      try {
        node.stop();
      } catch {
        // already stopped
      }
    }
    currentBgmNodes = [];
    if (bgmLoopTimer) {
      clearTimeout(bgmLoopTimer);
      bgmLoopTimer = null;
    }
  }

  /** SE再生 */
  function playSe(seId: string): void {
    const seDef = SE_DEFINITIONS[seId];
    if (!seDef) return;

    const audioCtx = ensureContext();
    if (!seGain) return;

    for (const seNote of seDef.notes) {
      const sampleRate = audioCtx.sampleRate;
      const bufferLength = Math.ceil(seNote.duration * sampleRate);
      const buffer = audioCtx.createBuffer(1, bufferLength, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferLength; i++) {
        const t = i / sampleRate;
        const progress = t / seNote.duration;

        // ピッチスライド
        let freq = seNote.freq;
        if (seNote.slideTo != null) {
          freq = seNote.freq + (seNote.slideTo - seNote.freq) * progress;
        }

        const phase = (t * freq) % 1;
        // エンベロープ: 急速減衰
        const envelope = Math.pow(1 - progress, 2);

        let sample = 0;
        switch (seNote.wave) {
          case "square":
            sample = phase < 0.5 ? 0.5 : -0.5;
            break;
          case "triangle":
            sample = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
            break;
          case "sine":
            sample = Math.sin(2 * Math.PI * freq * t);
            break;
          case "noise":
            sample = (Math.random() * 2 - 1) * 0.4;
            break;
          default:
            sample = 2 * phase - 1;
            sample *= 0.4;
        }

        data[i] = sample * seNote.volume * envelope;
      }

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(seGain);
      source.start();
    }
  }

  return {
    playBgm,
    stopBgm,
    playSe,

    setBgmVolume(vol: number) {
      bgmVolume = Math.max(0, Math.min(1, vol));
      if (bgmGain) bgmGain.gain.value = bgmVolume;
    },

    setSeVolume(vol: number) {
      seVolume = Math.max(0, Math.min(1, vol));
      if (seGain) seGain.gain.value = seVolume;
    },

    /** フェードアウト */
    fadeOut(durationMs: number) {
      if (!bgmGain || !ctx) return;
      bgmGain.gain.linearRampToValueAtTime(0, ctx.currentTime + durationMs / 1000);
      setTimeout(() => {
        stopBgm();
        if (bgmGain) bgmGain.gain.value = bgmVolume;
      }, durationMs);
    },

    /** AudioContext初期化（ユーザー操作後に呼ぶ） */
    init() {
      ensureContext();
    },

    /** リソース解放 */
    dispose() {
      stopBgm();
      if (ctx && ctx.state !== "closed") {
        ctx.close();
      }
      ctx = null;
      masterGain = null;
      bgmGain = null;
      seGain = null;
    },
  };
}

// ─── BGM楽曲データ ─────────────────────────────

/** ヘルパー: 音符列を簡潔に記述 */
function n(note: string, duration: number = 2): ChipNote {
  return { note, duration };
}
function r(duration: number = 2): ChipNote {
  return { note: "_", duration };
}

const BGM_TRACKS: Record<string, ChipTrack> = {
  // タイトル画面: 壮大で神秘的
  title: {
    bpm: 100,
    channels: [
      {
        wave: "square",
        volume: 0.25,
        notes: [
          n("E4", 4),
          n("G4", 4),
          n("A4", 4),
          n("B4", 4),
          n("A4", 4),
          n("G4", 4),
          n("E4", 8),
          n("D4", 4),
          n("E4", 4),
          n("G4", 4),
          n("A4", 4),
          n("G4", 4),
          n("E4", 4),
          n("D4", 8),
          n("E4", 4),
          n("G4", 4),
          n("B4", 4),
          n("C5", 4),
          n("B4", 4),
          n("A4", 4),
          n("G4", 8),
          n("A4", 4),
          n("B4", 4),
          n("A4", 4),
          n("G4", 4),
          n("E4", 8),
          r(8),
        ],
      },
      {
        wave: "triangle",
        volume: 0.3,
        notes: [
          n("E3", 8),
          n("A3", 8),
          n("D3", 8),
          n("G3", 8),
          n("E3", 8),
          n("A3", 8),
          n("C3", 8),
          r(8),
        ],
      },
    ],
  },

  // フィールド（オーバーワールド）: 明るく冒険的
  "overworld-default": {
    bpm: 130,
    channels: [
      {
        wave: "square",
        volume: 0.2,
        notes: [
          n("C4", 2),
          n("E4", 2),
          n("G4", 2),
          n("E4", 2),
          n("A4", 4),
          n("G4", 2),
          n("E4", 2),
          n("F4", 2),
          n("A4", 2),
          n("G4", 2),
          n("F4", 2),
          n("E4", 4),
          n("D4", 4),
          n("C4", 2),
          n("E4", 2),
          n("G4", 2),
          n("C5", 2),
          n("B4", 4),
          n("A4", 2),
          n("G4", 2),
          n("A4", 2),
          n("G4", 2),
          n("F4", 2),
          n("E4", 2),
          n("D4", 2),
          n("E4", 2),
          n("C4", 4),
        ],
      },
      {
        wave: "square",
        volume: 0.12,
        notes: [
          n("E3", 2),
          n("G3", 2),
          n("C4", 2),
          n("G3", 2),
          n("C4", 4),
          n("B3", 2),
          n("G3", 2),
          n("A3", 2),
          n("C4", 2),
          n("B3", 2),
          n("A3", 2),
          n("G3", 4),
          n("F3", 4),
          n("E3", 2),
          n("G3", 2),
          n("C4", 2),
          n("E4", 2),
          n("D4", 4),
          n("C4", 2),
          n("B3", 2),
          n("C4", 2),
          n("B3", 2),
          n("A3", 2),
          n("G3", 2),
          n("F3", 2),
          n("G3", 2),
          n("E3", 4),
        ],
      },
      {
        wave: "triangle",
        volume: 0.3,
        notes: [
          n("C3", 4),
          n("C3", 4),
          n("A3", 4),
          n("A3", 4),
          n("F3", 4),
          n("F3", 4),
          n("G3", 4),
          n("G3", 4),
          n("C3", 4),
          n("C3", 4),
          n("A3", 4),
          n("A3", 4),
          n("F3", 4),
          n("G3", 4),
          n("C3", 4),
          r(4),
        ],
      },
    ],
  },

  // 野生バトル: テンション高い
  "battle-wild": {
    bpm: 160,
    channels: [
      {
        wave: "square",
        volume: 0.22,
        notes: [
          n("E4", 2),
          n("E4", 1),
          r(1),
          n("E4", 2),
          n("G4", 2),
          n("A4", 2),
          n("B4", 2),
          n("A4", 2),
          n("G4", 2),
          n("E4", 2),
          n("E4", 1),
          r(1),
          n("E4", 2),
          n("D4", 2),
          n("E4", 4),
          r(4),
          n("A4", 2),
          n("A4", 1),
          r(1),
          n("A4", 2),
          n("B4", 2),
          n("C5", 2),
          n("B4", 2),
          n("A4", 2),
          n("G4", 2),
          n("A4", 2),
          n("G4", 2),
          n("E4", 2),
          n("D4", 2),
          n("E4", 4),
          r(4),
        ],
      },
      {
        wave: "square",
        volume: 0.12,
        notes: [
          n("C4", 2),
          n("C4", 1),
          r(1),
          n("C4", 2),
          n("E4", 2),
          n("F4", 2),
          n("G4", 2),
          n("F4", 2),
          n("E4", 2),
          n("C4", 2),
          n("C4", 1),
          r(1),
          n("C4", 2),
          n("B3", 2),
          n("C4", 4),
          r(4),
          n("F4", 2),
          n("F4", 1),
          r(1),
          n("F4", 2),
          n("G4", 2),
          n("A4", 2),
          n("G4", 2),
          n("F4", 2),
          n("E4", 2),
          n("F4", 2),
          n("E4", 2),
          n("C4", 2),
          n("B3", 2),
          n("C4", 4),
          r(4),
        ],
      },
      {
        wave: "triangle",
        volume: 0.3,
        notes: [
          n("A3", 2),
          r(2),
          n("A3", 2),
          r(2),
          n("F3", 2),
          r(2),
          n("F3", 2),
          r(2),
          n("A3", 2),
          r(2),
          n("G3", 2),
          r(2),
          n("A3", 4),
          r(4),
          n("F3", 2),
          r(2),
          n("F3", 2),
          r(2),
          n("A3", 2),
          r(2),
          n("A3", 2),
          r(2),
          n("F3", 2),
          r(2),
          n("G3", 2),
          r(2),
          n("A3", 4),
          r(4),
        ],
      },
      {
        wave: "noise",
        volume: 0.08,
        notes: [
          r(2),
          n("C4", 1),
          r(1),
          r(2),
          n("C4", 1),
          r(1),
          r(2),
          n("C4", 1),
          r(1),
          r(2),
          n("C4", 1),
          r(1),
          r(2),
          n("C4", 1),
          r(1),
          r(2),
          n("C4", 1),
          r(1),
          r(2),
          n("C4", 1),
          r(1),
          r(2),
          n("C4", 1),
          r(1),
          r(2),
          n("C4", 1),
          r(1),
          r(2),
          n("C4", 1),
          r(1),
          r(2),
          n("C4", 1),
          r(1),
          r(2),
          n("C4", 1),
          r(1),
          r(2),
          n("C4", 1),
          r(1),
          r(2),
          n("C4", 1),
          r(1),
          r(2),
          n("C4", 1),
          r(1),
          r(4),
        ],
      },
    ],
  },

  // トレーナーバトル
  "battle-trainer": {
    bpm: 155,
    channels: [
      {
        wave: "square",
        volume: 0.22,
        notes: [
          n("D4", 2),
          n("F4", 2),
          n("A4", 2),
          n("D5", 2),
          n("C5", 2),
          n("A4", 2),
          n("F4", 2),
          n("A4", 2),
          n("G4", 2),
          n("B4", 2),
          n("D5", 2),
          n("B4", 2),
          n("A4", 4),
          n("G4", 2),
          r(2),
          n("F4", 2),
          n("A4", 2),
          n("C5", 2),
          n("F5", 2),
          n("E5", 2),
          n("C5", 2),
          n("A4", 2),
          n("C5", 2),
          n("B4", 2),
          n("A4", 2),
          n("G4", 2),
          n("F4", 2),
          n("E4", 4),
          n("D4", 2),
          r(2),
        ],
      },
      {
        wave: "triangle",
        volume: 0.3,
        notes: [
          n("D3", 4),
          n("D3", 4),
          n("G3", 4),
          n("G3", 4),
          n("F3", 4),
          n("F3", 4),
          n("G3", 4),
          n("A3", 2),
          r(2),
          n("D3", 4),
          n("D3", 4),
          n("G3", 4),
          n("G3", 4),
          n("F3", 4),
          n("F3", 4),
          n("A3", 4),
          n("D3", 2),
          r(2),
        ],
      },
    ],
  },

  // ジムリーダーバトル: 緊迫感
  "battle-gym": {
    bpm: 165,
    channels: [
      {
        wave: "square",
        volume: 0.22,
        notes: [
          n("E4", 1),
          n("E4", 1),
          n("G4", 2),
          n("A4", 1),
          n("A4", 1),
          n("B4", 2),
          n("C5", 2),
          n("B4", 2),
          n("A4", 2),
          n("G4", 2),
          n("E4", 1),
          n("E4", 1),
          n("G4", 2),
          n("B4", 1),
          n("B4", 1),
          n("C5", 2),
          n("D5", 2),
          n("C5", 2),
          n("B4", 2),
          n("A4", 2),
          n("G4", 2),
          n("A4", 2),
          n("B4", 2),
          n("C5", 2),
          n("D5", 2),
          n("E5", 2),
          n("D5", 2),
          n("C5", 2),
          n("B4", 2),
          n("A4", 2),
          n("G4", 2),
          n("E4", 2),
          n("D4", 4),
          n("E4", 4),
        ],
      },
      {
        wave: "square",
        volume: 0.12,
        notes: [
          n("C4", 1),
          n("C4", 1),
          n("E4", 2),
          n("F4", 1),
          n("F4", 1),
          n("G4", 2),
          n("A4", 2),
          n("G4", 2),
          n("F4", 2),
          n("E4", 2),
          n("C4", 1),
          n("C4", 1),
          n("E4", 2),
          n("G4", 1),
          n("G4", 1),
          n("A4", 2),
          n("B4", 2),
          n("A4", 2),
          n("G4", 2),
          n("F4", 2),
          n("E4", 2),
          n("F4", 2),
          n("G4", 2),
          n("A4", 2),
          n("B4", 2),
          n("C5", 2),
          n("B4", 2),
          n("A4", 2),
          n("G4", 2),
          n("F4", 2),
          n("E4", 2),
          n("C4", 2),
          n("B3", 4),
          n("C4", 4),
        ],
      },
      {
        wave: "triangle",
        volume: 0.3,
        notes: [
          n("A3", 2),
          r(2),
          n("A3", 2),
          r(2),
          n("A3", 2),
          r(2),
          n("A3", 2),
          r(2),
          n("A3", 2),
          r(2),
          n("A3", 2),
          r(2),
          n("B3", 2),
          r(2),
          n("B3", 2),
          r(2),
          n("C3", 2),
          r(2),
          n("C3", 2),
          r(2),
          n("D3", 2),
          r(2),
          n("D3", 2),
          r(2),
          n("E3", 2),
          r(2),
          n("E3", 2),
          r(2),
          n("G3", 4),
          n("A3", 4),
        ],
      },
      {
        wave: "noise",
        volume: 0.06,
        notes: [
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
          n("C4", 1),
          r(1),
        ],
      },
    ],
  },

  // 四天王バトル
  "battle-elite": {
    bpm: 170,
    channels: [
      {
        wave: "square",
        volume: 0.22,
        notes: [
          n("E4", 2),
          n("G4", 2),
          n("B4", 2),
          n("E5", 2),
          n("D5", 2),
          n("B4", 2),
          n("G4", 2),
          n("B4", 2),
          n("C5", 2),
          n("E5", 2),
          n("G5", 2),
          n("E5", 2),
          n("D5", 4),
          n("C5", 2),
          n("B4", 2),
          n("A4", 2),
          n("C5", 2),
          n("E5", 4),
          n("D5", 2),
          n("C5", 2),
          n("B4", 2),
          n("A4", 2),
          n("G4", 2),
          n("A4", 2),
          n("B4", 2),
          n("C5", 2),
          n("B4", 4),
          n("E4", 4),
        ],
      },
      {
        wave: "triangle",
        volume: 0.3,
        notes: [
          n("E3", 2),
          r(2),
          n("E3", 2),
          r(2),
          n("G3", 2),
          r(2),
          n("G3", 2),
          r(2),
          n("A3", 2),
          r(2),
          n("A3", 2),
          r(2),
          n("B3", 2),
          r(2),
          n("A3", 2),
          n("G3", 2),
          n("F3", 2),
          r(2),
          n("A3", 2),
          r(2),
          n("B3", 2),
          r(2),
          n("A3", 2),
          r(2),
          n("G3", 2),
          r(2),
          n("F3", 2),
          r(2),
          n("E3", 4),
          n("E3", 4),
        ],
      },
    ],
  },

  // 勝利ファンファーレ
  victory: {
    bpm: 140,
    channels: [
      {
        wave: "square",
        volume: 0.22,
        notes: [
          n("C5", 2),
          n("E5", 2),
          n("G5", 4),
          n("C5", 2),
          n("E5", 2),
          n("G5", 4),
          n("C5", 2),
          n("D5", 2),
          n("E5", 2),
          n("F5", 2),
          n("G5", 8),
          n("A5", 4),
          n("G5", 2),
          n("F5", 2),
          n("E5", 4),
          n("D5", 2),
          n("C5", 2),
          n("D5", 4),
          n("E5", 4),
          n("C5", 8),
        ],
      },
      {
        wave: "triangle",
        volume: 0.3,
        notes: [
          n("C3", 4),
          n("E3", 4),
          n("C3", 4),
          n("E3", 4),
          n("C3", 4),
          n("F3", 4),
          n("G3", 8),
          n("F3", 4),
          n("E3", 4),
          n("C3", 4),
          n("A3", 4),
          n("G3", 4),
          n("G3", 4),
          n("C3", 8),
        ],
      },
    ],
  },

  // 回復ジングル
  healing: {
    bpm: 120,
    channels: [
      {
        wave: "sine",
        volume: 0.3,
        notes: [
          n("C5", 2),
          n("E5", 2),
          n("G5", 2),
          n("C6", 4),
          n("B5", 2),
          n("G5", 2),
          n("E5", 2),
          n("C5", 4),
          n("D5", 2),
          n("F5", 2),
          n("A5", 2),
          n("C6", 4),
          n("C6", 8),
        ],
      },
      {
        wave: "triangle",
        volume: 0.25,
        notes: [
          n("C3", 4),
          n("G3", 4),
          n("C4", 4),
          n("G3", 4),
          n("C3", 4),
          r(4),
          n("F3", 4),
          n("A3", 4),
          n("C4", 4),
          n("C4", 8),
        ],
      },
    ],
  },

  // 進化
  evolution: {
    bpm: 110,
    channels: [
      {
        wave: "square",
        volume: 0.2,
        notes: [
          n("C4", 4),
          n("D4", 4),
          n("E4", 4),
          n("F4", 4),
          n("G4", 4),
          n("A4", 4),
          n("B4", 4),
          n("C5", 4),
          n("C5", 2),
          n("E5", 2),
          n("G5", 4),
          n("E5", 4),
          n("C5", 8),
          r(8),
        ],
      },
      {
        wave: "triangle",
        volume: 0.3,
        notes: [
          n("C3", 8),
          n("F3", 8),
          n("G3", 8),
          n("C3", 8),
          n("C3", 4),
          n("E3", 4),
          n("G3", 4),
          n("C4", 4),
          n("C3", 8),
          r(8),
        ],
      },
    ],
  },
};

// ─── SE音源データ ─────────────────────────────

const SE_DEFINITIONS: Record<string, ChipSeDefinition> = {
  // バトル系
  "se-attack-normal": {
    notes: [
      { freq: 600, duration: 0.06, wave: "square", volume: 0.4 },
      { freq: 400, duration: 0.04, wave: "noise", volume: 0.3 },
    ],
  },
  "se-attack-super": {
    notes: [
      { freq: 800, duration: 0.05, wave: "square", volume: 0.5 },
      { freq: 1000, duration: 0.05, wave: "square", volume: 0.4 },
      { freq: 500, duration: 0.06, wave: "noise", volume: 0.3 },
    ],
  },
  "se-attack-weak": {
    notes: [{ freq: 300, duration: 0.08, wave: "square", volume: 0.25 }],
  },
  "se-attack-miss": {
    notes: [{ freq: 200, duration: 0.15, wave: "sine", volume: 0.2, slideTo: 100 }],
  },
  "se-damage": {
    notes: [
      { freq: 100, duration: 0.08, wave: "noise", volume: 0.4 },
      { freq: 80, duration: 0.06, wave: "noise", volume: 0.3 },
    ],
  },
  "se-faint": {
    notes: [
      { freq: 400, duration: 0.15, wave: "square", volume: 0.3, slideTo: 80 },
      { freq: 200, duration: 0.2, wave: "sine", volume: 0.2, slideTo: 50 },
    ],
  },

  // 捕獲系
  "se-ball-throw": {
    notes: [{ freq: 300, duration: 0.08, wave: "sine", volume: 0.3, slideTo: 600 }],
  },
  "se-ball-shake": {
    notes: [
      { freq: 500, duration: 0.05, wave: "square", volume: 0.2 },
      { freq: 400, duration: 0.05, wave: "square", volume: 0.15 },
    ],
  },
  "se-catch-success": {
    notes: [
      { freq: 523, duration: 0.1, wave: "square", volume: 0.3 },
      { freq: 659, duration: 0.1, wave: "square", volume: 0.3 },
      { freq: 784, duration: 0.15, wave: "square", volume: 0.35 },
    ],
  },
  "se-catch-fail": {
    notes: [{ freq: 400, duration: 0.1, wave: "square", volume: 0.25, slideTo: 200 }],
  },

  // UI系
  "se-cursor-move": {
    notes: [{ freq: 800, duration: 0.03, wave: "square", volume: 0.15 }],
  },
  "se-confirm": {
    notes: [
      { freq: 700, duration: 0.05, wave: "square", volume: 0.2 },
      { freq: 900, duration: 0.05, wave: "square", volume: 0.25 },
    ],
  },
  "se-cancel": {
    notes: [
      { freq: 500, duration: 0.05, wave: "square", volume: 0.2 },
      { freq: 350, duration: 0.05, wave: "square", volume: 0.15 },
    ],
  },
  "se-menu-open": {
    notes: [
      { freq: 600, duration: 0.04, wave: "square", volume: 0.2 },
      { freq: 800, duration: 0.04, wave: "square", volume: 0.2 },
    ],
  },
  "se-menu-close": {
    notes: [
      { freq: 800, duration: 0.04, wave: "square", volume: 0.2 },
      { freq: 600, duration: 0.04, wave: "square", volume: 0.15 },
    ],
  },

  // システム系
  "se-level-up": {
    notes: [
      { freq: 523, duration: 0.08, wave: "square", volume: 0.3 },
      { freq: 659, duration: 0.08, wave: "square", volume: 0.3 },
      { freq: 784, duration: 0.08, wave: "square", volume: 0.3 },
      { freq: 1047, duration: 0.15, wave: "square", volume: 0.35 },
    ],
  },
  "se-evolution": {
    notes: [
      { freq: 400, duration: 0.1, wave: "sine", volume: 0.3, slideTo: 800 },
      { freq: 800, duration: 0.15, wave: "sine", volume: 0.35, slideTo: 1200 },
    ],
  },
  "se-heal": {
    notes: [
      { freq: 523, duration: 0.1, wave: "sine", volume: 0.25 },
      { freq: 659, duration: 0.1, wave: "sine", volume: 0.25 },
      { freq: 784, duration: 0.12, wave: "sine", volume: 0.3 },
    ],
  },
  "se-save": {
    notes: [
      { freq: 600, duration: 0.08, wave: "square", volume: 0.2 },
      { freq: 700, duration: 0.08, wave: "square", volume: 0.2 },
      { freq: 600, duration: 0.12, wave: "square", volume: 0.25 },
    ],
  },
  "se-badge-get": {
    notes: [
      { freq: 523, duration: 0.1, wave: "square", volume: 0.3 },
      { freq: 659, duration: 0.1, wave: "square", volume: 0.3 },
      { freq: 784, duration: 0.1, wave: "square", volume: 0.3 },
      { freq: 1047, duration: 0.2, wave: "square", volume: 0.4 },
    ],
  },
  "se-item-get": {
    notes: [
      { freq: 600, duration: 0.08, wave: "square", volume: 0.25 },
      { freq: 800, duration: 0.12, wave: "square", volume: 0.3 },
    ],
  },

  // フィールド系
  "se-door": {
    notes: [
      { freq: 200, duration: 0.1, wave: "noise", volume: 0.2 },
      { freq: 300, duration: 0.08, wave: "square", volume: 0.15 },
    ],
  },
  "se-collision": {
    notes: [{ freq: 100, duration: 0.06, wave: "noise", volume: 0.25 }],
  },
  "se-encounter": {
    notes: [
      { freq: 800, duration: 0.05, wave: "square", volume: 0.35 },
      { freq: 600, duration: 0.05, wave: "square", volume: 0.3 },
      { freq: 800, duration: 0.05, wave: "square", volume: 0.35 },
      { freq: 1000, duration: 0.1, wave: "square", volume: 0.4 },
    ],
  },
};

/** 利用可能なBGMトラックIDのリスト */
export const AVAILABLE_BGM_TRACKS = Object.keys(BGM_TRACKS);

/** 利用可能なSE IDのリスト */
export const AVAILABLE_SE_IDS = Object.keys(SE_DEFINITIONS);
