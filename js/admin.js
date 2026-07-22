import {
  listMangas,
  getMangaDetails,
  createManga,
  updateManga,
  deleteManga
} from "./manga-service.js?v=20260722-v13";
import {
  createVolume,
  updateVolume,
  updateLocalDemoVolume,
  deleteVolume,
  getVolumeById
} from "./volume-service.js?v=20260722-v11";
import { getChapterMarks } from "./chapter-service.js";
import { requireAdmin, setupAuthListener } from "./guards.js?v=20260722-v15";
import { signOut } from "./auth.js?v=20260722-v15";
import { escapeHtml, friendlyError, setStatus } from "./utils.js";
import { showToast } from "./notifications.js";
import {
  renderAdminMangas,
  renderAdminVolumes,
  renderStats
} from "./admin-ui.js?v=20260722-v7";
import {
  setBusy,
  resetMangaForm,
  populateMangaForm,
  addChapterMarkRow,
  collectChapterMarks,
  resetVolumeForm,
  populateVolumeForm,
  setUploadProgress,
  hideUploadProgress
} from "./forms.js?v=20260722-v2";

const elements = {
  adminEmail: document.getElementById("admin-email"),
  logout: document.getElementById("logout-button"),
  totalMangas: document.getElementById("stat-total-mangas"),
  totalVolumes: document.getElementById("stat-total-tomos"),
  totalMarks: document.getElementById("stat-total-marcas"),

  mangaForm: document.getElementById("manga-form"),
  mangaFormTitle: document.getElementById("manga-form-title"),
  mangaStatus: document.getElementById("manga-status"),
  mangaList: document.getElementById("admin-manga-list"),
  cancelMangaEdit: document.getElementById("cancel-manga-edit"),

  volumeSection: document.getElementById("volume-section"),
  selectedMangaName: document.getElementById("selected-manga-name"),
  volumeForm: document.getElementById("volume-form"),
  volumeFormTitle: document.getElementById("volume-form-title"),
  volumeStatus: document.getElementById("volume-status"),
  volumeList: document.getElementById("admin-volume-list"),
  cancelVolumeEdit: document.getElementById("cancel-volume-edit"),
  addMark: document.getElementById("add-chapter-mark"),
  marksContainer: document.getElementById("chapter-marks"),

  uploadProgress: document.getElementById("upload-progress"),
  uploadProgressBar: document.getElementById("upload-progress-bar-fill"),
  uploadProgressText: document.getElementById("upload-progress-text")
};

let mangas = [];
let selectedManga = null;
let editingManga = null;
let editingVolume = null;
let localAdminMode = false;

async function refreshDashboard() {
  setStatus(elements.mangaStatus, "Actualizando información...", "info");
  try {
    mangas = await listMangas();

    // Calculate stats
    let totalVols = 0;
    mangas.forEach(m => totalVols += m.volume_count);

    renderStats(elements, {
      mangaCount: mangas.length,
      volumeCount: totalVols,
      markCount: "—" // Checked via volumes
    });

    renderAdminMangas(
      elements.mangaList,
      mangas,
      selectedManga?.id,
      selectManga,
      beginMangaEdit,
      confirmDeleteManga
    );

    setStatus(elements.mangaStatus, "");

    if (selectedManga) {
      const refreshed = mangas.find((item) => item.id === selectedManga.id);
      if (refreshed) {
        await selectManga(refreshed);
      } else {
        clearSelectedManga();
      }
    }
  } catch (error) {
    setStatus(elements.mangaStatus, friendlyError(error), "error");
  }
}

async function selectManga(manga) {
  setStatus(elements.volumeStatus, "Cargando tomos...", "info");
  try {
    selectedManga = await getMangaDetails(manga.id);
    elements.volumeSection.hidden = false;
    elements.selectedMangaName.textContent = selectedManga.title;
    const demoCollection = Boolean(selectedManga.is_demo);
    const volumeCreationDisabled = localAdminMode || demoCollection;

    resetVolumeForm(
      elements.volumeForm,
      elements.volumeFormTitle,
      elements.cancelVolumeEdit,
      elements.marksContainer
    );
    Array.from(elements.volumeForm.elements).forEach((control) => {
      control.disabled = volumeCreationDisabled;
    });

    renderAdminVolumes(
      elements.volumeList,
      selectedManga.volumes,
      beginVolumeEdit,
      confirmDeleteVolume
    );

    // Highlight selected manga in the list
    renderAdminMangas(
      elements.mangaList,
      mangas,
      selectedManga.id,
      selectManga,
      beginMangaEdit,
      confirmDeleteManga
    );

    setStatus(
      elements.volumeStatus,
      demoCollection
        ? "Puedes modificar cualquiera de estos tomos con el botón Editar. Los cambios y PDFs se guardan en este navegador."
        : (localAdminMode ? "La edición remota requiere una sesión administradora de Supabase." : ""),
      "info"
    );
    elements.volumeSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    setStatus(elements.volumeStatus, friendlyError(error), "error");
  }
}

function clearSelectedManga() {
  selectedManga = null;
  elements.volumeSection.hidden = true;
  renderAdminMangas(
    elements.mangaList,
    mangas,
    null,
    selectManga,
    beginMangaEdit,
    confirmDeleteManga
  );
}

// Manga Operations
elements.mangaForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (localAdminMode) {
    setStatus(elements.mangaStatus, "El acceso local permite revisar la interfaz, pero las escrituras requieren desplegar el esquema en Supabase.", "error");
    return;
  }
  const submitBtn = elements.mangaForm.querySelector("button[type=submit]");
  setBusy(submitBtn, true, editingManga ? "Guardando..." : "Creando...");
  setStatus(elements.mangaStatus, "");

  try {
    const data = new FormData(elements.mangaForm);
    const payload = {
      title: data.get("title"),
      author: data.get("author"),
      synopsis: data.get("synopsis"),
      direction: data.get("direction"),
      coverFile: data.get("cover")?.size ? data.get("cover") : null
    };

    if (editingManga) {
      await updateManga(editingManga.id, {
        ...payload,
        currentCoverPath: editingManga.cover_path
      });
      showToast("Manga actualizado correctamente.");
    } else {
      await createManga(payload);
      showToast("Manga registrado correctamente.");
    }

    resetMangaForm(elements.mangaForm, elements.mangaFormTitle, elements.cancelMangaEdit);
    await refreshDashboard();
  } catch (error) {
    setStatus(elements.mangaStatus, friendlyError(error), "error");
  } finally {
    setBusy(submitBtn, false);
  }
});

function beginMangaEdit(manga) {
  editingManga = manga;
  populateMangaForm(elements.mangaForm, manga, elements.mangaFormTitle, elements.cancelMangaEdit);
  elements.mangaForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

elements.cancelMangaEdit.addEventListener("click", () => {
  resetMangaForm(elements.mangaForm, elements.mangaFormTitle, elements.cancelMangaEdit);
  editingManga = null;
});

async function confirmDeleteManga(manga) {
  if (!window.confirm(`¿Seguro que deseas eliminar "${manga.title}" y todos sus tomos? Esta acción no se puede deshacer.`)) return;

  setStatus(elements.mangaStatus, "Eliminando manga...", "info");
  try {
    await deleteManga(manga.id);
    showToast("Manga eliminado correctamente.");
    if (selectedManga?.id === manga.id) {
      clearSelectedManga();
    }
    await refreshDashboard();
  } catch (error) {
    setStatus(elements.mangaStatus, friendlyError(error), "error");
  }
}

// Volume Operations
elements.volumeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!selectedManga) return;
  if (selectedManga.is_demo && !editingVolume) {
    setStatus(elements.volumeStatus, "Selecciona Editar en uno de los tomos existentes.", "error");
    return;
  }
  if (localAdminMode && !editingVolume?.is_demo) {
    setStatus(elements.volumeStatus, "La edición de tomos remotos requiere una sesión administradora de Supabase.", "error");
    return;
  }

  const submitBtn = elements.volumeForm.querySelector("button[type=submit]");
  setBusy(submitBtn, true, editingVolume ? "Guardando..." : "Subiendo PDF...");
  setStatus(elements.volumeStatus, "");
  hideUploadProgress();

  try {
    const data = new FormData(elements.volumeForm);
    const pdf = data.get("pdf");
    const payload = {
      mangaId: selectedManga.id,
      title: data.get("title"),
      chaptersLabel: data.get("chaptersLabel"),
      pdfFile: pdf?.size ? pdf : null,
      marks: collectChapterMarks(elements.marksContainer),
      onProgress: (percent) => setUploadProgress(
        elements.uploadProgress,
        elements.uploadProgressBar,
        elements.uploadProgressText,
        percent
      )
    };

    if (editingVolume?.is_demo) {
      await updateLocalDemoVolume(editingVolume.id, {
        ...payload,
        existingVolume: editingVolume
      });
      showToast("Tomo local actualizado correctamente.");
    } else if (editingVolume) {
      await updateVolume(editingVolume.id, {
        ...payload,
        existingVolume: editingVolume
      });
      showToast("Tomo actualizado correctamente.");
    } else {
      await createVolume(payload);
      showToast("Tomo creado y subido correctamente.");
    }

    resetVolumeForm(
      elements.volumeForm,
      elements.volumeFormTitle,
      elements.cancelVolumeEdit,
      elements.marksContainer
    );
    editingVolume = null;

    // Refresh volume list
    selectedManga = await getMangaDetails(selectedManga.id);
    renderAdminVolumes(
      elements.volumeList,
      selectedManga.volumes,
      beginVolumeEdit,
      confirmDeleteVolume
    );
    await refreshDashboard();
  } catch (error) {
    setStatus(elements.volumeStatus, friendlyError(error), "error");
  } finally {
    setBusy(submitBtn, false);
    setTimeout(hideUploadProgress, 600);
  }
});

async function beginVolumeEdit(volume) {
  try {
    setStatus(elements.volumeStatus, "Cargando marcas del tomo...", "info");
    editingVolume = await getVolumeById(volume.id);
    const canEdit = editingVolume.is_demo || !localAdminMode;
    Array.from(elements.volumeForm.elements).forEach((control) => {
      control.disabled = !canEdit;
    });

    populateVolumeForm(
      elements.volumeForm,
      editingVolume,
      elements.volumeFormTitle,
      elements.cancelVolumeEdit,
      elements.marksContainer
    );

    setStatus(
      elements.volumeStatus,
      `Archivo actual: ${editingVolume.pdf_name}. Deja el campo PDF vacío si no deseas reemplazarlo.`,
      "info"
    );
    elements.volumeForm.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showToast(friendlyError(error), "error");
  }
}

elements.cancelVolumeEdit.addEventListener("click", () => {
  resetVolumeForm(
    elements.volumeForm,
    elements.volumeFormTitle,
    elements.cancelVolumeEdit,
    elements.marksContainer
  );
  editingVolume = null;
  if (selectedManga?.is_demo || localAdminMode) {
    Array.from(elements.volumeForm.elements).forEach((control) => { control.disabled = true; });
  }
});

async function confirmDeleteVolume(volume) {
  if (!window.confirm(`¿Seguro que deseas eliminar el tomo "${volume.title}"?`)) return;

  setStatus(elements.volumeStatus, "Eliminando tomo...", "info");
  try {
    await deleteVolume(volume.id);
    showToast("Tomo eliminado correctamente.");

    // Refresh list
    selectedManga = await getMangaDetails(selectedManga.id);
    renderAdminVolumes(
      elements.volumeList,
      selectedManga.volumes,
      beginVolumeEdit,
      confirmDeleteVolume
    );
    await refreshDashboard();
  } catch (error) {
    setStatus(elements.volumeStatus, friendlyError(error), "error");
  }
}

elements.addMark.addEventListener("click", () => addChapterMarkRow(elements.marksContainer));

// Init Dashboard
async function initDashboard(user) {
  elements.adminEmail.textContent = user.email;
  localAdminMode = Boolean(user.isLocalDemo);
  elements.logout.addEventListener("click", async () => {
    try {
      await signOut();
      showToast("Sesión cerrada.");
      window.setTimeout(() => window.location.replace("login.html"), 250);
    } catch (error) {
      showToast(friendlyError(error), "error");
    }
  });

  resetMangaForm(elements.mangaForm, elements.mangaFormTitle, elements.cancelMangaEdit);
  resetVolumeForm(
    elements.volumeForm,
    elements.volumeFormTitle,
    elements.cancelVolumeEdit,
    elements.marksContainer
  );

  if (localAdminMode) {
    Array.from(elements.mangaForm.elements).forEach((control) => { control.disabled = true; });
    setStatus(elements.mangaStatus, "Modo local de revisión: el catálogo y los lectores funcionan; la edición se habilita al desplegar schema.sql y policies.sql en Supabase.", "info");
  }

  await refreshDashboard();
  if (localAdminMode) {
    setStatus(elements.mangaStatus, "Modo local de revisión: el catálogo y los lectores funcionan; la edición requiere desplegar schema.sql y policies.sql en Supabase.", "info");
  }
}

// Load Guard on startup
requireAdmin().then((user) => {
  if (user) {
    initDashboard(user);
  }
});
setupAuthListener();
