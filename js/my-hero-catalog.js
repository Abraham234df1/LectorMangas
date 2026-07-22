import { normalizeText } from "./utils.js";

const mangaId = "local-my-hero-academia";
const pageCounts = [
  228, 229, 196, 203, 202, 204, 214, 216, 223, 216, 249, 223,
  216, 236, 229, 222, 223, 208, 218, 236, 252, 266, 245, 235,
  241, 253, 213, 202, 247, 234, 257, 252, 257, 252, 240, 254,
  242, 257, 215, 226, 233, 241
];

const volumes = pageCounts.map((pageCount, index) => {
  const number = index + 1;
  const padded = String(number).padStart(2, "0");
  const id = `local-my-hero-academia-volume-${padded}`;
  const pdfName = `my-hero-academia-volume-${padded}.pdf`;
  return {
    id,
    manga_id: mangaId,
    title: `Tomo ${number}`,
    normalized_title: normalizeText(`Tomo ${number}`),
    chapters_label: `${pageCount} páginas`,
    pdf_path: `output/pdf/my-hero-academia/${pdfName}`,
    pdf_storage_mode: "local",
    pdf_parts: null,
    pdf_name: pdfName,
    normalized_pdf_name: normalizeText(pdfName),
    demo_url: `output/pdf/my-hero-academia/${pdfName}`,
    page_count: pageCount,
    is_user_provided: true,
    is_demo: true,
    created_at: `2026-07-22T02:${String(index).padStart(2, "0")}:00Z`,
    chapter_marks: []
  };
});

export const myHeroManga = {
  id: mangaId,
  title: "My Hero Academia",
  normalized_title: "my hero academia",
  author: "Kohei Horikoshi",
  synopsis: "Izuku Midoriya sueña con convertirse en héroe en una sociedad donde casi todos poseen un don. Colección local completa con los tomos 1 al 42 proporcionados por el usuario.",
  direction: "rtl",
  cover_path: "output/covers/my-hero-academia/cover.jpg",
  cover_url: "output/covers/my-hero-academia/cover.jpg",
  created_at: "2026-07-22T02:00:00Z",
  volumes,
  volume_count: volumes.length,
  has_local_content: true,
  is_demo: true,
  featured: true
};
