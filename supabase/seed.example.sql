  -- MangaReadV1 - seed.example.sql
-- Datos iniciales de prueba (Ficticios).

-- Registrar administrador inicial de prueba
insert into public.admins (email)
values
  ('admin@gmail.com')
on conflict (email) do nothing;

-- Insertar mangas de prueba
insert into public.mangas (id, title, normalized_title, author, synopsis, direction, cover_path)
values
  (
    'a3c8e9b6-89cd-4861-a477-76901bfd9061',
    'Guardianes del Eclipse',
    'guardianes del eclipse',
    'Valeria Montes',
    'En un mundo donde la luz solar es un recurso artificial controlado por corporaciones, un grupo de rebeldes conocidos como los Guardianes planea restaurar el eclipse natural permanente que alguna vez gobernó la Tierra.',
    'rtl',
    null
  ),
  (
    'f4d7b2a3-294b-4bda-a859-994c502da259',
    'Crónicas de Acero',
    'cronicas de acero',
    'Kenji Tanaka',
    'Las aventuras de un joven herrero y su autómata de combate en las profundidades de la gran cordillera industrial del este, luchando contra la polución y la tiranía del Gremio del vapor.',
    'rtl',
    null
  ),
  (
    'c29b71e8-782e-4b2a-89a1-5cfd5924b102',
    'Viajeros del Vacío',
    'viajeros del vacio',
    'Liam Sinclair',
    'Una epopeya espacial que narra los descubrimientos de la tripulación de la nave Odyssey mientras cartografían anomalías gravitacionales en los confines más oscuros del universo conocido.',
    'ltr',
    null
  )
on conflict (normalized_title) do nothing;
