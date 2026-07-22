import { normalizeText } from "./utils.js";

export function validateRequired(value, fieldName) {
  if (!value || !String(value).trim()) {
    throw new Error(`El campo ${fieldName} es obligatorio.`);
  }
  return String(value).trim();
}

export function validateEmail(email) {
  validateRequired(email, "Correo");
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    throw new Error("El correo electrónico no es válido.");
  }
  return email.trim().toLowerCase();
}

export function validatePassword(password) {
  validateRequired(password, "Contraseña");
  if (password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres.");
  }
  return password;
}

export function validatePasswordsMatch(password, confirmPassword) {
  if (password !== confirmPassword) {
    throw new Error("Las contraseñas no coinciden.");
  }
}

export function validateImage(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    throw new Error("La portada debe ser un archivo de imagen válido (JPG, PNG, WEBP).");
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

export function validatePositiveInteger(value, fieldName) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    throw new Error(`El campo ${fieldName} debe ser un número entero mayor que cero.`);
  }
  return num;
}

export function validateChapterMarks(marks) {
  const chapters = new Set();
  const pages = new Set();

  for (const mark of marks) {
    const chapter = validatePositiveInteger(mark.chapter, "Capítulo");
    const page = validatePositiveInteger(mark.page, "Página inicial");

    if (chapters.has(chapter)) {
      throw new Error(`El capítulo ${chapter} está repetido.`);
    }
    if (pages.has(page)) {
      throw new Error(`La página inicial ${page} está asignada a otro capítulo.`);
    }

    chapters.add(chapter);
    pages.add(page);
  }

  return marks
    .map((mark) => ({ chapter: Number(mark.chapter), page: Number(mark.page) }))
    .sort((a, b) => a.chapter - b.chapter);
}
