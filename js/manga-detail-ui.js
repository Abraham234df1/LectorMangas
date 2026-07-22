import { escapeHtml, formatDate } from "./utils.js";

const fallbackCover = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="680" viewBox="0 0 480 680">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#222831"/><stop offset="1" stop-color="#111318"/></linearGradient></defs>
  <rect width="480" height="680" fill="url(#g)"/>
  <circle cx="240" cy="260" r="92" fill="#38bdf8" opacity=".9"/>
  <path d="M180 260h120M240 200v120" stroke="white" stroke-width="20" stroke-linecap="round"/>
  <text x="240" y="420" fill="white" text-anchor="middle" font-family="Arial" font-size="38" font-weight="700">LectorPolar</text>
  <text x="240" y="465" fill="#c9ced6" text-anchor="middle" font-family="Arial" font-size="22">Sin portada</text>
</svg>`)}`;

export function renderMangaDetail(container, manga) {
  const directionLabel = manga.direction === "ltr" ? "Lectura: Izquierda a Derecha (Cómic)" : "Lectura: Derecha a Izquierda (Manga)";
  const renderVolumeRows = (items) => items.map((volume, index) => {
      const hasPdf = Boolean(volume.demo_url) || Boolean(volume.pdf_path) || (volume.pdf_storage_mode === "chunks" && volume.pdf_parts?.length);
      const action = hasPdf
        ? `<a class="button primary volume-read-button" href="reader.html?volumeId=${encodeURIComponent(volume.id)}">Leer ahora <span aria-hidden="true">→</span></a>`
        : `<span class="volume-pending" aria-label="PDF pendiente de carga">PDF pendiente</span>`;
      const demoBadge = volume.has_remote_pdf
        ? `<span class="demo-volume-badge">PDF en Supabase${volume.page_count ? ` · ${Number(volume.page_count)} páginas` : ""}</span>`
        : volume.is_user_provided
        ? `<span class="demo-volume-badge">PDF local · ${Number(volume.page_count || 0)} páginas</span>`
        : volume.demo_url || volume.is_demo
        ? `<span class="demo-volume-badge">PDF demo</span>`
        : "";

      return `
      <article class="volume-row">
        <span class="volume-index">${String(index + 1).padStart(2, "0")}</span>
        <div class="volume-title-column">
          <h4>${escapeHtml(volume.title)}</h4>
          <p>${escapeHtml(volume.chapters_label || "Capítulos sin especificar")}</p>
          ${demoBadge}
        </div>
        ${action}
      </article>`;
    }).join("");

  const volumes = manga.sections?.length
    ? manga.sections.map((section) => {
      const sectionVolumes = (manga.volumes || []).filter((volume) => volume.section_id === section.id);
      return `
        <section class="volume-year-section" aria-labelledby="${escapeHtml(section.id)}-title">
          <div class="volume-year-header">
            <div>
              <span class="eyebrow">Novela ligera</span>
              <h4 id="${escapeHtml(section.id)}-title">${escapeHtml(section.title)}</h4>
              <p>${escapeHtml(section.description || "")}</p>
            </div>
            <span class="volume-year-count">${sectionVolumes.length} ${sectionVolumes.length === 1 ? "lectura" : "lecturas"}</span>
          </div>
          <div class="volumes-list">
            ${sectionVolumes.length ? renderVolumeRows(sectionVolumes) : `<div class="volume-year-empty">Aún no hay PDFs para esta sección.</div>`}
          </div>
        </section>`;
    }).join("")
    : manga.volumes?.length
      ? `<div class="volumes-list">${renderVolumeRows(manga.volumes)}</div>`
      : `<div class="empty-inline">Este título todavía no tiene lecturas disponibles.</div>`;

  container.innerHTML = `
    <a class="back-link" href="index.html">← Volver a la biblioteca</a>
    <div class="detail-grid">
      <div class="detail-cover-wrap">
        <img class="detail-cover" src="${escapeHtml(manga.cover_url || fallbackCover)}" alt="Portada de ${escapeHtml(manga.title)}">
        ${manga.has_remote_content ? `<span class="detail-demo-badge">PDFs disponibles en línea</span>` : manga.has_local_content ? `<span class="detail-demo-badge">PDFs locales disponibles</span>` : manga.is_demo || manga.has_demo_fallback ? `<span class="detail-demo-badge">Contenido demo disponible</span>` : ""}
      </div>
      <div class="detail-info">
        <span class="eyebrow">Colección digital · ${manga.direction.toUpperCase()}</span>
        <h2>${escapeHtml(manga.title)}</h2>
        <p class="detail-author">Por ${escapeHtml(manga.author || "Autor desconocido")}</p>
        <p class="detail-synopsis">${escapeHtml(manga.synopsis || "Sin sinopsis disponible.")}</p>
        <div class="detail-stats">
          <div><strong>${manga.volumes?.length || 0}</strong><span>lecturas</span></div>
          <div><strong>${manga.sections?.length || manga.direction.toUpperCase()}</strong><span>${manga.sections?.length ? "años" : "lectura"}</span></div>
          <div><strong>3D</strong><span>lector</span></div>
        </div>
        <div class="detail-meta-info">${directionLabel} · Agregado ${escapeHtml(formatDate(manga.created_at))}</div>
      </div>
    </div>

    <section class="volume-list-section">
      <div class="volumes-title-row">
        <h3>Lecturas disponibles</h3>
      </div>
      <div class="volume-sections">
        ${volumes}
      </div>
    </section>`;
}
