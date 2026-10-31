-- 002: İngilizce alanlar, blog yazıları, iletişim mesajları, sayfa görüntülemeleri
-- db/schema.sql'in üstüne uygulanır. Supabase'de "i18n_messages_posts_stats" adıyla çalıştırıldı.

-- 1) İngilizce alanlar (boşsa arayüz Türkçesini gösterir)
alter table public.profile
  add column role_en text not null default '',
  add column intro_en text not null default '',
  add column words_en text[] not null default '{}',
  add column about_lead_en text not null default '',
  add column about_body_en text[] not null default '{}',
  add column about_now_en text not null default '',
  add column contact_lead_en text not null default '',
  add column coffee_lines_en text[] not null default '{}',
  add column cat_lines_en text[] not null default '{}',
  add column book_lines text[] not null default '{}',
  add column book_lines_en text[] not null default '{}';
alter table public.facts add column text_en text not null default '';
alter table public.projects
  add column title_en text not null default '',
  add column description_en text not null default '';
alter table public.skill_groups
  add column name_en text not null default '',
  add column items_en text[] not null default '{}';
alter table public.journey
  add column when_label_en text not null default '',
  add column title_en text not null default '',
  add column body_en text not null default '';
alter table public.contact_links
  add column label_en text not null default '',
  add column hint_en text not null default '';

-- 2) Blog yazıları
create table public.posts (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  emoji text not null default '📝',
  title text not null,
  title_en text not null default '',
  excerpt text not null default '',
  excerpt_en text not null default '',
  body text not null default '',
  body_en text not null default '',
  published boolean not null default false,
  published_at timestamptz not null default now()
);

-- 3) İletişim formu mesajları
create table public.messages (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  body text not null check (char_length(body) between 5 and 4000),
  lang text not null default 'tr' check (lang in ('tr','en')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4) Sayfa görüntülemeleri (çerezsiz; IP veya kimlik saklanmaz)
create table public.page_views (
  id bigint generated always as identity primary key,
  path text not null check (char_length(path) <= 120),
  lang text not null default 'tr' check (lang in ('tr','en')),
  created_at timestamptz not null default now()
);
create index page_views_created_at_idx on public.page_views (created_at);

-- 5) Güvenlik kuralları
do $$
declare
  t text;
  is_admin text := $e$exists (select 1 from public.admins a where lower(a.email) = lower((select auth.jwt() ->> 'email')))$e$;
begin
  foreach t in array array['posts','messages','page_views'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;

  -- yazılar: yayınlananı herkes okur, yönetici hepsini
  execute format('create policy "read published" on public.posts for select to anon, authenticated using (published or %s)', is_admin);
  execute format('create policy "admin insert" on public.posts for insert to authenticated with check (%s)', is_admin);
  execute format('create policy "admin update" on public.posts for update to authenticated using (%s) with check (%s)', is_admin, is_admin);
  execute format('create policy "admin delete" on public.posts for delete to authenticated using (%s)', is_admin);

  -- mesajlar: herkes gönderir, yalnızca yönetici okur/değiştirir/siler
  create policy "anyone can send" on public.messages for insert to anon, authenticated with check (true);
  execute format('create policy "admin read" on public.messages for select to authenticated using (%s)', is_admin);
  execute format('create policy "admin update" on public.messages for update to authenticated using (%s) with check (%s)', is_admin, is_admin);
  execute format('create policy "admin delete" on public.messages for delete to authenticated using (%s)', is_admin);

  -- görüntülemeler: herkes yazar, yalnızca yönetici okur
  create policy "anyone can log a view" on public.page_views for insert to anon, authenticated with check (true);
  execute format('create policy "admin read" on public.page_views for select to authenticated using (%s)', is_admin);
  execute format('create policy "admin delete" on public.page_views for delete to authenticated using (%s)', is_admin);
end $$;

-- 6) Sel koruması: 10 dakikada 10'dan fazla mesaj ya da dakikada 300'den fazla görüntüleme gelirse reddedilir
create function public.limit_messages() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.messages where created_at > now() - interval '10 minutes') >= 10 then
    raise exception 'too_many_messages' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger limit_messages before insert on public.messages
  for each row execute function public.limit_messages();

create function public.limit_page_views() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.page_views where created_at > now() - interval '1 minute') >= 300 then
    return null; -- sessizce atla
  end if;
  return new;
end $$;
create trigger limit_page_views before insert on public.page_views
  for each row execute function public.limit_page_views();

revoke execute on function public.limit_messages() from public, anon, authenticated;
revoke execute on function public.limit_page_views() from public, anon, authenticated;

-- 7) İstatistik özeti (yönetici dışında RLS yüzünden sıfır döner)
create function public.stats_summary(days int default 30) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'total', (select count(*) from public.page_views where created_at > now() - make_interval(days => days)),
    'today', (select count(*) from public.page_views where (created_at at time zone 'Europe/Istanbul')::date = (now() at time zone 'Europe/Istanbul')::date),
    'home', (select count(*) from public.page_views where path in ('/', '/en') and created_at > now() - make_interval(days => days)),
    'by_path', (select coalesce(jsonb_agg(t order by t.n desc), '[]'::jsonb) from (
        select path, count(*)::int n from public.page_views
        where created_at > now() - make_interval(days => days) group by path) t),
    'by_lang', (select coalesce(jsonb_agg(t order by t.n desc), '[]'::jsonb) from (
        select lang, count(*)::int n from public.page_views
        where created_at > now() - make_interval(days => days) group by lang) t),
    'by_day', (select coalesce(jsonb_agg(t order by t.day), '[]'::jsonb) from (
        select ((created_at at time zone 'Europe/Istanbul')::date)::text as day, count(*)::int n from public.page_views
        where created_at > now() - make_interval(days => days) group by 1) t)
  );
$$;
grant execute on function public.stats_summary(int) to authenticated;
revoke execute on function public.stats_summary(int) from public, anon;

-- 8) Herkese açık ziyaret sayısı (yalnızca bir sayı döner; Supabase'in "security definer" uyarısı bilerek kabul edildi)
create function public.visit_count() returns bigint
language sql stable security definer set search_path = '' as $$
  select count(*) from public.page_views where path in ('/', '/en');
$$;
grant execute on function public.visit_count() to anon, authenticated;
revoke execute on function public.visit_count() from public;
