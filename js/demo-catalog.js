import { normalizeText } from "./utils.js";
import { lightNovelManga } from "./light-novel-catalog.js?v=20260722-v1";
import { myHeroManga } from "./my-hero-catalog.js?v=20260722-v1";

const classroomId = "demo-classroom-of-the-elite";
const classroomAuthor = "Shogo Kinugasa / Yuyu Ichino";
const classroomParts = [
  [1, 4, 142, "classroom-of-the-elite-capitulos-01-04.pdf"],
  [5, 9, 140, "classroom-of-the-elite-capitulos-05-09.pdf"],
  [10, 14, 181, "classroom-of-the-elite-capitulos-10-14.pdf"],
  [15, 18, 153, "classroom-of-the-elite-capitulos-15-18.pdf"],
  [19, 22, 144, "classroom-of-the-elite-capitulos-19-22.pdf"],
  [23, 27, 140, "classroom-of-the-elite-capitulos-23-27.pdf"],
  [28, 32, 154, "classroom-of-the-elite-capitulos-28-32.pdf"],
  [33, 38, 173, "classroom-of-the-elite-capitulos-33-38.pdf"],
  [39, 45, 172, "classroom-of-the-elite-capitulos-39-45.pdf"],
  [46, 52, 161, "classroom-of-the-elite-capitulos-46-52.pdf"],
  [53, 60, 152, "classroom-of-the-elite-capitulos-53-60.pdf"],
  [61, 70, 160, "classroom-of-the-elite-capitulos-61-70.pdf"],
  [71, 72, 24, "classroom-of-the-elite-capitulos-71-72.pdf"],
  [73, 73, 12, "classroom-of-the-elite-capitulo-73.pdf"]
];

const classroomVolumes = classroomParts.map(([firstChapter, lastChapter, pageCount, pdfName], index) => {
  const range = firstChapter === lastChapter
    ? String(firstChapter)
    : `${String(firstChapter).padStart(2, "0")}-${String(lastChapter).padStart(2, "0")}`;
  const id = `local-cote-chapters-${range}`;
  const chapterLabel = firstChapter === lastChapter
    ? `Capítulo ${firstChapter}`
    : `Capítulos ${firstChapter} al ${lastChapter}`;
  return {
    id,
    manga_id: classroomId,
    title: chapterLabel,
    normalized_title: normalizeText(chapterLabel),
    chapters_label: `${chapterLabel} · ${pageCount} páginas`,
    pdf_path: `output/pdf/classroom-of-the-elite/${pdfName}`,
    pdf_storage_mode: "local",
    pdf_parts: null,
    pdf_name: pdfName,
    normalized_pdf_name: pdfName,
    demo_url: `output/pdf/classroom-of-the-elite/${pdfName}`,
    page_count: pageCount,
    is_user_provided: true,
    is_demo: true,
    created_at: `2026-07-22T00:${String(index).padStart(2, "0")}:00Z`,
    chapter_marks: [
      { id: `${id}-chapter-${firstChapter}`, volume_id: id, chapter: firstChapter, page: 1 }
    ]
  };
});

const catalogSeed = [
  ["One Piece", "Eiichiro Oda", "output/covers/catalog/one-piece.jpg"],
  ["Naruto", "Masashi Kishimoto", "output/covers/catalog/naruto.jpg"],
  ["Berserk", "Kentaro Miura", "output/covers/catalog/berserk.jpg"],
  ["Fullmetal Alchemist", "Hiromu Arakawa", "output/covers/catalog/fullmetal-alchemist.png"],
  ["Death Note", "Tsugumi Ohba / Takeshi Obata", "output/covers/catalog/death-note.jpg"],
  ["Attack on Titan", "Hajime Isayama", "output/covers/catalog/attack-on-titan.jpg"],
  ["Demon Slayer", "Koyoharu Gotouge", "output/covers/catalog/demon-slayer.png"],
  ["Jujutsu Kaisen", "Gege Akutami", "output/covers/catalog/jujutsu-kaisen.jpg"],
  ["SPY x FAMILY", "Tatsuya Endo", "output/covers/catalog/spy-x-family.jpg"],
  ["Chainsaw Man", "Tatsuki Fujimoto", "output/covers/catalog/chainsaw-man.png"],
  ["Oregairu", "Wataru Watari / Naomichi Io", "output/covers/catalog/oregairu.jpg"]
];

const summaries = {
  "One Piece": "Una tripulacion pirata recorre mares extraordinarios en busca de libertad, amistad y el tesoro mas legendario.",
  Naruto: "Un joven ninja busca el reconocimiento de su aldea mientras aprende el valor de los vinculos y la perseverancia.",
  Berserk: "Un guerrero marcado por la tragedia enfrenta un mundo oscuro dominado por ambicion y fuerzas sobrenaturales.",
  "Fullmetal Alchemist": "Dos hermanos alquimistas buscan reparar las consecuencias de una transmutacion prohibida.",
  "Death Note": "Un cuaderno sobrenatural provoca un duelo intelectual entre un estudiante y un detective excepcional.",
  "Attack on Titan": "La humanidad resiste tras enormes murallas mientras un grupo de soldados descubre secretos decisivos.",
  "Demon Slayer": "Un joven cazador de demonios emprende una mision para proteger a su hermana y honrar a su familia.",
  "Jujutsu Kaisen": "Un estudiante entra al mundo de la hechiceria despues de quedar ligado a una poderosa maldicion.",
  "SPY x FAMILY": "Un espia, una asesina y una nina telepata forman una familia mientras ocultan sus verdaderas identidades.",
  "Chainsaw Man": "Un joven obtiene un poder extraordinario y se une a una organizacion que combate amenazas sobrenaturales.",
  "My Hero Academia": "Un estudiante hereda un gran poder y comienza su formacion para convertirse en heroe profesional.",
  Oregairu: "Hachiman Hikigaya entra al club de servicio escolar y descubre que comprender a los demás puede ser más difícil que resolver sus problemas."
};

export const demoMangas = [
  {
    id: classroomId,
    title: "Classroom of the Elite",
    normalized_title: "classroom of the elite",
    author: classroomAuthor,
    synopsis: "Kiyotaka Ayanokoji ingresa a una preparatoria de élite donde los estudiantes compiten mediante puntos, estrategias y evaluaciones especiales. Esta colección local incluye los capítulos 1 al 73 distribuidos en 14 archivos PDF.",
    direction: "rtl",
    cover_path: "output/covers/classroom-of-the-elite/panel.webp",
    cover_url: "output/covers/classroom-of-the-elite/panel.webp",
    created_at: "2026-01-01T00:00:00Z",
    volumes: classroomVolumes,
    volume_count: classroomVolumes.length,
    has_local_content: true,
    is_demo: true,
    featured: true
  },
  lightNovelManga,
  myHeroManga,
  ...catalogSeed.map(([title, author, coverUrl], index) => ({
    id: `demo-${normalizeText(title).replaceAll(" ", "-")}`,
    title,
    normalized_title: normalizeText(title),
    author,
    synopsis: summaries[title],
    direction: "rtl",
    cover_path: coverUrl,
    cover_url: coverUrl,
    created_at: `2026-01-${String(index + 2).padStart(2, "0")}T00:00:00Z`,
    volumes: [],
    volume_count: 0,
    is_demo: true
  }))
];

export function getDemoMangaById(id) {
  return demoMangas.find((manga) => manga.id === id) || null;
}

export function getDemoMangaByTitle(title) {
  const catalogKey = (value) => normalizeText(value)
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const normalized = catalogKey(title);
  return demoMangas.find((manga) => catalogKey(manga.normalized_title) === normalized
    || catalogKey(manga.title) === normalized) || null;
}

export function getDemoVolumeById(id) {
  for (const manga of demoMangas) {
    const volume = manga.volumes.find((item) => item.id === id);
    if (volume) {
      return {
        ...volume,
        mangas: { id: manga.id, title: manga.title, direction: manga.direction }
      };
    }
  }
  return null;
}
