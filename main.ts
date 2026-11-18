// main.ts — the entrypoint of Aurora Warden.
// SPDX-License-Identifier: MIT
//
// It hands the game in: copies game/ and screenshots/ from this repository
// into the output directory and writes /output/dossier.json with
// buildDossier from vendor/makefun-game.ts, the kit's own library. Outside
// the grader, MAKEFUN_OUTPUT_DIR stands in for /output.
//
// The repository is located from this file's own URL, never from the
// working directory: the grader runs `node /bot/main.ts` with a working
// directory that is not /bot, and resolving game/ from process.cwd()
// fails there with ENOENT. import.meta.url always points at the checkout.

import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// Everything below stays inside outDir, which the grader owns and starts empty.
mkdirSync(outDir, { recursive: true });
for (const name of ['game', 'screenshots', 'dossier.json']) {
  rmSync(join(outDir, name), { recursive: true, force: true });
}
cpSync(join(repoDir, 'game'), join(outDir, 'game'), { recursive: true });
cpSync(join(repoDir, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`dossier.json written: ${dossier.length} bytes`);
