// Usage: GITHUB_TOKEN=$(gh auth token) node scripts/skins/gen.mjs [login] [outDir]
import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { loadData, avatarDataUri } from "./data.mjs";
import * as A from "./a.mjs";
import * as B from "./b.mjs";
import * as C from "./c.mjs";

const login = process.argv[2] || process.env.GITHUB_REPOSITORY_OWNER || "Rezwoan";
const out = process.argv[3] || "skins";
const SKINS = { "holo-card": A.holoCard, "signal-run": A.signalRun, "neon-skyline": B.neonSkyline, "code-pet": B.codePet, aquarium: B.aquarium, mixtape: B.mixtape, "bar-chart-race": B.barChartRace, "retro-tv": B.retroTv, arcade: C.arcade, "solar-system": C.solarSystem, "stock-ticker": C.stockTicker, "year-in-slides": C.yearInSlides, "living-scene": C.livingScene, "character-sheet": C.characterSheet, "repo-galaxy": C.repoGalaxy, "title-sequence": C.titleSequence, "game-of-life": C.gameOfLife };

const d = await loadData(login);
const ctx = { avatar: await avatarDataUri(d.avatarUrl) };
mkdirSync(out, { recursive: true });
let bad = 0;
for (const [name, fn] of Object.entries(SKINS)) {
  const file = `${out}/${name}.svg`;
  writeFileSync(file, fn(d, ctx));
  try { execFileSync("xmllint", ["--noout", file]); } catch { bad++; console.error("INVALID XML:", file); }
}
console.log(`${Object.keys(SKINS).length - bad}/${Object.keys(SKINS).length} skins written to ${out}/`);
process.exit(bad ? 1 : 0);
