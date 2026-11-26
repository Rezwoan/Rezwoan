import { esc, trunc, compact, MONO, SANS, svg, text, level, GREENS, rng } from "./lib.mjs";

const BG = "#0d1117";

// Holo Card: a collector card with a rotating foil border, then legendary stats
export function holoCard(d, { avatar }) {
  const tiles = [["REPOS", d.repoCount], ["COMMITS / YR", d.commitsYear], ["FOLLOWERS", d.followers], ["DAY STREAK", d.streak]];
  const powers = d.langs.slice(0, 3);
  const body = `
<rect width="800" height="320" rx="14" fill="${BG}"/>
<g transform="translate(28,24)">
  <rect width="210" height="272" rx="16" fill="url(#foil)"><animateTransform attributeName="gradientTransform" type="rotate" from="0 .5 .5" to="360 .5 .5" dur="8s" repeatCount="indefinite"/></rect>
  <rect x="4" y="4" width="202" height="264" rx="13" fill="#0f1620"/>
  <text x="16" y="28" font-family="${SANS}" font-size="14" font-weight="700" fill="#fff">${esc(trunc(d.name, 18))}</text>
  
  <clipPath id="av"><rect x="16" y="40" width="178" height="118" rx="8"/></clipPath>
  <image x="16" y="40" width="178" height="118" href="${avatar}" clip-path="url(#av)" preserveAspectRatio="xMidYMin slice"/>
  <rect x="16" y="40" width="178" height="118" rx="8" fill="url(#sheen)" opacity=".55"><animate attributeName="opacity" values=".15;.6;.15" dur="4s" repeatCount="indefinite"/></rect>
  <text x="16" y="182" font-family="${MONO}" font-size="9" fill="#7d8590" letter-spacing="1.5">LEGENDARY · SINCE ${d.since}</text>
  ${powers.map((l, i) => `<circle cx="22" cy="${204 + i * 22}" r="5" fill="${esc(l.color)}"/>${text(34, 208 + i * 22, trunc(l.name, 14), { size: 12, fill: "#e6edf3" })}${text(194, 208 + i * 22, `${Math.round(l.pct)} PWR`, { size: 11, fill: "#7d8590", anchor: "end" })}`).join("")}
</g>
${text(278, 70, "COLLECTOR'S EDITION · " + new Date().getFullYear(), { size: 11, fill: "#58a6ff", ls: 2.5 })}
${text(278, 122, "@" + d.login, { size: 44, font: SANS, weight: 800, fill: "#fff" })}
${text(278, 150, trunc(d.bio || "Developer", 62), { size: 14, font: SANS, fill: "#9da7b3" })}
${tiles.map(([k, v], i) => {
  const x = 278 + (i % 2) * 250, y = 178 + Math.floor(i / 2) * 68;
  return `<rect x="${x}" y="${y}" width="236" height="56" rx="8" fill="#111a25" stroke="#1f2d3d"/>${text(x + 16, y + 30, compact(v), { size: 28, font: SANS, weight: 700, fill: i % 2 ? "#39ff14" : "#58a6ff" })}${text(x + 16, y + 47, k, { size: 9, fill: "#7d8590", ls: 1.5 })}`;
}).join("")}`;
  const defs = `<linearGradient id="foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6ec7"/><stop offset=".25" stop-color="#ffd33d"/><stop offset=".5" stop-color="#39ff14"/><stop offset=".75" stop-color="#58a6ff"/><stop offset="1" stop-color="#b388ff"/></linearGradient>
<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
  return svg(800, 320, body, defs);
}

// Signal Run: a ship sweeps the real contribution grid; every column lights as it passes
export function signalRun(d, { avatar }) {
  const weeks = []; // columns of 7
  for (let i = 0; i < d.days.length; i += 7) weeks.push(d.days.slice(i, i + 7));
  const max = Math.max(...d.days.map((x) => x.contributionCount), 1);
  const cs = 11, gap = 3, x0 = 29, y0 = 62, W = weeks.length * (cs + gap), DUR = 14;
  let cells = "";
  weeks.forEach((wk, c) =>
    wk.forEach((day, r) => {
      const lv = level(day.contributionCount, max);
      const x = x0 + c * (cs + gap), y = y0 + r * (cs + gap);
      cells += `<rect x="${x}" y="${y}" width="${cs}" height="${cs}" rx="2" fill="${GREENS[lv]}">${lv ? `<animate attributeName="opacity" values="1;.35;1" keyTimes="0;.08;.3" dur="${DUR}s" begin="${((c / weeks.length) * DUR).toFixed(2)}s" repeatCount="indefinite"/>` : ""}</rect>`;
    }),
  );
  const mid = y0 + 3 * (cs + gap) + cs / 2;
  const path = `M ${x0} ${mid} ` + Array.from({ length: 12 }, (_, i) => `L ${x0 + ((i + 1) / 12) * W} ${mid + (i % 2 ? 18 : -18)}`).join(" ");
  const tiles = [["LEVEL", String(new Date().getFullYear())], ["STREAK", `${d.streak} DAYS`], ["COMMITS", compact(d.commitsYear)], ["FOLLOWERS", compact(d.followers)]];
  const body = `
<rect width="800" height="300" rx="14" fill="${BG}"/>
${text(29, 34, `SIGNAL RUN · @${d.login.toUpperCase()}`, { size: 12, fill: "#39ff14", ls: 3 })}
${text(771, 34, `HI-SCORE ${d.total}`, { size: 12, fill: "#ffa657", anchor: "end", ls: 1.5 })}
${cells}
<g><circle r="11" fill="#0d1117" stroke="#39ff14" stroke-width="2"/><image x="-9" y="-9" width="18" height="18" href="${avatar}" clip-path="url(#sh)"/><path d="M-26 0 L-12 0" stroke="#39ff14" stroke-width="2" stroke-linecap="round" opacity=".8"/>
<animateMotion dur="${DUR}s" repeatCount="indefinite" path="${path}"/></g>
${tiles.map(([k, v], i) => `<rect x="${29 + i * 187}" y="196" width="175" height="54" rx="8" fill="#111820" stroke="#1d2733"/>${text(43 + i * 187, 216, k, { size: 9, fill: "#7d8590", ls: 2 })}${text(43 + i * 187, 240, v, { size: 20, font: SANS, weight: 700 })}`).join("")}
${text(29, 276, "POWER-UPS", { size: 10, fill: "#7d8590", ls: 2 })}
${d.langs.slice(0, 5).map((l, i) => `<rect x="${110 + i * 128}" y="262" width="118" height="20" rx="10" fill="none" stroke="${esc(l.color)}"/><circle cx="${124 + i * 128}" cy="272" r="4" fill="${esc(l.color)}"/>${text(134 + i * 128, 276, trunc(l.name, 10), { size: 10 })}`).join("")}`;
  return svg(800, 300, body, `<clipPath id="sh"><circle r="9"/></clipPath>`);
}
