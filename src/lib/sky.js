import { clamp, lerp, smooth } from "./util";

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgb = (c) => `rgb(${c.map((v) => Math.round(v)).join(",")})`;
const mix = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const luminance = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

const P = (skyTop, skyBot, wall, wallDeep, desk, deskDark, dark) => ({
  skyTop: hex(skyTop), skyBot: hex(skyBot), wall: hex(wall), wallDeep: hex(wallDeep),
  desk: hex(desk), deskDark: hex(deskDark), dark,
});

const NIGHT = P("#0b1030", "#2a2f6b", "#2c2a4d", "#1f1e3a", "#5b3f33", "#47312a", 1);
const DAWN = P("#6c6fb5", "#ffb48a", "#eccbb2", "#dcae94", "#a9714a", "#8f5b3a", 0.3);
const MORNING = P("#7cc4f2", "#d8f0ff", "#f8e8d2", "#eed5b6", "#b98255", "#9a6a42", 0);
const NOON = P("#4fb0ee", "#cdeeff", "#fbeed8", "#f1ddbf", "#bd8659", "#9e6d45", 0);
const GOLD = P("#f39a6b", "#ffe0a3", "#f6d6b3", "#e7ba93", "#b47b4b", "#966238", 0.12);
const DUSK = P("#3b3a8a", "#f0708a", "#6f506e", "#523a58", "#7d5238", "#65422d", 0.7);

const KEYFRAMES = [[0, NIGHT], [5, NIGHT], [6.2, DAWN], [9, MORNING], [13, NOON], [17.5, GOLD], [19.5, DUSK], [21.5, NIGHT], [24, NIGHT]];

/** Günün saatine (0–24) göre renk paleti üretir. */
export function sample(h) {
  let i = 0;
  while (i < KEYFRAMES.length - 2 && h >= KEYFRAMES[i + 1][0]) i++;
  const [h0, a] = KEYFRAMES[i];
  const [h1, b] = KEYFRAMES[i + 1];
  const t = smooth(clamp((h - h0) / (h1 - h0), 0, 1));
  const out = {};
  for (const k in a) out[k] = Array.isArray(a[k]) ? mix(a[k], b[k], t) : lerp(a[k], b[k], t);
  return out;
}

/** Paletten CSS değişkenleri üretir. Duvar açıksa koyu, karanlıksa açık yazı rengi seçilir. */
export function cssVars(c) {
  const t = smooth(clamp((luminance(c.wall) - 0.5) / 0.16, 0, 1));
  return {
    "--sky-top": rgb(c.skyTop),
    "--sky-bot": rgb(c.skyBot),
    "--wall": rgb(c.wall),
    "--wall-deep": rgb(c.wallDeep),
    "--desk": rgb(c.desk),
    "--desk-dark": rgb(c.deskDark),
    "--dark": c.dark.toFixed(3),
    "--ink": rgb(mix(hex("#f4eeff"), hex("#2b2233"), t)),
    "--ink-soft": rgb(mix(hex("#cdc3e6"), hex("#6a5b6e"), t)),
  };
}

export const greetingFor = (h) =>
  h >= 5 && h < 11 ? "Günaydın ☀️" : h >= 11 && h < 17 ? "Merhaba 👋" : h >= 17 && h < 22 ? "İyi akşamlar 🌆" : "Hâlâ uyanık mısın? 🌙";

/** Güneş/ay yayı üzerindeki konumu: p 0..1 arası ilerleme. */
export function orbit(p, fadeEdge = 8) {
  const visible = p > -0.02 && p < 1.02;
  const q = clamp(p, 0, 1);
  return {
    opacity: visible ? clamp(Math.min(p, 1 - p) * fadeEdge, 0, 1) : 0,
    left: `${12 + 76 * q}%`,
    top: `${80 - Math.sin(Math.PI * q) * 58}%`,
  };
}

export const sunProgress = (h) => (h - 6) / 13.5;
export const moonProgress = (h) => (h >= 19 ? (h - 19) / 12 : h < 7 ? (h + 5) / 12 : -1);

export const nowMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
};
