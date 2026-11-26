import { esc, trunc, compact, MONO, SANS, svg, text, level, GREENS, rng, topRepos, recent } from "./lib.mjs";
const BG = "#0d1117";
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Neon Skyline: a tower per week under a neon sign
export function neonSkyline(d) {
  const r = rng("skyline" + d.login), W = d.weeks.length, max = Math.max(...d.weeks, 1), bw = 800 / W;
  let towers = "", wins = "";
  d.weeks.forEach((n, i) => {
    const h = 14 + Math.sqrt(n / max) * 120, x = i * bw, y = 270 - h;
    towers += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(bw - 2).toFixed(1)}" height="${h.toFixed(1)}" fill="url(#tw)" stroke="${["#b388ff", "#58a6ff", "#ff6ec7"][i % 3]}" stroke-opacity=".5"/>`;
    for (let wy = y + 6; wy < 266; wy += 9) if (r() > 0.55) wins += `<rect x="${(x + 3).toFixed(1)}" y="${wy.toFixed(1)}" width="3" height="4" fill="#ffd33d" opacity="${(0.4 + r() * 0.6).toFixed(2)}">${r() > 0.85 ? `<animate attributeName="opacity" values="1;.1;1" dur="${(2 + r() * 4).toFixed(1)}s" repeatCount="indefinite"/>` : ""}</rect>`;
  });
  const stars = Array.from({ length: 40 }, () => `<circle cx="${(r() * 800).toFixed(0)}" cy="${(r() * 120).toFixed(0)}" r="${(0.5 + r()).toFixed(1)}" fill="#fff" opacity="${(0.3 + r() * 0.6).toFixed(2)}"/>`).join("");
  const body = `<rect width="800" height="300" rx="14" fill="url(#sky)"/>${stars}
<circle cx="730" cy="48" r="16" fill="#ffd33d"/><circle cx="738" cy="43" r="14" fill="#0d0b24"/>
${towers}${wins}
<rect x="0" y="270" width="800" height="30" fill="#07060f"/>
<g filter="url(#glow)"><rect x="180" y="26" width="440" height="58" rx="8" fill="none" stroke="#ff6ec7" stroke-width="3"><animate attributeName="stroke-opacity" values="1;.55;1;.9;1" dur="3s" repeatCount="indefinite"/></rect>
${text(400, 66, trunc(d.name, 24), { size: 28, font: SANS, weight: 700, fill: "#ffd1ec", anchor: "middle" })}</g>
${text(400, 291, `each tower is a week · ${d.total} contributions this year`, { size: 11, fill: "#8b7fb8", anchor: "middle" })}`;
  const defs = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0b24"/><stop offset="1" stop-color="#241046"/></linearGradient><linearGradient id="tw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1a5e"/><stop offset="1" stop-color="#120a2e"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  return svg(800, 300, body, defs);
}

// Code Pet: grows with commits, glows with a streak, sleeps when you go quiet
export function codePet(d) {
  const awake = recent(d, 14) > 0, grow = clamp(0.8 + d.commitsYear / 4000, 0.8, 1.4), wk = d.weeks.slice(-13);
  const eye = awake ? `<circle cx="-18" cy="-6" r="7" fill="#fff"/><circle cx="18" cy="-6" r="7" fill="#fff"/><circle cx="-16" cy="-5" r="3.5" fill="#0d1117"><animate attributeName="cx" values="-16;-20;-16" dur="5s" repeatCount="indefinite"/></circle><circle cx="20" cy="-5" r="3.5" fill="#0d1117"><animate attributeName="cx" values="20;16;20" dur="5s" repeatCount="indefinite"/></circle>`
    : `<path d="M-25 -6 q7 6 14 0 M11 -6 q7 6 14 0" stroke="#0d1117" stroke-width="3" fill="none" stroke-linecap="round"/>${text(48, -34, "z", { size: 14, fill: "#8b949e" })}${text(60, -50, "Z", { size: 18, fill: "#8b949e" })}`;
  const body = `<rect width="800" height="300" rx="14" fill="#0b1020"/>
${text(24, 32, `CODE PET · @${d.login.toUpperCase()}`, { size: 11, fill: "#58a6ff", ls: 2.5 })}
<rect x="676" y="16" width="100" height="22" rx="11" fill="${awake ? "#0e4429" : "#30363d"}"/>${text(726, 31, awake ? "VIVID" : "SLEEPING", { size: 10, fill: awake ? "#39ff14" : "#8b949e", anchor: "middle", ls: 1.5 })}
<circle cx="400" cy="140" r="${(78 * grow).toFixed(0)}" fill="none" stroke="#39ff14" stroke-width="2" opacity="${d.streak > 3 ? 0.7 : 0.25}"><animate attributeName="opacity" values=".2;.8;.2" dur="3s" repeatCount="indefinite"/></circle>
<g transform="translate(400,142) scale(${grow.toFixed(2)})"><animateTransform attributeName="transform" type="translate" values="400 142;400 134;400 142" dur="${awake ? 2 : 5}s" repeatCount="indefinite" additive="replace"/>
<path d="M-48 -34 L-40 -68 L-18 -44 Z M48 -34 L40 -68 L18 -44 Z" fill="#4c8dff"/>
<ellipse rx="56" ry="50" fill="#4c8dff"/><ellipse rx="40" ry="30" cy="14" fill="#7db0ff"/>
${eye}<path d="M-8 12 q8 8 16 0" stroke="#0d1117" stroke-width="3" fill="none" stroke-linecap="round"/></g>
${d.langs.slice(0, 4).map((l, i) => `<rect x="${252 + i * 74}" y="238" width="68" height="20" rx="10" fill="#111a2e" stroke="${esc(l.color)}"/>${text(286 + i * 74, 252, trunc(l.name, 8), { size: 9, anchor: "middle" })}`).join("")}
${text(24, 262, compact(d.total), { size: 36, font: "Georgia,serif", fill: "#fff" })}${text(24, 282, `contributions this year · ${d.streak} day streak`, { size: 11, fill: "#7d8590" })}
${text(776, 252, `WEEKS ${wk.filter(Boolean).length}/${wk.length}`, { size: 9, fill: "#7d8590", anchor: "end", ls: 1.5 })}
${wk.map((n, i) => `<rect x="${776 - (wk.length - i) * 22}" y="260" width="18" height="10" rx="3" fill="${n ? "#2f6bff" : "#1c2438"}"/>`).join("")}`;
  return svg(800, 300, body);
}

// Aquarium: repos are fish, sized by commits (stars are too sparse here), seaweed = active days
export function aquarium(d) {
  const r = rng("fish" + d.login), repos = topRepos(d, 8), mx = Math.max(...repos.map((x) => x.score), 1);
  const fish = repos.map((p, i) => {
    const s = 0.7 + (p.score / mx) * 1.0, y = 60 + ((i * 53) % 150), dur = 16 + r() * 14, delay = -r() * dur;
    return `<g transform="translate(0,${y})"><g><animateTransform attributeName="transform" type="translate" from="-90 0" to="890 0" dur="${dur.toFixed(1)}s" begin="${delay.toFixed(1)}s" repeatCount="indefinite"/>
<g transform="scale(${s.toFixed(2)})"><path d="M-22 0 L-38 -12 L-38 12 Z" fill="${esc(p.color)}" opacity=".8"/><ellipse rx="26" ry="14" fill="${esc(p.color)}"/><circle cx="14" cy="-3" r="3" fill="#fff"/><circle cx="15" cy="-3" r="1.5" fill="#0d1117"/></g>
${text(0, 30 * s, trunc(p.name, 16), { size: 10, fill: "#cfe8ff", anchor: "middle" })}</g></g>`;
  }).join("");
  const active = d.days.filter((x) => x.contributionCount).length, blades = clamp(Math.round(active / 6), 12, 40);
  const weed = Array.from({ length: blades }, (_, i) => { const x = 10 + (i / blades) * 780, h = 30 + r() * 40; return `<path d="M${x.toFixed(0)} 300 q-6 -${(h / 2).toFixed(0)} 0 -${h.toFixed(0)}" stroke="#1f9d6b" stroke-width="3" fill="none" stroke-linecap="round"><animate attributeName="d" dur="${(3 + r() * 3).toFixed(1)}s" repeatCount="indefinite" values="M${x.toFixed(0)} 300 q-6 -${(h / 2).toFixed(0)} 0 -${h.toFixed(0)};M${x.toFixed(0)} 300 q6 -${(h / 2).toFixed(0)} 0 -${h.toFixed(0)};M${x.toFixed(0)} 300 q-6 -${(h / 2).toFixed(0)} 0 -${h.toFixed(0)}"/></path>`; }).join("");
  const bubbles = Array.from({ length: 14 }, () => { const x = (r() * 800).toFixed(0), dur = (6 + r() * 6).toFixed(1); return `<circle cx="${x}" cy="300" r="${(1.5 + r() * 2.5).toFixed(1)}" fill="none" stroke="#9ad1ff" opacity=".6"><animate attributeName="cy" from="300" to="-10" dur="${dur}s" begin="${(-r() * 8).toFixed(1)}s" repeatCount="indefinite"/></circle>`; }).join("");
  return svg(800, 300, `<rect width="800" height="300" rx="14" fill="url(#w)"/>${text(20, 28, `AQUARIUM · @${d.login.toUpperCase()}`, { size: 11, fill: "#9ad1ff", ls: 2.5 })}${bubbles}${fish}${weed}<rect y="288" width="800" height="12" fill="#6b5a3a"/>${text(780, 284, "fish = repos, by commits · seaweed = active days · bubbles = this year", { size: 9, fill: "#9ad1ff", anchor: "end" })}`,
    `<linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b4f7a"/><stop offset="1" stop-color="#06182b"/></linearGradient>`);
}

// Mixtape: a cassette of top repos with a 52-week equalizer
export function mixtape(d) {
  const repos = topRepos(d, 6), max = Math.max(...d.weeks, 1);
  const eq = d.weeks.map((n, i) => { const h = 6 + Math.sqrt(n / max) * 64; return `<g transform="translate(${24 + i * 14.4},292)"><g><animateTransform attributeName="transform" type="scale" values="1 1;1 ${(0.55 + (i % 5) * 0.1).toFixed(2)};1 1" dur="${(0.9 + (i % 7) * 0.15).toFixed(2)}s" repeatCount="indefinite"/><rect y="${-h.toFixed(1)}" width="10" height="${h.toFixed(1)}" rx="2" fill="#2f81f7"/></g></g>`; }).join("");
  const reel = (cx) => `<g transform="translate(${cx},166)"><circle r="20" fill="#111"/><g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite"/><circle r="12" fill="#eee"/>${[0, 60, 120, 180, 240, 300].map((a) => `<rect x="-1.5" y="-12" width="3" height="7" fill="#111" transform="rotate(${a})"/>`).join("")}</g></g>`;
  return svg(800, 310, `<rect width="800" height="310" rx="14" fill="${BG}"/>
<rect x="24" y="24" width="330" height="190" rx="16" fill="#2b2f3a" stroke="#454c5c"/>
<rect x="38" y="36" width="302" height="36" rx="6" fill="#2f81f7"/>${text(50, 60, `SIDE A · ${trunc(d.langs[0]?.name ?? "CODE", 12).toUpperCase()}`, { size: 11, fill: "#fff", ls: 1.5 })}
<rect x="38" y="78" width="302" height="124" rx="10" fill="#f3e9d2"/>${text(54, 104, d.name.length > 22 ? d.login : d.name, { size: 17, font: SANS, weight: 700, fill: "#222" })}${text(54, 124, `Greatest hits, ${new Date().getFullYear()}`, { size: 11, fill: "#555" })}
<rect x="76" y="140" width="226" height="52" rx="26" fill="#2b2f3a"/>${reel(118)}${reel(260)}
${text(376, 44, "TRACKLIST", { size: 10, fill: "#39c5bb", ls: 2 })}
${repos.map((p, i) => `${text(376, 74 + i * 24, String(i + 1).padStart(2, "0"), { size: 11, fill: "#7d8590" })}<circle cx="414" cy="${70 + i * 24}" r="5" fill="${esc(p.color)}"/>${text(428, 74 + i * 24, trunc(p.name, 30), { size: 13 })}${text(776, 74 + i * 24, `${p.score} commits`, { size: 11, fill: "#7d8590", anchor: "end" })}`).join("")}
${eq}${text(24, 304, `equalizer: 52 weeks of contributions · ${d.total} total`, { size: 9, fill: "#7d8590" })}`);
}

// Bar Chart Race: repos racing by commits this year
export function barChartRace(d) {
  const all = topRepos(d, 8), live = all.filter((x) => x.score > 0), repos = live.length >= 3 ? live : all, mx = Math.max(...repos.map((x) => x.score), 1);
  return svg(800, 330, `<rect width="800" height="330" rx="14" fill="${BG}"/>
${text(30, 34, "COMMIT RACE · LAST 12 MONTHS", { size: 10, fill: "#39c5bb", ls: 2 })}${text(30, 62, "Which project won my year", { size: 20, font: SANS, weight: 700 })}
${repos.map((p, i) => { const w = Math.max(6, (p.score / mx) * 430), y = 86 + i * 29; return `${text(190, y + 16, trunc(p.name, 24), { size: 11, fill: "#c9d1d9", anchor: "end" })}<rect x="204" y="${y}" width="${w.toFixed(0)}" height="20" rx="4" fill="${esc(p.color)}"><animate attributeName="width" from="0" to="${w.toFixed(0)}" dur="${(1 + i * 0.15).toFixed(2)}s" fill="freeze"/></rect>${text(212 + w, y + 15, p.score, { size: 11, fill: "#8b949e" })}`; }).join("")}
${text(770, 318, String(new Date().getFullYear()), { size: 44, font: SANS, weight: 800, fill: "#21262d", anchor: "end" })}`);
}

// Retro TV: languages on a CRT
export function retroTv(d) {
  const L = d.langs.slice(0, 5);
  return svg(800, 330, `<rect width="800" height="330" rx="14" fill="${BG}"/>
<rect x="110" y="30" width="580" height="270" rx="26" fill="#7a4a24" stroke="#4d2d14" stroke-width="4"/>
<rect x="140" y="52" width="440" height="226" rx="16" fill="#071a0e" stroke="#3a2412" stroke-width="5"/>
<rect x="140" y="52" width="440" height="226" rx="16" fill="url(#scan)"/>
${text(164, 90, "LANGUAGES", { size: 20, fill: "#4dff7c", ls: 2 })}${text(556, 90, "CH 02", { size: 13, fill: "#4dff7c", anchor: "end" })}
${L.map((l, i) => `${text(164, 128 + i * 30, trunc(l.name.toUpperCase(), 11), { size: 13, fill: "#4dff7c" })}<rect x="300" y="${114 + i * 30}" width="${Math.max(4, l.pct * 4).toFixed(0)}" height="14" fill="#4dff7c" opacity=".9"/>${text(556, 128 + i * 30, `${Math.round(l.pct)}%`, { size: 13, fill: "#4dff7c", anchor: "end" })}`).join("")}
<rect x="140" y="52" width="440" height="226" rx="16" fill="#4dff7c" opacity="0"><animate attributeName="opacity" values="0;.05;0" dur="0.15s" repeatCount="indefinite"/></rect>
<circle cx="636" cy="120" r="22" fill="#2a1a0e" stroke="#c9a06a" stroke-width="3"/><circle cx="636" cy="180" r="22" fill="#2a1a0e" stroke="#c9a06a" stroke-width="3"/>
${[0, 1, 2, 3, 4].map((i) => `<line x1="618" y1="${216 + i * 8}" x2="654" y2="${216 + i * 8}" stroke="#4d2d14" stroke-width="2"/>`).join("")}
<path d="M360 30 L300 0 M440 30 L500 0" stroke="#999" stroke-width="3"/>${text(400, 322, `@${d.login.toUpperCase()}`, { size: 10, fill: "#7d8590", anchor: "middle", ls: 2 })}`,
    `<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="#000" opacity=".28"/></pattern>`);
}
