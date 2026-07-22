import { assertConfigured } from "./utils.js";

let client;

export function getSupabase() {
  if (client) return client;
  const config = assertConfigured();
  if (!window.supabase?.createClient) {
    throw new Error("No se pudo cargar la librería de Supabase.");
  }
  client = window.supabase.createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  return client;
}

export function getPublicFileUrl(bucket, path) {
  if (!path) return "";
  const { data } = getSupabase().storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || "";
}
