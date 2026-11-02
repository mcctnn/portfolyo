import { clamp, lerp, smooth } from "./util";

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgb = (c) => `rgb(${c.map((v) => Math.round(v)).join(",")})`;
const mix = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));

// WCAG göreli parlaklık ve kontrast oranı (yazı okunabilirliği için)
const lin = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const relLum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (a, b) => {
  const x = relLum(a), y = relLum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const OVERLAY = [12, 8, 34]; // .scene::after: geceleri hem zemini hem metni karartan katman
const MIN_CONTRAST = 4.5;

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

/**
 * Paletten CSS değişkenleri üretir.
 * Yazı rengi, koyu ve açık adaydan duvarla kontrastı yüksek olanı seçilerek belirlenir; gerekirse
 * kontrast 4.5:1'e kadar itilir. (Eskiden iki renk arasında ara tonlardan geçiliyordu; akşam duvar
 * orta tondayken yazı neredeyse görünmez oluyordu.)
 */
export function cssVars(c) {
  const alpha = c.dark * 0.32;
  const shade = (col) => mix(col, OVERLAY, alpha);
  const bgs = [shade(c.wall), shade(c.wallDeep)];
  const worst = (fg) => Math.min(...bgs.map((bg) => contrast(shade(fg), bg)));

  // Hedef kontrasta ulaşana kadar rengi uca (siyaha ya da beyaza) doğru iter
  const push = (fg, target, min) => {
    let color = fg;
    for (let t = 0; worst(color) < min && t < 1; ) { t += 0.05; color = mix(fg, target, t); }
    return color;
  };
  const dark = {
    ink: push(hex("#241a2c"), [0, 0, 0], 7),
    soft: push(hex("#5a4b60"), [0, 0, 0], MIN_CONTRAST),
    accent: push(hex("#ff6b4a"), [40, 6, 0], MIN_CONTRAST),
  };
  const light = {
    ink: push(hex("#f8f4ff"), [255, 255, 255], 7),
    soft: push(hex("#d4cbea"), [255, 255, 255], MIN_CONTRAST),
    accent: push(hex("#ff6b4a"), [255, 235, 228], MIN_CONTRAST),
  };
  // İki yönden hangisinin metni daha okunur kıldığına bakılır (orta tonlu duvarda da en iyisi seçilir)
  const score = (set) => Math.min(worst(set.ink), worst(set.soft));
  const useDark = score(dark) >= score(light);
  const { ink, soft, accent } = useDark ? dark : light;
  // Yazının etrafına, yazı renginin tersi yumuşak bir hale: orta tonlu duvarda okunurluğu korur
  const halo = useDark ? "rgba(255, 248, 236, .65)" : "rgba(12, 8, 34, .6)";

  return {
    "--sky-top": rgb(c.skyTop),
    "--sky-bot": rgb(c.skyBot),
    "--wall": rgb(c.wall),
    "--wall-deep": rgb(c.wallDeep),
    "--desk": rgb(c.desk),
    "--desk-dark": rgb(c.deskDark),
    "--dark": c.dark.toFixed(3),
    "--ink": rgb(ink),
    "--ink-soft": rgb(soft),
    "--accent": rgb(accent),
    "--halo": halo,
  };
}

/** Günün saatine göre karşılama anahtarı; metni i18n sözlüğünden gelir. */
export const greetingFor = (h) =>
  h >= 5 && h < 11 ? "morning" : h >= 11 && h < 17 ? "day" : h >= 17 && h < 22 ? "evening" : "night";

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
