import { supabase } from "./supabase";
import { parsePath, SECTIONS } from "../i18n";

/**
 * Çerezsiz, basit sayfa görüntüleme kaydı: yalnızca sayfa adresi ve dil saklanır.
 * IP, tarayıcı bilgisi veya kimlik tutulmaz. Aynı sekmede aynı sayfa bir kez sayılır.
 * Yönetici girişi açıkken ve localhost'ta sayılmaz.
 */
export function trackView(pathname) {
  if (!supabase) return;
  const { lang, parts } = parsePath(pathname);
  const section = parts.length ? SECTIONS.find((s) => s.slug[lang] === parts[0]) : null;
  if (parts.length && !section) return; // bilinmeyen adres
  const path = `${lang === "en" ? "/en" : ""}${parts.length ? `/${parts.slice(0, 2).join("/")}` : ""}` || "/";

  try {
    if (["localhost", "127.0.0.1"].includes(location.hostname)) return;
    const key = `pv:${path}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch { /* depolama kapalıysa her seferinde sayılır, sorun değil */ }

  supabase.auth.getSession().then(({ data }) => {
    if (data.session) return;
    supabase.from("page_views").insert({ path: path.slice(0, 120), lang }).then(() => {});
  });
}

/** Ana sayfa ziyaret sayısı (yalnızca bir sayı döner). */
export async function fetchVisitCount() {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("visit_count");
  return error ? null : Number(data);
}
