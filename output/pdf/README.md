# Inventario de PDFs

Esta carpeta aparece en GitHub para documentar los tomos disponibles, pero los
archivos binarios `.pdf` se sirven desde el bucket público `pdfs` de Supabase.

## Estado actual

- 106 PDF originales disponibles en el entorno local (aproximadamente 4.24 GB).
- 54 lecturas enlazadas con Supabase: 38 volúmenes de novela ligera, 14 bloques
  del manga *Classroom of the Elite* y 2 tomos de *My Hero Academia*.
- Los archivos grandes se dividen en partes de 20 MiB y el lector los reconstruye
  automáticamente en el navegador.

## Catálogos visibles

- [`classroom-of-the-elite/manifest.json`](classroom-of-the-elite/manifest.json):
  capítulos 1 al 73, nombres de archivo y cantidad de páginas.
- [`classroom-of-the-elite-light-novel/manifest.json`](classroom-of-the-elite-light-novel/manifest.json):
  volúmenes organizados en Año 1, Año 2 y Año 3.
- Los 42 archivos locales de *My Hero Academia* siguen el formato
  `my-hero-academia-volume-01.pdf` a `my-hero-academia-volume-42.pdf`.

Los PDF no se versionan directamente porque el conjunto supera 4 GB y varios
archivos exceden el límite de 100 MiB por archivo de GitHub. Para probarlos,
ejecuta la aplicación y abre las lecturas que ya están conectadas a Supabase.
