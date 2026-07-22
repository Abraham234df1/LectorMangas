-- MangaReadV1 - Schema Database Definition
-- Tablas, llaves primarias, relaciones y restricciones de unicidad.

create extension if not exists pgcrypto;

-- Tabla de administradores autorizados
create table if not exists public.admins (
  email text primary key,
  created_at timestamptz not null default now()
);

-- Tabla de mangas / cómics
create table if not exists public.mangas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  normalized_title text not null unique,
  author text not null default 'Autor desconocido',
  synopsis text not null default '',
  direction text not null default 'rtl' check (direction in ('rtl', 'ltr')),
  cover_path text,
  created_at timestamptz not null default now()
);

-- Tabla de tomos asociados
create table if not exists public.volumes (
  id uuid primary key default gen_random_uuid(),
  manga_id uuid not null references public.mangas(id) on delete cascade,
  title text not null,
  normalized_title text not null,
  chapters_label text not null default '',
  pdf_path text not null,
  pdf_storage_mode text not null default 'single' check (pdf_storage_mode in ('single', 'chunks')),
  pdf_parts jsonb,
  pdf_name text not null,
  normalized_pdf_name text not null,
  created_at timestamptz not null default now(),
  constraint volumes_unique_title_per_manga unique (manga_id, normalized_title),
  constraint volumes_unique_pdf_per_manga unique (manga_id, normalized_pdf_name)
);

-- Tabla de marcas de capítulos
create table if not exists public.chapter_marks (
  id bigint generated always as identity primary key,
  volume_id uuid not null references public.volumes(id) on delete cascade,
  chapter integer not null check (chapter > 0),
  page integer not null check (page > 0),
  created_at timestamptz not null default now(),
  constraint chapter_marks_unique_chapter unique (volume_id, chapter),
  constraint chapter_marks_unique_page unique (volume_id, page)
);

-- Índices de optimización de búsquedas y uniones
create index if not exists volumes_manga_id_idx on public.volumes(manga_id);
create index if not exists chapter_marks_volume_id_idx on public.chapter_marks(volume_id);
create index if not exists mangas_title_search_idx on public.mangas using gin (to_tsvector('simple', title || ' ' || author));
