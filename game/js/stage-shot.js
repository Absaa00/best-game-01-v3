// stage-shot.js — deterministic staged states for the four screenshots.
// SPDX-License-Identifier: MIT
// ?shot=start|play|dawn|victory&seed=7 renders a real frame of the game's
// own code with a fixed seed, so each screenshot is reproducible.

import { createState, startGame, placeMote, placeWisp, placeOrb, step } from './state.js';

export function stageShot(shot, seed) {
  let s = createState(seed);
  if (shot === 'start') {
    s.phase = 'title';
    placeMote(s, 300, 150, 'spark');
    placeMote(s, 980, 110, 'golden');
    placeMote(s, 640, 90, 'spark');
    return s;
  }
  s = startGame(s);
  // freeze spawning so the frame is exactly what we place
  s.moteTimer = 999;
  s.wispTimer = 999;
  if (shot === 'play') {
    s.score = 480;
    s.caught = 23;
    s.level = 2;
    s.combo = 3;
    s.mult = 3;
    s.maxCombo = 4;
    s.player.x = 620;
    s.player.tx = 620;
    placeMote(s, 560, 330, 'spark');
    placeMote(s, 700, 260, 'spark');
    placeMote(s, 820, 180, 'golden');
    placeMote(s, 420, 200, 'spark');
    placeWisp(s, 'drifter', 480, 150);
    placeWisp(s, 'dart', 900, 120);
    placeWisp(s, 'weaver', 1080, 220);
    placeOrb(s, 760, 300);
    step(s, 0.05, { mouseX: null });
    return s;
  }
  if (shot === 'dawn') {
    s.score = 1240;
    s.caught = 60;
    s.level = 5;
    s.combo = 5;
    s.mult = 5;
    s.maxCombo = 9;
    s.phase = 'dawn';
    s.dawnTimer = 1.2;
    s.player.x = 640;
    placeMote(s, 500, 200, 'spark');
    placeMote(s, 780, 150, 'golden');
    return s;
  }
  // victory
  s.score = 1480;
  s.caught = 60;
  s.level = 5;
  s.combo = 5;
  s.mult = 5;
  s.maxCombo = 11;
  s.stats = { nearMiss: 6, golden: 4, hits: 1, blocked: 1 };
  s.phase = 'victory';
  s.player.x = 640;
  placeMote(s, 420, 160, 'spark');
  placeMote(s, 860, 140, 'golden');
  return s;
}

export function shotTitle(shot) {
  return `aurora-warden shot ${shot}`;
}
