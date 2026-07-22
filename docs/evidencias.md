# Evidencias de MangaReadV1

Este documento sirve como registro oficial de las pruebas y la correcta configuración del sistema.

## 1. Integrantes del Equipo

| Nombre | Matrícula | Responsabilidad principal |
|---|---|---|
| [Nombre Integrante 1] | [Matrícula] | Desarrollo Backend & Supabase (RLS y RPC) |
| [Nombre Integrante 2] | [Matrícula] | Integración Frontend (ES6 Modules) |
| [Nombre Integrante 3] | [Matrícula] | Lector PDF & PageFlip |
| [Nombre Integrante 4] | [Matrícula] | Estilos CSS, Layout y Responsive |

---

## 2. Evidencias de Supabase

### 2.1 Tablas creadas
Captura del panel de tablas de Supabase en donde se demuestre la existencia de:
*   `mangas`
*   `volumes`
*   `chapter_marks`
*   `admins`

**Captura:**
<!-- Reemplazar con: ![Tablas creadas](ruta/a/tabla-mangas.png) -->
*(Inserta aquí la captura del Table Editor mostrando las 4 tablas principales)*

### 2.2 Relaciones y restricciones de integridad
Captura del editor de base de datos o consola donde se observen las restricciones de clave foránea (`FOREIGN KEY` con `ON DELETE CASCADE`) y unicidades de tomos/PDFs en la tabla `volumes`.

**Captura:**
<!-- Reemplazar con: ![Relaciones base de datos](ruta/a/relaciones.png) -->

### 2.3 Buckets de Storage
Captura de la pestaña **Storage** de Supabase donde se visualicen los dos buckets públicos:
*   `covers` (para portadas de mangas)
*   `pdfs` (para archivos de lectura)

**Captura:**
<!-- Reemplazar con: ![Buckets de Storage](ruta/a/storage-buckets.png) -->

### 2.4 Usuario administrador inicial
Captura de la sección de **Authentication > Users** en Supabase mostrando el usuario administrador inicial `admin@gmail.com`.

**Captura:**
<!-- Reemplazar con: ![Autenticación de administrador](ruta/a/auth-users.png) -->

### 2.5 Políticas Row Level Security (RLS)
Captura del panel de **Authentication > Policies** mostrando las reglas aplicadas en las tablas:
*   Políticas para lectura pública (`SELECT USING true`).
*   Políticas para escritura administrativa (`INSERT/UPDATE/DELETE USING public.is_admin()`).

**Captura:**
<!-- Reemplazar con: ![Políticas RLS](ruta/a/rls-policies.png) -->

---

## 3. Evidencias de la aplicación

### 3.1 Biblioteca pública (Pantalla principal)
Captura de `index.html` con las tarjetas de los mangas cargadas directamente de la base de datos de Supabase.

**Captura:**
<!-- Reemplazar con: ![Biblioteca pública](ruta/a/index.png) -->

### 3.2 Búsqueda interactiva por título o autor
Captura demostrando el filtrado en tiempo real al escribir en el cuadro de búsqueda.

**Captura:**
<!-- Reemplazar con: ![Búsqueda en tiempo real](ruta/a/search.png) -->

### 3.3 Detalle del manga (`manga.html`)
Captura de la página de detalle cargando la sinopsis, sentido de lectura y lista de tomos asociados.

**Captura:**
<!-- Reemplazar con: ![Detalle de Manga](ruta/a/manga-detail.png) -->

### 3.4 Login de Administrador (`login.html`)
Captura del formulario de inicio de sesión y de registro administrativo.

**Captura:**
<!-- Reemplazar con: ![Login de Administrador](ruta/a/login-panel.png) -->

### 3.5 Panel de Control (`admin.html`)
Captura de las tarjetas de resumen del dashboard de administración.

**Captura:**
<!-- Reemplazar con: ![Dashboard](ruta/a/dashboard.png) -->

### 3.6 Registro de un nuevo Manga con portada
Captura del formulario de creación con la vista previa de la portada antes de subirse.

**Captura:**
<!-- Reemplazar con: ![Registro de Manga](ruta/a/create-manga.png) -->

### 3.7 Formulario de Tomos y marcas de capítulos
Captura mostrando la inserción dinámica de marcas de capítulos (Capítulo, Página inicial) junto con la selección del PDF.

**Captura:**
<!-- Reemplazar con: ![Registro de Tomos](ruta/a/create-volume.png) -->

### 3.8 Lector PDF con efecto libro interactivo (`reader.html`)
Captura del visor PDF en pleno funcionamiento mostrando las dos páginas abiertas y el efecto sombra del hojear.

**Captura:**
<!-- Reemplazar con: ![Efecto libro interactivo](ruta/a/page-flip.png) -->

### 3.9 Navegación y Zoom en el Lector
Captura demostrando el escalado de zoom y el salto al capítulo seleccionado.

**Captura:**
<!-- Reemplazar con: ![Zoom y control del lector](ruta/a/reader-zoom.png) -->

### 3.10 Adaptabilidad móvil (Responsive)
Captura del lector adaptado a pantalla móvil mostrando la visualización de una sola página.

**Captura:**
<!-- Reemplazar con: ![Vista en Dispositivo Móvil](ruta/a/mobile-view.png) -->
