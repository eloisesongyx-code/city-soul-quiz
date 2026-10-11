-- 城市灵魂测评：数据库结构 + RLS
-- 所有表启用 RLS 且不授予 anon/authenticated 任何策略：
-- 客户端一律通过 Edge Functions（service_role）访问，直接表读写被拒绝。

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------
-- access_codes：测评访问密码（仅存哈希，不存明文）
-- ---------------------------------------------------------------
create table if not exists public.access_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null,                 -- bcrypt 哈希
  code_prefix text not null,               -- 非敏感识别前缀（明文前 4 位）
  total_uses int not null default 3 check (total_uses > 0),
  used_count int not null default 0 check (used_count >= 0),
  is_active boolean not null default true,
  note text,
  batch_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists access_codes_prefix_idx on public.access_codes (code_prefix);
create index if not exists access_codes_batch_idx on public.access_codes (batch_id);
create index if not exists access_codes_active_idx on public.access_codes (is_active);

-- ---------------------------------------------------------------
-- test_sessions：测评会话
-- ---------------------------------------------------------------
create table if not exists public.test_sessions (
  id uuid primary key default gen_random_uuid(),
  access_code_id uuid not null references public.access_codes(id) on delete restrict,
  session_token text not null unique,      -- 随机会话凭证（bearer secret）
  idempotency_key text unique,             -- 防止重复创建会话/重复扣减
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  answers_json jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  result_id uuid
);

create index if not exists test_sessions_access_code_idx on public.test_sessions (access_code_id);
create index if not exists test_sessions_status_idx on public.test_sessions (status);
create index if not exists test_sessions_result_idx on public.test_sessions (result_id);

-- ---------------------------------------------------------------
-- test_results：测评结果（服务端生成）
-- ---------------------------------------------------------------
create table if not exists public.test_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.test_sessions(id) on delete cascade,
  primary_city_id text not null,
  secondary_city_id text not null,
  dimension_scores_json jsonb not null,
  city_scores_json jsonb not null,
  report_json jsonb not null,
  share_token text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists test_results_share_token_idx on public.test_results (share_token);
create index if not exists test_results_primary_city_idx on public.test_results (primary_city_id);

-- 会话与结果的关联外键（两表建完后补上）
alter table public.test_sessions
  add constraint test_sessions_result_id_fkey
  foreign key (result_id) references public.test_results(id) on delete set null;

-- ---------------------------------------------------------------
-- admins：管理员授权表（Supabase Auth 用户 -> 管理员）
-- ---------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- RLS：全部启用，且不创建任何 anon/authenticated 策略
-- （service_role 具备 BYPASSRLS，仅 Edge Functions 可访问）
-- ---------------------------------------------------------------
alter table public.access_codes enable row level security;
alter table public.test_sessions enable row level security;
alter table public.test_results enable row level security;
alter table public.admins enable row level security;
