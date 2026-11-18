// tune.js — procedural WebAudio for Aurora Warden. No audio files.
// SPDX-License-Identifier: MIT
// Every sound is an oscillator shaped in code: catch blips climb in pitch
// with the combo, gold chimes, hits thud, levels arpeggiate, dawn resolves.

export function createTune() {
  return { ctx: null, muted: false };
}

function ensure(t) {
  if (!t.ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      t.ctx = new AC();
    } catch {
      t.ctx = null;
    }
  }
  if (t.ctx && t.ctx.state === 'suspended') t.ctx.resume();
  return t.ctx;
}

function tone(t, freq, dur, kind, vol, when = 0, slide = 0) {
  if (t.muted) return;
  const ctx = ensure(t);
  if (!ctx) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = kind;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function unlockAudio(t) {
  ensure(t);
}

export function playCatch(t, mult) {
  const base = 520 + mult * 70;
  tone(t, base, 0.14, 'sine', 0.16);
  tone(t, base * 1.5, 0.1, 'triangle', 0.08, 0.03);
}

export function playGolden(t) {
  tone(t, 880, 0.22, 'sine', 0.18);
  tone(t, 1318, 0.3, 'sine', 0.14, 0.07);
  tone(t, 1760, 0.34, 'sine', 0.1, 0.14);
}

export function playHit(t) {
  tone(t, 140, 0.28, 'sawtooth', 0.2, 0, -70);
  tone(t, 70, 0.32, 'square', 0.12, 0, -20);
}

export function playBlocked(t) {
  tone(t, 660, 0.12, 'triangle', 0.14);
  tone(t, 440, 0.16, 'triangle', 0.12, 0.06);
}

export function playLevel(t) {
  [523, 659, 784, 1046].forEach((f, i) => tone(t, f, 0.16, 'triangle', 0.12, i * 0.07));
}

export function playDawn(t) {
  [392, 494, 587, 784, 988].forEach((f, i) => tone(t, f, 0.7, 'sine', 0.1, i * 0.12));
}

export function playOver(t) {
  [392, 330, 262, 196].forEach((f, i) => tone(t, f, 0.3, 'triangle', 0.12, i * 0.14));
}

export function playBrave(t) {
  tone(t, 1200, 0.07, 'sine', 0.07);
}
