-- Portfolyo veritabanı şeması (Supabase / PostgreSQL)
-- İçerik (satırlar) yönetim panelinden girilir; burada yalnızca yapı ve güvenlik kuralları var.

-- Yönetici e-postaları: yalnızca burada kayıtlı e-postalar içerik yazabilir
create table public.admins (
  email text primary key
);
alter table public.admins enable row level security;
create policy "admin sees own row" on public.admins
  for select to authenticated
  using (lower(email) = lower((select auth.jwt() ->> 'email')));

-- Tek satırlık profil (id her zaman 1)
create table public.profile (
  id int primary key default 1 check (id = 1),
  name text not null default '',
  role text not null default '',
  intro text not null default '',
  words text[] not null default '{}',
  about_lead text not null default '',
  about_body text[] not null default '{}',
  about_now text not null default '',
  contact_lead text not null default '',
  coffee_lines text[] not null default '{}',
  cat_lines text[] not null default '{}'
);

create table public.facts (
  id bigint generated always as identity primary key,
  icon text not null default '',
  text text not null default '',
  sort_order int not null default 0
);

create table public.projects (
  id bigint generated always as identity primary key,
  emoji text not null default '',
  title text not null,
  description text not null default '',
  tags text[] not null default '{}',
  demo_url text not null default '',
  code_url text not null default '',
  published boolean not null default true,
  sort_order int not null default 0
);

create table public.skill_groups (
  id bigint generated always as identity primary key,
  name text not null,
  items text[] not null default '{}',
  sort_order int not null default 0
);

create table public.journey (
  id bigint generated always as identity primary key,
  when_label text not null default '',
  title text not null,
  body text not null default '',
  sort_order int not null default 0
);

create table public.contact_links (
  id bigint generated always as identity primary key,
  icon text not null default '',
  label text not null,
  hint text not null default '',
  href text not null default '',
  sort_order int not null default 0
);

-- Güvenlik kuralları (RLS): herkes okur, yalnızca admins tablosundaki kişi yazar
do $$
declare
  t text;
  is_admin text := $e$exists (select 1 from public.admins a where lower(a.email) = lower((select auth.jwt() ->> 'email')))$e$;
begin
  foreach t in array array['profile','facts','projects','skill_groups','journey','contact_links'] loop
    execute format('alter table public.%I enable row level security', t);

    if t = 'projects' then
      execute format('create policy "public read" on public.%I for select to anon, authenticated using (published or %s)', t, is_admin);
    else
      execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    end if;

    execute format('create policy "admin insert" on public.%I for insert to authenticated with check (%s)', t, is_admin);
    execute format('create policy "admin update" on public.%I for update to authenticated using (%s) with check (%s)', t, is_admin, is_admin);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (%s)', t, is_admin);
  end loop;
end $$;

-- Yönetici eklemek için (kendi e-postanla):
-- insert into public.admins (email) values ('senin@epostan.com');
