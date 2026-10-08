create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 80),
  profile_type text not null check (profile_type in ('adotante', 'doador_ong')),
  phone text check (phone is null or char_length(trim(phone)) between 8 and 30),
  created_at timestamptz not null default now(),
  constraint donor_profile_requires_phone
    check (profile_type <> 'doador_ong' or phone is not null)
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (name, phone) on table public.profiles to authenticated;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

insert into public.profiles (id, name, profile_type, phone)
select
  users.id,
  case
    when char_length(trim(coalesce(users.raw_user_meta_data ->> 'name', ''))) between 2 and 80
      then trim(users.raw_user_meta_data ->> 'name')
    else 'Usuário'
  end,
  case
    when users.raw_user_meta_data ->> 'profile_type' = 'doador_ong'
      and char_length(trim(coalesce(users.raw_user_meta_data ->> 'phone', ''))) between 8 and 30
      then 'doador_ong'
    else 'adotante'
  end,
  case
    when users.raw_user_meta_data ->> 'profile_type' = 'doador_ong'
      and char_length(trim(coalesce(users.raw_user_meta_data ->> 'phone', ''))) between 8 and 30
      then trim(users.raw_user_meta_data ->> 'phone')
    else null
  end
from auth.users as users
where not exists (
  select 1
  from public.profiles
  where profiles.id = users.id
);

create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_type text := new.raw_user_meta_data ->> 'profile_type';
  profile_name text := trim(coalesce(new.raw_user_meta_data ->> 'name', ''));
  profile_phone text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), '');
begin
  if requested_type is null or requested_type not in ('adotante', 'doador_ong') then
    requested_type := 'adotante';
  end if;

  if char_length(profile_name) not between 2 and 80 then
    raise exception 'Informe um nome entre 2 e 80 caracteres para criar o perfil.';
  end if;

  if requested_type = 'doador_ong'
     and (profile_phone is null or char_length(profile_phone) not between 8 and 30) then
    raise exception 'Informe um telefone válido para o perfil doador/ONG.';
  end if;

  insert into public.profiles (id, name, profile_type, phone)
  values (new.id, profile_name, requested_type, profile_phone);

  return new;
end;
$$;

create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;

drop policy "Owners can register animals" on public.animals;
drop policy "Owners can update their animals" on public.animals;
drop policy "Owners can delete their animals" on public.animals;

create policy "Donors can register animals"
  on public.animals for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.profile_type = 'doador_ong'
    )
  );

create policy "Donors can update their animals"
  on public.animals for update
  to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.profile_type = 'doador_ong'
    )
  )
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.profile_type = 'doador_ong'
    )
  );

create policy "Donors can delete their animals"
  on public.animals for delete
  to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.profile_type = 'doador_ong'
    )
  );
