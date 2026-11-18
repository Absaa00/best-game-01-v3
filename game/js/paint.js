// paint.js — all canvas drawing for Aurora Warden. Art is code, no images.
// SPDX-License-Identifier: MIT

import { W, H, PLAYER_Y } from './state.js';
import { STAGES, GOAL } from './stages.js';
import { makeRng, range } from './seed.js';
import { drawFx } from './fx.js';

const stars = (() => {
  const rng = makeRng(1234);
  const out = [];
  for (let i = 0; i < 120; i++) {
    out.push({ x: range(rng, 0, W), y: range(rng, 0, 300), r: range(rng, 0.6, 2.1), p: range(rng, 0, 6.28) });
  }
  return out;
})();

function sky(ctx, st, t, dawnK) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, st.skyTop);
  g.addColorStop(0.55, st.skyMid);
  g.addColorStop(1, st.skyLow);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  if (dawnK > 0) {
    const d = ctx.createLinearGradient(0, 0, 0, H);
    d.addColorStop(0, `rgba(255, 122, 61, ${0.55 * dawnK})`);
    d.addColorStop(0.6, `rgba(255, 178, 102, ${0.4 * dawnK})`);
    d.addColorStop(1, `rgba(255, 214, 140, ${0.3 * dawnK})`);
    ctx.fillStyle = d;
    ctx.fillRect(0, 0, W, H);
  }
  // stars
  for (const s of stars) {
    const tw = 0.45 + 0.55 * Math.abs(Math.sin(t * 0.9 + s.p));
    ctx.globalAlpha = tw * (1 - dawnK * 0.85);
    ctx.fillStyle = '#dfe8ff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, 6.283);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // moon
  ctx.fillStyle = '#f4ead0';
  ctx.beginPath();
  ctx.arc(1120, 74, 34, 0, 6.283);
  ctx.fill();
  ctx.fillStyle = st.skyTop;
  ctx.beginPath();
  ctx.arc(1132, 66, 30, 0, 6.283);
  ctx.fill();
  // aurora ribbons
  ctx.save();
  ctx.globalAlpha = 0.5;
  st.aurora.forEach((color, i) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 26 - i * 8;
    ctx.beginPath();
    for (let x = -20; x <= W + 20; x += 40) {
      const y = 60 + i * 46 + Math.sin(x / 260 + t * 0.5 + i * 2) * 26;
      if (x === -20) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
  ctx.restore();
  // hills
  ctx.fillStyle = '#0b1026';
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 396 + Math.sin(x / 300) * 16);
  ctx.lineTo(W, H);
  ctx.fill();
  ctx.fillStyle = '#070a1a';
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 436 + Math.sin(x / 210 + 2) * 12);
  ctx.lineTo(W, H);
  ctx.fill();
}

function drawMote(ctx, m, t) {
  const gold = m.kind === 'golden';
  const r = gold ? 13 : 9;
  const pulse = 1 + 0.18 * Math.sin(t * 6 + m.sway);
  const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, r * 3);
  glow.addColorStop(0, gold ? 'rgba(255, 214, 90, 0.9)' : 'rgba(120, 235, 255, 0.85)');
  glow.addColorStop(1, 'rgba(120, 235, 255, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(m.x, m.y, r * 3, 0, 6.283);
  ctx.fill();
  ctx.save();
  ctx.translate(m.x, m.y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = gold ? '#ffd65a' : '#aef3ff';
  const s = r * pulse;
  ctx.fillRect(-s / 1.4, -s / 1.4, s * 1.4, s * 1.4);
  ctx.restore();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(m.x, m.y, r * 0.32, 0, 6.283);
  ctx.fill();
}

function drawWisp(ctx, w, t) {
  const bob = Math.sin(t * 3 + w.phase) * 3;
  const y = w.y + bob;
  ctx.save();
  ctx.translate(w.x, y);
  const body = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
  body.addColorStop(0, '#3a2a6e');
  body.addColorStop(1, 'rgba(20, 10, 50, 0.15)');
  ctx.fillStyle = body;
  ctx.beginPath();
  if (w.kind === 'dart') {
    ctx.moveTo(0, -24);
    ctx.lineTo(15, 6);
    ctx.lineTo(0, 18);
    ctx.lineTo(-15, 6);
    ctx.closePath();
  } else if (w.kind === 'weaver') {
    ctx.ellipse(0, 0, 22, 13, Math.sin(t * 6 + w.phase) * 0.4, 0, 6.283);
  } else {
    ctx.arc(0, 0, 18, 0, 6.283);
  }
  ctx.fill();
  ctx.fillStyle = w.kind === 'dart' ? '#ff5d73' : '#e8b4ff';
  ctx.beginPath();
  ctx.arc(-6, -3, 2.6, 0, 6.283);
  ctx.arc(6, -3, 2.6, 0, 6.283);
  ctx.fill();
  ctx.restore();
}

function drawOrb(ctx, o, t) {
  const pulse = 1 + 0.15 * Math.sin(t * 5);
  ctx.strokeStyle = '#6ff2ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(o.x, o.y, 16 * pulse, 0, 6.283);
  ctx.stroke();
  ctx.fillStyle = '#d9fbff';
  ctx.beginPath();
  ctx.arc(o.x, o.y, 6, 0, 6.283);
  ctx.fill();
}

function drawPlayer(ctx, s) {
  const p = s.player;
  if (s.invuln > 0 && Math.floor(s.time * 12) % 2 === 0 && s.phase === 'playing') return;
  const flick = 1 + 0.12 * Math.sin(s.time * 9) + 0.06 * Math.sin(s.time * 23);
  ctx.save();
  ctx.translate(p.x, PLAYER_Y);
  // cloak
  ctx.fillStyle = '#1d2f57';
  ctx.beginPath();
  ctx.moveTo(0, -34);
  ctx.lineTo(-17, 12);
  ctx.lineTo(17, 12);
  ctx.closePath();
  ctx.fill();
  // hood
  ctx.fillStyle = '#274b7a';
  ctx.beginPath();
  ctx.arc(0, -30, 11, 0, 6.283);
  ctx.fill();
  // lantern glow + lamp
  const glow = ctx.createRadialGradient(0, -8, 2, 0, -8, 46 * flick);
  glow.addColorStop(0, 'rgba(255, 214, 120, 0.85)');
  glow.addColorStop(1, 'rgba(255, 214, 120, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, -8, 46 * flick, 0, 6.283);
  ctx.fill();
  ctx.fillStyle = '#3a2a12';
  ctx.fillRect(-3, -26, 6, 6);
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(0, -14, 7 * flick, 0, 6.283);
  ctx.fill();
  ctx.restore();
  if (s.shield) {
    ctx.strokeStyle = 'rgba(111, 242, 255, 0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, PLAYER_Y - 12, 34 + Math.sin(s.time * 4) * 2, 0, 6.283);
    ctx.stroke();
  }
}

function hearts(ctx, n) {
  for (let i = 0; i < 3; i++) {
    const x = 26 + i * 30;
    const y = 30;
    ctx.fillStyle = i < n ? '#ff5d73' : 'rgba(255, 93, 115, 0.25)';
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.bezierCurveTo(x - 10, y - 2, x - 5, y - 10, x, y - 4);
    ctx.bezierCurveTo(x + 5, y - 10, x + 10, y - 2, x, y + 8);
    ctx.fill();
  }
}

function hud(ctx, s, best) {
  ctx.textAlign = 'left';
  ctx.font = 'bold 19px system-ui, sans-serif';
  ctx.fillStyle = '#eaf2ff';
  ctx.fillText(`SCORE ${s.score}`, 20, 66);
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillStyle = '#9fb4dd';
  ctx.fillText(`BEST ${Math.max(best, s.score)}`, 20, 88);
  hearts(ctx, s.hearts);
  // dawn meter
  const mw = 260;
  const mx = W / 2 - mw / 2;
  ctx.fillStyle = 'rgba(10, 16, 48, 0.7)';
  ctx.fillRect(mx - 2, 18, mw + 4, 22);
  ctx.fillStyle = '#2c4a7a';
  ctx.fillRect(mx, 20, mw, 18);
  const fill = Math.min(1, s.caught / GOAL);
  const grad = ctx.createLinearGradient(mx, 0, mx + mw, 0);
  grad.addColorStop(0, '#37b6ff');
  grad.addColorStop(1, '#ffd166');
  ctx.fillStyle = grad;
  ctx.fillRect(mx, 20, mw * fill, 18);
  ctx.textAlign = 'center';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`DAWN ${s.caught}/${GOAL}`, W / 2, 33);
  // level + combo, right side
  ctx.textAlign = 'right';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.fillStyle = '#eaf2ff';
  ctx.fillText(`LEVEL ${s.level + 1} · ${STAGES[s.level].name.toUpperCase()}`, W - 20, 34);
  if (s.mult >= 2 && s.phase === 'playing') {
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillStyle = '#ffd65a';
    ctx.fillText(`COMBO ×${s.mult}`, W - 20, 62);
  }
  if (s.shield) {
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillStyle = '#6ff2ff';
    ctx.fillText('SHIELD READY', W - 20, 86);
  }
}

function panel(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(6, 10, 30, 0.72)';
  const w = 640;
  const h = 92 + lines.length * 30;
  ctx.fillRect(W / 2 - w / 2, 96, w, h);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(W / 2 - w / 2, 96, w, h);
  ctx.textAlign = 'center';
  ctx.font = 'bold 40px system-ui, sans-serif';
  ctx.fillStyle = accent;
  ctx.fillText(title, W / 2, 150);
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillStyle = '#eaf2ff';
  lines.forEach((ln, i) => ctx.fillText(ln, W / 2, 190 + i * 30));
}

export function draw(ctx, s, fx, best, paused) {
  const st = STAGES[s.level];
  const dawnK = s.phase === 'dawn' ? 1 - s.dawnTimer / 2.4 : s.phase === 'victory' ? 1 : 0;
  ctx.save();
  if (s.shake > 0) {
    const m = s.shake * 7;
    ctx.translate(Math.sin(s.time * 71) * m, Math.cos(s.time * 57) * m);
  }
  sky(ctx, st, s.time, dawnK);
  for (const o of s.orbs) drawOrb(ctx, o, s.time);
  for (const m of s.motes) drawMote(ctx, m, s.time);
  for (const w of s.wisps) drawWisp(ctx, w, s.time);
  if (s.phase !== 'title') drawPlayer(ctx, s);
  drawFx(ctx, fx);
  ctx.restore();

  hud(ctx, s, best);

  if (s.phase === 'title') {
    panel(ctx, 'AURORA WARDEN', [
      'Catch 60 aurora sparks before dawn breaks.',
      'Dodge the shade wisps — 3 hits and the night keeps you.',
      'Gold sparks heal. Shield orbs block one hit. Near misses earn BRAVE +2.',
      `BEST ${best}`,
      '← → or mouse to move · Click / Enter to start · P pause · M mute · R restart',
    ], '#7fe7ff');
  } else if (s.phase === 'dawn') {
    panel(ctx, 'DAWN BREAKS!', [`${s.caught}/${GOAL} sparks gathered — the sky is turning gold.`], '#ffd166');
  } else if (s.phase === 'victory') {
    panel(ctx, 'DAWN IS YOURS!', [
      `Score ${s.score} · Best ${Math.max(best, s.score)} · Max combo ×${s.maxCombo}`,
      `Sparks ${s.caught}/${GOAL} · Golden ${s.stats.golden} · Near misses ${s.stats.nearMiss}`,
      `Hits taken ${s.stats.hits} · Shield blocks ${s.stats.blocked} · Level ${s.level + 1} ${STAGES[s.level].name}`,
      'Press R or click to play again.',
    ], '#ffd166');
  } else if (s.phase === 'over') {
    panel(ctx, 'THE NIGHT KEEPS YOU', [
      `Score ${s.score} · Sparks ${s.caught}/${GOAL} · Best ${Math.max(best, s.score)}`,
      'Press R or click to try again.',
    ], '#ff5d73');
  } else if (paused) {
    panel(ctx, 'PAUSED', ['Press P to resume.'], '#9fb4dd');
  }
}
