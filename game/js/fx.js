// fx.js — particles and floating score text. Visual only; never rules.
// SPDX-License-Identifier: MIT

export function createFx() {
  return { parts: [], texts: [] };
}

export function burst(fx, x, y, color, n = 14, speed = 170) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.35;
    const v = speed * (0.4 + ((i * 37) % 10) / 14);
    fx.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: 0.7, color });
  }
}

export function floatText(fx, x, y, str, color = '#ffe9a8') {
  fx.texts.push({ x, y, str, color, life: 1.1 });
}

export function updateFx(fx, dt) {
  for (const p of fx.parts) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 260 * dt;
    p.life -= dt;
  }
  fx.parts = fx.parts.filter((p) => p.life > 0);
  for (const t of fx.texts) {
    t.y -= 42 * dt;
    t.life -= dt;
  }
  fx.texts = fx.texts.filter((t) => t.life > 0);
}

export function drawFx(ctx, fx) {
  for (const p of fx.parts) {
    ctx.globalAlpha = Math.max(0, p.life / 0.7);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  ctx.font = 'bold 20px system-ui, sans-serif';
  for (const t of fx.texts) {
    ctx.globalAlpha = Math.max(0, Math.min(1, t.life));
    ctx.fillStyle = t.color;
    ctx.fillText(t.str, t.x, t.y);
  }
  ctx.globalAlpha = 1;
}
