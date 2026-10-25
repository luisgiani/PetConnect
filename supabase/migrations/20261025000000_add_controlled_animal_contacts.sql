create or replace function public.get_animal_contacts(p_animal_ids uuid[])
returns table (
  animal_id uuid,
  donor_name text,
  donor_phone text
)
language sql
stable
security definer
set search_path = ''
as $$
  select animals.id, profiles.name, profiles.phone
  from public.animals
  join public.profiles on profiles.id = animals.owner_id
  where animals.id = any(coalesce(p_animal_ids, '{}'::uuid[]))
    and animals.status = 'available'
    and profiles.profile_type = 'doador_ong'
    and (select auth.uid()) is not null;
$$;

revoke all on function public.get_animal_contacts(uuid[]) from public, anon;
grant execute on function public.get_animal_contacts(uuid[]) to authenticated;
