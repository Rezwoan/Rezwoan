// Usage: GITHUB_TOKEN=<token that sees private work> node scripts/skins/gen.mjs [login] [outDir]
import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { loadData, avatarDataUri } from "./data.mjs";
import * as K from "./cards.mjs";

const login = process.argv[2] || process.env.GITHUB_REPOSITORY_OWNER || "Rezwoan";
const out = process.argv[3] || "skins";
const CARDS = { hero: K.hero, about: K.about, stack: K.techStack, stats: K.stats, activity: K.activity, languages: K.languages, projects: K.projects, city: K.city, now: K.now, timeline: K.timeline };

const d = await loadData(login);
if (d.hidden > 0) { console.error(`Token cannot see ${d.hidden} private contributions; use a PAT with repo + read:user. Not writing.`); process.exit(2); }
const ctx = { avatar: await avatarDataUri(d.avatarUrl) };
mkdirSync(out, { recursive: true });
let bad = 0;
for (const [name, fn] of Object.entries(CARDS)) {
  const file = `${out}/${name}.svg`;
  writeFileSync(file, fn(d, ctx));
  try { execFileSync("xmllint", ["--noout", file]); } catch { bad++; console.error("INVALID XML:", file); }
}
const parts = K.connectParts();
for (const [name, svg] of parts) { const file = `${out}/connect-${name}.svg`; writeFileSync(file, svg); try { execFileSync("xmllint", ["--noout", file]); } catch { bad++; console.error("INVALID XML:", file); } }
console.log(`${Object.keys(CARDS).length + parts.length - bad}/${Object.keys(CARDS).length + parts.length} files written to ${out}/`);
process.exit(bad ? 1 : 0);
