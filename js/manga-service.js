import { getSupabase } from "./supabase-client.js";
import { uploadCover, deleteCover, getCoverUrl, removePdfFiles } from "./storage-service.js";
import { getVolumesByManga } from "./volume-service.js";
import { normalizeText } from "./utils.js";
import { demoMangas, getDemoMangaById, getDemoMangaByTitle } from "./demo-catalog.js?v=20260722-v9";
import { applyLocalVolumeOverrides } from "./local-volume-store.js";

function throwIfError(error) {
  if (error) throw error;
}

export async function listMangas(search = "") {
  let data = [];
  try {
    const { data: remoteData, error } = await getSupabase()
      .from("mangas")
      .select("*, volumes(id)")
      .order("created_at", { ascending: false });
    throwIfError(error);
    data = remoteData || [];
  } catch (error) {
    console.warn("Supabase no esta disponible; se mostrara el catalogo demo local.", error);
  }

  const merged = new Map(
    demoMangas.map((manga) => [manga.normalized_title, { ...manga }])
  );

  data.forEach((manga) => {
    const normalizedTitle = manga.normalized_title || normalizeText(manga.title);
    const demo = getDemoMangaByTitle(manga.title);
    const remoteVolumeCount = manga.volumes?.length || 0;
    merged.set(normalizedTitle, {
      ...demo,
      ...manga,
      is_demo: false,
      has_demo_fallback: Boolean(demo),
      volume_count: remoteVolumeCount || demo?.volume_count || 0,
      cover_url: manga.cover_path ? getCoverUrl(manga.cover_path) : (demo?.cover_url || "")
    });
  });

  const normalizedSearch = normalizeText(search);
  return [...merged.values()]
    .filter((manga) => {
      if (!normalizedSearch) return true;
      return normalizeText(manga.title).includes(normalizedSearch)
        || normalizeText(manga.author).includes(normalizedSearch);
    })
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))
      || new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

export async function getMangaDetails(id) {
  const localManga = getDemoMangaById(id);
  if (localManga) {
    return { ...localManga, volumes: await applyLocalVolumeOverrides(localManga.volumes) };
  }

  const supabase = getSupabase();
  const { data: manga, error: mangaError } = await supabase
    .from("mangas")
    .select("*")
    .eq("id", id)
    .single();
  throwIfError(mangaError);

  let volumes = await getVolumesByManga(id);
  const demo = getDemoMangaByTitle(manga.title);

  if (demo) {
    if (!volumes.length) {
      volumes = [...demo.volumes];
    } else {
      volumes = volumes.map((volume) => {
        const demoVolume = demo.volumes.find(
          (item) => item.normalized_title === volume.normalized_title
        );
        if (!demoVolume) return volume;
        if (volume.pdf_path) {
          const {
            demo_url: _demoUrl,
            pdf_path: _localPdfPath,
            pdf_storage_mode: _localStorageMode,
            pdf_parts: _localParts,
            ...demoMetadata
          } = demoVolume;
          return {
            ...demoMetadata,
            ...volume,
            is_demo: false,
            has_remote_pdf: true
          };
        }
        return {
          ...demoVolume,
          ...volume,
          demo_url: demoVolume.demo_url,
          page_count: demoVolume.page_count,
          is_user_provided: demoVolume.is_user_provided,
          is_demo: false,
          has_local_fallback: true
        };
      });
    }
  }

  volumes = await applyLocalVolumeOverrides(volumes);

  return {
    ...demo,
    ...manga,
    is_demo: false,
    has_demo_fallback: Boolean(demo),
    has_local_content: Boolean(demo?.has_local_content),
    cover_url: manga.cover_path ? getCoverUrl(manga.cover_path) : (demo?.cover_url || ""),
    volumes: volumes || []
  };
}

export async function findMangaByNormalizedTitle(normalizedTitle, excludeId = null) {
  const supabase = getSupabase();
  let query = supabase.from("mangas").select("id").eq("normalized_title", normalizedTitle).limit(1);
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query;
  throwIfError(error);
  return data?.[0] || null;
}

export async function createManga({ title, author, synopsis, direction, coverFile }) {
  const cleanTitle = String(title || "").trim();
  if (!cleanTitle) throw new Error("El título del manga es obligatorio.");
  const normalizedTitle = normalizeText(cleanTitle);

  if (await findMangaByNormalizedTitle(normalizedTitle)) {
    throw new Error("Ya existe un manga con el mismo título.");
  }
  if (!coverFile) throw new Error("Selecciona una portada.");

  let coverPath;
  try {
    coverPath = await uploadCover(coverFile, cleanTitle);
    const { data, error } = await getSupabase()
      .from("mangas")
      .insert({
        title: cleanTitle,
        normalized_title: normalizedTitle,
        author: String(author || "Autor desconocido").trim() || "Autor desconocido",
        synopsis: String(synopsis || "").trim(),
        direction: direction === "ltr" ? "ltr" : "rtl",
        cover_path: coverPath
      })
      .select()
      .single();
    throwIfError(error);
    return data;
  } catch (error) {
    if (coverPath) await deleteCover(coverPath);
    throw error;
  }
}

export async function updateManga(id, { title, author, synopsis, direction, coverFile, currentCoverPath }) {
  const cleanTitle = String(title || "").trim();
  if (!cleanTitle) throw new Error("El título del manga es obligatorio.");
  const normalizedTitle = normalizeText(cleanTitle);

  if (await findMangaByNormalizedTitle(normalizedTitle, id)) {
    throw new Error("Ya existe otro manga con el mismo título.");
  }

  let newCoverPath = currentCoverPath || null;
  let uploadedCoverPath = null;
  if (coverFile) {
    uploadedCoverPath = await uploadCover(coverFile, cleanTitle);
    newCoverPath = uploadedCoverPath;
  }

  try {
    const { data, error } = await getSupabase()
      .from("mangas")
      .update({
        title: cleanTitle,
        normalized_title: normalizedTitle,
        author: String(author || "Autor desconocido").trim() || "Autor desconocido",
        synopsis: String(synopsis || "").trim(),
        direction: direction === "ltr" ? "ltr" : "rtl",
        cover_path: newCoverPath
      })
      .eq("id", id)
      .select()
      .single();
    throwIfError(error);

    if (uploadedCoverPath && currentCoverPath && currentCoverPath !== uploadedCoverPath) {
      await deleteCover(currentCoverPath);
    }
    return data;
  } catch (error) {
    if (uploadedCoverPath) await deleteCover(uploadedCoverPath);
    throw error;
  }
}

export async function deleteManga(id) {
  const manga = await getMangaDetails(id);
  const { error } = await getSupabase().from("mangas").delete().eq("id", id);
  throwIfError(error);

  for (const volume of manga.volumes) {
    await removePdfFiles(volume);
  }
  if (manga.cover_path) {
    await deleteCover(manga.cover_path);
  }
}
