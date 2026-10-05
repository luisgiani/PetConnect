create table if not exists public.animals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 80),
  species text not null check (species in ('cachorro', 'gato', 'outro')),
  breed text check (breed is null or char_length(breed) <= 60),
  age_months integer not null check (age_months between 0 and 600),
  size text not null check (size in ('pequeno', 'medio', 'grande')),
  health_status text not null check (health_status in ('saudavel', 'em_tratamento', 'nao_informado')),
  description text not null check (char_length(trim(description)) between 10 and 1000),
  status text not null default 'available' check (status in ('available', 'adopted')),
  created_at timestamptz not null default now()
);

create index if not exists animals_status_created_at_idx
  on public.animals (status, created_at desc);

alter table public.animals enable row level security;

create policy "Anyone can view available animals"
  on public.animals for select
  using (status = 'available' or owner_id = (select auth.uid()));

create policy "Owners can register animals"
  on public.animals for insert
  with check (owner_id = (select auth.uid()));

create policy "Owners can update their animals"
  on public.animals for update
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "Owners can delete their animals"
  on public.animals for delete
  using (owner_id = (select auth.uid()));
