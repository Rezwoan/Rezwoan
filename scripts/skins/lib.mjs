// Shared design system. README <img> SVGs: no JS / foreignObject / external fonts; SMIL + CSS animation are fine.
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
export const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
export const compact = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "K" : String(n));
export const num = (n) => n.toLocaleString("en-US");
export const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace";
export const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif";

// one palette for every card
export const C = { bg: "#0a0c12", card: "#11151d", line: "#222a37", text: "#f5f5f7", mute: "#a1a8b3", dim: "#7b8494", green: "#30d158", neon: "#30d158", blue: "#4d9dff", purple: "#bf5af2", orange: "#ff9f0a", pink: "#ff6482", yellow: "#ffd60a" };
export const HEAT = ["#171c26", "#12402a", "#17703a", "#25a84e", "#30d158"];
export const level = (n, max) => (n === 0 ? 0 : Math.min(4, 1 + Math.floor((n / Math.max(max, 1)) * 3.999)));

export const text = (x, y, s, { size = 14, fill = C.text, font = SANS, weight = 400, anchor = "start", ls = 0, extra = "", tnum = false } = {}) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ""}${tnum ? ' style="font-variant-numeric:tabular-nums"' : ""}${extra ? " " + extra : ""}>${esc(s)}</text>`;
export const label = (x, y, s, fill = C.mute, anchor = "start") => text(x, y, s.toUpperCase(), { size: 11, fill, font: SANS, weight: 600, ls: 1.4, anchor });

// word-wrap into at most `lines` lines of ~`n` chars
export function wrap(s, n, lines = 2) {
  const out = []; let cur = "";
  for (const w of String(s).split(/\s+/).filter(Boolean)) { if ((cur + " " + w).trim().length > n) { out.push(cur); cur = w; } else cur = (cur + " " + w).trim(); }
  if (cur) out.push(cur);
  if (out.length > lines) { out.length = lines; out[lines - 1] = trunc(out[lines - 1] + "…", n); }
  return out;
}

// card shell: gradient fill, hairline border, soft corner glows
export function card(w, h, body, defs = "") {
  const R = 20, edge = `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${R}" fill="none" stroke="${C.line}"/>`;
  const shell = `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${R}" fill="url(#cardbg)"/><rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${R}" fill="url(#glowG)"/><rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${R}" fill="url(#glowB)"/>${edge}<path d="M${R} 1H${w - R}" stroke="url(#hi)" stroke-width="1.2" stroke-linecap="round"/>`;
  const d = `<linearGradient id="cardbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141a24"/><stop offset="1" stop-color="${C.bg}"/></linearGradient><radialGradient id="glowG" cx="1" cy="0" r=".7"><stop offset="0" stop-color="${C.green}" stop-opacity=".055"/><stop offset="1" stop-color="${C.green}" stop-opacity="0"/></radialGradient><radialGradient id="glowB" cx="0" cy="1" r=".6"><stop offset="0" stop-color="${C.blue}" stop-opacity=".05"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></radialGradient><linearGradient id="hi" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>${defs}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img"><defs>${d}</defs>${shell}${body}</svg>\n`;
}
// section header used by every card: mono kicker, bold title, optional right-aligned note
export const header = (w, kicker, title, note = "") => `${label(28, 36, kicker.replace(/^\d+ · /, ""))}${text(28, 64, title, { size: 24, weight: 700, ls: -0.5 })}${note ? text(w - 28, 62, note, { size: 12.5, fill: C.mute, anchor: "end" }) : ""}`;

// deterministic PRNG so identical data gives identical files (no noisy commits)
export function rng(seed) {
  let s = [...String(seed)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
