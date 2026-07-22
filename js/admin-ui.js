import { escapeHtml } from "./utils.js";

const fallbackCover = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="136"><rect width="96" height="136" fill="#171b24"/><circle cx="48" cy="52" r="22" fill="#e63946"/><path d="M36 52h24M48 40v24" stroke="white" stroke-width="6" stroke-linecap="round"/></svg>`)}`;

export function renderStats(elements, { mangaCount, volumeCount, markCount }) {
  if (elements.totalMangas) elements.totalMangas.textContent = mangaCount;
  if (elements.totalVolumes) elements.totalVolumes.textContent = volumeCount;
  if (elements.totalMarks) elements.totalMarks.textContent = markCount;
}

export function renderAdminMangas(container, mangas, selectedMangaId, onManage, onEdit, onDelete) {
  if (!mangas.length) {
    container.innerHTML = `<div class="empty-inline">Todavía no hay mangas registrados.</div>`;
    return;
  }
  container.innerHTML = `<div class="admin-table-wrapper"><table><thead><tr><th>Portada</th><th>Manga</th><th>Autor</th><th>Tomos</th><th>Origen</th><th>Acciones</th></tr></thead><tbody id="manga-rows-container"></tbody></table></div>`;
  const tbody = container.querySelector("#manga-rows-container");
  const fragment = document.createDocumentFragment();

  mangas.forEach((manga) => {
    const tr = document.createElement("tr");
    if (selectedMangaId === manga.id) tr.style.background = "rgba(230,57,70,.06)";
    const isDemo = Boolean(manga.is_demo);
    const sourceLabel = manga.has_local_content ? "PDF local" : isDemo ? "Demo local" : "Supabase";
    tr.innerHTML = `
      <td><img class="table-cover" src="${escapeHtml(manga.cover_url || fallbackCover)}" alt="Miniatura de ${escapeHtml(manga.title)}"></td>
      <td><strong>${escapeHtml(manga.title)}</strong></td>
      <td>${escapeHtml(manga.author || "—")}</td>
      <td>${Number(manga.volume_count || 0)}</td>
      <td><span class="eyebrow">${sourceLabel}</span></td>
      <td><div class="row-actions">
        <button class="button small secondary manage-btn" type="button">${isDemo ? "Ver tomos" : "Gestionar"}</button>
        ${isDemo ? `<span class="volume-pending">Tomos editables</span>` : `<button class="button small ghost edit-btn" type="button">Editar</button><button class="button small ghost danger delete-btn" type="button">Eliminar</button>`}
      </div></td>`;
    tr.querySelector(".manage-btn").addEventListener("click", () => onManage(manga));
    tr.querySelector(".edit-btn")?.addEventListener("click", () => onEdit(manga));
    tr.querySelector(".delete-btn")?.addEventListener("click", () => onDelete(manga));
    fragment.appendChild(tr);
  });
  tbody.appendChild(fragment);
}

export function renderAdminVolumes(container, volumes, onEdit, onDelete) {
  if (!volumes.length) {
    container.innerHTML = `<div class="empty-inline">Este manga no tiene tomos agregados.</div>`;
    return;
  }
  container.innerHTML = `<div class="admin-table-wrapper"><table><thead><tr><th>Tomo</th><th>Capítulos</th><th>Archivo PDF</th><th>Marcas</th><th>Acciones</th></tr></thead><tbody id="volume-rows-container"></tbody></table></div>`;
  const tbody = container.querySelector("#volume-rows-container");
  const fragment = document.createDocumentFragment();
  volumes.forEach((volume) => {
    const tr = document.createElement("tr");
    const isDemo = Boolean(volume.is_demo || volume.demo_url);
    const hasPdf = isDemo || Boolean(volume.pdf_path) || (volume.pdf_storage_mode === "chunks" && volume.pdf_parts?.length);
    const testAction = hasPdf ? `<a class="button small secondary" href="reader.html?volumeId=${encodeURIComponent(volume.id)}" target="_blank">Probar lector</a>` : `<span class="volume-pending">PDF pendiente</span>`;
    tr.innerHTML = `
      <td><strong>${escapeHtml(volume.title)}</strong>${isDemo ? `<br><small>${volume.has_local_override ? "Modificado localmente" : volume.is_user_provided ? "PDF local importado" : "Demo local"}</small>` : ""}</td>
      <td>${escapeHtml(volume.chapters_label || "Sin descripción")}</td>
      <td><small style="font-family:monospace">${escapeHtml(volume.pdf_name || "—")}</small></td>
      <td><span class="eyebrow">${volume.chapter_marks?.length || 0} marcas</span></td>
      <td><div class="row-actions">${testAction}<button class="button small ghost edit-vol-btn" type="button">Editar</button>${isDemo ? "" : `<button class="button small ghost danger delete-vol-btn" type="button">Eliminar</button>`}</div></td>`;
    tr.querySelector(".edit-vol-btn")?.addEventListener("click", () => onEdit(volume));
    tr.querySelector(".delete-vol-btn")?.addEventListener("click", () => onDelete(volume));
    fragment.appendChild(tr);
  });
  tbody.appendChild(fragment);
}
