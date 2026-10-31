/** Yönetim panelindeki bölümler ve düzenlenebilir alanları. */

/** i18n: true olan her alanın hemen altına "(English)" ikizini ekler. Boşsa sitede Türkçesi görünür. */
const withEn = (fields) =>
  fields.flatMap((f) =>
    f.i18n
      ? [
          { ...f, i18n: false },
          { ...f, key: `${f.key}_en`, label: `${f.label} (English)`, i18n: false, required: false, placeholder: "", help: "Boş bırakırsan Türkçesi gösterilir.", normalize: undefined },
        ]
      : [f],
  );

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const profileFields = withEn([
  { key: "name", label: "Adın", type: "text", required: true },
  { key: "role", label: "Unvanın", type: "text", placeholder: "bilgisayar mühendisi", help: "Ana sayfada adının altında görünür.", i18n: true },
  { key: "intro", label: "Ana sayfa giriş yazısı", type: "textarea", i18n: true },
  { key: "words", label: "Yazılıyor efektindeki kelimeler", type: "lines", rows: 4, help: "Her satıra bir ifade. \"Geliştirdiğim şeyler:\" yazısından sonra sırayla yazılır.", i18n: true },
  { key: "about_lead", label: "Hakkımda: ilk cümle", type: "textarea", rows: 2, i18n: true },
  { key: "about_body", label: "Hakkımda: paragraflar", type: "lines", rows: 6, help: "Her satır ayrı bir paragraf olur.", i18n: true },
  { key: "about_now", label: "Hakkımda: \"Şu an\" notu", type: "text", i18n: true },
  { key: "contact_lead", label: "İletişim penceresindeki yazı", type: "textarea", rows: 2, i18n: true },
  { key: "coffee_lines", label: "Kahveye tıklayınca çıkan mesajlar", type: "lines", rows: 6, help: "Sırayla gösterilir; sonuncusu tekrar eder.", i18n: true },
  { key: "cat_lines", label: "Kediye tıklayınca çıkan mesajlar", type: "lines", rows: 5, help: "Rastgele biri seçilir.", i18n: true },
  { key: "book_lines", label: "Kitaplara tıklayınca çıkan sözler", type: "lines", rows: 5, help: "Rastgele biri seçilir.", i18n: true },
]);

export const lists = {
  projeler: {
    table: "projects",
    title: "Projeler",
    noun: "proje",
    help: "Laptoptaki \"Projelerim\" penceresinde görünür. Bağlantı boşsa \"yakında\" yazar.",
    summary: (r) => `${r.emoji} ${r.title}${r.published ? "" : "  (gizli)"}`,
    detail: (r) => r.description,
    fields: withEn([
      { key: "emoji", label: "Emoji", type: "text", narrow: true, placeholder: "📋" },
      { key: "title", label: "Başlık", type: "text", required: true, i18n: true },
      { key: "description", label: "Açıklama", type: "textarea", i18n: true },
      { key: "tags", label: "Teknolojiler", type: "tags", placeholder: "React, TypeScript, SQL", help: "Virgülle ayır." },
      { key: "demo_url", label: "Canlı demo bağlantısı", type: "url", placeholder: "https://…" },
      { key: "code_url", label: "Kod (GitHub) bağlantısı", type: "url", placeholder: "https://github.com/…" },
      { key: "published", label: "Sitede göster", type: "bool" },
    ]),
  },
  yetenekler: {
    table: "skill_groups",
    title: "Yetenekler",
    noun: "grup",
    help: "Yapışkan notlar penceresinde grup grup görünür.",
    summary: (r) => r.name,
    detail: (r) => (r.items || []).join(", "),
    fields: withEn([
      { key: "name", label: "Grup adı", type: "text", required: true, placeholder: "Ön yüz", i18n: true },
      { key: "items", label: "Yetenekler", type: "tags", placeholder: "HTML, CSS, JavaScript", help: "Virgülle ayır.", i18n: true },
    ]),
  },
  yolculuk: {
    table: "journey",
    title: "Yolculuk",
    noun: "adım",
    help: "Polaroid fotoğrafındaki zaman çizelgesi. Yukarıdan aşağıya sıralanır.",
    summary: (r) => `${r.when_label}: ${r.title}`,
    detail: (r) => r.body,
    fields: withEn([
      { key: "when_label", label: "Zaman", type: "text", placeholder: "Mezuniyet", i18n: true },
      { key: "title", label: "Başlık", type: "text", required: true, i18n: true },
      { key: "body", label: "Açıklama", type: "textarea", i18n: true },
    ]),
  },
  maddeler: {
    table: "facts",
    title: "Hakkımda maddeleri",
    noun: "madde",
    help: "\"Hakkımda\" penceresindeki kısa kartlar.",
    summary: (r) => `${r.icon} ${r.text}`,
    detail: () => "",
    fields: withEn([
      { key: "icon", label: "Emoji", type: "text", narrow: true, placeholder: "🎓" },
      { key: "text", label: "Metin", type: "text", required: true, i18n: true },
    ]),
  },
  baglantilar: {
    table: "contact_links",
    title: "Bağlantılar",
    noun: "bağlantı",
    help: "Telefondaki \"Bana yaz\" penceresinde görünür. Adres boşsa gösterilmez.",
    summary: (r) => `${r.icon} ${r.label}`,
    detail: (r) => r.href,
    fields: withEn([
      { key: "icon", label: "Emoji", type: "text", narrow: true, placeholder: "✉️" },
      { key: "label", label: "Ad", type: "text", required: true, placeholder: "E-posta", i18n: true },
      { key: "hint", label: "Görünen yazı", type: "text", placeholder: "merhaba@ornek.com", i18n: true },
      { key: "href", label: "Adres", type: "url", placeholder: "mailto:merhaba@ornek.com veya https://…" },
    ]),
  },
  yazilar: {
    table: "posts",
    title: "Yazılar",
    noun: "yazı",
    help: "Masadaki mavi defterde görünür. İçerikte ## başlık, **kalın**, `kod`, - liste, > alıntı ve ``` kod bloğu kullanabilirsin. Yeni yazının kendi sayfası bir sonraki yayında (en geç ertesi gün) arama motorlarına açılır; siteyi açan ziyaretçiler ise hemen görür.",
    sortable: false,
    order: [["published_at", { ascending: false }]],
    summary: (r) => `${r.emoji} ${r.title}${r.published ? "" : "  (taslak)"}`,
    detail: (r) => `/${r.slug} · ${r.excerpt}`,
    fields: withEn([
      { key: "emoji", label: "Emoji", type: "text", narrow: true, placeholder: "📝" },
      { key: "title", label: "Başlık", type: "text", required: true, i18n: true },
      { key: "slug", label: "Adres (slug)", type: "text", required: true, placeholder: "ilk-yazim", help: "Küçük harf, rakam ve tire. Yazının adresi olur, sonradan değiştirme.", normalize: slugify },
      { key: "excerpt", label: "Kısa özet", type: "textarea", rows: 2, help: "Listede ve arama sonuçlarında görünür.", i18n: true },
      { key: "body", label: "İçerik", type: "textarea", rows: 16, i18n: true },
      { key: "published", label: "Yayınla (kapalıysa taslak)", type: "bool" },
    ]),
  },
};

export const TABS = [
  { path: "profil", label: "Profil" },
  ...["projeler", "yetenekler", "yolculuk", "maddeler", "baglantilar", "yazilar"].map((path) => ({ path, label: lists[path].title })),
  { path: "mesajlar", label: "Mesajlar" },
  { path: "istatistik", label: "İstatistik" },
];
