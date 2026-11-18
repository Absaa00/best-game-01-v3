// boot.js — wires Aurora Warden to the browser: input, loop, HUD, sound.
// SPDX-License-Identifier: MIT

import { createState, startGame, step } from './state.js';
import { draw } from './paint.js';
import { createFx, burst, floatText, updateFx } from './fx.js';
import {
  createTune, unlockAudio, playCatch, playGolden, playHit, playBlocked,
  playLevel, playDawn, playOver, playBrave,
} from './tune.js';
import { stageShot, shotTitle } from './stage-shot.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') || '7') || 7;

let best = 0;
try {
  best = Number(localStorage.getItem('aurora-warden-best') || '0') || 0;
} catch {
  best = 0;
}

let state = shot ? stageShot(shot, seed) : createState(seed);
if (shot) document.title = shotTitle(shot);
const fx = createFx();
const tune = createTune();
let paused = false;
const input = { left: false, right: false, mouseX: null };
let last = performance.now();

function saveBest() {
  if (state.score > best) {
    best = state.score;
    try {
      localStorage.setItem('aurora-warden-best', String(best));
    } catch {
      /* storage unavailable */
    }
  }
}

function drainEvents() {
  for (const ev of state.events) {
    if (ev.type === 'catch') {
      burst(fx, ev.x, ev.y, '#7fe7ff');
      floatText(fx, ev.x, ev.y - 14, `+${ev.points}`);
      playCatch(tune, ev.mult);
    } else if (ev.type === 'golden') {
      burst(fx, ev.x, ev.y, '#ffd65a', 22, 220);
      floatText(fx, ev.x, ev.y - 14, '+50 GOLD', '#ffd65a');
      playGolden(tune);
    } else if (ev.type === 'hit') {
      burst(fx, ev.x, ev.y, '#ff5d73', 20, 240);
      playHit(tune);
    } else if (ev.type === 'blocked') {
      burst(fx, ev.x, ev.y, '#6ff2ff', 16, 200);
      floatText(fx, ev.x, ev.y - 14, 'SHIELD!', '#6ff2ff');
      playBlocked(tune);
    } else if (ev.type === 'shield') {
      floatText(fx, ev.x, ev.y - 14, 'SHIELD UP', '#6ff2ff');
    } else if (ev.type === 'brave') {
      floatText(fx, ev.x, ev.y - 14, 'BRAVE +2', '#e8b4ff');
      playBrave(tune);
    } else if (ev.type === 'level') {
      floatText(fx, 640, 150, `LEVEL ${ev.level}`, '#ffd166');
      playLevel(tune);
    } else if (ev.type === 'dawn') {
      playDawn(tune);
    } else if (ev.type === 'over') {
      playOver(tune);
      saveBest();
    } else if (ev.type === 'victory') {
      saveBest();
    }
  }
  state.events.length = 0;
}

function restart() {
  state = startGame(state);
  paused = false;
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!shot && !paused) {
    step(state, dt, input);
    drainEvents();
    updateFx(fx, dt);
  } else if (shot) {
    updateFx(fx, 0);
  }
  draw(ctx, state, fx, best, paused);
  requestAnimationFrame(frame);
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') input.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') input.right = true;
  if (e.key === 'p' || e.key === 'P') paused = !paused;
  if (e.key === 'm' || e.key === 'M') tune.muted = !tune.muted;
  if (e.key === 'r' || e.key === 'R') restart();
  if (e.key === 'Enter' || e.key === ' ') {
    unlockAudio(tune);
    if (state.phase === 'title' || state.phase === 'victory' || state.phase === 'over') restart();
  }
});
window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') input.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') input.right = false;
});

function pointerX(e) {
  const r = canvas.getBoundingClientRect();
  return ((e.clientX - r.left) / r.width) * 1280;
}
canvas.addEventListener('mousemove', (e) => {
  input.mouseX = pointerX(e);
});
canvas.addEventListener('mousedown', (e) => {
  unlockAudio(tune);
  input.mouseX = pointerX(e);
  if (state.phase === 'title' || state.phase === 'victory' || state.phase === 'over') restart();
});

if (shot) {
  // staged frame: one deterministic step for ambient motion, then paint once
  if (shot === 'play') {
    drainEvents();
    floatText(fx, 560, 296, '+30');
    floatText(fx, 700, 226, '+20');
    floatText(fx, 820, 146, '+50 GOLD', '#ffd65a');
  }
  draw(ctx, state, fx, best, false);
} else {
  requestAnimationFrame(frame);
}
