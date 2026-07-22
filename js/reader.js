import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs";
import { getVolumeById } from "./volume-service.js?v=20260722-v12";
import { downloadVolumePdf } from "./storage-service.js?v=20260722-v6";
import { getQueryParam, friendlyError, setStatus } from "./utils.js";
import {
  setPdfDocument,
  getPdfDocument,
  renderPdfPage,
  renderNearbyPages,
  rerenderAllVisiblePages,
  getRenderGeneration,
  clearRenderCache
} from "./pdf-reader.js";
import {
  initializePageFlip,
  destroyPageFlip,
  getPageFlip,
  mapLogicalToPhysical,
  mapPhysicalToLogical
} from "./page-flip-reader.js?v=20260722-v15";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";

const elements = {
  title: document.getElementById("reader-title"),
  subtitle: document.getElementById("reader-subtitle"),
  status: document.getElementById("reader-status"),
  book: document.getElementById("book"),
  previous: document.getElementById("previous-page"),
  next: document.getElementById("next-page"),
  pageInput: document.getElementById("page-input"),
  pageTotal: document.getElementById("page-total"),
  chapterSelect: document.getElementById("chapter-select"),
  zoomOut: document.getElementById("zoom-out"),
  zoomIn: document.getElementById("zoom-in"),
  zoomLabel: document.getElementById("zoom-label"),
  fullscreen: document.getElementById("fullscreen-button"),
  loading: document.getElementById("reader-loading"),
  loadingBar: document.getElementById("reader-loading-bar"),
  loadingText: document.getElementById("reader-loading-text"),
  toolbar: document.querySelector(".reader-toolbar")
};

let volume = null;
let logicalPage = 1;
let zoom = 1.0;
let pendingLogicalPage = null;
let pendingPageTimer = null;
let resizeTimer = null;

function setLoading(percent, text) {
  if (elements.loading) {
    elements.loading.hidden = false;
    elements.loadingBar.value = percent;
    elements.loadingText.textContent = text;
  }
}

function hideLoading() {
  if (elements.loading) {
    elements.loading.hidden = true;
  }
}

function updateControls() {
  elements.pageInput.value = logicalPage;
  const pdfDocument = getPdfDocument();
  if (pdfDocument) {
    elements.previous.disabled = logicalPage <= 1;
    elements.next.disabled = logicalPage >= pdfDocument.numPages;
  } else {
    elements.previous.disabled = true;
    elements.next.disabled = true;
  }
  elements.zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
}

function goToPage(page, animate = true) {
  const pdfDocument = getPdfDocument();
  const pageFlip = getPageFlip();
  if (!pdfDocument || !pageFlip) return;

  const target = Math.max(1, Math.min(pdfDocument.numPages, Number(page) || 1));
  logicalPage = target;
  pendingLogicalPage = target;
  window.clearTimeout(pendingPageTimer);
  pendingPageTimer = window.setTimeout(() => {
    pendingLogicalPage = null;
  }, 5000);

  const physicalIndex = mapLogicalToPhysical(target, pdfDocument.numPages, volume.mangas.direction);
  if (animate && typeof pageFlip.flip === "function") {
    pageFlip.flip(physicalIndex, "top");
  } else {
    pageFlip.turnToPage(physicalIndex);
  }
  updateControls();
  renderNearbyPages(target, elements.book, zoom);
}

function nextLogicalPage() {
  const pdfDocument = getPdfDocument();
  const pageFlip = getPageFlip();
  if (!pdfDocument || !volume || !pageFlip) return;
  if (logicalPage >= pdfDocument.numPages) return;
  const pageStep = window.innerWidth < 800 ? 1 : 2;
  goToPage(Math.min(pdfDocument.numPages, logicalPage + pageStep));
}

function previousLogicalPage() {
  const pdfDocument = getPdfDocument();
  const pageFlip = getPageFlip();
  if (!pdfDocument || !volume || !pageFlip) return;
  if (logicalPage <= 1) return;
  const pageStep = window.innerWidth < 800 ? 1 : 2;
  goToPage(Math.max(1, logicalPage - pageStep));
}

function createPages() {
  elements.book.innerHTML = "";
  const pdfDocument = getPdfDocument();
  if (!pdfDocument) return;

  const logicalOrder = Array.from({ length: pdfDocument.numPages }, (_, index) => index + 1);
  const physicalOrder = volume.mangas.direction === "rtl" ? logicalOrder.reverse() : logicalOrder;

  const fragment = document.createDocumentFragment();
  physicalOrder.forEach((pageNumber) => {
    const page = document.createElement("div");
    page.className = "book-page";
    page.dataset.density = "soft";
    page.dataset.logicalPage = pageNumber;
    page.innerHTML = `
      <div class="page-content">
        <canvas aria-label="Página ${pageNumber}"></canvas>
        <span class="page-number-tag">${pageNumber}</span>
      </div>`;
    fragment.appendChild(page);
  });
  elements.book.appendChild(fragment);
}

function handleFlipEvent(physicalIndex) {
  const pdfDocument = getPdfDocument();
  if (!pdfDocument) return;

  logicalPage = pendingLogicalPage ?? mapPhysicalToLogical(physicalIndex, pdfDocument.numPages, volume.mangas.direction);
  if (pendingLogicalPage !== null) {
    window.clearTimeout(pendingPageTimer);
    pendingLogicalPage = null;
  }
  updateControls();
  renderNearbyPages(logicalPage, elements.book, zoom);
}

function populateChapters() {
  elements.chapterSelect.innerHTML = `<option value="">Ir a capítulo...</option>`;
  if (volume.chapter_marks && volume.chapter_marks.length > 0) {
    volume.chapter_marks.forEach((mark) => {
      const option = document.createElement("option");
      option.value = mark.page;
      option.textContent = `Capítulo ${mark.chapter} — pág. ${mark.page}`;
      elements.chapterSelect.appendChild(option);
    });
    elements.chapterSelect.disabled = false;
  } else {
    elements.chapterSelect.disabled = true;
  }
}

function rebuildReaderLayout() {
  if (!getPdfDocument() || !volume) return;
  const currentPage = logicalPage;
  const stage = document.querySelector(".book-stage");
  destroyPageFlip();
  if (stage && !elements.book.isConnected) stage.appendChild(elements.book);
  createPages();
  clearRenderCache();
  initializePageFlip(elements.book, volume.mangas.direction, handleFlipEvent);
  goToPage(currentPage, false);
  renderNearbyPages(currentPage, elements.book, zoom);
}

function scheduleReaderLayout() {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(rebuildReaderLayout, 180);
}

async function initializeReader() {
  const id = getQueryParam("volumeId");
  if (!id) {
    setStatus(elements.status, "No se indicó el identificador del tomo.", "error");
    hideLoading();
    return;
  }

  try {
    setLoading(5, "Cargando información del tomo...");
    volume = await getVolumeById(id);

    elements.title.textContent = volume.title;
    elements.subtitle.textContent = `${volume.mangas.title} · ${
      volume.mangas.direction === "rtl" ? "Lectura derecha a izquierda" : "Lectura izquierda a derecha"
    }`;
    populateChapters();

    setLoading(15, "Descargando documento PDF...");
    const pdfData = await downloadVolumePdf(volume, (percent) => {
      setLoading(15 + Math.round(percent * 0.55), `Descargando PDF... ${percent}%`);
    });

    setLoading(75, "Inicializando lector PDF...");
    const pdfDocument = await pdfjsLib.getDocument({ data: pdfData }).promise;
    setPdfDocument(pdfDocument);

    elements.pageTotal.textContent = `/ ${pdfDocument.numPages}`;
    elements.pageInput.max = pdfDocument.numPages;

    setLoading(85, "Preparando páginas...");
    createPages();

    // Setup PageFlip
    initializePageFlip(elements.book, volume.mangas.direction, handleFlipEvent);

    // Initial renders
    const generation = getRenderGeneration();
    await Promise.all([
      renderPdfPage(1, elements.book, zoom, generation),
      renderPdfPage(2, elements.book, zoom, generation)
    ]);
    renderNearbyPages(1, elements.book, zoom);

    goToPage(1, false);
    setLoading(100, "Completado");
    setTimeout(hideLoading, 300);
    setStatus(elements.status, "");
  } catch (error) {
    hideLoading();
    setStatus(elements.status, friendlyError(error), "error");
  }
}

// Event Listeners
elements.next.addEventListener("click", nextLogicalPage);
elements.previous.addEventListener("click", previousLogicalPage);

elements.pageInput.addEventListener("change", () => goToPage(elements.pageInput.value));
elements.pageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") goToPage(elements.pageInput.value);
});

elements.chapterSelect.addEventListener("change", () => {
  if (elements.chapterSelect.value) {
    goToPage(elements.chapterSelect.value);
  }
});

elements.zoomIn.addEventListener("click", () => {
  if (!getPdfDocument()) return;
  zoom = Math.min(2.0, Number((zoom + 0.15).toFixed(2)));
  updateControls();
  rerenderAllVisiblePages(elements.book, zoom, logicalPage);
});

elements.zoomOut.addEventListener("click", () => {
  if (!getPdfDocument()) return;
  zoom = Math.max(0.6, Number((zoom - 0.15).toFixed(2)));
  updateControls();
  rerenderAllVisiblePages(elements.book, zoom, logicalPage);
});

elements.fullscreen.addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    setStatus(elements.status, "El navegador no permitió activar la pantalla completa.", "error");
  }
});

document.addEventListener("keydown", (event) => {
  if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
  if (!volume) return;

  if (event.key === "ArrowRight") {
    if (volume.mangas.direction === "rtl") {
      previousLogicalPage();
    } else {
      nextLogicalPage();
    }
  }
  if (event.key === "ArrowLeft") {
    if (volume.mangas.direction === "rtl") {
      nextLogicalPage();
    } else {
      previousLogicalPage();
    }
  }
});

window.addEventListener("resize", scheduleReaderLayout);
document.addEventListener("fullscreenchange", scheduleReaderLayout);

// Initialize on load
initializeReader();
