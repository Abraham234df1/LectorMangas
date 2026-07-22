# Prompt maestro para desarrollar MangaReadV1

Actúa como un desarrollador full stack senior especializado en HTML, CSS, JavaScript, Supabase, PDF.js, diseño responsive, seguridad web y arquitectura modular.

Quiero que analices, diseñes y construyas desde cero una aplicación web completa llamada **MangaReadV1**.

No quiero únicamente ejemplos, fragmentos aislados, pseudocódigo ni pantallas sin funcionalidad. Debes generar un proyecto real, organizado, conectado, ejecutable, documentado y listo para probarse localmente y publicarse en GitHub Pages, Netlify o Vercel.

---

# 1. Descripción general

MangaReadV1 será una biblioteca digital de mangas y cómics en formato PDF.

La aplicación permitirá que cualquier usuario pueda:

* Consultar la biblioteca de mangas.
* Buscar mangas por título o autor.
* Ver la información completa de un manga.
* Consultar sus tomos disponibles.
* Abrir un tomo.
* Leer el PDF desde el navegador.
* Navegar entre páginas.
* Cambiar directamente a un capítulo registrado.
* Utilizar un efecto visual de libro 3D.

También tendrá una sección administrativa protegida mediante Supabase Auth, desde la cual los administradores podrán administrar mangas, tomos, portadas, archivos PDF y marcas de capítulos.

---

# 2. Objetivo principal

Construir una aplicación web completamente funcional usando:

* HTML5.
* CSS3.
* JavaScript moderno.
* Supabase JavaScript SDK versión 2.
* Supabase Authentication.
* Supabase Database.
* Supabase Storage.
* PDF.js.
* StPageFlip, PageFlip o una biblioteca similar para el efecto de libro 3D.

La aplicación no debe depender de datos simulados ni almacenamiento temporal para su funcionamiento principal.

Toda la información debe persistir en Supabase.

---

# 3. Reglas generales de desarrollo

Debes cumplir las siguientes reglas:

1. No generes solamente una maqueta visual.
2. Todos los botones deben tener una función real.
3. Todas las pantallas deben estar conectadas.
4. No dejes funciones vacías.
5. No agregues botones decorativos sin comportamiento.
6. No utilices datos hardcodeados como fuente principal.
7. No uses `localStorage` para sustituir la base de datos.
8. Puedes usar `localStorage` únicamente para preferencias visuales no sensibles.
9. No uses frameworks como React, Angular o Vue.
10. Utiliza JavaScript modular.
11. Utiliza `async/await`.
12. Maneja correctamente los errores de Supabase.
13. Muestra mensajes entendibles para el usuario.
14. Implementa estados de carga.
15. Implementa confirmaciones antes de eliminar información.
16. Protege las operaciones administrativas tanto desde la interfaz como mediante las políticas RLS de Supabase.
17. No incluyas la clave `service_role` en el frontend.
18. No expongas contraseñas ni secretos.
19. Mantén el diseño responsive.
20. Utiliza nombres de variables y funciones claros.
21. Agrega comentarios solamente donde ayuden a entender la lógica.
22. El proyecto debe poder ejecutarse usando Live Server o un servidor HTTP local.

---

# 4. Estructura obligatoria del proyecto

Organiza el proyecto de la siguiente manera:

```text
MangaReadV1/
│
├── index.html
├── manga.html
├── reader.html
├── admin.html
├── login.html
├── README.md
│
├── css/
│   ├── variables.css
│   ├── reset.css
│   ├── styles.css
│   ├── components.css
│   ├── responsive.css
│   ├── admin.css
│   └── reader.css
│
├── js/
│   ├── config.example.js
│   ├── config.js
│   ├── supabase-client.js
│   ├── app.js
│   ├── auth.js
│   ├── guards.js
│   ├── manga-service.js
│   ├── volume-service.js
│   ├── chapter-service.js
│   ├── storage-service.js
│   ├── library-ui.js
│   ├── manga-detail-ui.js
│   ├── admin-ui.js
│   ├── forms.js
│   ├── reader.js
│   ├── pdf-reader.js
│   ├── page-flip-reader.js
│   ├── validators.js
│   ├── modals.js
│   ├── notifications.js
│   └── utils.js
│
├── assets/
│   ├── icons/
│   ├── images/
│   └── placeholders/
│
├── supabase/
│   ├── schema.sql
│   ├── policies.sql
│   └── seed.example.sql
│
└── docs/
    ├── evidencias.md
    ├── pruebas.md
    ├── estructura-proyecto.md
    ├── configuracion-supabase.md
    └── dificultades.md
```

Puedes ajustar ligeramente la estructura si existe una razón técnica válida, pero debes mantener una separación clara entre:

* Configuración.
* Servicios.
* Interfaz.
* Autenticación.
* Validaciones.
* Lector PDF.
* Administración.
* Documentación.

---

# 5. Configuración de Supabase

Crea el archivo:

```text
js/config.example.js
```

Con el siguiente formato:

```javascript
window.SUPABASE_CONFIG = {
  url: "https://TU-PROYECTO.supabase.co",
  anonKey: "TU-ANON-PUBLIC-KEY",
  adminInviteCode: "MANGAREAD-2026",
  defaultAdmin: {
    email: "admin@gmail.com",
    password: "admin123"
  },
  adminEmails: [
    "admin@gmail.com"
  ],
  buckets: {
    covers: "covers",
    pdfs: "pdfs"
  }
};
```

Crea también:

```text
js/config.js
```

El proyecto podrá usar inicialmente valores de ejemplo, pero debes explicar claramente dónde colocar:

* Project URL.
* Anon public key.
* Correo del administrador.
* Código autorizado de registro.

Nunca utilices ni solicites la clave `service_role`.

Carga Supabase mediante CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

Crea un único cliente reutilizable:

```javascript
const supabaseClient = supabase.createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);
```

Evita crear diferentes clientes de Supabase en varios archivos.

---

# 6. Base de datos

Crea los scripts SQL necesarios dentro de la carpeta `supabase`.

La base de datos debe incluir las siguientes tablas:

## 6.1. Tabla `mangas`

Campos:

* `id`: UUID, llave primaria.
* `title`: texto obligatorio.
* `normalized_title`: texto normalizado, obligatorio y único.
* `author`: texto obligatorio.
* `synopsis`: texto.
* `direction`: `rtl` o `ltr`.
* `cover_path`: ruta de la portada en Supabase Storage.
* `created_at`: fecha de creación.

Reglas:

* No pueden existir dos mangas con el mismo título normalizado.
* El sentido de lectura únicamente puede ser `rtl` o `ltr`.
* Al eliminar un manga, también deben eliminarse sus tomos y marcas relacionadas.

## 6.2. Tabla `volumes`

Campos:

* `id`: UUID.
* `manga_id`: referencia al manga.
* `title`: título del tomo.
* `normalized_title`: título normalizado.
* `chapters_label`: descripción de capítulos incluidos.
* `pdf_path`: ruta del PDF.
* `pdf_storage_mode`: modo de almacenamiento.
* `pdf_parts`: información opcional sobre partes del PDF.
* `pdf_name`: nombre original del archivo.
* `normalized_pdf_name`: nombre normalizado.
* `created_at`: fecha.

Restricciones:

* El título del tomo no puede repetirse dentro del mismo manga.
* El nombre del PDF no puede repetirse dentro del mismo manga.
* Un tomo siempre debe pertenecer a un manga.
* Si se elimina un manga, sus tomos deben eliminarse mediante cascada.

## 6.3. Tabla `chapter_marks`

Campos:

* `id`: identificador.
* `volume_id`: referencia al tomo.
* `chapter`: número de capítulo.
* `page`: página inicial.
* `created_at`: fecha.

Restricciones:

* El capítulo debe ser mayor que cero.
* La página debe ser mayor que cero.
* No se puede repetir un número de capítulo dentro del mismo tomo.
* No se puede repetir una página inicial dentro del mismo tomo.
* Si se elimina un tomo, sus marcas deben eliminarse mediante cascada.

## 6.4. Índices

Crea índices para:

* `volumes.manga_id`.
* `chapter_marks.volume_id`.
* Campos que mejoren las búsquedas frecuentes, cuando sea necesario.

---

# 7. Seguridad y políticas RLS

Habilita Row Level Security en:

* `mangas`.
* `volumes`.
* `chapter_marks`.

Crea la función:

```sql
public.is_admin()
```

Esta función debe verificar si el correo del usuario autenticado pertenece a la lista de administradores autorizados.

Las políticas deben permitir:

## Usuarios públicos

* Leer mangas.
* Leer tomos.
* Leer marcas de capítulos.
* Ver portadas.
* Ver PDFs.

## Administradores autenticados

* Insertar mangas.
* Actualizar mangas.
* Eliminar mangas.
* Insertar tomos.
* Actualizar tomos.
* Eliminar tomos.
* Insertar marcas de capítulos.
* Actualizar marcas.
* Eliminar marcas.
* Subir archivos.
* Reemplazar archivos.
* Eliminar archivos.

Un usuario público nunca debe poder insertar, actualizar o eliminar información, incluso si intenta ejecutar una petición manual desde la consola del navegador.

---

# 8. Supabase Storage

Crea los siguientes buckets:

```text
covers
pdfs
```

## Bucket `covers`

Configuración:

* Público para lectura.
* Escritura exclusiva para administradores.
* Tamaño máximo recomendado: 10 MB.
* Solamente debe aceptar imágenes.

Tipos permitidos desde la aplicación:

* `image/jpeg`.
* `image/png`.
* `image/webp`.
* `image/gif`, opcional.

## Bucket `pdfs`

Configuración:

* Público para lectura.
* Escritura exclusiva para administradores.
* Tamaño máximo sugerido: 800 MB.
* Debe aceptar exclusivamente archivos PDF.

Tipo permitido:

```text
application/pdf
```

Organiza los archivos con rutas claras.

Ejemplos:

```text
covers/{mangaId}/{timestamp}-{nombreArchivo}
pdfs/{mangaId}/{volumeId}/{timestamp}-{nombreArchivo}
```

Sanitiza los nombres de los archivos para evitar espacios, caracteres extraños o rutas inseguras.

---

# 9. Normalización de texto

Implementa una función reutilizable:

```javascript
export function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}
```

Utiliza esta función para:

* Títulos de mangas.
* Títulos de tomos.
* Nombres de archivos PDF.
* Comparaciones de búsqueda.
* Validación preventiva de duplicados.

La validación del frontend no debe reemplazar las restricciones de la base de datos.

---

# 10. Roles del sistema

## 10.1. Usuario lector

No necesita iniciar sesión.

Puede:

* Ver la biblioteca.
* Buscar mangas.
* Consultar detalles.
* Ver los tomos.
* Abrir un tomo.
* Leer el PDF.
* Navegar por páginas.
* Ir a capítulos registrados.
* Cambiar a pantalla completa.
* Usar zoom.
* Leer desde computadora, tablet o celular.

No puede:

* Crear mangas.
* Editar mangas.
* Eliminar mangas.
* Subir portadas.
* Subir PDFs.
* Crear tomos.
* Modificar tomos.
* Crear marcas de capítulos.
* Acceder al panel administrativo.

## 10.2. Administrador

Debe iniciar sesión con Supabase Auth.

Puede:

* Crear mangas.
* Editar mangas.
* Eliminar mangas.
* Subir y reemplazar portadas.
* Crear tomos.
* Editar tomos.
* Eliminar tomos.
* Subir y reemplazar PDFs.
* Registrar marcas de capítulos.
* Editar marcas.
* Eliminar marcas.
* Cerrar sesión.

---

# 11. Pantalla principal: biblioteca pública

Construye `index.html`.

Debe incluir:

## Encabezado

* Logotipo o nombre MangaReadV1.
* Enlace a biblioteca.
* Campo de búsqueda.
* Botón o enlace discreto para acceso administrativo.
* Botón de menú móvil.

## Sección principal

* Título de bienvenida.
* Breve descripción.
* Contador de mangas disponibles.
* Buscador por título o autor.

## Biblioteca

Cada manga debe mostrarse en una tarjeta con:

* Portada.
* Título.
* Autor.
* Número de tomos.
* Sentido de lectura.
* Botón “Ver manga”.

## Estados de interfaz

Implementa:

* Skeletons o indicador de carga.
* Mensaje cuando no existan mangas.
* Mensaje cuando la búsqueda no tenga resultados.
* Portada predeterminada cuando un manga no tenga imagen.
* Mensaje de error cuando Supabase no responda.

## Búsqueda

La búsqueda debe:

* Buscar por título.
* Buscar por autor.
* Ignorar mayúsculas.
* Ignorar minúsculas.
* Ignorar acentos.
* Ignorar espacios duplicados.
* Actualizar los resultados sin recargar la página.

---

# 12. Pantalla de detalle del manga

Construye `manga.html`.

Recibe el identificador mediante query string:

```text
manga.html?id=UUID_DEL_MANGA
```

Debe mostrar:

* Portada grande.
* Título.
* Autor.
* Sinopsis.
* Sentido de lectura.
* Fecha de creación, opcional.
* Número de tomos.
* Lista de tomos disponibles.

Cada tomo debe mostrar:

* Título.
* Texto de capítulos incluidos.
* Cantidad de marcas de capítulos.
* Botón “Leer tomo”.

El botón debe abrir:

```text
reader.html?volumeId=UUID_DEL_TOMO
```

Valida:

* Que el parámetro exista.
* Que el manga exista.
* Que se puedan cargar sus tomos.
* Que un manga sin tomos muestre un mensaje adecuado.

---

# 13. Autenticación administrativa

Construye `login.html`.

Debe incluir:

## Inicio de sesión

Campos:

* Correo.
* Contraseña.

Funciones:

* Iniciar sesión.
* Mostrar errores.
* Deshabilitar el botón durante el proceso.
* Redirigir al panel al iniciar correctamente.

## Creación de cuenta administrativa

Campos:

* Correo.
* Contraseña.
* Confirmar contraseña.
* Código autorizado.

Reglas:

* El código debe coincidir con `adminInviteCode`.
* El correo debe pertenecer a la lista permitida.
* La contraseña debe cumplir una longitud mínima.
* Las contraseñas deben coincidir.
* No debe mostrarse la contraseña en texto plano.
* Agrega opción para mostrar u ocultar contraseña.

Aclara mediante comentarios y documentación que un código colocado en frontend no representa seguridad completa.

La seguridad real debe depender de:

* Supabase Auth.
* Lista de correos autorizados.
* Función `is_admin()`.
* Políticas RLS.
* Políticas de Storage.

## Recuperación de sesión

Al cargar la aplicación:

* Consulta la sesión actual.
* Escucha cambios mediante `onAuthStateChange`.
* Redirige correctamente según el estado de autenticación.
* Impide que usuarios sin sesión permanezcan en `admin.html`.

---

# 14. Panel administrativo

Construye `admin.html`.

Diseña un panel profesional y responsive con:

## Barra lateral

* Resumen.
* Mangas.
* Tomos.
* Archivos.
* Cerrar sesión.

## Encabezado

* Nombre del usuario autenticado.
* Estado de conexión.
* Botón para cerrar sesión.
* Botón para abrir la biblioteca pública.

## Tarjetas de resumen

Muestra:

* Total de mangas.
* Total de tomos.
* Total de marcas de capítulos.
* Manga más reciente, opcional.

## Administración de mangas

Incluye:

* Tabla o cuadrícula de mangas.
* Buscador.
* Botón “Nuevo manga”.
* Botón “Editar”.
* Botón “Eliminar”.
* Botón “Administrar tomos”.
* Vista previa de portada.
* Indicador de cantidad de tomos.

## Administración de tomos

El administrador primero debe seleccionar un manga.

Después de seleccionarlo, muestra:

* Nombre del manga seleccionado.
* Portada.
* Lista de tomos.
* Botón “Agregar tomo”.
* Botones para editar y eliminar cada tomo.
* Marcas de capítulos registradas.

No permitas crear un tomo cuando no exista un manga seleccionado.

---

# 15. Formulario para crear o editar mangas

El formulario debe contener:

* Título.
* Autor.
* Sinopsis.
* Sentido de lectura.
* Portada.
* Vista previa de la portada.
* Botón guardar.
* Botón cancelar.

Opciones del sentido de lectura:

```text
Derecha a izquierda — rtl
Izquierda a derecha — ltr
```

Validaciones:

* El título es obligatorio.
* El autor es obligatorio.
* La sinopsis puede tener longitud mínima o máxima razonable.
* La dirección debe ser válida.
* La portada debe ser una imagen.
* El archivo debe respetar el límite de tamaño.
* No debe repetirse el título normalizado.
* En edición, el registro actual no debe considerarse duplicado de sí mismo.

Proceso de creación:

1. Validar el formulario.
2. Comprobar duplicados.
3. Crear provisionalmente el registro o preparar su identificador.
4. Subir la portada.
5. Guardar `cover_path`.
6. Actualizar la interfaz.
7. Mostrar notificación.
8. Limpiar y cerrar el formulario.

Implementa compensación de errores:

* Si la portada se sube, pero falla la creación del manga, intenta eliminar el archivo subido.
* Si se reemplaza una portada, elimina la portada anterior solamente después de guardar correctamente la nueva.
* No dejes archivos huérfanos cuando pueda evitarse.

---

# 16. Formulario para crear o editar tomos

El formulario debe contener:

* Manga seleccionado.
* Título del tomo.
* Texto de capítulos incluidos.
* Archivo PDF.
* Nombre del PDF actual en modo edición.
* Lista dinámica de marcas de capítulos.
* Botón para agregar una marca.
* Botón guardar.
* Botón cancelar.

Cada marca debe incluir:

* Número de capítulo.
* Página inicial.
* Botón eliminar marca.

Validaciones obligatorias:

* Debe existir un manga seleccionado.
* El título del tomo es obligatorio.
* Al crear, el PDF es obligatorio.
* Al editar, el PDF puede conservarse.
* El archivo debe ser PDF.
* Debe respetar el límite de tamaño.
* No debe repetirse el título dentro del mismo manga.
* No debe repetirse el nombre del PDF dentro del mismo manga.
* No se permiten marcas incompletas.
* El capítulo debe ser entero y mayor que cero.
* La página debe ser entera y mayor que cero.
* No se puede repetir un capítulo.
* No se puede repetir una página.
* Ordena las marcas por página antes de guardarlas.

Proceso de creación:

1. Validar que exista un manga.
2. Validar campos.
3. Validar duplicados.
4. Subir PDF.
5. Insertar tomo.
6. Insertar marcas.
7. Si falla la inserción de marcas, ejecutar compensación o eliminar el tomo creado.
8. Actualizar la lista.
9. Mostrar mensaje de éxito.

Proceso de edición:

1. Conservar el PDF actual si el usuario no selecciona uno nuevo.
2. Si existe un PDF nuevo, subirlo.
3. Actualizar el tomo.
4. Reemplazar las marcas mediante una operación controlada.
5. Si todo termina correctamente, eliminar el PDF anterior.
6. Si ocurre un error, conservar la información anterior en la medida de lo posible.

---

# 17. Eliminación de mangas y tomos

Antes de eliminar, muestra un modal de confirmación.

## Eliminar manga

Advierte que se eliminarán:

* El manga.
* Todos sus tomos.
* Todas sus marcas.
* Sus portadas.
* Sus PDFs.

La base de datos debe eliminar las relaciones mediante cascada.

La aplicación debe intentar eliminar también los archivos de Storage.

## Eliminar tomo

Advierte que se eliminarán:

* El tomo.
* Sus marcas.
* Su PDF.

No utilices únicamente `confirm()` si puedes construir un modal accesible y reutilizable.

---

# 18. Lector PDF

Construye `reader.html`.

Recibe:

```text
reader.html?volumeId=UUID_DEL_TOMO
```

Debe cargar:

* Información del tomo.
* Manga al que pertenece.
* Dirección de lectura.
* PDF.
* Marcas de capítulos.

Utiliza PDF.js para renderizar el archivo.

Utiliza PageFlip, StPageFlip o una librería similar para generar el efecto de libro.

## Funciones obligatorias

* Mostrar páginas.
* Página anterior.
* Página siguiente.
* Ir a una página específica.
* Mostrar página actual.
* Mostrar total de páginas.
* Seleccionar capítulo registrado.
* Ir directamente a la página del capítulo.
* Regresar al detalle del manga.
* Respetar el sentido de lectura.
* Mostrar indicador de carga.
* Mostrar errores comprensibles.

## Funciones adicionales

Agrega:

* Zoom.
* Ajustar al ancho.
* Ajustar a la altura.
* Pantalla completa.
* Modo de una página en móvil.
* Modo de dos páginas en escritorio.
* Controles mediante teclado.
* Teclas de flecha para cambiar página.
* Escape para salir de pantalla completa.
* Barra de progreso.
* Indicador porcentual.
* Botón para ocultar controles durante la lectura.

## Dirección de lectura

Para mangas `rtl`:

* La navegación visual debe respetar derecha a izquierda.
* Los controles deben resultar intuitivos.
* El orden del libro debe configurarse correctamente.

Para cómics `ltr`:

* La navegación debe ser izquierda a derecha.

## Rendimiento

No renderices todas las páginas en alta resolución de manera simultánea si el PDF es muy grande.

Implementa alguna estrategia como:

* Renderizado bajo demanda.
* Renderizado progresivo.
* Caché limitada de páginas cercanas.
* Liberación de canvases no utilizados.
* Escala adaptativa.

Evita bloquear el navegador.

---

# 19. Servicios de datos

Implementa servicios separados.

## `manga-service.js`

Funciones recomendadas:

```javascript
getMangas()
getMangaById(id)
searchMangas(searchTerm)
createManga(data)
updateManga(id, data)
deleteManga(id)
checkMangaTitleExists(normalizedTitle, excludeId)
```

## `volume-service.js`

```javascript
getVolumesByManga(mangaId)
getVolumeById(id)
createVolume(data)
updateVolume(id, data)
deleteVolume(id)
checkVolumeTitleExists(mangaId, normalizedTitle, excludeId)
checkPdfNameExists(mangaId, normalizedPdfName, excludeId)
```

## `chapter-service.js`

```javascript
getChapterMarks(volumeId)
createChapterMarks(volumeId, marks)
replaceChapterMarks(volumeId, marks)
deleteChapterMarks(volumeId)
```

## `storage-service.js`

```javascript
uploadCover(mangaId, file)
replaceCover(mangaId, oldPath, file)
deleteCover(path)
uploadPdf(mangaId, volumeId, file)
replacePdf(mangaId, volumeId, oldPath, file)
deletePdf(path)
getPublicFileUrl(bucket, path)
```

Todas las funciones deben:

* Manejar errores.
* Devolver resultados consistentes.
* No modificar directamente el DOM.
* Lanzar errores claros cuando sea necesario.

---

# 20. Validaciones reutilizables

Construye `validators.js`.

Incluye funciones para:

* Validar texto obligatorio.
* Validar correo.
* Validar contraseña.
* Validar confirmación de contraseña.
* Validar imagen.
* Validar PDF.
* Validar tamaño.
* Validar número entero positivo.
* Validar marcas de capítulos.
* Detectar capítulos repetidos.
* Detectar páginas repetidas.
* Sanitizar nombre de archivo.
* Normalizar texto.
* Validar UUID de parámetros, cuando sea posible.

Los mensajes deben ser específicos.

Ejemplos:

```text
El título del manga es obligatorio.
Ya existe un manga con ese título.
Selecciona primero el manga al que pertenece el tomo.
El archivo seleccionado no es una imagen válida.
El archivo del tomo debe estar en formato PDF.
El capítulo 4 se encuentra repetido.
La página inicial 25 ya está asignada a otro capítulo.
No se pudo cargar la biblioteca. Revisa tu conexión.
```

---

# 21. Diseño visual

Crea una interfaz moderna inspirada en plataformas de lectura digital, sin copiar marcas existentes.

## Estilo recomendado

* Fondo oscuro o combinación de oscuro con superficies claras.
* Colores principales relacionados con rojo, violeta o azul.
* Tarjetas elegantes.
* Bordes suaves.
* Sombras moderadas.
* Portadas con proporción vertical.
* Tipografía legible.
* Botones claramente diferenciados.
* Estados `hover`, `focus`, `active` y `disabled`.
* Transiciones suaves.
* Iconos sencillos.
* Navegación intuitiva.

## Accesibilidad

Implementa:

* Etiquetas `label` asociadas a inputs.
* Contraste adecuado.
* Navegación por teclado.
* Indicadores de foco.
* Textos alternativos.
* Botones con `aria-label` cuando sea necesario.
* Modales con manejo de foco.
* Mensajes de error asociados a sus campos.
* No depender exclusivamente del color.

## Responsive

La aplicación debe funcionar en:

* Computadoras.
* Tablets.
* Celulares.

En móvil:

* La barra lateral debe convertirse en menú.
* Las tablas deben adaptarse o convertirse en tarjetas.
* Los formularios deben usar una sola columna.
* El lector debe mostrar una página cuando el espacio sea reducido.
* Los botones principales deben ser fáciles de tocar.

---

# 22. Sistema de notificaciones

Crea un componente reutilizable para mostrar:

* Éxito.
* Error.
* Advertencia.
* Información.

Ejemplos:

```text
Manga creado correctamente.
Tomo actualizado correctamente.
La portada fue reemplazada.
No se pudo subir el PDF.
Tu sesión ha expirado.
Debes iniciar sesión como administrador.
```

Las notificaciones deben:

* Ser visibles.
* Poder cerrarse.
* Desaparecer automáticamente cuando sea adecuado.
* Ser accesibles con lectores de pantalla.

---

# 23. Estados de carga

Agrega estados de carga en:

* Biblioteca.
* Detalle del manga.
* Inicio de sesión.
* Creación de manga.
* Edición de manga.
* Subida de portada.
* Subida de PDF.
* Creación de tomo.
* Edición de tomo.
* Eliminaciones.
* Apertura del lector.
* Renderizado del PDF.

Durante una operación:

* Deshabilita el botón correspondiente.
* Cambia el texto del botón.
* Evita envíos duplicados.
* Muestra un spinner o indicador.
* Restaura el estado cuando termine.

---

# 24. Manejo de errores

Maneja al menos:

* Falta de conexión.
* Credenciales incorrectas.
* Sesión expirada.
* Usuario no autorizado.
* Parámetro faltante.
* Manga inexistente.
* Tomo inexistente.
* PDF inexistente.
* Archivo demasiado grande.
* Tipo de archivo incorrecto.
* Título duplicado.
* Nombre de PDF duplicado.
* Error de Storage.
* Error de base de datos.
* Error al renderizar PDF.
* Fallo parcial durante una actualización.

No muestres al usuario objetos técnicos completos ni errores sin procesar.

Puedes registrar detalles técnicos en `console.error`, pero muestra mensajes sencillos en pantalla.

---

# 25. Documentación

Genera un `README.md` completo con:

* Nombre del proyecto.
* Descripción.
* Funcionalidades.
* Tecnologías.
* Estructura.
* Requisitos.
* Instalación.
* Configuración de Supabase.
* Ejecución local.
* Configuración de URLs de autenticación.
* Publicación.
* Credenciales de prueba, usando únicamente placeholders.
* Seguridad.
* Problemas conocidos.
* Integrantes del equipo como campos editables.

Genera también:

## `docs/evidencias.md`

Incluye espacios para capturas de:

* Tablas.
* Relaciones.
* Buckets.
* Usuario administrador.
* Biblioteca.
* Detalle.
* Formulario de manga.
* Formulario de tomo.
* Lector.
* Login.
* Panel.

## `docs/pruebas.md`

Incluye una tabla con:

* ID.
* Función.
* Datos de prueba.
* Pasos.
* Resultado esperado.
* Resultado obtenido.
* Estado.
* Evidencia.

Agrega pruebas para:

* Crear manga.
* Editar manga.
* Eliminar manga.
* Rechazar título duplicado.
* Rechazar portada inválida.
* Crear tomo.
* Rechazar tomo sin manga.
* Rechazar PDF inválido.
* Rechazar tomo duplicado.
* Rechazar nombre de PDF duplicado.
* Rechazar capítulos repetidos.
* Rechazar páginas repetidas.
* Leer PDF.
* Ir a capítulo.
* Acceso público.
* Bloqueo de escritura pública.
* Inicio de sesión.
* Cierre de sesión.
* Sesión expirada.

## `docs/estructura-proyecto.md`

Explica:

* Responsabilidad de cada archivo.
* Flujo de datos.
* Relación entre interfaz, servicios y Supabase.

## `docs/configuracion-supabase.md`

Explica:

* Creación del proyecto.
* Ejecución del SQL.
* Creación de buckets.
* Configuración de Email Auth.
* Configuración de URL.
* Colocación de credenciales públicas.
* Creación del administrador.
* Verificación de RLS.

## `docs/dificultades.md`

Incluye una plantilla para documentar:

* Problema encontrado.
* Causa.
* Solución.
* Evidencia.
* Aprendizaje obtenido.

---

# 26. Datos de ejemplo

Crea un archivo:

```text
supabase/seed.example.sql
```

Incluye algunos mangas y tomos de prueba sin utilizar material protegido real.

Utiliza nombres ficticios, por ejemplo:

* Guardianes del Eclipse.
* Crónicas de Acero.
* Viajeros del Vacío.

No incluyas PDFs comerciales ni portadas con derechos de autor.

Puedes agregar archivos de ejemplo genéricos o instrucciones para que el usuario suba sus propios archivos autorizados.

---

# 27. Requisitos de aceptación

El proyecto se considerará completo únicamente cuando se cumpla lo siguiente:

* La biblioteca obtiene los mangas desde Supabase.
* La búsqueda funciona por título y autor.
* El detalle obtiene el manga mediante su ID.
* Los tomos se muestran asociados al manga correcto.
* El lector carga el PDF desde Storage.
* El lector permite cambiar de página.
* El lector permite ir a una página específica.
* El lector permite ir a capítulos registrados.
* Existe un efecto visual de libro.
* El administrador puede iniciar sesión.
* Un usuario no autenticado no puede abrir el panel.
* Un usuario público no puede modificar la base de datos.
* El administrador puede crear mangas.
* El administrador puede editar mangas.
* El administrador puede eliminar mangas.
* El administrador puede subir portadas.
* El administrador puede crear tomos.
* El administrador puede editar tomos.
* El administrador puede eliminar tomos.
* El administrador puede subir PDFs.
* Las marcas de capítulos se guardan correctamente.
* Los títulos duplicados son rechazados.
* Los nombres de PDF duplicados son rechazados.
* Los archivos inválidos son rechazados.
* Los errores se muestran claramente.
* La información persiste después de recargar.
* El diseño funciona en escritorio y móvil.
* El código se encuentra separado en módulos.
* Existe documentación de instalación y pruebas.

---

# 28. Forma de trabajo obligatoria

Antes de escribir código:

1. Analiza todos los requisitos.
2. Identifica las entidades y relaciones.
3. Define el flujo de navegación.
4. Define la arquitectura de archivos.
5. Define la estrategia del lector PDF.
6. Define la estrategia de autenticación.
7. Define el manejo de archivos.
8. Identifica riesgos técnicos.
9. Verifica que las funciones cubran todos los requisitos.

Después, genera el proyecto por fases:

## Fase 1

* Estructura de carpetas.
* HTML base.
* Variables CSS.
* Navegación.
* Componentes generales.

## Fase 2

* Configuración de Supabase.
* Cliente.
* SQL.
* RLS.
* Storage.

## Fase 3

* Biblioteca pública.
* Búsqueda.
* Detalle del manga.
* Listado de tomos.

## Fase 4

* Inicio de sesión.
* Registro administrativo autorizado.
* Protección de rutas.
* Manejo de sesión.

## Fase 5

* Panel administrativo.
* CRUD de mangas.
* Gestión de portadas.

## Fase 6

* CRUD de tomos.
* Gestión de PDFs.
* Gestión de marcas.

## Fase 7

* Lector PDF.
* Navegación por páginas.
* Navegación por capítulos.
* Efecto libro.
* Zoom.
* Pantalla completa.

## Fase 8

* Responsive.
* Accesibilidad.
* Manejo de errores.
* Optimización.

## Fase 9

* Documentación.
* Pruebas.
* Revisión final.

No avances dejando errores evidentes en fases anteriores.

---

# 29. Revisión final obligatoria

Al terminar, revisa el proyecto completo y corrige:

* Importaciones incorrectas.
* Rutas rotas.
* Funciones no utilizadas.
* Variables inexistentes.
* IDs duplicados.
* Formularios que se recargan accidentalmente.
* Eventos registrados varias veces.
* Errores de sesión.
* Consultas incorrectas.
* Archivos sin referencia.
* Botones sin funcionamiento.
* Pantallas sin navegación.
* Problemas de responsive.
* Problemas de accesibilidad.
* Riesgos de seguridad.
* Archivos huérfanos.
* Registros duplicados.
* Errores al sustituir portadas o PDFs.
* Problemas de rendimiento en PDFs grandes.

Realiza una matriz final indicando cada requisito y el archivo donde fue implementado.

---

# 30. Formato de entrega de la IA

Entrega:

1. Resumen de la arquitectura elegida.
2. Árbol completo de archivos.
3. Código completo de cada archivo.
4. Scripts SQL.
5. Instrucciones para configurar Supabase.
6. Instrucciones para ejecutar localmente.
7. Instrucciones para crear al administrador.
8. Instrucciones para probar cada módulo.
9. Lista de credenciales o valores que el usuario debe reemplazar.
10. Lista de pruebas realizadas.
11. Lista de requisitos cumplidos.
12. Posibles mejoras futuras.

Cuando generes archivos:

* Escribe primero la ruta.
* Después muestra el contenido completo.
* No omitas código con frases como “resto del código”.
* No utilices puntos suspensivos para reemplazar implementaciones.
* No generes funciones vacías.
* No resumas archivos importantes.
* Mantén compatibilidad entre todos los módulos.

El resultado final debe ser una aplicación web funcional, segura, organizada, responsive y lista para conectarse a un proyecto real de Supabase.
