import { listMangas } from "./manga-service.js?v=20260722-v13";
import { debounce, friendlyError, setStatus } from "./utils.js";
import { renderMangaGrid } from "./library-ui.js?v=20260722-v6";

const elements = {
  grid: document.getElementById("manga-grid"),
  search: document.getElementById("search-input"),
  resultCount: document.getElementById("result-count"),
  heroTitleCount: document.getElementById("hero-title-count"),
  heroVolumeCount: document.getElementById("hero-volume-count"),
  status: document.getElementById("library-status")
};

async function loadLibrary(term = "") {
  if (!elements.grid) return;
  setStatus(elements.status, "Cargando la biblioteca...", "info");
  elements.grid.setAttribute("aria-busy", "true");
  try {
    const mangas = await listMangas(term);
    renderMangaGrid(elements.grid, mangas);
    if (elements.resultCount) elements.resultCount.textContent = `${mangas.length} ${mangas.length === 1 ? "título" : "títulos"}`;
    if (!term) {
      const readableVolumes = mangas.reduce((total, manga) => total + Number(manga.volume_count || 0), 0);
      if (elements.heroTitleCount) elements.heroTitleCount.textContent = mangas.length;
      if (elements.heroVolumeCount) elements.heroVolumeCount.textContent = readableVolumes;
    }
    setStatus(elements.status, "", "info");
  } catch (error) {
    setStatus(elements.status, friendlyError(error), "error");
    elements.grid.innerHTML = "";
  } finally {
    elements.grid.removeAttribute("aria-busy");
  }
}

if (elements.search) {
  const handleSearch = debounce(() => loadLibrary(elements.search.value), 250);
  elements.search.addEventListener("input", handleSearch);
}

loadLibrary();
