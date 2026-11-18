// seed.js — deterministic RNG for Aurora Warden.
// SPDX-License-Identifier: MIT
// A tiny mulberry32 generator: the whole game (spawns, stars, wisps) draws
// from streams seeded here, so a fixed seed replays the same game exactly.

export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick(rng, items, weights) {
  let total = 0;
  for (const w of weights) total += w;
  let roll = rng() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function range(rng, lo, hi) {
  return lo + rng() * (hi - lo);
}
