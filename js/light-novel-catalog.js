import { normalizeText } from "./utils.js";

const mangaId = "local-classroom-of-the-elite-light-novel";
const basePath = "output/pdf/classroom-of-the-elite-light-novel";

const volumeSeed = [
  [1, "0", 258, "year-1/classroom-of-the-elite-light-novel-year-1-volume-00.pdf", "en", "Precuela"],
  [1, "1", 277, "year-1/classroom-of-the-elite-light-novel-year-1-volume-01.pdf", "en"],
  [1, "2", 277, "year-1/classroom-of-the-elite-light-novel-year-1-volume-02.pdf", "en"],
  [1, "3", 266, "year-1/classroom-of-the-elite-light-novel-year-1-volume-03.pdf", "es"],
  [1, "4", 258, "year-1/classroom-of-the-elite-light-novel-year-1-volume-04.pdf", "es"],
  [1, "4.5", 257, "year-1/classroom-of-the-elite-light-novel-year-1-volume-04-5.pdf", "es"],
  [1, "5", 263, "year-1/classroom-of-the-elite-light-novel-year-1-volume-05.pdf", "es"],
  [1, "6", 259, "year-1/classroom-of-the-elite-light-novel-year-1-volume-06.pdf", "es"],
  [1, "7", 249, "year-1/classroom-of-the-elite-light-novel-year-1-volume-07.pdf", "es"],
  [1, "7.5", 229, "year-1/classroom-of-the-elite-light-novel-year-1-volume-07-5.pdf", "es"],
  [1, "8", 247, "year-1/classroom-of-the-elite-light-novel-year-1-volume-08.pdf", "es"],
  [1, "9", 247, "year-1/classroom-of-the-elite-light-novel-year-1-volume-09.pdf", "es"],
  [1, "10", 278, "year-1/classroom-of-the-elite-light-novel-year-1-volume-10.pdf", "es"],
  [1, "11", 293, "year-1/classroom-of-the-elite-light-novel-year-1-volume-11.pdf", "es"],
  [1, "11.5", 297, "year-1/classroom-of-the-elite-light-novel-year-1-volume-11-5.pdf", "es"],
  [1, "11.75", 12, "year-1/classroom-of-the-elite-light-novel-year-1-volume-11-75.pdf", "es", "Historia corta"],
  [2, "1", 306, "year-2/classroom-of-the-elite-light-novel-year-2-volume-01.pdf", "es"],
  [2, "2", 273, "year-2/classroom-of-the-elite-light-novel-year-2-volume-02.pdf", "es"],
  [2, "3", 314, "year-2/classroom-of-the-elite-light-novel-year-2-volume-03.pdf", "es"],
  [2, "4", 464, "year-2/classroom-of-the-elite-light-novel-year-2-volume-04.pdf", "es"],
  [2, "4.5", 550, "year-2/classroom-of-the-elite-light-novel-year-2-volume-04-5.pdf", "es"],
  [2, "5", 321, "year-2/classroom-of-the-elite-light-novel-year-2-volume-05.pdf", "es"],
  [2, "6", 337, "year-2/classroom-of-the-elite-light-novel-year-2-volume-06.pdf", "es"],
  [2, "7", 344, "year-2/classroom-of-the-elite-light-novel-year-2-volume-07.pdf", "es"],
  [2, "8", 339, "year-2/classroom-of-the-elite-light-novel-year-2-volume-08.pdf", "es"],
  [2, "9", 282, "year-2/classroom-of-the-elite-light-novel-year-2-volume-09.pdf", "es"],
  [2, "9.5", 250, "year-2/classroom-of-the-elite-light-novel-year-2-volume-09-5.pdf", "es"],
  [2, "9.75", 12, "year-2/classroom-of-the-elite-light-novel-year-2-volume-09-75.pdf", "es", "Historia corta"],
  [2, "10", 286, "year-2/classroom-of-the-elite-light-novel-year-2-volume-10.pdf", "es"],
  [2, "10.25", 12, "year-2/classroom-of-the-elite-light-novel-year-2-volume-10-25.pdf", "es", "Historia corta"],
  [2, "11", 252, "year-2/classroom-of-the-elite-light-novel-year-2-volume-11.pdf", "es"],
  [2, "12", 266, "year-2/classroom-of-the-elite-light-novel-year-2-volume-12.pdf", "es"],
  [2, "12.5", 212, "year-2/classroom-of-the-elite-light-novel-year-2-volume-12-5.pdf", "es"],
  [2, "12.75", 10, "year-2/classroom-of-the-elite-light-novel-year-2-volume-12-75.pdf", "es", "Historia corta"],
  [3, "1", 232, "year-3/classroom-of-the-elite-light-novel-year-3-volume-01.pdf", "es"],
  [3, "2", 269, "year-3/classroom-of-the-elite-light-novel-year-3-volume-02.pdf", "es"],
  [3, "3", 306, "year-3/classroom-of-the-elite-light-novel-year-3-volume-03.pdf", "es"],
  [3, "4", 308, "year-3/classroom-of-the-elite-light-novel-year-3-volume-04.pdf", "es"]
];

const volumes = volumeSeed.map(([year, number, pages, relativePath, language, note], index) => {
  const numberId = number.replaceAll(".", "-");
  const id = `local-cote-ln-year-${year}-volume-${numberId}`;
  const title = `Volumen ${number}`;
  const languageLabel = language === "en" ? "Inglés" : "Español";
  return {
    id,
    manga_id: mangaId,
    title,
    normalized_title: normalizeText(`año ${year} ${title}`),
    chapters_label: [`Año ${year}`, languageLabel, note].filter(Boolean).join(" · "),
    section_id: `year-${year}`,
    year,
    volume_number: number,
    sort_order: index,
    pdf_path: `${basePath}/${relativePath}`,
    pdf_storage_mode: "local",
    pdf_parts: null,
    pdf_name: relativePath.split("/").pop(),
    normalized_pdf_name: relativePath.split("/").pop(),
    demo_url: `${basePath}/${relativePath}`,
    page_count: pages,
    language,
    is_user_provided: true,
    is_demo: true,
    created_at: `2026-07-22T02:${String(index).padStart(2, "0")}:00Z`,
    chapter_marks: []
  };
});

export const lightNovelManga = {
  id: mangaId,
  title: "Classroom of the Elite - Novela ligera",
  normalized_title: "classroom of the elite novela ligera",
  author: "Shogo Kinugasa / Shunsaku Tomose",
  synopsis: "La novela ligera de Classroom of the Elite organizada por curso escolar. La colección local contiene 16 lecturas del Año 1, 18 del Año 2 y 4 del Año 3.",
  direction: "ltr",
  cover_path: "output/covers/classroom-of-the-elite-light-novel/v0.jpg",
  cover_url: "output/covers/classroom-of-the-elite-light-novel/v0.jpg",
  created_at: "2026-07-22T02:00:00Z",
  sections: [
    { id: "year-1", title: "Año 1", description: "Volúmenes 0 al 11.75" },
    { id: "year-2", title: "Año 2", description: "Volúmenes 1 al 12.75" },
    { id: "year-3", title: "Año 3", description: "Volúmenes 1 al 4" }
  ],
  volumes,
  volume_count: volumes.length,
  has_local_content: true,
  content_type: "light_novel",
  is_demo: true,
  featured: true
};
