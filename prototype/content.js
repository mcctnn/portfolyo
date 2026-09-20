/* ------------------------------------------------------------------
   İÇERİK DOSYASI — siteyi buradan düzenlersin.
   Aşağıdaki her şey ÖRNEKTİR; kendi bilgilerinle değiştir.
   ------------------------------------------------------------------ */
window.SITE = {
  name: "Mehmet Can",
  role: "bilgisayar mühendisi",

  // Ana sayfadaki "yazılıyor" efektinde dönen kelimeler
  words: ["web uygulamaları", "backend servisleri", "küçük ama işe yarar araçlar", "güzel arayüzler"],

  intro:
    "Burası benim masam. Nesneleri sürükleyip karıştırabilir, tıklayıp içine bakabilirsin. Sitenin ışığı da senin saatine göre değişiyor.",

  about: {
    lead: "Merhaba! Ben bilgisayar mühendisliği mezunuyum ve yazılım geliştirmeyi gerçekten seviyorum.",
    body: [
      "Bir fikri çalışan bir ürüne dönüştürmek, karmaşık bir problemi sade bir çözüme indirmek beni en çok mutlu eden şey. Kod kadar, o ürünü kullanan kişinin ne hissettiği de benim için önemli.",
      "Yeni şeyler öğrenmeye açığım; takım içinde iletişimi güçlü, işini sahiplenen biri olmaya çalışıyorum."
    ],
    facts: [
      { icon: "🎓", text: "Bilgisayar Mühendisliği mezunu" },
      { icon: "💻", text: "Web ve masaüstü uygulamaları geliştiriyorum" },
      { icon: "☕", text: "Kod + kahve = mutlu ben" },
      { icon: "🌙", text: "Gece kuşuyum, en iyi fikirler 23:00'ten sonra gelir" }
    ],
    now: "Yeni projeler geliştiriyor ve kendimi ilerletiyorum."
  },

  // href "#" bırakırsan link "yakında" olarak görünür
  projects: [
    {
      emoji: "📋",
      title: "Görev Panosu",
      desc: "Sürükle-bırak çalışan, takımlar için sade bir kanban panosu.",
      tags: ["React", "TypeScript", "REST API"],
      links: [{ label: "Demo", href: "#" }, { label: "Kod", href: "#" }]
    },
    {
      emoji: "📅",
      title: "Rezervasyon Sistemi",
      desc: "Randevu ve rezervasyonları yöneten, yönetici paneli olan bir uygulama.",
      tags: ["C#", ".NET", "SQL"],
      links: [{ label: "Demo", href: "#" }, { label: "Kod", href: "#" }]
    },
    {
      emoji: "⛅",
      title: "Hava Durumu Panosu",
      desc: "Şehirleri karşılaştıran, grafiklerle dolu küçük bir pano.",
      tags: ["JavaScript", "API", "Chart"],
      links: [{ label: "Demo", href: "#" }, { label: "Kod", href: "#" }]
    },
    {
      emoji: "✍️",
      title: "Mini Blog Motoru",
      desc: "Markdown ile yazıp yayınlayabildiğim, hafif bir blog altyapısı.",
      tags: ["Node.js", "Markdown"],
      links: [{ label: "Kod", href: "#" }]
    }
  ],

  skills: [
    { group: "Ön yüz", items: ["HTML", "CSS", "JavaScript", "TypeScript", "React"] },
    { group: "Arka uç", items: ["C#", ".NET", "Node.js", "REST API"] },
    { group: "Veri", items: ["SQL", "PostgreSQL"] },
    { group: "Araçlar", items: ["Git & GitHub", "VS Code", "Postman"] }
  ],

  journey: [
    { when: "Başlangıç", title: "İlk satır kod", text: "Ekrana ilk \"Merhaba Dünya\"yı yazdırdığım gün merakım başladı." },
    { when: "Üniversite", title: "Bilgisayar Mühendisliği", text: "Algoritmalar, veri yapıları ve saatlerce süren proje geceleri." },
    { when: "Mezuniyet", title: "Diploma 🎓", text: "Mühendis oldum; asıl öğrenme şimdi başlıyor." },
    { when: "Şimdi", title: "Üretmeye devam", text: "Yeni projeler geliştiriyor, yeni teknolojiler deniyorum." }
  ],

  contact: {
    lead: "Bir proje, bir fikir ya da sadece bir merhaba… Yaz, kahve benden. ☕",
    links: [
      { icon: "✉️", label: "E-posta", hint: "merhaba@ornek.com", href: "mailto:merhaba@ornek.com" },
      { icon: "🐙", label: "GitHub", hint: "github.com/kullanici-adin", href: "https://github.com/" },
      { icon: "💼", label: "LinkedIn", hint: "linkedin.com/in/kullanici-adin", href: "https://www.linkedin.com/" }
    ]
  },

  // Küçük sürprizler
  coffeeLines: [
    "1. kahve ☕ — motor çalıştı.",
    "2. kahve — bug'lar titremeye başladı.",
    "3. kahve — artık klavyeyle tek vücut oldum.",
    "4. kahve — tek seferde derlenen kod diye bir şey var mı?",
    "5. kahve — nabzım 140, commit mesajlarım şiirsel.",
    "6. kahve — bence yeter, su iç 💧",
    "7. kahve — kahve makinesi istifa etti."
  ],
  catLines: [
    "Miyav! 🐱",
    "Cuma günü production'a deploy atma dedim.",
    "Prrrr… bu kod iyi görünüyor.",
    "Mama kabı boş. Bu da bir bug.",
    "Klavyenin üstüne yatarsam commit'lenir mi?",
    "Çalışıyor mu? Dokunma. 🐾"
  ]
};
