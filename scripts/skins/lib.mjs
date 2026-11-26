// Shared design system. README <img> SVGs: no JS / foreignObject / external fonts; SMIL + CSS animation are fine.
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
export const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
export const compact = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "K" : String(n));
export const num = (n) => n.toLocaleString("en-US");
export const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace";
export const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif";

// one palette for every card
export const C = { bg: "#0b0f17", card: "#0f1520", line: "#1f2937", text: "#e6edf3", mute: "#8b949e", dim: "#5b6573", green: "#3fb950", neon: "#39ff14", blue: "#58a6ff", purple: "#bc8cff", orange: "#f0883e", pink: "#ff7eb6", yellow: "#e3b341" };
export const HEAT = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];
export const level = (n, max) => (n === 0 ? 0 : Math.min(4, 1 + Math.floor((n / Math.max(max, 1)) * 3.999)));

export const text = (x, y, s, { size = 14, fill = C.text, font = SANS, weight = 400, anchor = "start", ls = 0, extra = "" } = {}) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ""}${extra ? " " + extra : ""}>${esc(s)}</text>`;
export const label = (x, y, s, fill = C.green, anchor = "start") => text(x, y, s.toUpperCase(), { size: 10.5, fill, font: MONO, weight: 600, ls: 2, anchor });

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
  const shell = `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="14" fill="url(#cardbg)" stroke="${C.line}"/><rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="14" fill="url(#glowG)"/><rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="14" fill="url(#glowB)"/>`;
  const d = `<linearGradient id="cardbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101826"/><stop offset="1" stop-color="${C.bg}"/></linearGradient><radialGradient id="glowG" cx="1" cy="0" r=".7"><stop offset="0" stop-color="${C.green}" stop-opacity=".10"/><stop offset="1" stop-color="${C.green}" stop-opacity="0"/></radialGradient><radialGradient id="glowB" cx="0" cy="1" r=".6"><stop offset="0" stop-color="${C.blue}" stop-opacity=".08"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></radialGradient>${defs}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img"><defs>${d}</defs>${shell}${body}</svg>\n`;
}
// section header used by every card: mono kicker, bold title, optional right-aligned note
export const header = (w, kicker, title, note = "") => `${label(28, 36, kicker)}${text(28, 64, title, { size: 22, weight: 700 })}${note ? text(w - 28, 62, note, { size: 12, fill: C.mute, anchor: "end" }) : ""}`;
