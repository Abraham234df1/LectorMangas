# LectorPolar

Biblioteca web de manga y novelas ligeras construida con HTML, CSS y JavaScript. Utiliza Supabase para autenticación, base de datos y almacenamiento, e incluye un lector PDF responsivo con animación de cambio de hoja.

## Funciones principales

- Catálogo responsivo con 14 títulos, buscador, portadas y carrusel de colecciones destacadas.
- Detalle de cada título y organización de la novela ligera de *Classroom of the Elite* en Año 1, Año 2 y Año 3.
- Lector PDF con navegación RTL/LTR, zoom, teclado, pantalla completa y animación 3D.
- Inicio de sesión y registro en pantallas separadas.
- Panel administrativo para crear y editar mangas y tomos.
- Persistencia mediante Supabase y respaldo local para desarrollo.

## Contenido conectado a Supabase

El proyecto remoto contiene 14 mangas y 94 registros de tomos. Actualmente hay 54 PDFs reales alojados y vinculados en el bucket `pdfs`:

- 38 volúmenes de *Classroom of the Elite - Novela ligera*.
- 14 bloques del manga de *Classroom of the Elite*, capítulos 1 al 73.
- 2 tomos de *My Hero Academia*.

Los archivos grandes se almacenan en partes de 20 MiB y el lector los reconstruye automáticamente. El bucket utiliza aproximadamente 912.4 MiB. Los PDFs originales no se incluyen en Git porque ocupan más de 4 GB y algunos superan el límite de tamaño de GitHub.

## Ejecutar localmente

Desde la carpeta del proyecto:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Después abre [http://127.0.0.1:8765/index.html](http://127.0.0.1:8765/index.html).

No abras los archivos mediante `file://`; los módulos JavaScript y el lector requieren un servidor HTTP.

## Supabase

La configuración pública está en `js/config.js`. La clave `service_role` nunca debe colocarse en el frontend.

Para preparar un proyecto nuevo, ejecuta en el SQL Editor:

1. `supabase/schema.sql`
2. `supabase/policies.sql`
3. `supabase/catalog.sql`
4. `supabase/my-hero-catalog.sql`

Los scripts crean las tablas `admins`, `mangas`, `volumes` y `chapter_marks`, las políticas RLS, las funciones administrativas y los buckets `covers` y `pdfs`.

## Administración

Credencial académica inicial:

- Correo: `admin@gmail.com`
- Contraseña: `admin123`

Debe cambiarse antes de publicar la aplicación en un entorno abierto.

## Estructura

- `index.html`: biblioteca y carrusel de inicio.
- `manga.html`: ficha y listado de lecturas.
- `reader.html`: lector PDF.
- `admin.html`: gestión del catálogo.
- `js/`: servicios, autenticación, interfaz y lector.
- `css/`: estilos generales y diseño responsivo.
- `supabase/`: esquema, políticas y catálogos SQL.
- `output/covers/`: portadas del catálogo.
- `tools/upload_pdfs_supabase.py`: carga reanudable de PDFs a Storage.
- `output/LectorPolar_Entrega_Completa_Actualizada.docx`: documento de entrega con evidencias.

## Nota sobre derechos de autor

El repositorio contiene únicamente el código y los recursos de interfaz necesarios. Los PDFs proporcionados por el usuario se mantienen fuera del historial de Git.
