import { getSupabase } from "./supabase-client.js";
import { uploadPdf, removePdfFiles } from "./storage-service.js";
import { replaceChapterMarks, getChapterMarks } from "./chapter-service.js";
import { normalizeText } from "./utils.js";
import { validateChapterMarks, validatePdf } from "./validators.js";
import { getDemoMangaByTitle, getDemoVolumeById } from "./demo-catalog.js?v=20260722-v8";
import { applyLocalVolumeOverride, saveLocalVolumeOverride } from "./local-volume-store.js";

function throwIfError(error) {
  if (error) throw error;
}

export async function getVolumesByManga(mangaId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("volumes")
    .select("*, chapter_marks(id)")
    .eq("manga_id", mangaId)
    .order("created_at", { ascending: true });
  throwIfError(error);
  return data || [];
}

export async function getVolumeById(id) {
  const localVolume = getDemoVolumeById(id);
  if (localVolume) return applyLocalVolumeOverride(localVolume);

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("volumes")
    .select("*, mangas(id,title,direction)")
    .eq("id", id)
    .single();
  throwIfError(error);

  const marks = await getChapterMarks(id);
  const demoManga = getDemoMangaByTitle(data.mangas?.title);
  const demoVolume = demoManga?.volumes.find(
    (item) => item.normalized_title === data.normalized_title
  );
  return {
    ...(demoVolume || {}),
    ...data,
    ...(!data.pdf_path && demoVolume ? {
      demo_url: demoVolume.demo_url,
      page_count: demoVolume.page_count,
      is_user_provided: demoVolume.is_user_provided,
      is_demo: false,
      has_local_fallback: true
    } : {}),
    chapter_marks: marks.length ? marks : (demoVolume?.chapter_marks || [])
  };
}

export async function updateLocalDemoVolume(id, {
  title,
  chaptersLabel,
  pdfFile,
  marks,
  existingVolume,
  onProgress = () => {}
}) {
  if (!existingVolume?.is_demo) throw new Error("El tomo indicado no es un tomo local editable.");
  const cleanTitle = String(title || "").trim();
  if (!cleanTitle) throw new Error("El título del tomo es obligatorio.");
  if (pdfFile) validatePdf(pdfFile);
  const cleanMarks = validateChapterMarks(marks || []);
  const changes = {
    title: cleanTitle,
    normalized_title: normalizeText(cleanTitle),
    chapters_label: String(chaptersLabel || "").trim(),
    chapter_marks: cleanMarks.map((mark, index) => ({
      id: `local-${id}-${index + 1}`,
      volume_id: id,
      ...mark
    })),
    pdf_name: pdfFile?.name || existingVolume.pdf_name
  };
  if (pdfFile) {
    changes.pdf_blob = pdfFile;
    changes.pdf_storage_mode = "local";
  }
  onProgress(40);
  await saveLocalVolumeOverride(id, changes);
  onProgress(100);
  return getVolumeById(id);
}

export async function checkVolumeTitleExists(mangaId, normalizedTitle, excludeId = null) {
  const supabase = getSupabase();
  let query = supabase
    .from("volumes")
    .select("id")
    .eq("manga_id", mangaId)
    .eq("normalized_title", normalizedTitle)
    .limit(1);
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query;
  throwIfError(error);
  return (data?.length || 0) > 0;
}

export async function checkPdfNameExists(mangaId, normalizedPdfName, excludeId = null) {
  const supabase = getSupabase();
  let query = supabase
    .from("volumes")
    .select("id")
    .eq("manga_id", mangaId)
    .eq("normalized_pdf_name", normalizedPdfName)
    .limit(1);
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query;
  throwIfError(error);
  return (data?.length || 0) > 0;
}

export async function createVolume({ mangaId, title, chaptersLabel, pdfFile, marks, onProgress }) {
  if (!mangaId) throw new Error("Selecciona primero el manga al que pertenece el tomo.");
  const cleanTitle = String(title || "").trim();
  if (!cleanTitle) throw new Error("El título del tomo es obligatorio.");
  if (!pdfFile) throw new Error("Selecciona el PDF del tomo.");
  validatePdf(pdfFile);

  const normalizedTitle = normalizeText(cleanTitle);
  const normalizedPdfName = normalizeText(pdfFile.name);

  if (await checkVolumeTitleExists(mangaId, normalizedTitle)) {
    throw new Error("Ya existe un tomo con ese título en este manga.");
  }
  if (await checkPdfNameExists(mangaId, normalizedPdfName)) {
    throw new Error("Ya existe un tomo con el mismo nombre de PDF en este manga.");
  }

  const uploaded = await uploadPdf(pdfFile, mangaId, cleanTitle, onProgress);
  let volume;
  try {
    const { data, error } = await getSupabase()
      .from("volumes")
      .insert({
        manga_id: mangaId,
        title: cleanTitle,
        normalized_title: normalizedTitle,
        chapters_label: String(chaptersLabel || "").trim(),
        ...uploaded,
        pdf_name: pdfFile.name,
        normalized_pdf_name: normalizedPdfName
      })
      .select()
      .single();
    throwIfError(error);
    volume = data;
    await replaceChapterMarks(volume.id, marks);
    return volume;
  } catch (error) {
    await removePdfFiles(uploaded);
    if (volume?.id) {
      await getSupabase().from("volumes").delete().eq("id", volume.id);
    }
    throw error;
  }
}

export async function updateVolume(id, {
  mangaId,
  title,
  chaptersLabel,
  pdfFile,
  marks,
  existingVolume,
  onProgress
}) {
  if (!mangaId) throw new Error("No se encontró el manga del tomo.");
  const cleanTitle = String(title || "").trim();
  if (!cleanTitle) throw new Error("El título del tomo es obligatorio.");

  const normalizedTitle = normalizeText(cleanTitle);
  const pdfName = pdfFile?.name || existingVolume.pdf_name;
  const normalizedPdfName = normalizeText(pdfName);

  if (await checkVolumeTitleExists(mangaId, normalizedTitle, id)) {
    throw new Error("Ya existe otro tomo con ese título en este manga.");
  }
  if (await checkPdfNameExists(mangaId, normalizedPdfName, id)) {
    throw new Error("Ya existe otro tomo con el mismo nombre de PDF en este manga.");
  }

  let newUpload = null;
  let databaseUpdated = false;
  if (pdfFile) newUpload = await uploadPdf(pdfFile, mangaId, cleanTitle, onProgress);

  try {
    const payload = {
      title: cleanTitle,
      normalized_title: normalizedTitle,
      chapters_label: String(chaptersLabel || "").trim(),
      pdf_name: pdfName,
      normalized_pdf_name: normalizedPdfName
    };
    if (newUpload) Object.assign(payload, newUpload);

    const { data, error } = await getSupabase()
      .from("volumes")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    throwIfError(error);
    databaseUpdated = true;

    await replaceChapterMarks(id, marks);
    if (newUpload) await removePdfFiles(existingVolume);
    return data;
  } catch (error) {
    let rollbackSucceeded = !databaseUpdated;
    if (databaseUpdated) {
      try {
        const rollbackPayload = {
          title: existingVolume.title,
          normalized_title: existingVolume.normalized_title,
          chapters_label: existingVolume.chapters_label,
          pdf_path: existingVolume.pdf_path,
          pdf_storage_mode: existingVolume.pdf_storage_mode,
          pdf_parts: existingVolume.pdf_parts,
          pdf_name: existingVolume.pdf_name,
          normalized_pdf_name: existingVolume.normalized_pdf_name
        };
        await getSupabase().from("volumes").update(rollbackPayload).eq("id", id);
        await replaceChapterMarks(id, existingVolume.chapter_marks || []);
        rollbackSucceeded = true;
      } catch (rollbackError) {
        console.error("No se pudo revertir la edición del tomo:", rollbackError);
      }
    }
    if (newUpload && rollbackSucceeded) await removePdfFiles(newUpload);
    throw error;
  }
}

export async function deleteVolume(id) {
  const volume = await getVolumeById(id);
  const { error } = await getSupabase().from("volumes").delete().eq("id", id);
  throwIfError(error);
  await removePdfFiles(volume);
}
