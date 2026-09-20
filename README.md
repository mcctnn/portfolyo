# Portfolyo

Masa temalı, gündüz/gece döngüsü olan kişisel portfolyo sitesi. React + Vite + React Router (SPA), içerik Supabase'den gelir ve `/admin` sayfasından düzenlenir.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # dist/ klasörünü üretir
```

`.env` dosyasında Supabase adresi ve herkese açık (publishable) anahtar bulunur. Şablon: `.env.example`.

## Adresler

| Adres | Ne açar |
|---|---|
| `/` | Masa sahnesi |
| `/hakkimda`, `/projeler`, `/yetenekler`, `/yolculuk`, `/iletisim` | Sahnenin üstünde ilgili pencere |
| `/admin` | Yönetim paneli (giriş gerekir) |

## Yönetim paneli kurulumu (bir kez)

1. Supabase panelinde **Authentication → Users → Add user** ile e-posta ve şifre oluştur.
2. **SQL Editor**'de kendi e-postanı yönetici olarak ekle:
   ```sql
   insert into public.admins (email) values ('senin@epostan.com');
   ```
3. İstersen **Authentication → Sign In / Providers**'tan yeni kayıtları kapat.
4. `/admin` adresinden giriş yap.

Veritabanı güvenliği (RLS): herkes içeriği okuyabilir; ekleme, güncelleme ve silme yalnızca `admins` tablosundaki e-postalara açıktır.

## Veritabanı tabloları

`profile` (tek satır), `facts`, `projects`, `skill_groups`, `journey`, `contact_links`, `admins`. Yapı ve güvenlik kuralları: `db/schema.sql`.

## Yayınlama

Site GitHub Pages'te yayınlanır: **https://mcctnn.github.io/portfolyo/**

`main` dalına her push'ta `.github/workflows/deploy.yml` siteyi derleyip yayınlar. İçerik değişiklikleri için deploy gerekmez, `/admin` üzerinden yapılır.

- Alt klasörden (`/portfolyo/`) yayınlandığı için workflow `VITE_BASE=/portfolyo/` ile derler.
- GitHub Pages bilinmeyen adreslerde `404.html` gösterir. `npm run build` bu yüzden `index.html`'i `404.html` olarak da kopyalar; böylece `/projeler` gibi adresler doğrudan açılır.
- `VITE_SUPABASE_URL` ve `VITE_SUPABASE_KEY` workflow dosyasında durur. Bunlar herkese açık değerlerdir; yazma yetkisi Supabase güvenlik kurallarıyla (`db/schema.sql`) korunur.

### Kendi alan adına geçmek
1. Depo ayarlarında **Pages → Custom domain** alanına alan adını yaz, alan adı sağlayıcında DNS kaydını GitHub'a yönlendir.
2. `deploy.yml` içindeki `VITE_BASE: /portfolyo/` satırını sil (alan adının kökünden yayınlanacak).

Vercel ya da Netlify'a geçmek istersen `vercel.json` ve `public/_redirects` hazır; `VITE_BASE`'i boş bırakman yeterli.

## Klasörler

- `src/components`: sahne, masa nesneleri, pencereler
- `src/admin`: yönetim paneli
- `src/data`: içeriği yükleyen katman ve varsayılan içerik
- `prototype/`: ilk statik (React'siz) sürüm, referans için duruyor
