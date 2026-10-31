import { pickList, pickText } from "../i18n";

/**
 * Varsayılan içerik. Veritabanına ulaşılamazsa (ya da içerik yüklenirken)
 * site bununla açılır. Asıl içerik Supabase'den gelir; /admin sayfasından düzenlenir.
 */
export const defaultContent = {
  profile: {
    name: "Mehmet Can",
    role: "bilgisayar mühendisi",
    intro:
      "Burası benim masam. Nesneleri sürükleyip karıştırabilir, tıklayıp içine bakabilirsin. Sitenin ışığı da senin saatine göre değişiyor.",
    words: ["web uygulamaları", "backend servisleri", "küçük ama işe yarar araçlar", "güzel arayüzler"],
    aboutLead: "Merhaba! Ben bilgisayar mühendisliği mezunuyum ve yazılım geliştirmeyi gerçekten seviyorum.",
    aboutBody: [
      "Bir fikri çalışan bir ürüne dönüştürmek, karmaşık bir problemi sade bir çözüme indirmek beni en çok mutlu eden şey.",
    ],
    aboutNow: "Yeni projeler geliştiriyor ve kendimi ilerletiyorum.",
    contactLead: "Bir proje, bir fikir ya da sadece bir merhaba… Yaz, kahve benden. ☕",
    coffeeLines: ["1. kahve ☕ — motor çalıştı.", "2. kahve — bug'lar titremeye başladı.", "3. kahve — kod artık kendiliğinden akıyor."],
    catLines: ["Miyav! 🐱", "Prrrr… bu kod iyi görünüyor.", "Çalışıyor mu? Dokunma. 🐾"],
    bookLines: ["Önce çalıştır, sonra güzelleştir, sonra hızlandır."],
  },
  facts: [
    { id: "f1", icon: "🎓", text: "Bilgisayar Mühendisliği mezunu" },
    { id: "f2", icon: "☕", text: "Kod + kahve = mutlu ben" },
  ],
  projects: [],
  skills: [],
  journey: [],
  links: [],
};

/** Supabase satırlarını, seçili dile göre arayüzün kullandığı biçime çevirir. */
export function normalizeContent({ profile, facts, projects, skills, journey, links }, lang) {
  const p = profile || {};
  const d = defaultContent.profile;
  const text = (tr, en) => pickText(lang, tr, en);
  const list = (tr, en, fallback) => {
    const v = pickList(lang, tr, en);
    return v.length ? v : fallback;
  };
  return {
    profile: {
      name: p.name || d.name,
      role: text(p.role ?? d.role, p.role_en),
      intro: text(p.intro ?? d.intro, p.intro_en),
      words: list(p.words, p.words_en, d.words),
      aboutLead: text(p.about_lead ?? d.aboutLead, p.about_lead_en),
      aboutBody: list(p.about_body, p.about_body_en, d.aboutBody),
      aboutNow: text(p.about_now ?? d.aboutNow, p.about_now_en),
      contactLead: text(p.contact_lead ?? d.contactLead, p.contact_lead_en),
      coffeeLines: list(p.coffee_lines, p.coffee_lines_en, d.coffeeLines),
      catLines: list(p.cat_lines, p.cat_lines_en, d.catLines),
      bookLines: list(p.book_lines, p.book_lines_en, d.bookLines),
    },
    facts: (facts || []).map((r) => ({ id: r.id, icon: r.icon, text: text(r.text, r.text_en) })),
    projects: (projects || []).map((r) => ({
      id: r.id, emoji: r.emoji, title: text(r.title, r.title_en), description: text(r.description, r.description_en),
      tags: r.tags || [], demoUrl: r.demo_url, codeUrl: r.code_url,
    })),
    skills: (skills || []).map((r) => ({ id: r.id, name: text(r.name, r.name_en), items: pickList(lang, r.items, r.items_en) })),
    journey: (journey || []).map((r) => ({
      id: r.id, when: text(r.when_label, r.when_label_en), title: text(r.title, r.title_en), body: text(r.body, r.body_en),
    })),
    links: (links || []).map((r) => ({ id: r.id, icon: r.icon, label: text(r.label, r.label_en), hint: text(r.hint, r.hint_en), href: r.href })),
  };
}
