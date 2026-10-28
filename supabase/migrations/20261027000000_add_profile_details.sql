alter table public.profiles
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists bio text;

alter table public.profiles
  add constraint profiles_city_length check (city is null or char_length(trim(city)) between 2 and 80),
  add constraint profiles_state_format check (state is null or state ~ '^[A-Za-z]{2}$'),
  add constraint profiles_bio_length check (bio is null or char_length(trim(bio)) <= 500);

grant update (name, phone, city, state, bio) on table public.profiles to authenticated;

drop function public.get_animal_contacts(uuid[]);

create function public.get_animal_contacts(p_animal_ids uuid[])
returns table (
  animal_id uuid,
  donor_name text,
  donor_phone text,
  donor_city text,
  donor_state text,
  donor_bio text
)
language sql
stable
security definer
set search_path = ''
as $$
  select animals.id, profiles.name, profiles.phone, profiles.city, profiles.state, profiles.bio
  from public.animals
  join public.profiles on profiles.id = animals.owner_id
  where animals.id = any(coalesce(p_animal_ids, '{}'::uuid[]))
    and animals.status = 'available'
    and profiles.profile_type = 'doador_ong'
    and (select auth.uid()) is not null;
$$;

revoke all on function public.get_animal_contacts(uuid[]) from public, anon;
grant execute on function public.get_animal_contacts(uuid[]) to authenticated;
