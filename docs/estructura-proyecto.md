# Estructura y Arquitectura del Proyecto — MangaReadV1

El proyecto está diseñado bajo un modelo modular, separando la lógica de negocio (servicios), la manipulación del DOM (interfaz UI) y la configuración del cliente.

## 📂 Organización de Archivos

```text
MangaReadV1/
├── index.html                 # Biblioteca pública (Grid de Mangas)
├── manga.html                 # Detalle del manga y tomos disponibles
├── reader.html                # Lector PDF interactivo 3D
├── admin.html                 # Panel de administración de contenidos
├── login.html                 # Pantalla de acceso y registro de administradores
├── README.md                  # Manual general del proyecto
│
├── css/
│   ├── variables.css          # Variables globales, tipografía y colores
│   ├── reset.css              # Normalización de estilos entre navegadores
│   ├── styles.css             # Importador global y estilos comunes de la app
│   ├── components.css         # Formularios, botones, modales, spinners y toasts
│   ├── responsive.css         # Ajustes de cuadrículas y vistas móviles
│   ├── admin.css              # Diseño de tablas y secciones del panel
│   └── reader.css             # Estructura del escenario de lectura 3D
│
├── js/
│   ├── config.js              # Credenciales y endpoints de Supabase
│   ├── config.example.js      # Plantilla de credenciales públicas
│   ├── supabase-client.js     # Inicialización del SDK de Supabase
│   ├── utils.js               # Conversiones de datos y formatos comunes
│   ├── validators.js          # Validaciones de entrada en el cliente
│   ├── notifications.js       # Control de avisos Toast
│   ├── modals.js              # Gestor de accesibilidad de modales
│   ├── guards.js              # Protectores de rutas en el navegador
│   │
│   ├── auth.js                # Lógica de inicio de sesión y registro RPC
│   ├── manga-service.js       # Base de datos y Storage de Mangas
│   ├── volume-service.js      # Gestión de base de datos de tomos
│   ├── chapter-service.js     # Creación y sustitución de marcas
│   ├── storage-service.js     # Gestor de subidas y descargas en Storage
│   │
│   ├── library-ui.js          # Renderizado de catálogo público
│   ├── manga-detail-ui.js     # Renderizado de detalles del manga seleccionado
│   ├── admin-ui.js            # Pintor de tablas y estadísticas de panel
│   ├── forms.js               # Gestor de estados de botones y formularios
│   │
│   ├── pdf-reader.js          # Renderizador de páginas de PDF.js y caché
│   ├── page-flip-reader.js    # Conector de StPageFlip y cálculo de spreads
│   └── reader.js              # Coordinador principal de lectura
│
└── supabase/
    ├── schema.sql             # Estructuras DDL de las tablas
    ├── policies.sql           # Políticas RLS, funciones y buckets
    └── seed.example.sql       # Carga inicial de datos de ejemplo
```

## 🔄 Flujo de Datos

1. **Catálogo Público (`index.html`):**
   * Llama a `app.js` -> Solicita catálogo a `manga-service.js`.
   * Los datos vienen de Supabase Database y la URL de portadas viene de Storage.
   * `library-ui.js` dibuja las tarjetas en el DOM y redirige a `manga.html?id=ID`.

2. **Detalles del Manga (`manga.html`):**
   * Lee la QueryString `id`.
   * Solicita información detallada a `manga-service.js` y `volume-service.js`.
   * `manga-detail-ui.js` pinta la portada, autor y la lista de tomos. Al pulsar "Leer tomo", redirige a `reader.html?volumeId=ID`.

3. **Lector interactivo (`reader.html`):**
   * Llama a `reader.js` el cual usa `volume-service.js` para traer metadatos del tomo y marcas.
   * Descarga el PDF (en partes si pesa más de 45MB) con `storage-service.js`.
   * Carga el archivo en `pdf-reader.js` (PDF.js) e inicializa el hojear interactivo 3D con `page-flip-reader.js` (StPageFlip).
   * Renderiza de manera floja (*lazy load*) únicamente las páginas visibles y colindantes para conservar memoria.

4. **Administración (`admin.html`):**
   * Llama a `admin.js` el cual ejecuta `guards.js` (`requireAdmin`) para verificar que el usuario tenga sesión y esté en la lista `admins`.
   * El panel permite registrar/editar mangas y tomos subiendo portadas a Storage `covers` y PDFs a `pdfs`.
