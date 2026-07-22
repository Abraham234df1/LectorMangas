# Documento de pruebas — MangaReadV1

## Datos de la ejecución

- **Fecha:** 14 de Julio de 2026
- **Navegador:** Google Chrome / Mozilla Firefox
- **Dispositivo:** Laptop (Desktop) y emulador móvil Chrome DevTools
- **Integrante responsable:** Equipo de Desarrollo MangaReadV1
- **URL probada:** http://localhost:8000

## Casos de prueba

| ID | Caso | Pasos resumidos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|
| CP01 | Cargar biblioteca | Abrir `index.html` | Mostrar mangas persistidos | Se cargan y muestran todos los mangas registrados en Supabase. | Aprobado |
| CP02 | Buscar por título | Escribir parte del título | Mostrar coincidencias | El buscador filtra en tiempo real ignorando mayúsculas, minúsculas y acentos. | Aprobado |
| CP03 | Buscar por autor | Escribir parte del autor | Mostrar coincidencias | Muestra los mangas cuyo autor coincide con el término de búsqueda. | Aprobado |
| CP04 | Abrir detalle | Seleccionar una tarjeta | Mostrar portada, datos y tomos | Se abre `manga.html` mostrando la sinopsis, portada original y la lista de tomos disponibles. | Aprobado |
| CP05 | Login válido | Ingresar credenciales autorizadas | Abrir dashboard | Acceso exitoso a `admin.html` mostrando las estadísticas. | Aprobado |
| CP06 | Login inválido | Usar contraseña incorrecta | Mostrar error comprensible | Muestra un aviso toast informando de credenciales inválidas. | Aprobado |
| CP07 | Crear manga | Completar campos y portada | Guardar y mostrar en biblioteca | Se registra el manga en la base de datos y la portada se sube a Storage. | Aprobado |
| CP08 | Manga sin título | Dejar título vacío | Impedir guardado | El validador del cliente e input required bloquean el envío. | Aprobado |
| CP09 | Manga duplicado | Repetir título con mayúsculas/acentos distintos | Rechazar duplicado | Se comprueba el título normalizado y se rechaza la inserción mostrando error. | Aprobado |
| CP10 | Portada inválida | Seleccionar archivo no imagen | Mostrar error | El validador de imagen arroja error de extensión inválida. | Aprobado |
| CP11 | Editar manga | Cambiar autor o sinopsis | Persistir cambios | Los cambios se guardan y se actualiza la portada anterior en Storage. | Aprobado |
| CP12 | Agregar tomo sin manga | Intentar guardar sin selección | Impedir operación | El panel de control no muestra el formulario de tomos hasta seleccionar un manga. | Aprobado |
| CP13 | Crear tomo | Seleccionar manga, PDF y marcas | Asociar al manga correcto | El tomo se guarda, el PDF se sube (en trozos si supera los 45MB) y se ligan las marcas. | Aprobado |
| CP14 | Tomo sin título | Dejar título vacío | Impedir guardado | El input bloquea el envío indicando que el título es obligatorio. | Aprobado |
| CP15 | PDF inválido | Seleccionar archivo no PDF | Mostrar error | El validador arroja que el archivo debe ser obligatoriamente un PDF. | Aprobado |
| CP16 | Tomo duplicado | Repetir título en el mismo manga | Rechazar duplicado | Se comprueba el título normalizado y se cancela la subida. | Aprobado |
| CP17 | PDF duplicado | Repetir nombre de PDF en el mismo manga | Rechazar duplicado | Se cancela la subida por duplicidad del nombre de archivo. | Aprobado |
| CP18 | Marca incompleta | Dejar capítulo o página vacíos | Impedir guardado | El formulario exige que ambos campos numéricos estén completos. | Aprobado |
| CP19 | Capítulo repetido | Registrar dos veces el mismo capítulo | Rechazar datos | La validación del cliente y de la base de datos lanzan error de capítulo duplicado. | Aprobado |
| CP20 | Página repetida | Registrar dos capítulos con la misma página | Rechazar datos | La validación lanza error indicando que la página ya está asignada. | Aprobado |
| CP21 | Página no válida | Registrar cero o negativo | Impedir guardado | Se bloquea el ingreso de números menores o iguales a cero. | Aprobado |
| CP22 | Editar tomo sin PDF nuevo | Modificar título sin seleccionar archivo | Conservar PDF existente | Se actualizan los campos textuales y se mantiene el archivo PDF de la base de datos. | Aprobado |
| CP23 | Abrir lector | Pulsar Leer tomo | Mostrar PDF y total de páginas | Se inicializa `reader.html`, descarga el PDF y cuenta el número total de páginas. | Aprobado |
| CP24 | Página siguiente/anterior | Usar botones | Cambiar página con animación | Pasa a la siguiente página mediante el efecto volteo de StPageFlip. | Aprobado |
| CP25 | Ir a página | Escribir un número válido | Saltar a esa página | El lector realiza la transición a la página digitada en el input. | Aprobado |
| CP26 | Ir a capítulo | Elegir una marca | Saltar a la página registrada | El select carga las marcas y navega a la página donde empieza dicho capítulo. | Aprobado |
| CP27 | Zoom | Usar + y − | Cambiar escala de renderizado | Incrementa o decrementa la resolución de dibujado de PDF.js en tiempo real. | Aprobado |
| CP28 | Pantalla completa | Pulsar control | Activar/desactivar fullscreen | Activa el modo de pantalla completa nativo en el navegador. | Aprobado |
| CP29 | Lectura RTL | Abrir manga RTL | Avance adaptado derecha-izquierda | El sentido de volteo de StPageFlip y las flechas de teclado cambian según el manga. | Aprobado |
| CP30 | Persistencia | Recargar navegador | Mantener datos | Los datos se cargan dinámicamente de Supabase, manteniendo los cambios al refrescar. | Aprobado |
| CP31 | Seguridad sin sesión | Cerrar sesión e intentar una escritura por API | Supabase rechaza mediante RLS | La base de datos rechaza la operación enviando un error de violación de RLS. | Aprobado |
| CP32 | Eliminar tomo | Confirmar eliminación | Borrar DB, marcas y archivo | Elimina el registro del tomo, sus marcas y el archivo del storage (incluyendo chunks). | Aprobado |
| CP33 | Eliminar manga | Confirmar eliminación | Borrar manga, tomos y archivos | Borra en cascada mangas, tomos, marcas y archivos asociados. | Aprobado |
| CP34 | Vista móvil | Probar ancho menor a 430 px | Interfaz usable | El lector se reduce a una sola página y las tablas se reorganizan en tarjetas. | Aprobado |

## Registro de errores

| Folio | Descripción | Severidad | Evidencia | Solución aplicada | Estado |
|---|---|---|---|---|---|
| E01 | TypeError al tocar teclado o zoom antes de cargar PDF | Alta | Consola del navegador | Se agregaron validaciones de estado y guards en las funciones del lector. | Resuelto |
| E02 | Timeouts en subida de PDFs de alta resolución (>50MB) | Alta | Error de red / Timeout | Se implementó el sistema de subida en trozos (chunks) binarios de 20MB. | Resuelto |
| E03 | Cuentas administrativas bloqueadas de RLS en base de datos | Alta | Error de RLS en panel | Se creó la tabla `admins` y la función RPC de registro automático con RLS. | Resuelto |

## Resultado final

- **Casos aprobados:** 34
- **Casos fallidos:** 0
- **Casos pendientes:** 0
- **Observaciones:** El proyecto cumple con la totalidad de los requisitos de aceptación establecidos en el documento de requerimientos maestros.
