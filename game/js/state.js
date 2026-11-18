// state.js — the pure rules of Aurora Warden. No DOM, no Date, no Math.random.
// SPDX-License-Identifier: MIT
// Every decision the game makes lives here so Node can drive it headless:
// catch 60 aurora sparks before dawn, dodge the shade wisps, keep 3 hearts.

import { makeRng, pick, range } from './seed.js';
import { GOAL, stageFor } from './stages.js';

export const W = 1280;
export const H = 480;
export const PLAYER_Y = 418;
export const CATCH_R = 54;
export const HIT_R = 44;

export function createState(seed) {
  return {
    seed,
    rng: makeRng(seed),
    time: 0,
    phase: 'title', // title | playing | dawn | victory | over
    score: 0,
    caught: 0,
    combo: 0,
    maxCombo: 0,
    mult: 1,
    hearts: 3,
    shield: false,
    shieldAt: [], // caught-counts at which a shield orb already dropped
    level: 0,
    moteTimer: 0.4,
    wispTimer: 1.6,
    motes: [],
    wisps: [],
    orbs: [],
    player: { x: W / 2, tx: W / 2 },
    invuln: 0,
    shake: 0,
    dawnTimer: 0,
    stats: { nearMiss: 0, golden: 0, hits: 0, blocked: 0 },
    events: [], // drained by boot each frame: {type, ...}
  };
}

export function startGame(s) {
  const fresh = createState(s.seed);
  fresh.phase = 'playing';
  return fresh;
}

function stage(s) {
  return stageFor(s.caught).def;
}

function spawnMote(s) {
  const st = stage(s);
  const golden = s.rng() < 0.07;
  s.motes.push({
    x: range(s.rng, 50, W - 50),
    y: -18,
    vy: st.moteSpeed * range(s.rng, 0.9, 1.2),
    kind: golden ? 'golden' : 'spark',
    sway: range(s.rng, 0, Math.PI * 2),
    swayAmp: range(s.rng, 8, 26),
  });
}

function spawnWisp(s) {
  const st = stage(s);
  const kind = pick(s.rng, ['drifter', 'dart', 'weaver'], st.mix);
  s.wisps.push({
    kind,
    x: range(s.rng, 50, W - 50),
    y: -22,
    vy: st.wispSpeed * range(s.rng, 0.9, 1.25),
    phase: range(s.rng, 0, Math.PI * 2),
    grazed: false,
  });
}

function spawnOrb(s) {
  s.orbs.push({ x: range(s.rng, 90, W - 90), y: -18, vy: 74 });
}

export function placeMote(s, x, y, kind = 'spark') {
  s.motes.push({ x, y, vy: 100, kind, sway: 0, swayAmp: 0 });
  return s.motes[s.motes.length - 1];
}

export function placeWisp(s, kind, x, y) {
  s.wisps.push({ kind, x, y, vy: 80, phase: 0, grazed: false });
  return s.wisps[s.wisps.length - 1];
}

export function placeOrb(s, x, y) {
  s.orbs.push({ x, y, vy: 70 });
  return s.orbs[s.orbs.length - 1];
}

function catchMote(s, mote) {
  s.combo += 1;
  if (s.combo > s.maxCombo) s.maxCombo = s.combo;
  s.mult = Math.min(5, s.combo);
  if (mote.kind === 'golden') {
    s.score += 50;
    s.stats.golden += 1;
    if (s.hearts < 3) s.hearts += 1;
    s.events.push({ type: 'golden', x: mote.x, y: mote.y, points: 50 });
  } else {
    const pts = 10 * s.mult;
    s.score += pts;
    s.events.push({ type: 'catch', x: mote.x, y: mote.y, points: pts, mult: s.mult });
  }
  s.caught += 1;
  const lv = stageFor(s.caught).index;
  if (lv !== s.level) {
    s.level = lv;
    s.events.push({ type: 'level', level: lv + 1 });
  }
  if ((s.caught === 20 || s.caught === 40) && !s.shieldAt.includes(s.caught)) {
    s.shieldAt.push(s.caught);
    spawnOrb(s);
    s.events.push({ type: 'orb' });
  }
  if (s.caught >= GOAL) {
    s.phase = 'dawn';
    s.dawnTimer = 2.4;
    s.events.push({ type: 'dawn' });
  }
}

function takeHit(s, wisp) {
  s.stats.hits += 1;
  s.combo = 0;
  s.mult = 1;
  if (s.shield) {
    s.shield = false;
    s.stats.blocked += 1;
    s.invuln = 1.2;
    s.events.push({ type: 'blocked', x: wisp.x, y: wisp.y });
    return;
  }
  s.hearts -= 1;
  s.invuln = 1.5;
  s.shake = 1;
  s.events.push({ type: 'hit', x: wisp.x, y: wisp.y, hearts: s.hearts });
  if (s.hearts <= 0) {
    s.phase = 'over';
    s.events.push({ type: 'over' });
  }
}

export function step(s, dt, input) {
  s.time += dt;
  if (s.shake > 0) s.shake = Math.max(0, s.shake - dt * 2.2);
  if (s.invuln > 0) s.invuln -= dt;
  if (s.phase === 'dawn') {
    s.dawnTimer -= dt;
    if (s.dawnTimer <= 0) {
      s.phase = 'victory';
      s.events.push({ type: 'victory' });
    }
    return;
  }
  if (s.phase !== 'playing') return;

  const p = s.player;
  if (input.mouseX !== null && input.mouseX !== undefined) {
    p.tx = Math.max(36, Math.min(W - 36, input.mouseX));
    p.x += (p.tx - p.x) * Math.min(1, dt * 14);
  } else {
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    p.x = Math.max(36, Math.min(W - 36, p.x + dir * 520 * dt));
    p.tx = p.x;
  }

  const st = stage(s);
  s.moteTimer -= dt;
  if (s.moteTimer <= 0) {
    spawnMote(s);
    s.moteTimer = st.moteEvery * range(s.rng, 0.85, 1.15);
  }
  s.wispTimer -= dt;
  if (s.wispTimer <= 0) {
    spawnWisp(s);
    s.wispTimer = st.wispEvery * range(s.rng, 0.85, 1.15);
  }

  for (const m of s.motes) {
    m.y += m.vy * dt;
    m.x += Math.sin(s.time * 2 + m.sway) * m.swayAmp * dt;
  }
  for (const w of s.wisps) {
    w.y += w.vy * dt;
    if (w.kind === 'drifter') w.x += Math.sin(s.time * 1.6 + w.phase) * 46 * dt;
    if (w.kind === 'weaver') w.x += Math.sin(s.time * 5 + w.phase) * 150 * dt;
    if (w.kind === 'dart') w.x += Math.max(-90, Math.min(90, (p.x - w.x) * 0.9)) * dt;
    w.x = Math.max(18, Math.min(W - 18, w.x));
  }
  for (const o of s.orbs) o.y += o.vy * dt;

  // catches
  s.motes = s.motes.filter((m) => {
    const dx = m.x - p.x;
    const dy = m.y - PLAYER_Y;
    if (dx * dx + dy * dy < CATCH_R * CATCH_R) {
      catchMote(s, m);
      return false;
    }
    if (m.y > H + 24) {
      if (s.combo > 0) s.events.push({ type: 'miss' });
      s.combo = 0;
      s.mult = 1;
      return false;
    }
    return true;
  });

  // shield orbs
  s.orbs = s.orbs.filter((o) => {
    const dx = o.x - p.x;
    const dy = o.y - PLAYER_Y;
    if (dx * dx + dy * dy < CATCH_R * CATCH_R) {
      s.shield = true;
      s.events.push({ type: 'shield', x: o.x, y: o.y });
      return false;
    }
    return o.y <= H + 24;
  });

  // wisps: hits and near misses
  s.wisps = s.wisps.filter((w) => {
    const dx = w.x - p.x;
    const dy = w.y - PLAYER_Y;
    const hit = dx * dx + dy * dy < HIT_R * HIT_R;
    if (hit && s.invuln <= 0 && s.phase === 'playing') {
      takeHit(s, w);
      return false;
    }
    if (!w.grazed && w.y > PLAYER_Y + 26) {
      w.grazed = true;
      if (Math.abs(dx) < 110 && !hit) {
        s.stats.nearMiss += 1;
        s.score += 2;
        s.events.push({ type: 'brave', x: w.x, y: w.y });
      }
    }
    return w.y <= H + 30;
  });
}
