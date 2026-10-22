alter table public.animals
  add column photo_paths text[] not null default '{}',
  add constraint animals_photo_paths_max_count_check
    check (cardinality(photo_paths) <= 5);

create function public.validate_animal_photo_paths()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  photo_count integer := coalesce(cardinality(new.photo_paths), 0);
begin
  if photo_count > 5 then
    raise exception 'Um anúncio pode ter no máximo 5 fotos.';
  end if;

  if tg_op = 'INSERT' and photo_count < 1 then
    raise exception 'Adicione pelo menos uma foto para publicar o anúncio.';
  end if;

  if tg_op = 'UPDATE' and new.photo_paths is distinct from old.photo_paths and photo_count < 1 then
    raise exception 'Um anúncio deve manter pelo menos uma foto.';
  end if;

  return new;
end;
$$;

create trigger validate_animal_photo_paths
  before insert or update of photo_paths on public.animals
  for each row execute procedure public.validate_animal_photo_paths();

revoke execute on function public.validate_animal_photo_paths() from public, anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('animal-photos', 'animal-photos', true, 5242880, array['image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view animal photos"
  on storage.objects for select
  to public
  using (bucket_id = 'animal-photos');

create policy "Donors can upload their animal photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'animal-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.profile_type = 'doador_ong'
    )
  );

create policy "Donors can delete their animal photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'animal-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.profile_type = 'doador_ong'
    )
  );
