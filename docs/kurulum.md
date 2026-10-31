# Geliştirme ve yayın notları

React + Vite + React Router (SPA). İçerik Supabase'den gelir, `/admin` sayfasından düzenlenir. Yayın: GitHub Pages.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # dist/ klasörünü üretir (sayfalar, sitemap.xml, 404.html dahil)
```

`.env` dosyasında `VITE_SUPABASE_URL` ve `VITE_SUPABASE_KEY` (herkese açık anahtar) bulunur. Şablon: `.env.example`.

## Adresler

| Türkçe | İngilizce | Açılan |
|---|---|---|
| `/` | `/en` | Masa sahnesi |
| `/hakkimda` | `/en/about` | Hakkımda |
| `/projeler` | `/en/projects` | Projeler |
| `/yetenekler` | `/en/skills` | Yetenekler |
| `/yolculuk` | `/en/journey` | Yolculuk |
| `/yazilar`, `/yazilar/<slug>` | `/en/writing`, `/en/writing/<slug>` | Blog |
| `/iletisim` | `/en/contact` | İletişim ve form |
| `/admin` | | Yönetim paneli |

Sağ üstteki **TR/EN** düğmesi aynı sayfanın öbür dildeki adresine geçer.

## Yönetim paneli

`/admin` → giriş (Supabase kullanıcısı, e-postası `admins` tablosunda kayıtlı olmalı).

- **Profil, Projeler, Yetenekler, Yolculuk, Hakkımda maddeleri, Bağlantılar:** her alanın altında "(English)" ikizi var. Boş bırakırsan İngilizce sayfada Türkçesi görünür.
- **Yazılar:** blog. İçerikte `## başlık`, `**kalın**`, `*eğik*`, `` `kod` ``, `- liste`, `1. liste`, `> alıntı` ve ``` kod bloğu kullanılır. Adres (slug) küçük harf ve tireyle yazılır.
- **Mesajlar:** iletişim formundan gelenler. Yeni mesaj için e-posta bildirimi gitmez; okunmamış sayısı menüde görünür.
- **İstatistik:** son 30 günün sayfa görüntülemeleri. Çerez ve kişisel veri yok; yalnızca sayfa adresi ve dil sayılır. Yönetici girişi açıkken ve localhost'ta sayılmaz.

## Veritabanı

Yapı ve güvenlik kuralları: `db/schema.sql`, ardından `db/migrations/*.sql` sırayla uygulanır. Herkes içeriği okuyabilir; yazma yalnızca `admins` tablosundaki e-postalara açıktır. Formdan mesaj bırakmak ve sayfa görüntüleme kaydı herkese açıktır (alan sınırları ve sel koruması veritabanında).

## Yayınlama

`main` dalına her push'ta `.github/workflows/deploy.yml` siteyi derleyip GitHub Pages'e yayınlar. Ayrıca her gün 03:17 UTC'de otomatik yeniden yayınlanır.

- Panelden eklenen içerik anında görünür, deploy gerekmez.
- Yeni blog yazısının **kendi sayfası** (arama motorları ve paylaşım önizlemesi için) bir sonraki yayında üretilir. Hemen istersen GitHub → Actions → "Yayınla" → Run workflow.
- Alt klasörden (`/portfolyo/`) yayınlandığı için workflow `VITE_BASE=/portfolyo/` ile derler. `scripts/postbuild.mjs` her sayfa ve yazı için ayrı `index.html`, `sitemap.xml` ve `404.html` üretir.

### Kendi alan adına geçmek
1. Depo ayarlarında **Pages → Custom domain** alanına alan adını yaz, DNS kaydını GitHub'a yönlendir.
2. `deploy.yml` içinde `VITE_BASE: /portfolyo/` satırını sil, `SITE_URL`'yi yeni alan adıyla değiştir.
3. `index.html` içindeki `https://mcctnn.github.io/portfolyo/` adreslerini güncelle.

## Klasörler

- `src/components`: sahne, masa nesneleri, pencereler
- `src/admin`: yönetim paneli
- `src/i18n`: dil, adresler ve arayüz metinleri
- `src/data`: içeriği yükleyen katman ve varsayılan içerik
- `scripts/postbuild.mjs`: derleme sonrası sayfa ve sitemap üretimi
- `prototype/`: ilk statik sürüm, referans için duruyor
