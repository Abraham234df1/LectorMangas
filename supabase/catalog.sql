-- MangaReadV1 - Catalogo ampliado
-- Ejecutar despues de schema.sql y policies.sql desde el SQL Editor de Supabase.
--
-- Este archivo agrega metadatos de catalogo. No incluye ni distribuye portadas o
-- PDFs protegidos por derechos de autor. Los 12 tomos de Classroom of the Elite
-- quedan visibles como "PDF pendiente" hasta que un administrador cargue cada
-- archivo obtenido legalmente desde el panel de la aplicacion.

insert into public.mangas (
  id,
  title,
  normalized_title,
  author,
  synopsis,
  direction,
  cover_path
)
values
  (
    'c1000000-0000-4000-8000-000000000001',
    'Classroom of the Elite',
    'classroom of the elite',
    'Shogo Kinugasa / Yuyu Ichino',
    'Kiyotaka Ayanokoji ingresa a una preparatoria de elite donde los alumnos compiten mediante un sistema de puntos, estrategias y evaluaciones especiales.',
    'rtl',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000002',
    'One Piece',
    'one piece',
    'Eiichiro Oda',
    'Monkey D. Luffy recorre los mares con su tripulacion para encontrar el tesoro legendario One Piece.',
    'rtl',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000003',
    'Naruto',
    'naruto',
    'Masashi Kishimoto',
    'Un joven ninja busca el reconocimiento de su aldea mientras aprende el valor de los vinculos y la perseverancia.',
    'rtl',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000004',
    'Berserk',
    'berserk',
    'Kentaro Miura',
    'Guts, un guerrero marcado por la tragedia, lucha contra enemigos humanos y sobrenaturales en un mundo oscuro.',
    'rtl',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000005',
    'Fullmetal Alchemist',
    'fullmetal alchemist',
    'Hiromu Arakawa',
    'Los hermanos Elric buscan la Piedra Filosofal para recuperar aquello que perdieron al intentar una transmutacion prohibida.',
    'rtl',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000006',
    'Death Note',
    'death note',
    'Tsugumi Ohba / Takeshi Obata',
    'Un estudiante encuentra un cuaderno sobrenatural capaz de matar y desencadena un duelo intelectual con un detective excepcional.',
    'rtl',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000007',
    'Attack on Titan',
    'attack on titan',
    'Hajime Isayama',
    'La humanidad vive tras enormes murallas mientras un grupo de jovenes soldados descubre el origen de los titanes.',
    'rtl',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000008',
    'Demon Slayer',
    'demon slayer',
    'Koyoharu Gotouge',
    'Tanjiro se convierte en cazador de demonios para salvar a su hermana y enfrentar al responsable de la tragedia de su familia.',
    'rtl',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000009',
    'Jujutsu Kaisen',
    'jujutsu kaisen',
    'Gege Akutami',
    'Yuji Itadori entra al mundo de la hechiceria jujutsu despues de quedar ligado a una poderosa maldicion.',
    'rtl',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000010',
    'SPY x FAMILY',
    'spy x family',
    'Tatsuya Endo',
    'Un espia, una asesina y una nina telepata forman una familia de apariencia perfecta mientras ocultan sus identidades.',
    'rtl',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000011',
    'Chainsaw Man',
    'chainsaw man',
    'Tatsuki Fujimoto',
    'Denji obtiene el poder del demonio motosierra y se une a una organizacion dedicada a combatir amenazas sobrenaturales.',
    'rtl',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000012',
    'My Hero Academia',
    'my hero academia',
    'Kohei Horikoshi',
    'Izuku Midoriya hereda un gran poder y comienza su formacion para convertirse en heroe profesional.',
    'rtl',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000013',
    'Oregairu',
    'oregairu',
    'Wataru Watari / Naomichi Io',
    'Hachiman Hikigaya entra al club de servicio escolar y descubre que comprender a los demas puede ser mas dificil que resolver sus problemas.',
    'rtl',
    null
  )
on conflict (normalized_title) do update
set author = excluded.author,
    synopsis = excluded.synopsis,
    direction = excluded.direction;

-- Classroom of the Elite usa sus 14 PDF locales reales. No se insertan tomos
-- remotos vacíos porque ocultarían ese respaldo legible en la interfaz.
