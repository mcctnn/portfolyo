export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => t * t * (3 - 2 * t);
export const pad = (n) => String(n).padStart(2, "0");
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Yönetici panelinden gelen bağlantılarda yalnızca güvenli protokollere izin verir. */
export function safeHref(href) {
  const v = String(href || "").trim();
  if (!v) return "";
  if (/^(https?:|mailto:|tel:)/i.test(v)) return v;
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(v)) return `https://${v}`;
  return "";
}
