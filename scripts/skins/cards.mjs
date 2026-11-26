import { esc, trunc, compact, num, MONO, SANS, C, HEAT, level, text, label, wrap, card, header } from "./lib.mjs";

const W = 840;
const ICON = { // 16px stroke icons
  commit: `<circle cx="8" cy="8" r="3"/><path d="M1 8h4M11 8h4"/>`,
  pr: `<circle cx="4" cy="3.5" r="1.6"/><circle cx="4" cy="12.5" r="1.6"/><circle cx="12" cy="12.5" r="1.6"/><path d="M4 5.1v5.8M12 10.9V6.5a2 2 0 0 0-2-2H8"/>`,
  issue: `<circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="1.2"/>`,
  review: `<path d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8z"/><circle cx="8" cy="8" r="2"/>`,
  flame: `<path d="M8 1.5c.6 2.6 3.7 3.6 3.7 7.1a3.7 3.7 0 0 1-7.4 0c0-1.7.8-2.7 1.8-3.6.1 1 .7 1.6 1.5 1.2.4-1.6.4-3 .4-4.7z"/>`,
  bolt: `<path d="M9 1.5 3.5 9H8l-1 5.5L12.5 7H8z"/>`,
  repo: `<path d="M3.5 2h8.5v12H3.5zM3.5 11.5H12"/>`,
  graph: `<path d="M2 13.5V8M6 13.5V3.5M10 13.5V6M14 13.5V1.5"/>`,
  lock: `<rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/>`,
};
const icon = (k, x, y, col) => `<g transform="translate(${x},${y})" fill="none" stroke="${col}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICON[k]}</g>`;

// 1. HERO ---------------------------------------------------------------------------------------------------------------
export function hero(d, { avatar }) {
  const roles = ["Full-Stack Developer", "System Builder", "CS Student @ AIUB"], T = 3.2;
  const role = roles.map((r, i) => {
    const a = i / 3, b = (i + 1) / 3, f = 0.015, kt = [0, a, a + f, b - f, b, 1].map((v) => +v.toFixed(3));
    return `<g opacity="${i ? 0 : 1}"><animate attributeName="opacity" values="${i ? "0;0;1;1;0;0" : "1;1;1;1;0;0"}" keyTimes="${kt.join(";")}" dur="${T * 3}s" repeatCount="indefinite"/>${text(222, 140, r, { size: 19, fill: C.neon, font: MONO, weight: 600 })}</g>`;
  }).join("");
  const stats = [[compact(d.life.total), "contributions"], [String(d.repoTotal), "repositories"], [String(d.followers), "followers"], [String(new Date().getFullYear() - d.since), "years on GitHub"]];
  const body = `
<pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#fff" opacity=".07"/></pattern>
<rect x="1" y="1" width="${W - 2}" height="282" rx="13" fill="url(#dots)"/>
<circle cx="112" cy="120" r="76" fill="none" stroke="url(#ring)" stroke-width="3"><animateTransform attributeName="transform" type="rotate" from="0 112 120" to="360 112 120" dur="14s" repeatCount="indefinite"/></circle>
<clipPath id="av"><circle cx="112" cy="120" r="66"/></clipPath><image x="46" y="54" width="132" height="132" href="${avatar}" clip-path="url(#av)" preserveAspectRatio="xMidYMid slice"/>
${label(222, 64, `${d.location || "Earth"}  ·  since ${d.since}`)}
${text(222, 108, d.name, { size: d.name.length > 20 ? 38 : 44, weight: 800 })}
${role}
${text(222, 172, d.bio || "Building things on the web.", { size: 14, fill: C.mute })}
<line x1="28" y1="216" x2="${W - 28}" y2="216" stroke="${C.line}"/>
${stats.map(([v, k], i) => { const x = 28 + i * 196; return `${i ? `<line x1="${x - 14}" y1="232" x2="${x - 14}" y2="262" stroke="${C.line}"/>` : ""}${text(x, 254, v, { size: 22, weight: 700, extra: "" })}${text(x + (String(v).length * 13.5) + 8, 254, k, { size: 12, fill: C.mute })}`; }).join("")}`;
  return card(W, 284, body, `<linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.neon}"/><stop offset=".5" stop-color="${C.blue}"/><stop offset="1" stop-color="${C.purple}"/></linearGradient>`);
}

// 2. STATS ---------------------------------------------------------------------------------------------------------------
export function stats(d) {
  const Y = new Date().getFullYear();
  const tiles = [
    ["graph", "Contributions", d.life.total, `${num(d.year.total)} in ${Y}`, C.green],
    ["commit", "Commits", d.life.commits, `${num(d.year.commits)} in ${Y}`, C.blue],
    ["pr", "Pull requests", d.life.prs, `${num(d.year.prs)} in ${Y}`, C.purple],
    ["review", "Code reviews", d.life.reviews, `${num(d.year.reviews)} in ${Y}`, C.orange],
    ["issue", "Issues", d.life.issues, `${num(d.year.issues)} in ${Y}`, C.pink],
    ["flame", "Current streak", d.streak, "days in a row", C.orange, true],
    ["bolt", "Longest streak", d.best, "days, last 12 months", C.yellow, true],
    ["repo", "Repositories", d.repoTotal, `${d.repoPublic} public · ${d.repoPrivate} private`, C.blue],
  ];
  const tw = (W - 56 - 36) / 4, th = 104;
  const t = tiles.map(([ic, k, v, sub, col, small], i) => {
    const x = 28 + (i % 4) * (tw + 12), y = 86 + Math.floor(i / 4) * (th + 12);
    return `<g>
<rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="10" fill="#0c121c" stroke="${C.line}"/><rect x="${x}" y="${y + 18}" width="3" height="28" rx="1.5" fill="${col}"/>
${icon(ic, x + 18, y + 16, col)}${text(x + 42, y + 29, k.toUpperCase(), { size: 10, fill: C.mute, font: MONO, weight: 600, ls: 1.5 })}
${text(x + 18, y + 72, num(v), { size: 34, weight: 800 })}${text(x + 18, y + 92, sub, { size: 11.5, fill: C.mute })}</g>`;
  }).join("");
  const h = 86 + 2 * (th + 12) + 4;
  const pill = `<rect x="${W - 28 - 196}" y="46" width="196" height="24" rx="12" fill="#0e2a17" stroke="#1d5a30"/>${icon("lock", W - 28 - 184, 50, C.green)}${text(W - 28 - 160, 62, "includes private work", { size: 11.5, fill: "#7ee787" })}`;
  return card(W, h, `${label(28, 36, "01 · by the numbers")}${text(28, 64, "Lifetime stats", { size: 22, weight: 700 })}${pill}${t}`);
}

// 3. ACTIVITY ------------------------------------------------------------------------------------------------------------
export function activity(d) {
  const cs = 11, g = 3.5, x0 = 56, y0 = 118, days = d.days, max = Math.max(...days.map((x) => x.contributionCount), 1);
  const wk = []; for (let i = 0; i < days.length; i += 7) wk.push(days.slice(i, i + 7));
  const first = new Date(days[0].date + "T00:00:00Z").getUTCDay(); // pad so rows are weekdays
  let cells = "", mon = "", lastM = -1, lastX = -99;
  wk.forEach((col, c) => col.forEach((day, r) => {
    const row = c === 0 ? r + first : r; if (row > 6) return;
    const x = x0 + c * (cs + g), y = y0 + row * (cs + g), lv = level(day.contributionCount, max);
    cells += `<rect x="${x.toFixed(1)}" y="${y}" width="${cs}" height="${cs}" rx="2.5" fill="${HEAT[lv]}"/>`;
    const m = new Date(day.date + "T00:00:00Z").getUTCMonth();
    if (r === 0 && m !== lastM && x < W - 70) { lastM = m; if (x - lastX < 34) return; lastX = x; mon += text(x.toFixed(1), y0 - 10, new Date(day.date + "T00:00:00Z").toLocaleString("en-US", { month: "short", timeZone: "UTC" }), { size: 10.5, fill: C.mute }); }
  }));
  const gridW = wk.length * (cs + g);
  const dayL = ["Mon", "Wed", "Fri"].map((s, i) => text(28, y0 + (1 + i * 2) * (cs + g) + 9, s, { size: 10, fill: C.dim })).join("");
  const scan = `<clipPath id="gridclip"><rect x="${x0}" y="${y0 - 4}" width="${gridW}" height="${7 * (cs + g) + 4}"/></clipPath><g clip-path="url(#gridclip)"><rect x="${x0}" y="${y0 - 4}" width="70" height="${7 * (cs + g) + 4}" fill="url(#scan)"><animate attributeName="x" from="${x0 - 70}" to="${x0 + gridW}" dur="7s" repeatCount="indefinite"/></rect></g>`;
  const legendX = W - 28 - 5 * 14 - 74;
  const legend = `${text(legendX, y0 + 7 * (cs + g) + 22, "Less", { size: 10, fill: C.dim })}${HEAT.map((c, i) => `<rect x="${legendX + 30 + i * 14}" y="${y0 + 7 * (cs + g) + 13}" width="11" height="11" rx="2.5" fill="${c}"/>`).join("")}${text(legendX + 30 + 5 * 14 + 4, y0 + 7 * (cs + g) + 22, "More", { size: 10, fill: C.dim })}`;
  // monthly bars
  const by = y0 + 7 * (cs + g) + 56, bh = 70, mmax = Math.max(...d.months.map((m) => m.n), 1), bw = (W - 56 - 11 * 10) / 12;
  const bars = d.months.map((m, i) => { const h = Math.max(3, (m.n / mmax) * bh), x = 28 + i * (bw + 10); return `<rect x="${x.toFixed(1)}" y="${(by + bh - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="4" fill="${i === 11 ? C.green : "#1f6f3a"}"><animate attributeName="height" from="3" to="${h.toFixed(1)}" dur="${(0.5 + i * 0.05).toFixed(2)}s" fill="freeze"/><animate attributeName="y" from="${by + bh - 3}" to="${(by + bh - h).toFixed(1)}" dur="${(0.5 + i * 0.05).toFixed(2)}s" fill="freeze"/></rect>${text((x + bw / 2).toFixed(1), by + bh + 16, m.label, { size: 10, fill: C.dim, anchor: "middle" })}${m.n ? text((x + bw / 2).toFixed(1), (by + bh - h - 6).toFixed(1), compact(m.n), { size: 10, fill: C.mute, anchor: "middle" }) : ""}`; }).join("");
  const busy = new Date(d.busy.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  const h = by + bh + 34;
  return card(W, h, `${label(28, 36, "02 · activity")}${text(28, 64, `${num(d.year.total)} contributions in the last year`, { size: 22, weight: 700 })}${text(W - 28, 62, `${d.streak} day streak · busiest day ${busy} (${d.busy.contributionCount})`, { size: 12, fill: C.mute, anchor: "end" })}
${dayL}${mon}${cells}${scan}${legend}` + `${text(28, by - 12, "MONTH BY MONTH", { size: 10.5, fill: C.green, font: MONO, weight: 600, ls: 2 })}${bars}`, `<linearGradient id="scan" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`);
}

// 4. LANGUAGES -----------------------------------------------------------------------------------------------------------
export function languages(d) {
  const top = d.langs.slice(0, 8), other = d.langs.slice(8).reduce((s, l) => s + l.pct, 0);
  const rows = other > 0.05 ? [...top, { name: "Other", color: "#6e7681", pct: other }] : top;
  const bx = 28, bw = W - 56; let x = bx;
  const seg = rows.map((l, i) => { const w = (l.pct / 100) * bw, r = `<rect x="${x.toFixed(1)}" y="92" width="${Math.max(w - 2, 1).toFixed(1)}" height="14" fill="${esc(l.color)}"></rect>`; x += w; return r; }).join("");
  const cw = bw / 3, list = rows.map((l, i) => { const cx = bx + (i % 3) * cw, cy = 140 + Math.floor(i / 3) * 34; return `<circle cx="${cx + 6}" cy="${cy - 4}" r="5" fill="${esc(l.color)}"/>${text(cx + 20, cy, trunc(l.name, 18), { size: 13.5, weight: 500 })}${text(cx + cw - 24, cy, `${l.pct.toFixed(1)}%`, { size: 12.5, fill: C.mute, anchor: "end", font: MONO })}`; }).join("");
  const h = 140 + Math.ceil(rows.length / 3) * 34 + 6;
  return card(W, h, `${header(W, "03 · stack", "Languages", `by code written across ${d.repoPublic} public repositories`)}<clipPath id="lb"><rect x="${bx}" y="92" width="${bw}" height="14" rx="7"/></clipPath><g clip-path="url(#lb)"><rect x="${bx}" y="92" width="${bw}" height="14" fill="#161b22"/>${seg}</g>${list}`);
}

const ago = (iso) => { const d = Math.max(0, Math.round((Date.now() - new Date(iso)) / 864e5)); return d < 1 ? "today" : d < 14 ? `${d} days ago` : d < 60 ? `${Math.round(d / 7)} weeks ago` : `${Math.round(d / 30)} months ago`; };
// 5. PROJECTS ------------------------------------------------------------------------------------------------------------
export function projects(d) {
  const pick = [...d.repos].filter((r) => r.name !== d.login).sort((a, b) => b.commits - a.commits || b.stargazerCount - a.stargazerCount || new Date(b.pushedAt) - new Date(a.pushedAt)).slice(0, 6);
  const cw = (W - 56 - 12) / 2, ch = 108;
  const cards = pick.map((p, i) => {
    const x = 28 + (i % 2) * (cw + 12), y = 86 + Math.floor(i / 2) * (ch + 12), desc = p.description ? wrap(p.description, 58, 2) : [`Last push ${ago(p.pushedAt)}`], col = p.primaryLanguage?.color || C.mute;
    return `<g>
<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="10" fill="#0c121c" stroke="${C.line}"/>
${icon("repo", x + 16, y + 17, C.blue)}${text(x + 40, y + 30, trunc(p.name, 30), { size: 14.5, fill: C.blue, weight: 700 })}
${desc.map((l, j) => text(x + 16, y + 54 + j * 17, l, { size: 12, fill: C.mute })).join("")}
<circle cx="${x + 20}" cy="${y + ch - 18}" r="5" fill="${esc(col)}"/>${text(x + 32, y + ch - 14, p.primaryLanguage?.name ?? "—", { size: 11.5, fill: C.text })}
${text(x + cw - 16, y + ch - 14, [p.commits ? `${p.commits} commits this year` : "", p.stargazerCount ? `★ ${p.stargazerCount}` : ""].filter(Boolean).join("   ·   "), { size: 11.5, fill: C.mute, anchor: "end" })}</g>`;
  }).join("");
  const y2 = 86 + Math.ceil(pick.length / 2) * (ch + 12);
  const priv = `<rect x="28" y="${y2}" width="${W - 56}" height="46" rx="10" fill="#0c121c" stroke="${C.line}" stroke-dasharray="4 4"/>${icon("lock", 46, y2 + 15, C.mute)}${text(72, y2 + 28, `+ ${d.repoPrivate} private repositories — client and product work, shown as counts only`, { size: 12.5, fill: C.mute })}`;
  return card(W, y2 + 46 + 24, `${header(W, "04 · work", "Selected projects", "most active public repositories this year")}${cards}${priv}`);
}
