const DB_NAME = "mangaread-local-content";
const DB_VERSION = 1;
const STORE_NAME = "volume-overrides";

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("Este navegador no permite guardar PDFs localmente."));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("No se pudo abrir el almacenamiento local."));
  });
}

async function runRequest(mode, operation) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = operation(store);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error("No se pudo guardar el tomo."));
    transaction.oncomplete = () => database.close();
  });
}

export function getLocalVolumeOverride(id) {
  return runRequest("readonly", (store) => store.get(id));
}

export async function applyLocalVolumeOverride(volume) {
  const override = await getLocalVolumeOverride(volume.id);
  if (!override) return volume;
  return {
    ...volume,
    ...override,
    id: volume.id,
    manga_id: volume.manga_id,
    is_demo: true,
    has_local_override: true,
    demo_url: override.pdf_blob ? null : volume.demo_url,
    local_pdf_blob: override.pdf_blob || null
  };
}

export function applyLocalVolumeOverrides(volumes = []) {
  return Promise.all(volumes.map(applyLocalVolumeOverride));
}

export async function saveLocalVolumeOverride(id, changes) {
  const previous = await getLocalVolumeOverride(id);
  const record = {
    ...(previous || {}),
    ...changes,
    id,
    updated_at: new Date().toISOString()
  };
  await runRequest("readwrite", (store) => store.put(record));
  return record;
}
