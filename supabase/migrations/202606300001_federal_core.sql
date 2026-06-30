create extension if not exists pg_trgm;

create table if not exists public.universities (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  short_name text,
  name text not null,
  region text,
  city text,
  is_branch boolean not null default false,
  parent_university_id uuid references public.universities(id) on delete set null,
  official_url text,
  admissions_url text,
  monitoring_url text,
  license_status text,
  accreditation_status text,
  source_status text not null default 'unverified' check (source_status in ('verified','partial','unverified')),
  source_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  admission_year int not null,
  code text not null,
  title text not null,
  profile_title text,
  degree_level text not null default 'bachelor',
  study_form text not null default 'full_time',
  funding_type text not null default 'budget',
  faculty text,
  admissions_url text,
  source_status text not null default 'unverified' check (source_status in ('verified','partial','unverified')),
  source_updated_at timestamptz
);

create table if not exists public.exam_sets (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  variant_no int not null default 1,
  subjects text[] not null,
  minimum_scores jsonb not null default '{}'::jsonb,
  source_url text,
  source_page text,
  source_status text not null default 'unverified' check (source_status in ('verified','partial','unverified')),
  unique(program_id, variant_no)
);

create table if not exists public.admission_stats (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  year int not null,
  cutoff_score int,
  budget_places int,
  paid_places int,
  target_places int,
  special_quota_places int,
  separate_quota_places int,
  tuition_rub numeric,
  source_url text,
  source_page text,
  source_status text not null default 'unverified' check (source_status in ('verified','partial','unverified')),
  unique(program_id, year)
);

create table if not exists public.achievement_rules (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  admission_year int not null,
  achievement_type text not null,
  label text not null,
  points int not null check (points between 0 and 10),
  conditions jsonb not null default '{}'::jsonb,
  cap_group text not null default 'general',
  source_url text,
  source_page text,
  source_status text not null default 'unverified' check (source_status in ('verified','partial','unverified')),
  unique(university_id, admission_year, achievement_type, label)
);

create table if not exists public.admission_deadlines (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  program_id uuid references public.programs(id) on delete cascade,
  admission_year int not null,
  event_type text not null,
  event_date timestamptz not null,
  description text,
  source_url text,
  source_status text not null default 'unverified' check (source_status in ('verified','partial','unverified'))
);

create table if not exists public.required_documents (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  admission_year int not null,
  applicant_category text not null default 'general',
  document_code text not null,
  label text not null,
  required boolean not null default true,
  conditions jsonb not null default '{}'::jsonb,
  source_url text,
  source_status text not null default 'unverified',
  unique(university_id, admission_year, applicant_category, document_code)
);

create table if not exists public.source_documents (
  id uuid primary key default gen_random_uuid(),
  university_id uuid references public.universities(id) on delete cascade,
  admission_year int,
  kind text not null,
  url text not null,
  title text,
  checksum text,
  fetched_at timestamptz,
  parser_version text,
  status text not null default 'pending',
  error text,
  unique(url, admission_year)
);

create table if not exists public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running',
  fetched_count int not null default 0,
  parsed_count int not null default 0,
  verified_count int not null default 0,
  error_count int not null default 0,
  details jsonb not null default '{}'::jsonb
);

create table if not exists public.route_orders (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id bigint,
  status text not null default 'draft',
  price_stars int not null default 149,
  payload jsonb not null,
  telegram_payment_charge_id text unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  delivered_at timestamptz
);

create index if not exists universities_name_trgm_idx on public.universities using gin (name gin_trgm_ops);
create index if not exists universities_short_name_trgm_idx on public.universities using gin (short_name gin_trgm_ops);
create unique index if not exists programs_unique_offer_idx on public.programs(university_id, admission_year, code, coalesce(profile_title,''), study_form, funding_type);
create index if not exists programs_title_trgm_idx on public.programs using gin (title gin_trgm_ops);
create index if not exists programs_code_idx on public.programs(code);
create index if not exists programs_year_idx on public.programs(admission_year);
create index if not exists exam_sets_subjects_idx on public.exam_sets using gin(subjects);
create index if not exists deadlines_event_date_idx on public.admission_deadlines(event_date);

alter table public.universities enable row level security;
alter table public.programs enable row level security;
alter table public.exam_sets enable row level security;
alter table public.admission_stats enable row level security;
alter table public.achievement_rules enable row level security;
alter table public.admission_deadlines enable row level security;
alter table public.required_documents enable row level security;
alter table public.source_documents enable row level security;
alter table public.ingestion_runs enable row level security;
alter table public.route_orders enable row level security;

create policy "public read verified universities" on public.universities for select to anon, authenticated using (source_status in ('verified','partial'));
create policy "public read verified programs" on public.programs for select to anon, authenticated using (source_status in ('verified','partial'));
create policy "public read verified exam sets" on public.exam_sets for select to anon, authenticated using (source_status in ('verified','partial'));
create policy "public read verified stats" on public.admission_stats for select to anon, authenticated using (source_status in ('verified','partial'));
create policy "public read verified achievements" on public.achievement_rules for select to anon, authenticated using (source_status in ('verified','partial'));
create policy "public read verified deadlines" on public.admission_deadlines for select to anon, authenticated using (source_status in ('verified','partial'));
create policy "public read verified documents" on public.required_documents for select to anon, authenticated using (source_status in ('verified','partial'));

create or replace function public.search_admission_programs(
  p_query text default null,
  p_subjects text[] default null,
  p_total_score int default null,
  p_region text default null,
  p_budget_only boolean default true,
  p_year int default 2026,
  p_limit int default 100
)
returns table (
  university_id uuid,
  university_name text,
  university_short_name text,
  region text,
  city text,
  program_id uuid,
  code text,
  title text,
  profile_title text,
  subjects text[],
  minimum_scores jsonb,
  cutoff_score int,
  budget_places int,
  source_status text,
  source_url text
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    u.id,
    u.name,
    u.short_name,
    u.region,
    u.city,
    p.id,
    p.code,
    p.title,
    p.profile_title,
    e.subjects,
    e.minimum_scores,
    s.cutoff_score,
    s.budget_places,
    case when p.source_status = 'verified' and e.source_status = 'verified' and coalesce(s.source_status,'verified') = 'verified' then 'verified' else 'partial' end,
    coalesce(s.source_url, e.source_url, p.admissions_url, u.admissions_url)
  from public.programs p
  join public.universities u on u.id = p.university_id
  join public.exam_sets e on e.program_id = p.id
  left join public.admission_stats s on s.program_id = p.id and s.year = p_year - 1
  where p.admission_year = p_year
    and (not p_budget_only or p.funding_type = 'budget')
    and (p_query is null or p_query = '' or
      u.name ilike '%' || p_query || '%' or coalesce(u.short_name,'') ilike '%' || p_query || '%' or
      p.title ilike '%' || p_query || '%' or p.code ilike '%' || p_query || '%')
    and (p_region is null or p_region = '' or u.region ilike '%' || p_region || '%')
    and (p_subjects is null or e.subjects <@ p_subjects)
    and (p_total_score is null or s.cutoff_score is null or p_total_score >= greatest(0, s.cutoff_score - 35))
  order by
    case when s.cutoff_score is null or p_total_score is null then 1 else 0 end,
    abs(coalesce(s.cutoff_score, p_total_score) - coalesce(p_total_score, s.cutoff_score)),
    u.name,
    p.code
  limit greatest(1, least(p_limit, 500));
$$;

grant execute on function public.search_admission_programs(text,text[],int,text,boolean,int,int) to anon, authenticated;
