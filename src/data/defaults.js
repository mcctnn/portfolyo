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

/** Supabase satırlarını arayüzün kullandığı biçime çevirir. */
export function normalizeContent({ profile, facts, projects, skills, journey, links }) {
  const p = profile || {};
  const d = defaultContent.profile;
  const arr = (v, fallback) => (Array.isArray(v) && v.length ? v : fallback);
  return {
    profile: {
      name: p.name || d.name,
      role: p.role ?? d.role,
      intro: p.intro ?? d.intro,
      words: arr(p.words, d.words),
      aboutLead: p.about_lead ?? d.aboutLead,
      aboutBody: p.about_body ?? d.aboutBody,
      aboutNow: p.about_now ?? d.aboutNow,
      contactLead: p.contact_lead ?? d.contactLead,
      coffeeLines: arr(p.coffee_lines, d.coffeeLines),
      catLines: arr(p.cat_lines, d.catLines),
    },
    facts: (facts || []).map((r) => ({ id: r.id, icon: r.icon, text: r.text })),
    projects: (projects || []).map((r) => ({
      id: r.id, emoji: r.emoji, title: r.title, description: r.description,
      tags: r.tags || [], demoUrl: r.demo_url, codeUrl: r.code_url,
    })),
    skills: (skills || []).map((r) => ({ id: r.id, name: r.name, items: r.items || [] })),
    journey: (journey || []).map((r) => ({ id: r.id, when: r.when_label, title: r.title, body: r.body })),
    links: (links || []).map((r) => ({ id: r.id, icon: r.icon, label: r.label, hint: r.hint, href: r.href })),
  };
}
