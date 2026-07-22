/**
 * Ejemplo de configuración pública del cliente de Supabase.
 * Copia este archivo a js/config.js y coloca tus credenciales reales.
 * Nunca coloques aquí la service_role key.
 */
window.SUPABASE_CONFIG = {
  url: "https://TU-PROYECTO.supabase.co",
  anonKey: "TU-ANON-PUBLIC-KEY",
  adminInviteCode: "MANGAREAD-2026",
  defaultAdmin: {
    email: "admin@gmail.com",
    password: "admin123"
  },
  buckets: {
    covers: "covers",
    pdfs: "pdfs"
  },
  upload: {
    chunkThresholdBytes: 45 * 1024 * 1024,
    chunkSizeBytes: 20 * 1024 * 1024
  }
};
