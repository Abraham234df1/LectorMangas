export function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "archivo";
}

export function uniqueId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function setStatus(element, message = "", type = "info") {
  if (!element) return;
  element.textContent = message;
  element.className = `status-message ${type}`;
  element.hidden = !message;
}

export function assertConfigured() {
  const config = window.SUPABASE_CONFIG;
  if (!config?.url || !config?.anonKey) {
    throw new Error("Falta configurar js/config.js.");
  }
  if (config.url.includes("TU-PROYECTO") || config.anonKey.includes("TU-ANON")) {
    throw new Error("Configura Project URL y anon public key en js/config.js antes de usar la aplicación.");
  }
  return config;
}

export function validateImage(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    throw new Error("La portada debe ser un archivo de imagen.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("La portada no debe superar 10 MB.");
  }
}

export function validatePdf(file) {
  if (!file) return;
  const looksLikePdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!looksLikePdf) {
    throw new Error("El archivo del tomo debe ser un PDF.");
  }
  if (file.size > 800 * 1024 * 1024) {
    throw new Error("El PDF no debe superar 800 MB.");
  }
}

export function validateChapterMarks(marks) {
  const chapters = new Set();
  const pages = new Set();

  for (const mark of marks) {
    const chapter = Number(mark.chapter);
    const page = Number(mark.page);

    if (!Number.isInteger(chapter) || !Number.isInteger(page)) {
      throw new Error("Cada marca debe tener capítulo y página completos.");
    }
    if (chapter <= 0 || page <= 0) {
      throw new Error("Los capítulos y las páginas deben ser mayores que cero.");
    }
    if (chapters.has(chapter)) {
      throw new Error(`El capítulo ${chapter} está repetido.`);
    }
    if (pages.has(page)) {
      throw new Error(`La página ${page} está repetida.`);
    }

    chapters.add(chapter);
    pages.add(page);
  }

  return marks
    .map((mark) => ({ chapter: Number(mark.chapter), page: Number(mark.page) }))
    .sort((a, b) => a.chapter - b.chapter);
}

export function friendlyError(error) {
  const message = error?.message || String(error || "Ocurrió un error inesperado.");
  if (/duplicate key|unique constraint|already exists/i.test(message)) {
    return "Ya existe un registro con esos datos.";
  }
  if (/row-level security|permission denied|not authorized|unauthorized/i.test(message)) {
    return "No tienes permisos para realizar esta operación.";
  }
  if (/failed to fetch|network/i.test(message)) {
    return "No fue posible conectar con Supabase. Revisa tu conexión y configuración.";
  }
  return message;
}

export function debounce(callback, delay = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}
