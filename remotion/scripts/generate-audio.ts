#!/usr/bin/env bun
/**
 * BGM/SE WAVファイル生成スクリプト
 * ゲーム本体の chiptune-synth.ts の楽曲データから
 * オフラインで WAV を生成する
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// ─── 音階定義（chiptune-synth.ts から移植）─────────────────

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const NOTE_MAP: Record<string, number> = {
  C3: 48, "C#3": 49, D3: 50, "D#3": 51, E3: 52, F3: 53, "F#3": 54,
  G3: 55, "G#3": 56, A3: 57, "A#3": 58, B3: 59,
  C4: 60, "C#4": 61, D4: 62, "D#4": 63, E4: 64, F4: 65, "F#4": 66,
  G4: 67, "G#4": 68, A4: 69, "A#4": 70, B4: 71,
  C5: 72, "C#5": 73, D5: 74, "D#5": 75, E5: 76, F5: 77, "F#5": 78,
  G5: 79, "G#5": 80, A5: 81, "A#5": 82, B5: 83,
  C6: 84,
};

function noteToFreq(note: string): number {
  return midiToFreq(NOTE_MAP[note] ?? 60);
}

// ─── 型定義 ─────────────────

type ChipWave = "square" | "triangle" | "sawtooth" | "sine" | "noise";

interface ChipNote { note: string; duration: number; }
interface ChipChannel { wave: ChipWave; volume: number; notes: ChipNote[]; }
interface ChipTrack { bpm: number; channels: ChipChannel[]; }
interface ChipSeNote { freq: number; duration: number; wave: ChipWave; volume: number; slideTo?: number; }
interface ChipSeDefinition { notes: ChipSeNote[]; }

function n(note: string, duration: number = 2): ChipNote { return { note, duration }; }
function r(duration: number = 2): ChipNote { return { note: "_", duration }; }

// ─── BGM楽曲データ（chiptune-synth.ts から完全コピー）─────────────────

const BGM_TRACKS: Record<string, ChipTrack> = {
  title: {
    bpm: 100,
    channels: [
      { wave: "square", volume: 0.25, notes: [n("E4",4),n("G4",4),n("A4",4),n("B4",4),n("A4",4),n("G4",4),n("E4",8),n("D4",4),n("E4",4),n("G4",4),n("A4",4),n("G4",4),n("E4",4),n("D4",8),n("E4",4),n("G4",4),n("B4",4),n("C5",4),n("B4",4),n("A4",4),n("G4",8),n("A4",4),n("B4",4),n("A4",4),n("G4",4),n("E4",8),r(8)] },
      { wave: "triangle", volume: 0.3, notes: [n("E3",8),n("A3",8),n("D3",8),n("G3",8),n("E3",8),n("A3",8),n("C3",8),r(8)] },
    ],
  },
  "battle-wild": {
    bpm: 160,
    channels: [
      { wave: "square", volume: 0.22, notes: [n("E4",2),n("E4",1),r(1),n("E4",2),n("G4",2),n("A4",2),n("B4",2),n("A4",2),n("G4",2),n("E4",2),n("E4",1),r(1),n("E4",2),n("D4",2),n("E4",4),r(4),n("A4",2),n("A4",1),r(1),n("A4",2),n("B4",2),n("C5",2),n("B4",2),n("A4",2),n("G4",2),n("A4",2),n("G4",2),n("E4",2),n("D4",2),n("E4",4),r(4)] },
      { wave: "square", volume: 0.12, notes: [n("C4",2),n("C4",1),r(1),n("C4",2),n("E4",2),n("F4",2),n("G4",2),n("F4",2),n("E4",2),n("C4",2),n("C4",1),r(1),n("C4",2),n("B3",2),n("C4",4),r(4),n("F4",2),n("F4",1),r(1),n("F4",2),n("G4",2),n("A4",2),n("G4",2),n("F4",2),n("E4",2),n("F4",2),n("E4",2),n("C4",2),n("B3",2),n("C4",4),r(4)] },
      { wave: "triangle", volume: 0.3, notes: [n("A3",2),r(2),n("A3",2),r(2),n("F3",2),r(2),n("F3",2),r(2),n("A3",2),r(2),n("G3",2),r(2),n("A3",4),r(4),n("F3",2),r(2),n("F3",2),r(2),n("A3",2),r(2),n("A3",2),r(2),n("F3",2),r(2),n("G3",2),r(2),n("A3",4),r(4)] },
      { wave: "noise", volume: 0.08, notes: [r(2),n("C4",1),r(1),r(2),n("C4",1),r(1),r(2),n("C4",1),r(1),r(2),n("C4",1),r(1),r(2),n("C4",1),r(1),r(2),n("C4",1),r(1),r(2),n("C4",1),r(1),r(2),n("C4",1),r(1),r(2),n("C4",1),r(1),r(2),n("C4",1),r(1),r(2),n("C4",1),r(1),r(2),n("C4",1),r(1),r(2),n("C4",1),r(1),r(2),n("C4",1),r(1),r(2),n("C4",1),r(1),r(4)] },
    ],
  },
  "battle-gym": {
    bpm: 165,
    channels: [
      { wave: "square", volume: 0.22, notes: [n("E4",1),n("E4",1),n("G4",2),n("A4",1),n("A4",1),n("B4",2),n("C5",2),n("B4",2),n("A4",2),n("G4",2),n("E4",1),n("E4",1),n("G4",2),n("B4",1),n("B4",1),n("C5",2),n("D5",2),n("C5",2),n("B4",2),n("A4",2),n("G4",2),n("A4",2),n("B4",2),n("C5",2),n("D5",2),n("E5",2),n("D5",2),n("C5",2),n("B4",2),n("A4",2),n("G4",2),n("E4",2),n("D4",4),n("E4",4)] },
      { wave: "square", volume: 0.12, notes: [n("C4",1),n("C4",1),n("E4",2),n("F4",1),n("F4",1),n("G4",2),n("A4",2),n("G4",2),n("F4",2),n("E4",2),n("C4",1),n("C4",1),n("E4",2),n("G4",1),n("G4",1),n("A4",2),n("B4",2),n("A4",2),n("G4",2),n("F4",2),n("E4",2),n("F4",2),n("G4",2),n("A4",2),n("B4",2),n("C5",2),n("B4",2),n("A4",2),n("G4",2),n("F4",2),n("E4",2),n("C4",2),n("B3",4),n("C4",4)] },
      { wave: "triangle", volume: 0.3, notes: [n("A3",2),r(2),n("A3",2),r(2),n("A3",2),r(2),n("A3",2),r(2),n("A3",2),r(2),n("A3",2),r(2),n("B3",2),r(2),n("B3",2),r(2),n("C3",2),r(2),n("C3",2),r(2),n("D3",2),r(2),n("D3",2),r(2),n("E3",2),r(2),n("E3",2),r(2),n("G3",4),n("A3",4)] },
      { wave: "noise", volume: 0.06, notes: Array.from({length: 32}, () => [n("C4",1),r(1)]).flat().concat([n("C4",1),r(1)]) },
    ],
  },
  "battle-elite": {
    bpm: 170,
    channels: [
      { wave: "square", volume: 0.22, notes: [n("E4",2),n("G4",2),n("B4",2),n("E5",2),n("D5",2),n("B4",2),n("G4",2),n("B4",2),n("C5",2),n("E5",2),n("G5",2),n("E5",2),n("D5",4),n("C5",2),n("B4",2),n("A4",2),n("C5",2),n("E5",4),n("D5",2),n("C5",2),n("B4",2),n("A4",2),n("G4",2),n("A4",2),n("B4",2),n("C5",2),n("B4",4),n("E4",4)] },
      { wave: "triangle", volume: 0.3, notes: [n("E3",2),r(2),n("E3",2),r(2),n("G3",2),r(2),n("G3",2),r(2),n("A3",2),r(2),n("A3",2),r(2),n("B3",2),r(2),n("A3",2),n("G3",2),n("F3",2),r(2),n("A3",2),r(2),n("B3",2),r(2),n("A3",2),r(2),n("G3",2),r(2),n("F3",2),r(2),n("E3",4),n("E3",4)] },
    ],
  },
  evolution: {
    bpm: 110,
    channels: [
      { wave: "square", volume: 0.2, notes: [n("C4",4),n("D4",4),n("E4",4),n("F4",4),n("G4",4),n("A4",4),n("B4",4),n("C5",4),n("C5",2),n("E5",2),n("G5",4),n("E5",4),n("C5",8),r(8)] },
      { wave: "triangle", volume: 0.3, notes: [n("C3",8),n("F3",8),n("G3",8),n("C3",8),n("C3",4),n("E3",4),n("G3",4),n("C4",4),n("C3",8),r(8)] },
    ],
  },
  victory: {
    bpm: 140,
    channels: [
      { wave: "square", volume: 0.22, notes: [n("C5",2),n("E5",2),n("G5",4),n("C5",2),n("E5",2),n("G5",4),n("C5",2),n("D5",2),n("E5",2),n("F5",2),n("G5",8),n("A5",4),n("G5",2),n("F5",2),n("E5",4),n("D5",2),n("C5",2),n("D5",4),n("E5",4),n("C5",8)] },
      { wave: "triangle", volume: 0.3, notes: [n("C3",4),n("E3",4),n("C3",4),n("E3",4),n("C3",4),n("F3",4),n("G3",8),n("F3",4),n("E3",4),n("C3",4),n("A3",4),n("G3",4),n("G3",4),n("C3",8)] },
    ],
  },
};

// SE定義
const SE_DEFINITIONS: Record<string, ChipSeDefinition> = {
  "se-attack-normal": { notes: [{ freq: 600, duration: 0.06, wave: "square", volume: 0.4 },{ freq: 400, duration: 0.04, wave: "noise", volume: 0.3 }] },
  "se-attack-super": { notes: [{ freq: 800, duration: 0.05, wave: "square", volume: 0.5 },{ freq: 1000, duration: 0.05, wave: "square", volume: 0.4 },{ freq: 500, duration: 0.06, wave: "noise", volume: 0.3 }] },
  "se-damage": { notes: [{ freq: 100, duration: 0.08, wave: "noise", volume: 0.4 },{ freq: 80, duration: 0.06, wave: "noise", volume: 0.3 }] },
  "se-evolution": { notes: [{ freq: 400, duration: 0.1, wave: "sine", volume: 0.3, slideTo: 800 },{ freq: 800, duration: 0.15, wave: "sine", volume: 0.35, slideTo: 1200 }] },
  "se-encounter": { notes: [{ freq: 800, duration: 0.05, wave: "square", volume: 0.35 },{ freq: 600, duration: 0.05, wave: "square", volume: 0.3 },{ freq: 800, duration: 0.05, wave: "square", volume: 0.35 },{ freq: 1000, duration: 0.1, wave: "square", volume: 0.4 }] },
  "se-level-up": { notes: [{ freq: 523, duration: 0.08, wave: "square", volume: 0.3 },{ freq: 659, duration: 0.08, wave: "square", volume: 0.3 },{ freq: 784, duration: 0.08, wave: "square", volume: 0.3 },{ freq: 1047, duration: 0.15, wave: "square", volume: 0.35 }] },
  "se-confirm": { notes: [{ freq: 700, duration: 0.05, wave: "square", volume: 0.2 },{ freq: 900, duration: 0.05, wave: "square", volume: 0.25 }] },
};

// ─── レンダリングエンジン ─────────────────

const SAMPLE_RATE = 44100;

// seeded random for noise
let noiseSeed = 12345;
function seededNoise(): number {
  noiseSeed = (noiseSeed * 16807 + 0) % 2147483647;
  return ((noiseSeed - 1) / 2147483646) * 2 - 1;
}

function renderChannel(channel: ChipChannel, bpm: number): Float32Array {
  const sixteenthDuration = 60 / bpm / 4;
  let totalDuration = 0;
  for (const note of channel.notes) totalDuration += note.duration * sixteenthDuration;

  const bufferLength = Math.ceil(totalDuration * SAMPLE_RATE);
  const data = new Float32Array(bufferLength);

  let offset = 0;
  for (const note of channel.notes) {
    const noteDuration = note.duration * sixteenthDuration;
    const noteSamples = Math.floor(noteDuration * SAMPLE_RATE);

    if (note.note === "_") { offset += noteSamples; continue; }

    const freq = noteToFreq(note.note);
    const vol = channel.volume;

    for (let i = 0; i < noteSamples && offset + i < bufferLength; i++) {
      const t = i / SAMPLE_RATE;
      const phase = (t * freq) % 1;
      const attackEnd = Math.min(0.005, noteDuration * 0.1);
      const releaseStart = noteDuration - Math.min(0.02, noteDuration * 0.2);
      let envelope = 1;
      if (t < attackEnd) envelope = t / attackEnd;
      else if (t > releaseStart) envelope = (noteDuration - t) / (noteDuration - releaseStart);

      let sample = 0;
      switch (channel.wave) {
        case "square": sample = (phase < 0.5 ? 1 : -1) * 0.5; break;
        case "triangle": sample = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase; break;
        case "sawtooth": sample = (2 * phase - 1) * 0.4; break;
        case "sine": sample = Math.sin(2 * Math.PI * phase); break;
        case "noise": sample = seededNoise() * 0.3; break;
      }
      data[offset + i] = sample * vol * envelope;
    }
    offset += noteSamples;
  }
  return data;
}

function renderTrack(track: ChipTrack, loops: number = 1): Float32Array {
  const channelBuffers = track.channels.map(ch => renderChannel(ch, track.bpm));
  const maxLen = Math.max(...channelBuffers.map(b => b.length)) * loops;
  const mixed = new Float32Array(maxLen);

  for (const buf of channelBuffers) {
    for (let loop = 0; loop < loops; loop++) {
      const loopOffset = loop * buf.length;
      for (let i = 0; i < buf.length && loopOffset + i < maxLen; i++) {
        mixed[loopOffset + i] += buf[i];
      }
    }
  }
  return mixed;
}

function renderSe(seDef: ChipSeDefinition): Float32Array {
  let totalDuration = 0;
  for (const note of seDef.notes) totalDuration += note.duration;

  const bufferLength = Math.ceil(totalDuration * SAMPLE_RATE);
  const data = new Float32Array(bufferLength);
  let offset = 0;

  for (const seNote of seDef.notes) {
    const noteSamples = Math.ceil(seNote.duration * SAMPLE_RATE);
    for (let i = 0; i < noteSamples && offset + i < bufferLength; i++) {
      const t = i / SAMPLE_RATE;
      const progress = t / seNote.duration;

      let freq = seNote.freq;
      if (seNote.slideTo != null) {
        freq = seNote.freq + (seNote.slideTo - seNote.freq) * progress;
      }

      const phase = (t * freq) % 1;
      const envelope = Math.pow(1 - progress, 2);

      let sample = 0;
      switch (seNote.wave) {
        case "square": sample = phase < 0.5 ? 0.5 : -0.5; break;
        case "triangle": sample = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase; break;
        case "sine": sample = Math.sin(2 * Math.PI * freq * t); break;
        case "noise": sample = seededNoise() * 0.4; break;
        default: sample = (2 * phase - 1) * 0.4;
      }
      data[offset + i] = sample * seNote.volume * envelope;
    }
    offset += noteSamples;
  }
  return data;
}

// ─── WAV書き出し ─────────────────

function float32ToWav(samples: Float32Array, sampleRate: number): Buffer {
  const bytesPerSample = 2; // 16-bit PCM
  const dataLength = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataLength);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);

  // fmt subchunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);           // SubChunk1Size
  buffer.writeUInt16LE(1, 20);            // AudioFormat (PCM)
  buffer.writeUInt16LE(1, 22);            // NumChannels (mono)
  buffer.writeUInt32LE(sampleRate, 24);   // SampleRate
  buffer.writeUInt32LE(sampleRate * bytesPerSample, 28); // ByteRate
  buffer.writeUInt16LE(bytesPerSample, 32); // BlockAlign
  buffer.writeUInt16LE(16, 34);           // BitsPerSample

  // data subchunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);

  // Write samples
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const intSample = Math.round(clamped * 32767);
    buffer.writeInt16LE(intSample, 44 + i * bytesPerSample);
  }

  return buffer;
}

// ─── フェードイン/アウト適用 ─────────────────

function applyFade(samples: Float32Array, fadeInSec: number, fadeOutSec: number): Float32Array {
  const fadeInSamples = Math.floor(fadeInSec * SAMPLE_RATE);
  const fadeOutSamples = Math.floor(fadeOutSec * SAMPLE_RATE);

  for (let i = 0; i < fadeInSamples && i < samples.length; i++) {
    samples[i] *= i / fadeInSamples;
  }
  for (let i = 0; i < fadeOutSamples && samples.length - 1 - i >= 0; i++) {
    samples[samples.length - 1 - i] *= i / fadeOutSamples;
  }
  return samples;
}

// ─── ボリューム調整 ─────────────────

function applyVolume(samples: Float32Array, vol: number): Float32Array {
  for (let i = 0; i < samples.length; i++) samples[i] *= vol;
  return samples;
}

// ─── PV用BGMトラック合成 ─────────────────
// 90秒PV全体のBGMを1ファイルにミックスダウン

function generatePvBgm(): Float32Array {
  const totalSamples = 90 * SAMPLE_RATE; // 90秒
  const mixed = new Float32Array(totalSamples);

  /**
   * TransitionSeriesの実効タイミング
   * 各シーンはfadeトランジションでオーバーラップするため、
   * 実効開始フレームは「前シーンのduration - transitionDuration」ずつ加算される。
   *
   * ACT0: 0f     → 0.00s
   * ACT1: 195f   → 6.50s
   * ACT2: 570f   → 19.00s
   * ACT3: 1005f  → 33.50s
   * ACT4: 1440f  → 48.00s
   * ACT5: 1875f  → 62.50s
   * ACT6: 2315f  → 77.17s
   * End:  2700f  → 90.00s
   */

  // ACT0 (0-6.5s): 静寂 — タイトルBGMを極小音量で
  const titleBgm = renderTrack(BGM_TRACKS.title, 1);
  applyVolume(titleBgm, 0.15);
  applyFade(titleBgm, 1, 2);
  mixInto(mixed, titleBgm, 0, 6.5);

  // ACT1 (6.5-19s): タイトルBGM ゆっくり — 不気味さ
  const titleBgm2 = renderTrack(BGM_TRACKS.title, 3);
  applyVolume(titleBgm2, 0.3);
  applyFade(titleBgm2, 2, 2);
  mixInto(mixed, titleBgm2, 6.5, 19);

  // ACT2 (19-33.5s): 進化BGM — 希望の光
  const evoBgm = renderTrack(BGM_TRACKS.evolution, 3);
  applyVolume(evoBgm, 0.5);
  applyFade(evoBgm, 1, 1.5);
  mixInto(mixed, evoBgm, 19, 33.5);

  // ACT3 (33.5-48s): ジムバトルBGM — テンションアップ
  const gymBgm = renderTrack(BGM_TRACKS["battle-gym"], 4);
  applyVolume(gymBgm, 0.6);
  applyFade(gymBgm, 0.5, 1);
  mixInto(mixed, gymBgm, 33.5, 48);

  // ACT4 (48-62.5s): エリートBGM — 暗転・緊迫
  const eliteBgm = renderTrack(BGM_TRACKS["battle-elite"], 4);
  applyVolume(eliteBgm, 0.5);
  applyFade(eliteBgm, 1, 1.5);
  mixInto(mixed, eliteBgm, 48, 62.5);

  // ACT5 (62.5-77.2s): ワイルドバトルBGM — 最高潮
  const wildBgm = renderTrack(BGM_TRACKS["battle-wild"], 5);
  applyVolume(wildBgm, 0.7);
  applyFade(wildBgm, 0.3, 2);
  mixInto(mixed, wildBgm, 62.5, 77.2);

  // ACT6 (77.2-90s): 勝利→フェードアウト
  const vicBgm = renderTrack(BGM_TRACKS.victory, 3);
  applyVolume(vicBgm, 0.6);
  applyFade(vicBgm, 0.5, 3);
  mixInto(mixed, vicBgm, 77.2, 90);

  return mixed;
}

function mixInto(dest: Float32Array, src: Float32Array, startSec: number, endSec: number): void {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const endSample = Math.floor(endSec * SAMPLE_RATE);
  const length = endSample - startSample;

  for (let i = 0; i < length && i < src.length && startSample + i < dest.length; i++) {
    dest[startSample + i] += src[i];
  }
}

// ─── PV用SEトラック合成 ─────────────────

function generatePvSe(): Float32Array {
  const totalSamples = 90 * SAMPLE_RATE;
  const mixed = new Float32Array(totalSamples);

  /**
   * TransitionSeries実効タイミング基準でSEを配置
   *
   * ACT start offsets (seconds):
   *   ACT0: 0.00, ACT1: 6.50, ACT2: 19.00, ACT3: 33.50,
   *   ACT4: 48.00, ACT5: 62.50, ACT6: 77.17
   *
   * 各SE配置はACTローカルフレーム÷30fpsで算出
   */

  const ACT2 = 19.0;   // Encounter: 450f (15s)
  const ACT3 = 33.5;   // Adventure: 450f (15s)
  const ACT4 = 48.0;   // Darkness: 450f (15s)
  const ACT5 = 62.5;   // Climax: 450f (15s)
  const ACT6 = 77.17;  // TitleCall: 385f (12.8s)

  const confirmSe = renderSe(SE_DEFINITIONS["se-confirm"]);
  const encounterSe = renderSe(SE_DEFINITIONS["se-encounter"]);
  const evoSe = renderSe(SE_DEFINITIONS["se-evolution"]);
  const attackSe = renderSe(SE_DEFINITIONS["se-attack-super"]);
  const damageSe = renderSe(SE_DEFINITIONS["se-damage"]);
  const levelUpSe = renderSe(SE_DEFINITIONS["se-level-up"]);

  // ACT2: 御三家登場時の確認SE
  // Phase2 starts at local frame 60, starters appear at delays 0, 50, 100
  // Local frames: 60, 110, 160 → seconds: 2.0, 3.67, 5.33
  placeSe(mixed, confirmSe, ACT2 + 2.0, 0.8);
  placeSe(mixed, confirmSe, ACT2 + 3.67, 0.8);
  placeSe(mixed, confirmSe, ACT2 + 5.33, 0.8);

  // ACT3: ジムリーダーフラッシュ — エンカウント音
  // FlashCut interval=25, 5 leaders → local frames 0, 25, 50, 75, 100
  for (let i = 0; i < 5; i++) {
    placeSe(mixed, encounterSe, ACT3 + (i * 25) / 30, 0.6);
  }

  // ACT3: 進化SE
  // Phase2 starts at local frame 125, stages at 0, 65, 130
  // Local frames: 125, 190, 255 → seconds: 4.17, 6.33, 8.50
  placeSe(mixed, evoSe, ACT3 + 4.17, 0.9);
  placeSe(mixed, evoSe, ACT3 + 6.33, 0.9);
  placeSe(mixed, evoSe, ACT3 + 8.50, 1.0);

  // ACT3: バトルシーン 攻撃SE + ダメージSE
  // Phase3 starts at local frame 340, attack at +30 frames, damage at +35
  // Local frames: 370, 375 → seconds: 12.33, 12.50
  placeSe(mixed, attackSe, ACT3 + 12.33, 0.8);
  placeSe(mixed, damageSe, ACT3 + 12.50, 0.7);

  // ACT4: エンカウント音（暗転）— シーン開始直後
  // Local frame ~15 → 0.5s
  placeSe(mixed, encounterSe, ACT4 + 0.5, 0.7);

  // ACT5: 四天王フラッシュ — エンカウント音
  // Phase2 starts at local frame 110, FlashCut interval=30, 4 members
  // Local frames: 110, 140, 170, 200 → seconds: 3.67, 4.67, 5.67, 6.67
  for (let i = 0; i < 4; i++) {
    placeSe(mixed, encounterSe, ACT5 + 3.67 + i * 1.0, 0.7);
  }

  // ACT5: チャンピオン登場 — レベルアップ音
  // Phase3 starts at local frame 230, +20 for entrance
  // Local frame 250 → 8.33s
  placeSe(mixed, levelUpSe, ACT5 + 8.33, 0.9);

  // ACT6: タイトル表示 — 確認SE
  // Title appears at local frame ~80 → 2.67s
  placeSe(mixed, confirmSe, ACT6 + 2.67, 1.0);

  return mixed;
}

function placeSe(dest: Float32Array, se: Float32Array, timeSec: number, volume: number): void {
  const startSample = Math.floor(timeSec * SAMPLE_RATE);
  for (let i = 0; i < se.length && startSample + i < dest.length; i++) {
    dest[startSample + i] += se[i] * volume;
  }
}

// ─── メイン ─────────────────

console.log("=== Monster Chronicle PV Audio Generator ===");
console.log("");

const outDir = join(import.meta.dir, "..", "public", "audio");
mkdirSync(outDir, { recursive: true });

// BGM生成
console.log("Generating BGM...");
const bgmSamples = generatePvBgm();
const bgmWav = float32ToWav(bgmSamples, SAMPLE_RATE);
writeFileSync(join(outDir, "pv-bgm.wav"), bgmWav);
console.log(`  pv-bgm.wav (${(bgmWav.length / 1024 / 1024).toFixed(1)} MB, ${(bgmSamples.length / SAMPLE_RATE).toFixed(1)}s)`);

// SE生成
console.log("Generating SE...");
const seSamples = generatePvSe();
const seWav = float32ToWav(seSamples, SAMPLE_RATE);
writeFileSync(join(outDir, "pv-se.wav"), seWav);
console.log(`  pv-se.wav (${(seWav.length / 1024 / 1024).toFixed(1)} MB, ${(seSamples.length / SAMPLE_RATE).toFixed(1)}s)`);

console.log("");
console.log("Done! Audio files saved to public/audio/");
