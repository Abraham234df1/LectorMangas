# Dificultades Encontradas y Soluciones — MangaReadV1

En esta sección se listan los problemas técnicos encontrados durante el desarrollo de la aplicación y la estrategia utilizada para resolverlos.

## 1. Concurrencia de Renderizado de Páginas PDF

*   **Problema:** Al hojear rápido el libro interactivo o cambiar de zoom, se disparaban múltiples llamadas de renderizado simultáneas de una misma página de PDF.js sobre el mismo lienzo (`canvas`), causando parpadeos de imagen y el error crítico: `Error: Rendering cancelled`.
*   **Causa:** PDF.js es monohilo en sus tareas de dibujo en lienzo. Si se invoca `page.render()` mientras hay otra tarea activa en el mismo lienzo, cancela la anterior.
*   **Solución:** Se implementó una cola de renderizado en `pdf-reader.js` usando un mapa de promesas (`renderQueue`). Antes de renderizar una página, se verifica si ya está en cola; si es así, se retorna la promesa existente en lugar de iniciar un nuevo dibujo. Adicionalmente, se integró una variable de generación (`renderGeneration`) que invalida las tareas asíncronas antiguas si se cambia de página o de zoom.
*   **Aprendizaje:** Las operaciones sobre el canvas deben gestionarse como recursos de exclusión mutua cuando dependen de APIs asíncronas pesadas como PDF.js.

## 2. Límite de Tamaño de Archivos en Supabase Storage (PDFs Grandes)

*   **Problema:** Intentar subir archivos PDF de tomos de alta resolución superiores a 50 MB fallaba constantemente debido a desconexiones del navegador o límites de timeout del servidor de red.
*   **Causa:** Las subidas masivas monohilo en conexiones residenciales tienden a ser inestables y carecen de soporte para reanudación.
*   **Solución:** Se implementó en `storage-service.js` un sistema de división de archivos (*chunking*). Si un archivo supera el umbral de 45 MB, se fragmenta en el cliente en bloques binarios de 20 MB y se suben en partes ordenadas con extensión `.bin`. En el modo lectura, la función de descarga junta recursivamente las partes en memoria dentro de un `Uint8Array` y las pasa como flujo binario unificado a PDF.js.
*   **Aprendizaje:** Para archivos grandes en la web, la fragmentación y reconstrucción en memoria del cliente es más confiable que transferir un único archivo grande.

## 3. Autorización de Administradores Dinámicos vs RLS Estática

*   **Problema:** Registrar nuevos administradores mediante el panel web los agregaba a Supabase Auth, pero no les permitía escribir en la base de datos debido a que la función `public.is_admin()` tenía los correos quemados en código SQL.
*   **Causa:** La RLS evaluaba una función SQL no dinámica.
*   **Solución:** Se creó la tabla `public.admins` y se reescribió `public.is_admin()` para buscar en dicha tabla en tiempo real. Para autorizar registros, se programó el procedimiento RPC `register_admin_email()` con seguridad definidora (`security definer`), lo que le permite insertar registros de correos en la tabla saltándose RLS temporalmente sólo si el código de invitación es correcto.
*   **Aprendizaje:** El patrón `security definer` en Postgres es vital para realizar operaciones administrativas indirectas de manera segura sin exponer la clave `service_role`.
