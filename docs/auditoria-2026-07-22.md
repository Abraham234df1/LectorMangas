# Auditoría de cumplimiento — MangaReadV1

Fecha: 22 de julio de 2026

## Resultado

La aplicación funciona de extremo a extremo en local: biblioteca, búsqueda, detalle, lector PDF, cambio de hoja, capítulos y acceso administrativo. El catálogo combina los registros remotos con un respaldo local para no quedar vacío cuando Supabase no está preparado.

## Funcionalidad verificada

| Área | Resultado |
|---|---|
| Biblioteca | 12 tarjetas y conteos correctos |
| Classroom of the Elite | 12 tomos, todos con botón **Leer ahora** |
| PDF | 6 páginas por tomo y 2 marcas de capítulo |
| Lector escritorio | Avance coherente por pliegos: 1 → 3 |
| Lector móvil | Avance página por página: 1 → 2 |
| Salto de capítulo | Capítulo 2 abre la página 5 |
| Responsive | 390 × 844 px, dos columnas y sin desbordamiento horizontal |
| Administrador inicial | `admin@gmail.com` / `admin123` abre el panel |
| Panel en modo local | 12 títulos, 12 tomos y formularios deshabilitados |
| Consola | Sin errores JavaScript durante el recorrido final |

## Correcciones principales

1. Se agregaron 12 PDFs originales de demostración y se conectaron al lector.
2. Se creó un catálogo de respaldo de 12 títulos y una mezcla no duplicada con Supabase.
3. Se repararon las plantillas de tarjetas y detalle que impedían cargar la interfaz.
4. Se corrigió el cargador del lector y la sincronización del contador con StPageFlip.
5. Se mejoró la animación de hoja, la navegación por capítulos y el comportamiento RTL.
6. Se rediseñaron portada, tarjetas, detalle, lista de tomos y estados de origen.
7. Se corrigió el orden de los estilos responsive, que anulaba la cuadrícula móvil.
8. Se agregó acceso admin local de revisión y se bloquearon escrituras cuando no existe una sesión remota autorizada.
9. Se diferenciaron claramente registros demo y registros de Supabase en administración.

## Supabase remoto

Comprobaciones realizadas contra el proyecto configurado:

- La lectura REST de `mangas` responde, pero devuelve cero registros.
- `register_admin_email` no existe en el proyecto remoto.
- `public.admins` no está disponible mediante REST.
- Las escrituras anónimas en `mangas` son rechazadas por RLS.
- Supabase Auth rechaza `admin@gmail.com` como dirección válida en ese proyecto.

Una clave pública no puede crear tablas, funciones, políticas ni usuarios privilegiados. Para terminar el despliegue remoto se deben ejecutar, desde el SQL Editor autenticado, `schema.sql`, `policies.sql` y `catalog.sql`, en ese orden. La aplicación local ya funciona mientras tanto y no afirma haber persistido cambios que el servidor rechazó.
