/** Yönetim panelindeki bölümler ve düzenlenebilir alanları. */

export const profileFields = [
  { key: "name", label: "Adın", type: "text", required: true },
  { key: "role", label: "Unvanın", type: "text", placeholder: "bilgisayar mühendisi", help: "Ana sayfada adının altında görünür." },
  { key: "intro", label: "Ana sayfa giriş yazısı", type: "textarea" },
  { key: "words", label: "Yazılıyor efektindeki kelimeler", type: "lines", rows: 4, help: "Her satıra bir ifade. \"Geliştirdiğim şeyler:\" yazısından sonra sırayla yazılır." },
  { key: "about_lead", label: "Hakkımda: ilk cümle", type: "textarea", rows: 2 },
  { key: "about_body", label: "Hakkımda: paragraflar", type: "lines", rows: 6, help: "Her satır ayrı bir paragraf olur." },
  { key: "about_now", label: "Hakkımda: \"Şu an\" notu", type: "text" },
  { key: "contact_lead", label: "İletişim penceresindeki yazı", type: "textarea", rows: 2 },
  { key: "coffee_lines", label: "Kahveye tıklayınca çıkan mesajlar", type: "lines", rows: 6, help: "Sırayla gösterilir; sonuncusu tekrar eder." },
  { key: "cat_lines", label: "Kediye tıklayınca çıkan mesajlar", type: "lines", rows: 5, help: "Rastgele biri seçilir." },
];

export const lists = {
  projeler: {
    table: "projects",
    title: "Projeler",
    noun: "proje",
    help: "Laptoptaki \"Projelerim\" penceresinde görünür. Bağlantı boşsa \"yakında\" yazar.",
    summary: (r) => `${r.emoji} ${r.title}${r.published ? "" : "  (gizli)"}`,
    detail: (r) => r.description,
    fields: [
      { key: "emoji", label: "Emoji", type: "text", narrow: true, placeholder: "📋" },
      { key: "title", label: "Başlık", type: "text", required: true },
      { key: "description", label: "Açıklama", type: "textarea" },
      { key: "tags", label: "Teknolojiler", type: "tags", placeholder: "React, TypeScript, SQL", help: "Virgülle ayır." },
      { key: "demo_url", label: "Canlı demo bağlantısı", type: "url", placeholder: "https://…" },
      { key: "code_url", label: "Kod (GitHub) bağlantısı", type: "url", placeholder: "https://github.com/…" },
      { key: "published", label: "Sitede göster", type: "bool" },
    ],
  },
  yetenekler: {
    table: "skill_groups",
    title: "Yetenekler",
    noun: "grup",
    help: "Yapışkan notlar penceresinde grup grup görünür.",
    summary: (r) => r.name,
    detail: (r) => (r.items || []).join(", "),
    fields: [
      { key: "name", label: "Grup adı", type: "text", required: true, placeholder: "Ön yüz" },
      { key: "items", label: "Yetenekler", type: "tags", placeholder: "HTML, CSS, JavaScript", help: "Virgülle ayır." },
    ],
  },
  yolculuk: {
    table: "journey",
    title: "Yolculuk",
    noun: "adım",
    help: "Polaroid fotoğrafındaki zaman çizelgesi. Yukarıdan aşağıya sıralanır.",
    summary: (r) => `${r.when_label}: ${r.title}`,
    detail: (r) => r.body,
    fields: [
      { key: "when_label", label: "Zaman", type: "text", placeholder: "Mezuniyet" },
      { key: "title", label: "Başlık", type: "text", required: true },
      { key: "body", label: "Açıklama", type: "textarea" },
    ],
  },
  maddeler: {
    table: "facts",
    title: "Hakkımda maddeleri",
    noun: "madde",
    help: "\"Hakkımda\" penceresindeki kısa kartlar.",
    summary: (r) => `${r.icon} ${r.text}`,
    detail: () => "",
    fields: [
      { key: "icon", label: "Emoji", type: "text", narrow: true, placeholder: "🎓" },
      { key: "text", label: "Metin", type: "text", required: true },
    ],
  },
  baglantilar: {
    table: "contact_links",
    title: "Bağlantılar",
    noun: "bağlantı",
    help: "Telefondaki \"Bana yaz\" penceresinde görünür. Adres boşsa gösterilmez.",
    summary: (r) => `${r.icon} ${r.label}`,
    detail: (r) => r.href,
    fields: [
      { key: "icon", label: "Emoji", type: "text", narrow: true, placeholder: "✉️" },
      { key: "label", label: "Ad", type: "text", required: true, placeholder: "E-posta" },
      { key: "hint", label: "Görünen yazı", type: "text", placeholder: "merhaba@ornek.com" },
      { key: "href", label: "Adres", type: "url", placeholder: "mailto:merhaba@ornek.com veya https://…" },
    ],
  },
};

export const TABS = [
  { path: "profil", label: "Profil" },
  ...Object.entries(lists).map(([path, c]) => ({ path, label: c.title })),
];
