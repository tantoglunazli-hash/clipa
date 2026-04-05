# Clipa — Kurulum ve Deploy

## 1. Supabase Kurulumu

1. supabase.com → "New Project" → proje oluştur
2. Sol menü → "SQL Editor" → "New query"
3. Aşağıdaki SQL'i yapıştır ve çalıştır:

```sql
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  author text,
  cover_url text,
  created_at timestamptz default now()
);

create table quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  book_id uuid references books(id) on delete cascade,
  text text not null,
  page_number int,
  image_url text,
  tags text[] default '{}',
  created_at timestamptz default now()
);

alter table books enable row level security;
alter table quotes enable row level security;
alter table profiles enable row level security;

create policy "Kendi kitaplarım" on books using (auth.uid() = user_id);
create policy "Kendi alıntılarım" on quotes using (auth.uid() = user_id);
create policy "Kendi profilim" on profiles using (auth.uid() = id);
create policy "Profil oluşturma" on profiles for insert with check (auth.uid() = id);
create policy "Profil güncelleme" on profiles for update using (auth.uid() = id);
create policy "Kitap ekleme" on books for insert with check (auth.uid() = user_id);
create policy "Alıntı ekleme" on quotes for insert with check (auth.uid() = user_id);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create view user_stats as
select
  user_id,
  count(distinct book_id) as total_books,
  count(*) as total_quotes
from quotes
group by user_id;
```

4. Sol menü → "Settings" → "API"
   - "Project URL" → kopyala
   - "anon public" key → kopyala

## 2. .env Dosyasını Doldur

`clipa/.env` dosyasını aç ve değerleri gir:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhb...
```

## 3. Vercel'e Deploy

```bash
cd clipa
npx vercel
```

İlk seferinde:
- "Set up and deploy?" → Y
- "Which scope?" → kendi hesabın
- "Link to existing project?" → N
- "Project name?" → clipa (veya istediğin isim)
- "Directory?" → . (nokta, Enter)
- Build ayarları otomatik algılanır

Deploy tamamlandığında bir link verir: `https://clipa-xxx.vercel.app`

## 4. Telefona Kur

**iPhone:** Safari'de linki aç → Paylaş butonu (alt orta) → "Ana Ekrana Ekle" → "Ekle"

**Android:** Chrome'da linki aç → sağ üst ⋮ → "Ana ekrana ekle" → "Ekle"

Artık telefon ekranında Clipa ikonu görünür, tam ekran açılır.
