let pdfDoc = null;
let renderGen = 0;
const renderedPages = new Set();
const renderQueue = new Map();

export function setPdfDocument(doc) {
  pdfDoc = doc;
  clearRenderCache();
}

export function getPdfDocument() {
  return pdfDoc;
}

export function getRenderGeneration() {
  return renderGen;
}

export function bumpRenderGeneration() {
  renderGen += 1;
  return renderGen;
}

export function clearRenderCache() {
  renderedPages.clear();
  renderQueue.clear();
}

export async function renderPdfPage(pageNumber, container, zoom, generation = renderGen) {
  if (!pdfDoc) return;
  if (pageNumber < 1 || pageNumber > pdfDoc.numPages || renderedPages.has(pageNumber)) return;
  if (renderQueue.has(pageNumber)) return renderQueue.get(pageNumber);

  const task = (async () => {
    const page = await pdfDoc.getPage(pageNumber);
    if (generation !== renderGen) return;

    const baseViewport = page.getViewport({ scale: 1 });
    const targetWidth = Math.min(760, Math.max(320, container.clientWidth / (window.innerWidth < 800 ? 1 : 2)));
    const scale = (targetWidth / baseViewport.width) * zoom * Math.min(window.devicePixelRatio || 1, 2);
    const viewport = page.getViewport({ scale });

    const canvas = container.querySelector(`[data-logical-page="${pageNumber}"] canvas`);
    if (!canvas || generation !== renderGen) return;

    const context = canvas.getContext("2d", { alpha: false });
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.aspectRatio = `${viewport.width} / ${viewport.height}`;

    await page.render({ canvasContext: context, viewport }).promise;
    renderedPages.add(pageNumber);
    canvas.closest(".page-content")?.classList.add("rendered");
  })().finally(() => renderQueue.delete(pageNumber));

  renderQueue.set(pageNumber, task);
  return task;
}

export function renderNearbyPages(pageNumber, container, zoom) {
  if (!pdfDoc) return;
  [pageNumber - 2, pageNumber - 1, pageNumber, pageNumber + 1, pageNumber + 2]
    .filter((num) => num >= 1 && num <= pdfDoc.numPages)
    .forEach((num) => renderPdfPage(num, container, zoom));
}

export async function rerenderAllVisiblePages(container, zoom, currentPage) {
  if (!pdfDoc) return;
  bumpRenderGeneration();
  renderedPages.clear();

  container.querySelectorAll("canvas").forEach((canvas) => {
    const context = canvas.getContext("2d");
    if (context) context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.closest(".page-content")?.classList.remove("rendered");
  });

  renderNearbyPages(currentPage, container, zoom);
}
