// stages.js — the six aurora phases of Aurora Warden.
// SPDX-License-Identifier: MIT
// Every 10 sparks the night deepens: new name, new sky, faster falls,
// more wisps, and a heavier wisp mix. Level 6 is the last hour before dawn.

export const GOAL = 60;
export const SPARKS_PER_STAGE = 10;

export const STAGES = [
  {
    name: 'First Light',
    skyTop: '#0a1030',
    skyMid: '#16224f',
    skyLow: '#2a3a6e',
    aurora: ['#3fe0a0', '#37b6ff'],
    moteSpeed: 92,
    moteEvery: 0.95,
    wispEvery: 2.9,
    wispSpeed: 62,
    mix: [0.72, 0.18, 0.10],
  },
  {
    name: 'Green Veil',
    skyTop: '#081226',
    skyMid: '#12294a',
    skyLow: '#1d4a55',
    aurora: ['#46f2a5', '#2fd6c8'],
    moteSpeed: 104,
    moteEvery: 0.85,
    wispEvery: 2.5,
    wispSpeed: 70,
    mix: [0.62, 0.23, 0.15],
  },
  {
    name: 'Violet Current',
    skyTop: '#120a2e',
    skyMid: '#241a55',
    skyLow: '#3a2a72',
    aurora: ['#b06bff', '#4fe3c1'],
    moteSpeed: 116,
    moteEvery: 0.76,
    wispEvery: 2.15,
    wispSpeed: 78,
    mix: [0.52, 0.28, 0.20],
  },
  {
    name: 'Crimson Rush',
    skyTop: '#1c0a24',
    skyMid: '#3a1440',
    skyLow: '#5e2247',
    aurora: ['#ff7a9e', '#c96bff'],
    moteSpeed: 128,
    moteEvery: 0.68,
    wispEvery: 1.85,
    wispSpeed: 87,
    mix: [0.44, 0.31, 0.25],
  },
  {
    name: 'Storm Veil',
    skyTop: '#0a0f22',
    skyMid: '#1c2140',
    skyLow: '#33284f',
    aurora: ['#5fe8ff', '#ff9d5c'],
    moteSpeed: 142,
    moteEvery: 0.60,
    wispEvery: 1.55,
    wispSpeed: 97,
    mix: [0.36, 0.34, 0.30],
  },
  {
    name: 'The Last Hour',
    skyTop: '#160a20',
    skyMid: '#2c1238',
    skyLow: '#4a1e40',
    aurora: ['#ffd166', '#ff6b9e'],
    moteSpeed: 156,
    moteEvery: 0.52,
    wispEvery: 1.30,
    wispSpeed: 108,
    mix: [0.30, 0.35, 0.35],
  },
];

export function stageFor(caught) {
  const idx = Math.min(STAGES.length - 1, Math.floor(caught / SPARKS_PER_STAGE));
  return { index: idx, def: STAGES[idx] };
}
