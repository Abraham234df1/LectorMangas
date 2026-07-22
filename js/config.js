/**
 * Configuración pública del cliente.
 * Project URL y clave pública de Supabase configuradas.
 * Nunca coloques aquí la service_role key.
 */
window.SUPABASE_CONFIG = {
  url: "https://yeqckipopvimhfuidwld.supabase.co",
  anonKey: "sb_publishable_2IBhxPTaGTfA4i2EjCV5tA_FbNNJo9Z",
  adminInviteCode: "MANGAREAD-2026",
  defaultAdmin: {
    email: "admin@gmail.com",
    password: "admin123"
  },
  adminEmails: [
    "admin@gmail.com"
  ],
  buckets: {
    covers: "covers",
    pdfs: "pdfs"
  },
  upload: {
    // Los PDFs mayores a este límite se dividen en partes para evitar fallos de subida.
    chunkThresholdBytes: 45 * 1024 * 1024,
    chunkSizeBytes: 20 * 1024 * 1024
  }
};
