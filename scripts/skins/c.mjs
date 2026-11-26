import { esc, trunc, compact, MONO, SANS, svg, text, level, GREENS, rng, topRepos, recent, weeklyCols } from "./lib.mjs";
const BG = "#0d1117";
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const md = (s) => new Date(s + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

// Arcade Cabinet: weekly contributions as the playfield, repos as the high-score table
export function arcade(d) {
  const wk = d.weeks.slice(-36), mx = Math.max(...wk, 1), repos = topRepos(d, 5);
  return svg(800, 330, `<rect width="800" height="330" rx="14" fill="${BG}"/>
<rect x="30" y="20" width="470" height="290" rx="14" fill="#1b2433" stroke="#2d3b52"/>
<rect x="44" y="30" width="442" height="34" rx="6" fill="#2f81f7"/>${text(265, 54, d.name.toUpperCase().slice(0, 28), { size: 17, font: MONO, weight: 700, fill: "#fff", anchor: "middle", ls: 2 })}
<rect x="44" y="74" width="442" height="190" rx="8" fill="#05070c"/>${text(56, 94, `SCORE ${d.total}`, { size: 12, fill: "#e6edf3" })}
${wk.map((n, i) => { const h = 6 + Math.sqrt(n / mx) * 130; return `<rect x="${58 + i * 11.7}" y="${(258 - h).toFixed(0)}" width="9" height="${h.toFixed(0)}" fill="#2f81f7"><animate attributeName="opacity" values="1;.6;1" dur="${(1.5 + (i % 5) * 0.3).toFixed(1)}s" repeatCount="indefinite"/></rect>`; }).join("")}
<g><path d="M0 -8 L7 6 L-7 6 Z" fill="#fff"/><animateTransform attributeName="transform" type="translate" values="60 118;470 118;60 118" dur="9s" repeatCount="indefinite"/></g>
<circle cx="80" cy="288" r="8" fill="#f85149"/><rect x="112" y="282" width="24" height="12" rx="6" fill="#222"/><circle cx="360" cy="288" r="8" fill="#ffd33d"/><circle cx="388" cy="288" r="8" fill="#39ff14"/><circle cx="416" cy="288" r="8" fill="#58a6ff"/>
${text(530, 44, "HI-SCORES", { size: 14, fill: "#39ff14", ls: 3 })}
${repos.map((p, i) => `${text(530, 82 + i * 38, String(i + 1), { size: 14, fill: "#7d8590" })}<rect x="552" y="${70 + i * 38}" width="12" height="12" fill="${esc(p.color)}"/>${text(574, 82 + i * 38, trunc(p.name, 20), { size: 13 })}${text(770, 82 + i * 38, String(p.score * 10).padStart(5, "0"), { size: 13, fill: "#ffa657", anchor: "end" })}`).join("")}
${text(530, 292, "POWER-UPS", { size: 11, fill: "#7d8590", ls: 2 })}${d.langs.slice(0, 7).map((l, i) => `<rect x="${530 + i * 34}" y="302" width="26" height="8" fill="${esc(l.color)}"/>`).join("")}`);
}

// Solar System: you are the sun, languages orbit as planets (legend is static so labels never spin upside-down)
export function solarSystem(d, { avatar }) {
  const L = d.langs.slice(0, 6), cx = 260, cy = 165;
  const orbits = L.map((l, i) => {
    const R = 52 + i * 24, size = clamp(4 + l.pct * 0.35, 5, 14), dur = 8 + i * 5;
    return `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#1c2433" stroke-dasharray="2 4"/>
<g><animateTransform attributeName="transform" type="rotate" from="${(i * 60) % 360} ${cx} ${cy}" to="${((i * 60) % 360) + 360} ${cx} ${cy}" dur="${dur}s" repeatCount="indefinite"/><circle cx="${cx + R}" cy="${cy}" r="${size.toFixed(1)}" fill="${esc(l.color)}"/></g>`;
  }).join("");
  return svg(800, 330, `<rect width="800" height="330" rx="14" fill="#05070f"/>${Array.from({ length: 50 }, (_, i) => { const r = rng("sun" + i); return `<circle cx="${(r() * 800).toFixed(0)}" cy="${(r() * 330).toFixed(0)}" r=".8" fill="#fff" opacity="${(0.2 + r() * 0.6).toFixed(2)}"/>`; }).join("")}
${text(24, 32, `SOLAR SYSTEM · @${d.login.toUpperCase()}`, { size: 11, fill: "#58a6ff", ls: 2.5 })}
<circle cx="${cx}" cy="${cy}" r="30" fill="#ffd33d" opacity=".25"><animate attributeName="r" values="30;36;30" dur="4s" repeatCount="indefinite"/></circle>
${orbits}
<clipPath id="sun"><circle cx="${cx}" cy="${cy}" r="24"/></clipPath><circle cx="${cx}" cy="${cy}" r="26" fill="#ffd33d"/><image x="${cx - 24}" y="${cy - 24}" width="48" height="48" href="${avatar}" clip-path="url(#sun)"/>
${text(500, 90, "PLANETS = LANGUAGES", { size: 11, fill: "#7d8590", ls: 2 })}
${L.map((l, i) => `<circle cx="508" cy="${118 + i * 30}" r="7" fill="${esc(l.color)}"/>${text(526, 123 + i * 30, trunc(l.name, 16), { size: 14 })}${text(776, 123 + i * 30, `${l.pct.toFixed(1)}%`, { size: 13, fill: "#7d8590", anchor: "end" })}`).join("")}
${text(776, 312, "size = share of code · orbit speed = just for show", { size: 9, fill: "#4d5566", anchor: "end" })}`);
}

// Stock Ticker: weekly contributions as candles, repos on the tape
export function stockTicker(d) {
  const r = rng("stock" + d.login), wk = d.weeks.slice(-26), mx = Math.max(...wk, 1), px = (v) => 190 - (v / mx) * 120;
  let candles = "", prev = wk[0];
  wk.forEach((n, i) => { const up = n >= prev, o = px(prev), c = px(n), hi = Math.min(o, c) - r() * 12, lo = Math.max(o, c) + r() * 12, x = 40 + i * 28, col = up ? "#3fb950" : "#f85149";
    candles += `<line x1="${x}" y1="${hi.toFixed(1)}" x2="${x}" y2="${lo.toFixed(1)}" stroke="${col}"/><rect x="${x - 7}" y="${Math.min(o, c).toFixed(1)}" width="14" height="${Math.max(2, Math.abs(o - c)).toFixed(1)}" fill="${col}"/><rect x="${x - 7}" y="${(262 - (n / mx) * 40).toFixed(1)}" width="14" height="${((n / mx) * 40 + 1).toFixed(1)}" fill="#30363d"/>`; prev = n; });
  const a = wk.slice(-4).reduce((s, v) => s + v, 0), b = wk.slice(-8, -4).reduce((s, v) => s + v, 0), chg = b ? ((a - b) / b) * 100 : 0;
  const tape = topRepos(d, 8).map((p) => `${p.name.toUpperCase()} ▲ ${p.score}`).join("      ") + "      ";
  return svg(800, 330, `<rect width="800" height="330" rx="14" fill="${BG}"/>
${text(30, 44, "$" + d.login.toUpperCase(), { size: 24, font: SANS, weight: 700 })}${text(30, 64, `${d.name} · GitHub · price = weekly contributions · last 26 weeks`, { size: 11, fill: "#7d8590" })}
${text(770, 46, "$" + d.total.toLocaleString("en-US"), { size: 26, font: SANS, weight: 700, anchor: "end" })}${text(770, 66, `${chg >= 0 ? "▲" : "▼"} ${Math.abs(chg).toFixed(1)}% · 4 wk`, { size: 12, fill: chg >= 0 ? "#3fb950" : "#f85149", anchor: "end" })}
${candles}
<clipPath id="tape"><rect x="0" y="296" width="800" height="24"/></clipPath>
<g clip-path="url(#tape)"><g><animateTransform attributeName="transform" type="translate" from="0 0" to="-900 0" dur="28s" repeatCount="indefinite"/>${text(0, 312, tape + tape + tape, { size: 12, fill: "#58a6ff", extra: 'xml:space="preserve"' })}</g></g>`);
}

// Year in Slides: five story slides cycle (SMIL opacity)
export function yearInSlides(d) {
  const busy = d.days.reduce((m, x) => (x.contributionCount > m.contributionCount ? x : m), d.days[0]);
  const top = topRepos(d, 1)[0];
  const slides = [
    ["YOUR YEAR ON GITHUB", compact(d.total), "contributions in the last 12 months"],
    ["BUSIEST DAY", String(busy.contributionCount), md(busy.date)],
    ["LONGEST STREAK", `${d.best} days`, `${d.streak} day current streak`],
    ["TOP PROJECT", top ? trunc(top.name, 20) : "—", top ? `${top.score} commits this year` : ""],
    ["MOST WRITTEN", d.langs[0]?.name ?? "—", `${d.commitsYear} commits · ${d.prs} PRs · ${d.reviews} reviews`],
  ];
  const N = slides.length, T = 4, total = N * T;
  const g = slides.map(([k, big, sub], i) => {
    const a = i / N, b = (i + 1) / N, kt = [0, Math.max(0, a - 0.001), a + 0.015, b - 0.015, Math.min(1, b), 1].map((v) => +v.toFixed(4));
    const vals = i === 0 ? "1;1;1;1;0;0" : "0;0;1;1;0;0"; // first slide visible at t=0 for the static frame
    return `<g opacity="${i === 0 ? 1 : 0}"><animate attributeName="opacity" values="${vals}" keyTimes="${kt.join(";")}" dur="${total}s" repeatCount="indefinite"/>
${text(400, 100, k, { size: 12, fill: "#58a6ff", anchor: "middle", ls: 4 })}${text(400, 190, big, { size: 78, font: SANS, weight: 800, fill: "#fff", anchor: "middle" })}${text(400, 232, sub, { size: 15, fill: "#8b949e", anchor: "middle" })}</g>`;
  }).join("");
  const dots = slides.map((_, i) => `<circle cx="${380 + i * 10}" cy="292" r="3" fill="#30363d"><animate attributeName="fill" values="#30363d;#58a6ff;#30363d" keyTimes="0;.5;1" dur="${T}s" begin="${i * T}s" repeatCount="indefinite"/></circle>`).join("");
  return svg(800, 320, `<rect width="800" height="320" rx="14" fill="url(#bg)"/>${g}${dots}`, `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d1117"/><stop offset="1" stop-color="#151b2e"/></linearGradient>`);
}

// Living Scene: a garden with one plant per week, under a looping day/night sky
export function livingScene(d) {
  const r = rng("garden" + d.login), mx = Math.max(...d.weeks, 1), W = d.weeks.length;
  const plants = d.weeks.map((n, i) => { const x = 14 + (i / W) * 772, h = 12 + Math.sqrt(n / mx) * 90, col = ["#ff6b6b", "#ffa94d", "#ffd43b", "#f783ac", "#b197fc"][i % 5];
    return `<g transform="translate(${x.toFixed(0)},262)"><g><animateTransform attributeName="transform" type="rotate" values="-3;3;-3" dur="${(3 + r() * 3).toFixed(1)}s" repeatCount="indefinite"/><line y2="${-h.toFixed(0)}" stroke="#2f9e44" stroke-width="2"/>${n ? `<circle cy="${-h.toFixed(0)}" r="${(3 + Math.sqrt(n / mx) * 4).toFixed(1)}" fill="${col}"/>` : `<circle cy="${-h.toFixed(0)}" r="2" fill="#2f9e44"/>`}</g></g>`; }).join("");
  const stars = Array.from({ length: 30 }, () => `<circle cx="${(r() * 800).toFixed(0)}" cy="${(r() * 120).toFixed(0)}" r="1" fill="#fff"/>`).join("");
  return svg(800, 310, `<rect width="800" height="310" rx="14" fill="#3b82c4"/>
<rect width="800" height="310" rx="14" fill="#0b1026" opacity=".8"><animate attributeName="opacity" values=".85;0;0;.85" keyTimes="0;.35;.65;1" dur="24s" repeatCount="indefinite"/></rect>
<g opacity=".8"><animate attributeName="opacity" values=".9;0;0;.9" keyTimes="0;.35;.65;1" dur="24s" repeatCount="indefinite"/>${stars}</g>
<circle r="18" fill="#ffd33d"><animateMotion dur="24s" repeatCount="indefinite" path="M-20 200 Q400 -120 820 200"/></circle>
<circle r="13" fill="#dfe6f3"><animateMotion dur="24s" begin="-12s" repeatCount="indefinite" path="M-20 200 Q400 -120 820 200"/></circle>
<path d="M0 230 Q200 190 400 225 T800 215 V310 H0 Z" fill="#26456b" opacity=".6"/><rect y="262" width="800" height="48" fill="#2b4a2e"/>${plants}
${text(24, 30, `GARDEN · @${d.login.toUpperCase()}`, { size: 11, fill: "#fff", ls: 2.5, extra: 'opacity=".85"' })}${text(776, 298, `each plant is a week of contributions · ${d.total} this year`, { size: 10, fill: "#cfe8cf", anchor: "end" })}`);
}

// Character Sheet: RPG stats from real numbers (log-scaled so one huge week doesn't pin the bar)
export function characterSheet(d, { avatar }) {
  const sc = (v, cap) => clamp(Math.round((Math.log2(1 + v) / Math.log2(1 + cap)) * 20), 1, 20);
  const stats = [["STR", sc(d.commitsYear, 3000), `${d.commitsYear} commits`], ["DEX", sc(d.prs, 300), `${d.prs} pull requests`], ["INT", sc(d.reviews + d.issues, 200), `${d.reviews + d.issues} reviews & issues`], ["WIS", sc(new Date().getFullYear() - d.since, 10), `${new Date().getFullYear() - d.since} years on GitHub`], ["CHA", sc(d.followers, 100), `${d.followers} followers`], ["CON", sc(d.best, 60), `${d.best} day best streak`]];
  const cls = { TypeScript: "Paladin", JavaScript: "Rogue", Python: "Wizard", PHP: "Druid", Kotlin: "Ranger", "C++": "Berserker", Rust: "Artificer", Go: "Monk", Java: "Cleric" };
  const top = d.langs.find((l) => l.name !== "Jupyter Notebook") ?? d.langs[0], lvl = Math.floor(Math.sqrt(d.total)), into = d.total - lvl * lvl, need = (lvl + 1) ** 2 - lvl * lvl;
  return svg(800, 330, `<rect width="800" height="330" rx="14" fill="${BG}"/>
<clipPath id="pf"><rect x="40" y="40" width="150" height="150" rx="6"/></clipPath><rect x="36" y="36" width="158" height="158" rx="8" fill="none" stroke="#39ff14"/><image x="40" y="40" width="150" height="150" href="${avatar}" clip-path="url(#pf)"/>
${text(40, 224, d.name.toUpperCase().slice(0, 16), { size: 14, weight: 700 })}${text(40, 244, `LEVEL ${lvl} ${(top?.name ?? "CODE").toUpperCase()} ${(cls[top?.name] ?? "Adventurer").toUpperCase()}`, { size: 10, fill: "#39ff14" })}${text(40, 260, "class from top language", { size: 9, fill: "#7d8590" })}
${text(240, 52, "ATTRIBUTES", { size: 12, fill: "#8b949e", ls: 2 })}
${stats.map(([k, v, note], i) => { const y = 82 + i * 30; return `${text(240, y, k, { size: 17 })}${text(290, y, String(v), { size: 17, anchor: "start" })}${Array.from({ length: 20 }, (_, j) => `<rect x="${330 + j * 18}" y="${y - 13}" width="14" height="14" fill="${j < v ? "#39ff14" : "#1c2a1f"}"/>`).join("")}${text(330, y + 13, note, { size: 8, fill: "#7d8590" })}`; }).join("")}
${text(240, 292, `XP  LV ${lvl} > ${lvl + 1}`, { size: 12 })}<rect x="400" y="280" width="360" height="14" rx="3" fill="#2a2208"/><rect x="400" y="280" width="${(360 * into / need).toFixed(0)}" height="14" rx="3" fill="#ffc107"/>${text(760, 310, `${into} / ${need} XP`, { size: 10, fill: "#7d8590", anchor: "end" })}`);
}

// Repo Galaxy: every public repo is a star on a spiral arm (newest nearest the core)
export function repoGalaxy(d) {
  const r = rng("galaxy" + d.login), repos = d.repos.slice(0, 48), lead = new Set(topRepos(d, 6).map((p) => p.name)), cx = 400, cy = 170;
  const pos = (i) => { const t = i / Math.max(repos.length - 1, 1), ang = t * 9 + (i % 2) * Math.PI, rad = 30 + Math.sqrt(t) * 135; return [cx + Math.cos(ang) * rad * 2.1, cy + Math.sin(ang) * rad * 0.85]; };
  const bg = Array.from({ length: 70 }, () => `<circle cx="${(r() * 800).toFixed(0)}" cy="${(r() * 330).toFixed(0)}" r=".7" fill="#9aa7c7" opacity="${(0.15 + r() * 0.5).toFixed(2)}"/>`).join("");
  const stars = repos.map((p, i) => { const [x, y] = pos(i), s = 2 + Math.min(p.stargazerCount, 10) * 0.5 + (lead.has(p.name) ? 2 : 0);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(1)}" fill="${esc(p.primaryLanguage?.color || "#c9d1d9")}"><animate attributeName="opacity" values="1;.35;1" dur="${(2 + r() * 4).toFixed(1)}s" begin="${(-r() * 4).toFixed(1)}s" repeatCount="indefinite"/></circle>`; }).join("");
  const labels = repos.map((p, i) => { if (!lead.has(p.name)) return ""; const [x, y] = pos(i); return text(x.toFixed(0), (y - 9).toFixed(0), trunc(p.name, 18), { size: 9, fill: "#c9d1d9", anchor: "middle" }); }).join("");
  return svg(800, 330, `<rect width="800" height="330" rx="14" fill="#04060d"/>${bg}
<ellipse cx="${cx}" cy="${cy}" rx="330" ry="130" fill="url(#core)"/>${stars}${labels}
<circle cx="${cx}" cy="${cy}" r="6" fill="#fff" opacity=".9"/>
${text(24, 32, `REPO GALAXY · @${d.login.toUpperCase()}`, { size: 11, fill: "#58a6ff", ls: 2.5 })}${text(24, 52, `${d.repoCount} repositories · ${d.stars} stars`, { size: 12, fill: "#c9d1d9" })}
${text(776, 312, "each star is a repository · colour = main language · labelled = most commits this year", { size: 9, fill: "#4d5566", anchor: "end" })}`,
    `<radialGradient id="core"><stop offset="0" stop-color="#5b7cfa" stop-opacity=".35"/><stop offset="1" stop-color="#5b7cfa" stop-opacity="0"/></radialGradient>`);
}

// Title Sequence: movie opening credits starring your projects
export function titleSequence(d) {
  const cast = topRepos(d, 6);
  return svg(800, 330, `<rect width="800" height="330" rx="14" fill="#0a0806"/><ellipse cx="400" cy="130" rx="360" ry="110" fill="url(#vig)"/>
${text(400, 62, "GITHUB PICTURES PRESENTS", { size: 11, fill: "#a58a4b", anchor: "middle", ls: 6 })}
${text(400, 130, d.name.toUpperCase().slice(0, 22), { size: d.name.length > 16 ? 40 : 56, font: SANS, weight: 900, fill: "#f5c542", anchor: "middle" })}
${text(400, 168, d.langs.slice(0, 3).map((l) => l.name.toUpperCase()).join(" · "), { size: 13, fill: "#d8c28a", anchor: "middle", ls: 4 })}
<clipPath id="cr"><rect x="0" y="186" width="800" height="100"/></clipPath>
<g clip-path="url(#cr)"><g><animateTransform attributeName="transform" type="translate" from="0 100" to="0 -140" dur="14s" repeatCount="indefinite"/>${cast.map((p, i) => text(400, 206 + i * 28, `starring ${trunc(p.name, 26)} · ${p.score} commits`, { size: 14, fill: "#e8dcb8", anchor: "middle" })).join("")}</g></g>
${text(400, 312, `${d.total} contributions · ${d.followers} followers · ${d.repoCount} repos`, { size: 10, fill: "#7a6a3a", anchor: "middle" })}`,
    `<radialGradient id="vig"><stop offset="0" stop-color="#5c4510" stop-opacity=".55"/><stop offset="1" stop-color="#5c4510" stop-opacity="0"/></radialGradient>`);
}

// Game of Life: your real contribution grid is generation 0; the rules run on it
export function gameOfLife(d) {
  const cols = weeklyCols(d).slice(-52), R = 7, C = cols.length, GEN = 24, cs = 11, g = 3, x0 = 24, y0 = 86;
  let grid = Array.from({ length: R }, (_, y) => Array.from({ length: C }, (_, x) => (cols[x][y]?.contributionCount ?? 0) > 0 ? 1 : 0));
  const step = (G) => G.map((row, y) => row.map((v, x) => { let n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dy || dx) n += G[(y + dy + R) % R][(x + dx + C) % C]; return n === 3 || (v && n === 2) ? 1 : 0; }));
  const frames = [];
  for (let i = 0; i < GEN; i++) { frames.push(grid); grid = step(grid); }
  const kt = frames.map((_, i) => (i / GEN).toFixed(4)).join(";");
  const layer = frames.map((G, i) => `<g visibility="${i ? "hidden" : "visible"}"><animate attributeName="visibility" calcMode="discrete" keyTimes="${kt}" values="${frames.map((_, j) => (j === i ? "visible" : "hidden")).join(";")}" dur="${GEN * 0.5}s" repeatCount="indefinite"/>${G.map((row, y) => row.map((v, x) => (v ? `<rect x="${x0 + x * (cs + g)}" y="${y0 + y * (cs + g)}" width="${cs}" height="${cs}" rx="2" fill="#39d353"/>` : "")).join("")).join("")}</g>`).join("");
  const base = Array.from({ length: R }, (_, y) => Array.from({ length: C }, (_, x) => `<rect x="${x0 + x * (cs + g)}" y="${y0 + y * (cs + g)}" width="${cs}" height="${cs}" rx="2" fill="#161b22"/>`).join("")).join("");
  return svg(800, 220, `<rect width="800" height="220" rx="14" fill="${BG}"/>${text(24, 34, "GAME OF LIFE", { size: 11, fill: "#39c5bb", ls: 3 })}${text(24, 62, "Generation 0 is my real year", { size: 20, font: SANS, weight: 700 })}${base}${layer}${text(24, 208, "every lit square is a day I contributed · then the rules of life take over", { size: 10, fill: "#7d8590" })}`);
}
