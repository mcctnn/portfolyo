// Derleme sonrası: arama motorları ve paylaşım önizlemeleri için her sayfaya ayrı index.html üretir,
// yayınlanmış yazıları Supabase'den okuyup onlara da sayfa açar, sitemap.xml yazar ve 404.html'i hazırlar.
//
// Not: bu dosyadaki bölüm adresleri ve başlıklar src/i18n içindekilerle aynı olmalı.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const DIST = "dist";
const SITE = (process.env.SITE_URL || "https://mcctnn.github.io/portfolyo").replace(/\/$/, "");
const NAME = "Mehmet Can Çetin";

// Yerel derlemede .env'yi oku (GitHub Actions'ta değişkenler zaten ortamda)
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}
const SB_URL = process.env.VITE_SUPABASE_URL;
const SB_KEY = process.env.VITE_SUPABASE_KEY;

const SECTIONS = [
  { key: "about", slug: { tr: "hakkimda", en: "about" } },
  { key: "projects", slug: { tr: "projeler", en: "projects" } },
  { key: "skills", slug: { tr: "yetenekler", en: "skills" } },
  { key: "journey", slug: { tr: "yolculuk", en: "journey" } },
  { key: "posts", slug: { tr: "yazilar", en: "writing" } },
  { key: "contact", slug: { tr: "iletisim", en: "contact" } },
];

const TEXT = {
  tr: {
    locale: "tr_TR",
    site: "Masamdan Merhaba",
    desc: "Mehmet Can Çetin: .NET backend geliştirici, bilgisayar mühendisi. ASP.NET Core, Clean Architecture ve ERP projeleri. Masamı karıştır, projelerime göz at.",
    titles: { about: "Hakkımda", projects: "Projelerim", skills: "Yeteneklerim", journey: "Yolculuğum", contact: "Bana yaz", posts: "Yazılarım" },
    descs: {
      about: "Düzce Üniversitesi Bilgisayar Mühendisliği mezunu, .NET backend geliştirici Mehmet Can Çetin hakkında.",
      projects: "ASP.NET Core, Clean Architecture, CQRS ve mikroservis projelerim: ERP paneli, e-ticaret, API'ler.",
      skills: "C#, .NET, ASP.NET Core, Entity Framework Core, PostgreSQL, MSSQL, Angular ve React yeteneklerim.",
      journey: "Liseden bugüne eğitim ve iş yolculuğum: stajlar, mezuniyet ve yazılıma bakışım.",
      contact: "Bir proje ya da fikir için bana yaz: e-posta, GitHub, LinkedIn veya iletişim formu.",
      posts: "Yazılım, backend ve mimari üzerine yazılarım.",
    },
  },
  en: {
    locale: "en_US",
    site: "Hello from my desk",
    desc: "Mehmet Can Çetin: .NET backend developer and computer engineer. ASP.NET Core, Clean Architecture and ERP projects. Rearrange my desk and browse my work.",
    titles: { about: "About me", projects: "My projects", skills: "My skills", journey: "My journey", contact: "Write to me", posts: "My writing" },
    descs: {
      about: "About Mehmet Can Çetin, a .NET backend developer and Düzce University Computer Engineering graduate.",
      projects: "My ASP.NET Core, Clean Architecture, CQRS and microservice projects: an ERP dashboard, e-commerce, APIs.",
      skills: "My skills in C#, .NET, ASP.NET Core, Entity Framework Core, PostgreSQL, MSSQL, Angular and React.",
      journey: "My education and work journey from high school to today: internships, graduation and how I see software.",
      contact: "Write to me about a project or an idea: email, GitHub, LinkedIn or the contact form.",
      posts: "My writing on software, backend and architecture.",
    },
  },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const prefix = (lang) => (lang === "en" ? "/en" : "");
const urlPath = (lang, section, child) =>
  section ? `${prefix(lang)}/${section.slug[lang]}${child ? `/${child}` : ""}/` : `${prefix(lang)}/`;

const template = readFileSync(join(DIST, "index.html"), "utf8");

function render({ lang, title, desc, path, alternates }) {
  const url = SITE + path;
  let html = template
    .replace(/<html lang="[^"]*">/, `<html lang="${lang}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`)
    .replace(/<meta property="og:locale" content="[^"]*">/, `<meta property="og:locale" content="${TEXT[lang].locale}">`);
  const links = alternates.map(([hl, p]) => `  <link rel="alternate" hreflang="${hl}" href="${SITE}${p}" data-i18n="1">`).join("\n");
  return html.replace("</head>", `${links}\n</head>`);
}

function write(path, html) {
  const file = join(DIST, path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

async function fetchPosts() {
  if (!SB_URL || !SB_KEY) { console.warn("Supabase bilgisi yok, yazı sayfaları üretilmedi."); return []; }
  try {
    const q = "select=slug,title,title_en,excerpt,excerpt_en,published_at&published=eq.true&order=published_at.desc";
    const r = await fetch(`${SB_URL}/rest/v1/posts?${q}`, { headers: { apikey: SB_KEY } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    console.warn("Yazılar alınamadı, yazı sayfaları üretilmedi:", e.message);
    return [];
  }
}

const posts = await fetchPosts();
const entries = []; // sitemap için: { alts: [[hreflang, path]], lastmod? }

// Ana sayfalar ve bölümler
const homeAlts = [["tr", urlPath("tr")], ["en", urlPath("en")], ["x-default", urlPath("tr")]];
entries.push({ alts: homeAlts, path: urlPath("tr") }, { alts: homeAlts, path: urlPath("en") });
write("/en", render({ lang: "en", title: `${NAME} — ${TEXT.en.site}`, desc: TEXT.en.desc, path: urlPath("en"), alternates: homeAlts }));
// Türkçe ana sayfa dist/index.html'in kendisi; canonical ve alternatifleri ekle
writeFileSync(join(DIST, "index.html"), render({ lang: "tr", title: `${NAME} — ${TEXT.tr.site}`, desc: TEXT.tr.desc, path: urlPath("tr"), alternates: homeAlts }));

for (const s of SECTIONS) {
  const alts = [["tr", urlPath("tr", s)], ["en", urlPath("en", s)], ["x-default", urlPath("tr", s)]];
  entries.push({ alts, path: urlPath("tr", s) }, { alts, path: urlPath("en", s) });
  for (const lang of ["tr", "en"]) {
    write(urlPath(lang, s), render({
      lang, title: `${TEXT[lang].titles[s.key]} — ${NAME}`, desc: TEXT[lang].descs[s.key], path: urlPath(lang, s), alternates: alts,
    }));
  }
}

// Yayınlanmış yazılar
const postsSection = SECTIONS.find((s) => s.key === "posts");
for (const p of posts) {
  const alts = [["tr", urlPath("tr", postsSection, p.slug)], ["en", urlPath("en", postsSection, p.slug)], ["x-default", urlPath("tr", postsSection, p.slug)]];
  entries.push({ alts, path: urlPath("tr", postsSection, p.slug), lastmod: p.published_at }, { alts, path: urlPath("en", postsSection, p.slug), lastmod: p.published_at });
  for (const lang of ["tr", "en"]) {
    const title = lang === "en" && p.title_en ? p.title_en : p.title;
    const desc = (lang === "en" && p.excerpt_en ? p.excerpt_en : p.excerpt) || TEXT[lang].descs.posts;
    write(urlPath(lang, postsSection, p.slug), render({
      lang, title: `${title} — ${NAME}`, desc, path: urlPath(lang, postsSection, p.slug), alternates: alts,
    }));
  }
}

// sitemap.xml
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map((e) => `  <url>
    <loc>${SITE}${e.path}</loc>${e.lastmod ? `\n    <lastmod>${new Date(e.lastmod).toISOString().slice(0, 10)}</lastmod>` : ""}
${e.alts.map(([hl, p]) => `    <xhtml:link rel="alternate" hreflang="${hl}" href="${SITE}${p}"/>`).join("\n")}
  </url>`).join("\n")}
</urlset>
`;
writeFileSync(join(DIST, "sitemap.xml"), sitemap);

// Bilinmeyen adreslerde GitHub Pages bu dosyayı gösterir; uygulama yine açılır (admin vb. için)
copyFileSync(join(DIST, "index.html"), join(DIST, "404.html"));

console.log(`${entries.length} sayfa adresi, ${posts.length} yazı, sitemap.xml ve 404.html üretildi`);
