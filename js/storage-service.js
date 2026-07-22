import { getSupabase, getPublicFileUrl } from "./supabase-client.js";
import { slugify, uniqueId } from "./utils.js";
import { validateImage, validatePdf } from "./validators.js";

const config = () => window.SUPABASE_CONFIG;

function throwIfError(error) {
  if (error) throw error;
}

export async function uploadCover(file, mangaTitle) {
  validateImage(file);
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `manga-covers/${slugify(mangaTitle)}-${uniqueId()}.${extension}`;
  const { error } = await getSupabase().storage
    .from(config().buckets.covers)
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  throwIfError(error);
  return path;
}

export async function deleteCover(path) {
  if (!path) return;
  const { error } = await getSupabase().storage.from(config().buckets.covers).remove([path]);
  if (error) console.warn("No se pudo eliminar la portada anterior:", error.message);
}

export async function uploadPdf(file, mangaId, volumeTitle, onProgress = () => {}) {
  validatePdf(file);
  const threshold = config().upload?.chunkThresholdBytes || 45 * 1024 * 1024;
  const chunkSize = config().upload?.chunkSizeBytes || 20 * 1024 * 1024;
  const folder = `manga-${mangaId}/volume-${slugify(volumeTitle)}-${uniqueId()}`;

  if (file.size <= threshold) {
    const path = `${folder}/${slugify(file.name.replace(/\.pdf$/i, ""))}.pdf`;
    const { error } = await getSupabase().storage
      .from(config().buckets.pdfs)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: "application/pdf"
      });
    throwIfError(error);
    onProgress(100);
    return { pdf_path: path, pdf_storage_mode: "single", pdf_parts: null };
  }

  const totalParts = Math.ceil(file.size / chunkSize);
  const parts = [];

  try {
    for (let index = 0; index < totalParts; index += 1) {
      const start = index * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const blob = file.slice(start, end, "application/octet-stream");
      const path = `${folder}/parts/part-${String(index + 1).padStart(5, "0")}.bin`;
      const { error } = await getSupabase().storage
        .from(config().buckets.pdfs)
        .upload(path, blob, {
          cacheControl: "3600",
          upsert: false,
          contentType: "application/octet-stream"
        });
      throwIfError(error);
      parts.push({ path, index, size: blob.size });
      onProgress(Math.round(((index + 1) / totalParts) * 100));
    }
  } catch (error) {
    if (parts.length) {
      await getSupabase().storage.from(config().buckets.pdfs).remove(parts.map((part) => part.path));
    }
    throw error;
  }

  return {
    pdf_path: folder,
    pdf_storage_mode: "chunks",
    pdf_parts: parts
  };
}

export async function removePdfFiles(volumeLike) {
  if (!volumeLike) return;
  const paths = volumeLike.pdf_storage_mode === "chunks"
    ? (volumeLike.pdf_parts || []).map((part) => typeof part === "string" ? part : part.path).filter(Boolean)
    : [volumeLike.pdf_path].filter(Boolean);
  if (!paths.length) return;
  const { error } = await getSupabase().storage.from(config().buckets.pdfs).remove(paths);
  if (error) console.warn("No se pudo eliminar todos los archivos PDF:", error.message);
}

export async function downloadVolumePdf(volume, onProgress = () => {}) {
  if (volume.local_pdf_blob) {
    const data = new Uint8Array(await volume.local_pdf_blob.arrayBuffer());
    onProgress(100);
    return data;
  }
  if (volume.demo_url) {
    const response = await fetch(volume.demo_url);
    if (!response.ok) {
      throw new Error("No se pudo cargar el PDF de demostracion.");
    }
    const data = new Uint8Array(await response.arrayBuffer());
    onProgress(100);
    return data;
  }

  const bucket = getSupabase().storage.from(config().buckets.pdfs);

  if (volume.pdf_storage_mode !== "chunks") {
    const { data, error } = await bucket.download(volume.pdf_path);
    throwIfError(error);
    onProgress(100);
    return new Uint8Array(await data.arrayBuffer());
  }

  const parts = [...(volume.pdf_parts || [])]
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  if (!parts.length) throw new Error("El tomo no tiene partes de PDF registradas.");

  const buffers = [];
  let totalSize = 0;
  for (let index = 0; index < parts.length; index += 1) {
    const path = typeof parts[index] === "string" ? parts[index] : parts[index].path;
    const { data, error } = await bucket.download(path);
    throwIfError(error);
    const buffer = new Uint8Array(await data.arrayBuffer());
    buffers.push(buffer);
    totalSize += buffer.length;
    onProgress(Math.round(((index + 1) / parts.length) * 100));
  }

  const merged = new Uint8Array(totalSize);
  let offset = 0;
  for (const buffer of buffers) {
    merged.set(buffer, offset);
    offset += buffer.length;
  }
  return merged;
}

export function getCoverUrl(coverPath) {
  if (!coverPath) return "";
  return getPublicFileUrl(config().buckets.covers, coverPath);
}
