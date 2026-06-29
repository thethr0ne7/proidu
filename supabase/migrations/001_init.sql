
create table if not exists universities (
  id text primary key,
  name text,
  region text,
  city text
);

create table if not exists programs (
  id text primary key,
  university_id text,
  code text,
  title text,
  subjects text
);

create table if not exists admission_stats (
  id serial primary key,
  program_id text,
  year int,
  cutoff int,
  budget_places int
);
