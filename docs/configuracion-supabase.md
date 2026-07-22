# Configuración de Supabase — MangaReadV1

Sigue estos pasos paso a paso para configurar tu entorno en Supabase y tener la aplicación funcionando correctamente.

## Paso 1: Crear el proyecto
1. Ve a [Supabase.com](https://supabase.com) e inicia sesión.
2. Haz clic en **New Project** y selecciona tu organización.
3. Elige un nombre de proyecto (ej. `MangaReadV1`), define una contraseña segura para la base de datos y selecciona la región geográfica más cercana.
4. Espera un par de minutos a que la base de datos esté lista.

## Paso 2: Crear el esquema de la base de datos
1. En el panel izquierdo de Supabase, navega a **SQL Editor**.
2. Haz clic en **New Query**.
3. Abre el archivo local [schema.sql](file:///C:/Users/manue/Downloads/MangaReadV1(1)/MangaReadV1/supabase/schema.sql), copia todo su contenido y pégalo en el editor SQL de Supabase.
4. Haz clic en **Run**. Verás el mensaje *Success*.

## Paso 3: Aplicar seguridad, funciones y buckets
1. Haz clic en **New Query** de nuevo.
2. Abre el archivo local [policies.sql](file:///C:/Users/manue/Downloads/MangaReadV1(1)/MangaReadV1/supabase/policies.sql), copia todo su contenido y pégalo en el editor.
3. Haz clic en **Run**. Esto creará:
   * La tabla de administradores autorizados.
   * La función `is_admin()`.
   * El procedimiento seguro `register_admin_email()`.
   * El procedimiento seguro `replace_chapter_marks()`.
   * Las políticas RLS de lectura pública y escritura administrativa.
   * Los buckets de almacenamiento `covers` y `pdfs`.

## Paso 4: Cargar datos iniciales de prueba (Opcional)
1. Haz clic en **New Query**.
2. Abre el archivo local [seed.example.sql](file:///C:/Users/manue/Downloads/MangaReadV1(1)/MangaReadV1/supabase/seed.example.sql).
3. Modifica la dirección de correo electrónico del administrador inicial por la tuya.
4. Ejecuta el script. Esto te registrará como administrador y creará mangas de prueba.

## Paso 5: Configurar la Autenticación
1. Ve a **Authentication** -> **Providers** -> **Email** en Supabase.
2. Asegúrate de que **Email Provider** esté activado.
3. Decide si deseas exigir confirmación de correo electrónico (*Confirm email*). Si está activo, los administradores recién registrados deberán verificar su correo antes de poder acceder al panel.
4. Ve a **Authentication** -> **URL Configuration**:
   * En **Site URL**, coloca tu dominio de producción (ej. `https://tu-usuario.github.io/MangaReadV1/`) o local de desarrollo (`http://localhost:8000`).
   * En **Redirect URLs**, añade la dirección completa de tu panel (ej. `http://localhost:8000/admin.html` o `http://127.0.0.1:5500/admin.html`).

## Paso 6: Vincular la aplicación
1. Ve a **Project Settings** -> **API**.
2. Copia la **Project URL**.
3. Copia la clave **Project API keys** de tipo `anon` / `public`.
4. Ve a tu proyecto local y crea el archivo [config.js](file:///C:/Users/manue/Downloads/MangaReadV1(1)/MangaReadV1/js/config.js) basándote en [config.example.js](file:///C:/Users/manue/Downloads/MangaReadV1(1)/MangaReadV1/js/config.example.js). Coloca tus credenciales reales:
   ```javascript
   export const SUPABASE_CONFIG = {
     url: "https://TU-PROYECTO.supabase.co",
     anonKey: "TU-ANON-PUBLIC-KEY",
     adminInviteCode: "MANGAREAD-2026",
     buckets: {
       covers: "covers",
       pdfs: "pdfs"
     }
   };
   ```
