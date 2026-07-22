-- MangaReadV1 - Seguridad RLS y funciones controladas (Políticas)
-- Habilita RLS, define el guardián is_admin(), los buckets y permisos de almacenamiento.

-- 1. Activar RLS en todas las tablas
alter table public.admins enable row level security;
alter table public.mangas enable row level security;
alter table public.volumes enable row level security;
alter table public.chapter_marks enable row level security;

-- Administrador inicial solicitado para la entrega. La contraseña se gestiona
-- exclusivamente en Supabase Auth; nunca se almacena en una tabla pública.
insert into public.admins (email)
values ('admin@gmail.com')
on conflict (email) do nothing;

-- 2. Función de verificación de administrador
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
end;
$$;

-- 3. Función para registrar dinámicamente nuevos administradores mediante código de invitación
create or replace function public.register_admin_email(
  p_email text,
  p_invite_code text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_invite_code = 'MANGAREAD-2026' then
    insert into public.admins (email)
    values (lower(trim(p_email)))
    on conflict (email) do nothing;
  else
    raise exception 'Código de invitación inválido';
  end if;
end;
$$;

-- 4. Función de utilidad para reemplazar marcas de capítulo transaccionalmente
create or replace function public.replace_chapter_marks(
  p_volume_id uuid,
  p_marks jsonb default '[]'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Operación exclusiva para administradores';
  end if;

  if not exists (select 1 from public.volumes where id = p_volume_id) then
    raise exception 'El tomo indicado no existe';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(coalesce(p_marks, '[]'::jsonb)) as x(chapter integer, page integer)
    where chapter is null or page is null or chapter <= 0 or page <= 0
  ) then
    raise exception 'Las marcas contienen valores incompletos o inválidos';
  end if;

  if exists (
    select chapter
    from jsonb_to_recordset(coalesce(p_marks, '[]'::jsonb)) as x(chapter integer, page integer)
    group by chapter
    having count(*) > 1
  ) then
    raise exception 'No se puede repetir un capítulo en el mismo tomo';
  end if;

  if exists (
    select page
    from jsonb_to_recordset(coalesce(p_marks, '[]'::jsonb)) as x(chapter integer, page integer)
    group by page
    having count(*) > 1
  ) then
    raise exception 'No se puede repetir una página inicial en el mismo tomo';
  end if;

  delete from public.chapter_marks where volume_id = p_volume_id;

  insert into public.chapter_marks (volume_id, chapter, page)
  select p_volume_id, x.chapter, x.page
  from jsonb_to_recordset(coalesce(p_marks, '[]'::jsonb)) as x(chapter integer, page integer);
end;
$$;

-- 5. Definición de Políticas RLS para Tablas de Datos
-- Admins: cada usuario autenticado solo puede consultar su propio registro.
drop policy if exists "public can read admins" on public.admins;
drop policy if exists "authenticated can read own admin row" on public.admins;
create policy "authenticated can read own admin row"
on public.admins for select
to authenticated
using (email = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Mangas
drop policy if exists "public can read mangas" on public.mangas;
drop policy if exists "admin can insert mangas" on public.mangas;
drop policy if exists "admin can update mangas" on public.mangas;
drop policy if exists "admin can delete mangas" on public.mangas;
create policy "public can read mangas" on public.mangas for select using (true);
create policy "admin can insert mangas" on public.mangas for insert with check (public.is_admin());
create policy "admin can update mangas" on public.mangas for update using (public.is_admin()) with check (public.is_admin());
create policy "admin can delete mangas" on public.mangas for delete using (public.is_admin());

-- Volumes
drop policy if exists "public can read volumes" on public.volumes;
drop policy if exists "admin can insert volumes" on public.volumes;
drop policy if exists "admin can update volumes" on public.volumes;
drop policy if exists "admin can delete volumes" on public.volumes;
create policy "public can read volumes" on public.volumes for select using (true);
create policy "admin can insert volumes" on public.volumes for insert with check (public.is_admin());
create policy "admin can update volumes" on public.volumes for update using (public.is_admin()) with check (public.is_admin());
create policy "admin can delete volumes" on public.volumes for delete using (public.is_admin());

-- Chapter Marks
drop policy if exists "public can read chapter marks" on public.chapter_marks;
drop policy if exists "admin can insert chapter marks" on public.chapter_marks;
drop policy if exists "admin can update chapter marks" on public.chapter_marks;
drop policy if exists "admin can delete chapter marks" on public.chapter_marks;
create policy "public can read chapter marks" on public.chapter_marks for select using (true);
create policy "admin can insert chapter marks" on public.chapter_marks for insert with check (public.is_admin());
create policy "admin can update chapter marks" on public.chapter_marks for update using (public.is_admin()) with check (public.is_admin());
create policy "admin can delete chapter marks" on public.chapter_marks for delete using (public.is_admin());

-- 6. Concesión de privilegios a los roles de cliente
grant usage on schema public to anon, authenticated;
grant select on public.mangas, public.volumes, public.chapter_marks to anon, authenticated;
grant select on public.admins to authenticated;
revoke select on public.admins from anon;
grant insert, update, delete on public.mangas, public.volumes, public.chapter_marks to authenticated;
grant usage, select on sequence public.chapter_marks_id_seq to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.register_admin_email(text, text) to anon, authenticated;
grant execute on function public.replace_chapter_marks(uuid, jsonb) to authenticated;

-- 7. Configurar Buckets de Almacenamiento
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('covers', 'covers', true, 10485760),
  ('pdfs', 'pdfs', true, 838860800)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

-- Políticas de Storage
drop policy if exists "public can read covers" on storage.objects;
drop policy if exists "admin can insert covers" on storage.objects;
drop policy if exists "admin can update covers" on storage.objects;
drop policy if exists "admin can delete covers" on storage.objects;
drop policy if exists "public can read pdfs" on storage.objects;
drop policy if exists "admin can insert pdfs" on storage.objects;
drop policy if exists "admin can update pdfs" on storage.objects;
drop policy if exists "admin can delete pdfs" on storage.objects;
create policy "public can read covers" on storage.objects for select using (bucket_id = 'covers');
create policy "admin can insert covers" on storage.objects for insert with check (bucket_id = 'covers' and public.is_admin());
create policy "admin can update covers" on storage.objects for update using (bucket_id = 'covers' and public.is_admin()) with check (bucket_id = 'covers' and public.is_admin());
create policy "admin can delete covers" on storage.objects for delete using (bucket_id = 'covers' and public.is_admin());

create policy "public can read pdfs" on storage.objects for select using (bucket_id = 'pdfs');
create policy "admin can insert pdfs" on storage.objects for insert with check (bucket_id = 'pdfs' and public.is_admin());
create policy "admin can update pdfs" on storage.objects for update using (bucket_id = 'pdfs' and public.is_admin()) with check (bucket_id = 'pdfs' and public.is_admin());
create policy "admin can delete pdfs" on storage.objects for delete using (bucket_id = 'pdfs' and public.is_admin());
