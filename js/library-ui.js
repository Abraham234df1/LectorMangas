import { escapeHtml } from "./utils.js";

const fallbackCover = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="680" viewBox="0 0 480 680">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#222831"/><stop offset="1" stop-color="#111318"/></linearGradient></defs>
  <rect width="480" height="680" fill="url(#g)"/>
  <circle cx="240" cy="260" r="92" fill="#38bdf8" opacity=".9"/>
  <path d="M180 260h120M240 200v120" stroke="white" stroke-width="20" stroke-linecap="round"/>
  <text x="240" y="420" fill="white" text-anchor="middle" font-family="Arial" font-size="38" font-weight="700">LectorPolar</text>
  <text x="240" y="465" fill="#c9ced6" text-anchor="middle" font-family="Arial" font-size="22">Sin portada</text>
</svg>`)}`;

export function renderMangaGrid(container, mangas) {
  container.innerHTML = "";
  if (!mangas.length) {
    container.innerHTML = `
      <section class="empty-state panel">
        <span class="empty-state-icon">📚</span>
        <h3>No se encontraron mangas</h3>
        <p>Prueba otra búsqueda o agrega contenido desde el panel administrador.</p>
      </section>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  mangas.forEach((manga, index) => {
    const article = document.createElement("article");
    article.className = `manga-card${manga.is_demo ? " demo-card" : ""}${Number(manga.volume_count) > 0 ? " has-readings" : ""}`;
    const sourceBadge = manga.has_local_content
      ? `<span class="card-source-badge">En biblioteca</span>`
      : manga.is_demo || manga.has_demo_fallback
      ? `<span class="card-source-badge">Catálogo</span>`
      : "";
    article.innerHTML = `
      <a href="manga.html?id=${encodeURIComponent(manga.id)}" class="manga-card-link" aria-label="Ver ${escapeHtml(manga.title)}">
        <div class="card-cover-container">
          <img src="${escapeHtml(manga.cover_url || fallbackCover)}" alt="Portada de ${escapeHtml(manga.title)}" loading="lazy">
          <span class="card-cover-shade" aria-hidden="true"></span>
          ${sourceBadge}
          <span class="card-badge">${manga.volume_count} ${manga.volume_count === 1 ? "lectura" : "lecturas"}</span>
        </div>
        <div class="card-body">
          <span class="card-catalog-number">Colección ${String(index + 1).padStart(2, "0")}</span>
          <h3>${escapeHtml(manga.title)}</h3>
          <p>${escapeHtml(manga.author || "Autor desconocido")}</p>
          <div class="card-footer-row">
            <span class="reading-chip">${manga.direction.toUpperCase()}</span>
            <span class="text-button">Ver ficha <span aria-hidden="true">→</span></span>
          </div>
        </div>
      </a>`;
    fragment.appendChild(article);
  });
  container.appendChild(fragment);
}
