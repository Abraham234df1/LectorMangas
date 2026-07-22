-- MangaReadV1 - Catálogo de My Hero Academia (tomos 1 al 42)
-- Ejecutar después de schema.sql y policies.sql desde el SQL Editor de Supabase.
-- Los PDF locales se sirven desde output/pdf/my-hero-academia. Cuando se suban
-- al bucket `pdfs`, el panel administrativo actualizará pdf_path/pdf_parts.

with manga_row as (
  insert into public.mangas (
    title, normalized_title, author, synopsis, direction, cover_path
  ) values (
    'My Hero Academia',
    'my hero academia',
    'Kohei Horikoshi',
    'Izuku Midoriya sueña con convertirse en héroe. Colección con los tomos 1 al 42.',
    'rtl',
    ''
  )
  on conflict (normalized_title) do update set
    author = excluded.author,
    synopsis = excluded.synopsis,
    direction = excluded.direction
  returning id
), page_counts(page_count, volume_number) as (
  select page_count, volume_number
  from unnest(array[
    228,229,196,203,202,204,214,216,223,216,249,223,
    216,236,229,222,223,208,218,236,252,266,245,235,
    241,253,213,202,247,234,257,252,257,252,240,254,
    242,257,215,226,233,241
  ]::integer[]) with ordinality as values_with_number(page_count, volume_number)
), resolved_manga as (
  select id from manga_row
  union all
  select id from public.mangas
  where normalized_title = 'my hero academia'
  limit 1
)
insert into public.volumes (
  manga_id,
  title,
  normalized_title,
  chapters_label,
  pdf_path,
  pdf_storage_mode,
  pdf_parts,
  pdf_name,
  normalized_pdf_name
)
select
  resolved_manga.id,
  'Tomo ' || page_counts.volume_number,
  'tomo ' || page_counts.volume_number,
  page_counts.page_count || ' páginas',
  '',
  'single',
  null,
  'my-hero-academia-volume-' || lpad(page_counts.volume_number::text, 2, '0') || '.pdf',
  'my hero academia volume ' || lpad(page_counts.volume_number::text, 2, '0') || ' pdf'
from resolved_manga
cross join page_counts
on conflict (manga_id, normalized_title) do update set
  chapters_label = excluded.chapters_label,
  pdf_name = excluded.pdf_name,
  normalized_pdf_name = excluded.normalized_pdf_name;
