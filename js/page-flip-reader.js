let pageFlip = null;

export function getPageFlip() {
  return pageFlip;
}

export function destroyPageFlip() {
  if (pageFlip) {
    pageFlip.destroy();
    pageFlip = null;
  }
}

export function mapLogicalToPhysical(page, totalPages, direction) {
  return direction === "rtl" ? totalPages - page : page - 1;
}

export function mapPhysicalToLogical(index, totalPages, direction) {
  return direction === "rtl" ? totalPages - index : index + 1;
}

export function initializePageFlip(bookElement, direction, onFlip) {
  if (!window.St?.PageFlip) {
    throw new Error("No se pudo cargar la librería del efecto libro 3D (StPageFlip).");
  }

  const availableWidth = Math.max(240, Math.min(window.innerWidth - 32, 1280));
  const portrait = window.innerWidth < 800;
  const headerHeight = document.querySelector(".reader-header")?.offsetHeight || 0;
  const toolbarHeight = document.querySelector(".reader-toolbar")?.offsetHeight || 0;
  const availableHeight = Math.max(280, window.innerHeight - headerHeight - toolbarHeight - 44);
  const widthFromHeight = Math.floor(availableHeight / 1.42);
  const pageWidth = Math.max(
    190,
    portrait
      ? Math.min(availableWidth, widthFromHeight, 620)
      : Math.min(availableWidth / 2, widthFromHeight, 620)
  );
  const pageHeight = Math.round(pageWidth * 1.42);
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  pageFlip = new window.St.PageFlip(bookElement, {
    width: pageWidth,
    height: pageHeight,
    size: "fixed",
    minWidth: 190,
    maxWidth: 700,
    minHeight: 270,
    maxHeight: 994,
    drawShadow: true,
    maxShadowOpacity: 0.68,
    showCover: false,
    mobileScrollSupport: false,
    usePortrait: portrait,
    autoSize: false,
    flippingTime: prefersReducedMotion ? 250 : 900,
    swipeDistance: 20
  });

  bookElement.dataset.readingDirection = direction;

  pageFlip.on("changeState", (event) => {
    const state = String(event.data || "read");
    bookElement.dataset.flipState = state;
    bookElement.classList.toggle("is-flipping", state === "flipping" || state === "user_fold");
  });

  pageFlip.loadFromHTML(bookElement.querySelectorAll(".book-page"));

  pageFlip.on("flip", (event) => {
    bookElement.classList.add("flip-settled");
    window.setTimeout(() => bookElement.classList.remove("flip-settled"), 260);
    onFlip(event.data);
  });

  return pageFlip;
}
