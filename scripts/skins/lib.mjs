// Shared SVG helpers. GitHub renders README SVGs via <img>: no JS, no external fonts/images; SMIL + CSS animation are fine.
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
export const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
export const compact = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "K" : String(n));
export const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Courier New',monospace";
export const SANS = "-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";

// deterministic PRNG so regenerating on identical data gives identical files (no noisy commits)
export function rng(seed) {
  let s = [...String(seed)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export const svg = (w, h, body, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">${defs ? `<defs>${defs}</defs>` : ""}${body}</svg>\n`;

export const text = (x, y, s, { size = 14, fill = "#e6edf3", font = MONO, weight = 400, anchor = "start", ls = 0, extra = "" } = {}) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ""} ${extra}>${esc(s)}</text>`;

// five-level green ramp for contribution intensity
export const level = (n, max) => (n === 0 ? 0 : Math.min(4, 1 + Math.floor((n / Math.max(max, 1)) * 3.999)));
export const GREENS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

// Stars are ~0 on a young profile, so rank repos by commits this year, then stars, then recency. Never returns empty if any repo exists.
export function topRepos(d, n = 8) {
  const byName = new Map(d.repos.map((r) => [r.name, r]));
  const rows = d.commits.map((c) => ({ name: c.name, score: c.n, stars: byName.get(c.name)?.stargazerCount ?? 0, color: byName.get(c.name)?.primaryLanguage?.color || "#8b949e", lang: byName.get(c.name)?.primaryLanguage?.name || "" }));
  const seen = new Set(rows.map((r) => r.name));
  for (const r of d.repos) if (!seen.has(r.name) && rows.length < n) rows.push({ name: r.name, score: r.stargazerCount, stars: r.stargazerCount, color: r.primaryLanguage?.color || "#8b949e", lang: r.primaryLanguage?.name || "" });
  return rows.slice(0, n);
}
export const recent = (d, n) => d.days.slice(-n).reduce((s, x) => s + x.contributionCount, 0);
export const weeklyCols = (d) => { const w = []; for (let i = 0; i < d.days.length; i += 7) w.push(d.days.slice(i, i + 7)); return w; };
