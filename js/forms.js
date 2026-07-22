import { escapeHtml } from "./utils.js";

// General buttons state helper
export function setBusy(button, busy, busyText = "Procesando...") {
  if (!button) return;
  if (busy) {
    button.dataset.originalText = button.textContent;
    button.textContent = busyText;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
    button.removeAttribute("aria-busy");
  }
}

// Manga Form helpers
export function resetMangaForm(form, titleElement, cancelBtn) {
  form.reset();
  form.elements.cover.required = true;
  if (titleElement) titleElement.textContent = "Registrar manga";
  if (cancelBtn) cancelBtn.hidden = true;
}

export function populateMangaForm(form, manga, titleElement, cancelBtn) {
  form.elements.title.value = manga.title;
  form.elements.author.value = manga.author;
  form.elements.synopsis.value = manga.synopsis;
  form.elements.direction.value = manga.direction;
  form.elements.cover.required = false;
  if (titleElement) titleElement.textContent = `Editar: ${manga.title}`;
  if (cancelBtn) cancelBtn.hidden = false;
}

// Volume Form helpers
export function addChapterMarkRow(container, mark = { chapter: "", page: "" }) {
  const row = document.createElement("div");
  row.className = "chapter-mark-row";
  row.innerHTML = `
    <label>Capítulo
      <input type="number" min="1" step="1" name="chapter" value="${escapeHtml(mark.chapter)}" required>
    </label>
    <label>Página inicial
      <input type="number" min="1" step="1" name="page" value="${escapeHtml(mark.page)}" required>
    </label>
    <button class="icon-button danger danger-btn" type="button" aria-label="Eliminar marca">×</button>`;

  row.querySelector(".danger-btn").addEventListener("click", () => row.remove());
  container.appendChild(row);
}

export function collectChapterMarks(container) {
  return [...container.querySelectorAll(".chapter-mark-row")].map((row) => ({
    chapter: row.querySelector('[name="chapter"]').value,
    page: row.querySelector('[name="page"]').value
  }));
}

export function resetVolumeForm(form, titleElement, cancelBtn, marksContainer) {
  form.reset();
  form.elements.pdf.required = true;
  if (titleElement) titleElement.textContent = "Agregar tomo";
  if (cancelBtn) cancelBtn.hidden = true;
  if (marksContainer) {
    marksContainer.innerHTML = "";
    addChapterMarkRow(marksContainer);
  }
  hideUploadProgress();
}

export function populateVolumeForm(form, volume, titleElement, cancelBtn, marksContainer) {
  form.elements.title.value = volume.title;
  form.elements.chaptersLabel.value = volume.chapters_label;
  form.elements.pdf.required = false;
  if (titleElement) titleElement.textContent = `Editar: ${volume.title}`;
  if (cancelBtn) cancelBtn.hidden = false;

  if (marksContainer) {
    marksContainer.innerHTML = "";
    if (volume.chapter_marks && volume.chapter_marks.length > 0) {
      volume.chapter_marks.forEach((mark) => addChapterMarkRow(marksContainer, mark));
    }
  }
}

// Upload progress bar helpers
export function setUploadProgress(progressContainer, progressBar, progressText, percent) {
  if (progressContainer) progressContainer.hidden = false;
  if (progressBar) progressBar.style.width = `${percent}%`;
  if (progressText) progressText.textContent = `${percent}%`;
}

export function hideUploadProgress() {
  const container = document.getElementById("upload-progress");
  const bar = document.getElementById("upload-progress-bar-fill");
  const text = document.getElementById("upload-progress-text");
  if (container) container.hidden = true;
  if (bar) bar.style.width = "0%";
  if (text) text.textContent = "0%";
}
