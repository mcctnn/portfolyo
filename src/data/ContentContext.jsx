import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { defaultContent, normalizeContent } from "./defaults";

const ContentContext = createContext(null);

async function fetchContent() {
  const byOrder = (q) => q.order("sort_order", { ascending: true }).order("id", { ascending: true });
  const [profile, facts, projects, skills, journey, links] = await Promise.all([
    supabase.from("profile").select("*").eq("id", 1).maybeSingle(),
    byOrder(supabase.from("facts").select("*")),
    byOrder(supabase.from("projects").select("*")),
    byOrder(supabase.from("skill_groups").select("*")),
    byOrder(supabase.from("journey").select("*")),
    byOrder(supabase.from("contact_links").select("*")),
  ]);
  const failed = [profile, facts, projects, skills, journey, links].find((r) => r.error);
  if (failed) throw failed.error;
  return normalizeContent({
    profile: profile.data, facts: facts.data, projects: projects.data,
    skills: skills.data, journey: journey.data, links: links.data,
  });
}

/** İçeriği Supabase'den yükler; başarısız olursa varsayılan içerikle devam eder. */
export function ContentProvider({ children }) {
  const [content, setContent] = useState(defaultContent);
  const [status, setStatus] = useState(supabase ? "loading" : "fallback");

  const reload = useCallback(async () => {
    if (!supabase) return;
    try {
      setContent(await fetchContent());
      setStatus("ready");
    } catch (err) {
      console.warn("İçerik yüklenemedi, varsayılan içerik kullanılıyor:", err);
      setStatus("fallback");
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const value = useMemo(() => ({ content, status, reload }), [content, status, reload]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent, ContentProvider içinde kullanılmalı");
  return ctx;
}
