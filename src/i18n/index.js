import { useLocation } from "react-router-dom";
import { dict } from "./strings";

/**
 * Bölümler ve adresleri. Türkçe adresler kökte (/projeler), İngilizce olanlar /en altında (/en/projects).
 * Yazılar (posts) için adresin sonuna yazının slug'ı eklenebilir: /yazilar/ornek, /en/writing/ornek.
 */
export const SECTIONS = [
  { key: "about", slug: { tr: "hakkimda", en: "about" } },
  { key: "projects", slug: { tr: "projeler", en: "projects" } },
  { key: "skills", slug: { tr: "yetenekler", en: "skills" } },
  { key: "journey", slug: { tr: "yolculuk", en: "journey" } },
  { key: "posts", slug: { tr: "yazilar", en: "writing" }, hasChild: true },
  { key: "contact", slug: { tr: "iletisim", en: "contact" } },
];

export const sectionByKey = (key) => SECTIONS.find((s) => s.key === key);

/** "/en/projects/abc" → { lang: "en", parts: ["projects", "abc"] } */
export function parsePath(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  const lang = parts[0] === "en" ? "en" : "tr";
  return { lang, parts: lang === "en" ? parts.slice(1) : parts };
}

/** Bölüm anahtarından adres üretir. key boşsa o dilin ana sayfası. */
export function pathFor(lang, key, child) {
  const prefix = lang === "en" ? "/en" : "";
  if (!key) return prefix || "/";
  const s = sectionByKey(key);
  return `${prefix}/${s.slug[lang]}${child ? `/${child}` : ""}`;
}

/** Aynı sayfanın öbür dildeki adresi. Bilinmeyen adresler ana sayfaya düşer. */
export function switchPath(pathname, targetLang) {
  const { lang, parts } = parsePath(pathname);
  const section = SECTIONS.find((s) => s.slug[lang] === parts[0]);
  if (!section) return pathFor(targetLang);
  return pathFor(targetLang, section.key, section.hasChild ? parts[1] : undefined);
}

/** Geçerli dili, metinleri ve adres üreticiyi verir. */
export function useI18n() {
  const { pathname } = useLocation();
  const { lang } = parsePath(pathname);
  return { lang, t: dict[lang], to: (key, child) => pathFor(lang, key, child), otherLang: lang === "en" ? "tr" : "en" };
}

/** İçerik alanlarında İngilizce boşsa Türkçeye düşer. */
export const pickText = (lang, tr, en) => (lang === "en" && en ? en : tr);
export const pickList = (lang, tr, en) => (lang === "en" && Array.isArray(en) && en.length ? en : tr || []);
