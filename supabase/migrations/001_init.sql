-- UNIVERSITIES CORE SCHEMA
create table if not exists universities (
  id text primary key,
  name text not null,
  region text,
  city text,
  is_branch boolean default false,
  source_url text
);

create table if not exists programs (
  id text primary key,
  university_id text references universities(id),
  code text,
  title text,
  profile text,
  subjects text[],
  budget_places int,
  source_url text
);

create table if not exists admission_stats (
  id bigserial primary key,
  program_id text references programs(id),
  year int,
  cutoff int,
  budget_places int
);

-- SEED CORE UNIVERSITIES (minimal verified set)
insert into universities (id,name,region,city,is_branch,source_url) values
('msu','МГУ имени М.В. Ломоносова','Москва','Москва',false,'https://msu.ru'),
('mgimo','МГИМО','Москва','Москва',false,'https://mgimo.ru');

insert into programs (id,university_id,code,title,profile,subjects,budget_places,source_url) values
('msu-cs','msu','01.03.02','Прикладная математика и информатика','it','{"math","russian","informatics"}',55,'https://msu.ru'),
('mgimo-ir','mgimo','41.03.05','Международные отношения','law','{"russian","social","history"}',120,'https://mgimo.ru');

