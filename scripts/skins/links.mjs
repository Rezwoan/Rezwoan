import { esc, MONO, SANS, C, text } from "./lib.mjs";

// Icon buttons for the README's Connect row. Each is its own SVG so it can sit inside an <a>.
const G = { // 28px glyphs drawn on a coloured tile
  in: `<text x="14" y="20" font-family="${SANS}" font-size="15" font-weight="800" fill="#fff" text-anchor="middle">in</text>`,
  x: `<path d="M8.5 8.5l11 11M19.5 8.5l-11 11" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`,
  f: `<text x="15" y="23" font-family="${SANS}" font-size="20" font-weight="800" fill="#fff" text-anchor="middle">f</text>`,
  ig: `<rect x="7" y="7" width="14" height="14" rx="4" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="14" cy="14" r="3.2" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="18" cy="10" r="1" fill="#fff"/>`,
  wa: `<path d="M14 6.5a7.5 7.5 0 0 0-6.4 11.4L6.5 21.5l3.7-1A7.5 7.5 0 1 0 14 6.5z" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><path d="M11.3 11c.2 2.2 2.6 4.6 5 5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`,
  web: `<circle cx="14" cy="14" r="7" fill="none" stroke="#fff" stroke-width="1.8"/><ellipse cx="14" cy="14" rx="3" ry="7" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M7 14h14" stroke="#fff" stroke-width="1.6"/>`,
};
const TILE = { in: "#0a66c2", x: "#111", f: "#1877f2", ig: "url(#ig)", wa: "#25d366", web: "url(#wb)" };

export const LINKS = [
  ["linkedin", "LinkedIn", "Connect", "in"], ["x", "X", "@XRezwoan", "x"], ["facebook", "Facebook", "Follow", "f"],
  ["instagram", "Instagram", "Follow", "ig"], ["whatsapp", "WhatsApp", "Message", "wa"], ["portfolio", "Portfolio", "rezwoan.codes", "web"],
];

export function button([, name, sub, g]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="134" height="46" viewBox="0 0 134 46" role="img"><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121a28"/><stop offset="1" stop-color="#0c121c"/></linearGradient><linearGradient id="ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#feda75"/><stop offset=".4" stop-color="#d62976"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient><linearGradient id="wb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3fb950"/><stop offset="1" stop-color="#58a6ff"/></linearGradient></defs>
<rect x=".5" y=".5" width="133" height="45" rx="14" fill="url(#bg)" stroke="${C.line}"/><g transform="translate(9,9)"><rect width="28" height="28" rx="8" fill="${TILE[g]}"${g === "x" ? ` stroke="#30363d"` : ""}/>${G[g]}</g>
${text(46, 21, name, { size: 13.5, weight: 700 })}${text(46, 35, sub, { size: 10.5, fill: C.mute, font: MONO })}</svg>
`;
}
