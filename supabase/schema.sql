-- =============================================================
-- 기분 트래커 — Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 실행하면 된다.
-- =============================================================

-- 1) 프로필 테이블 (auth.users 와 1:1) ------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz default now()
);

-- 2) 기분 로그 테이블 -----------------------------------------
create table if not exists public.moods (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  mood       int  not null check (mood between 1 and 4),  -- DB 레벨 검증
  memo       text,                                        -- optional
  created_at timestamptz default now()
);

create index if not exists moods_user_created_idx
  on public.moods (user_id, created_at desc);

-- 3) RLS 활성화 ------------------------------------------------
-- 이걸 켜지 않으면 anon key 로 전체 테이블이 열린다 = 최대 감점 포인트.
alter table public.profiles enable row level security;
alter table public.moods    enable row level security;

-- 4) 정책: "본인 데이터만" -------------------------------------
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all
  using      (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "own moods" on public.moods;
create policy "own moods" on public.moods
  for all
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5) 회원가입 시 프로필 자동 생성 trigger ----------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- 검증 팁: 다른 계정으로 로그인해 남의 user_id 로우를 select 해보면
-- RLS 덕분에 0건이 나와야 정상이다. (제출 전 반드시 확인)
-- =============================================================
