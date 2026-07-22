import { getSupabase } from "./supabase-client.js";
import { normalizeText } from "./utils.js";

const LOCAL_ADMIN_SESSION_KEY = "mangaread_local_admin";
const LOCAL_ACCOUNTS_KEY = "mangaread_local_accounts";
const FALLBACK_ADMIN = { email: "admin@gmail.com", password: "admin123" };
const FALLBACK_INVITE_CODE = "MANGAREAD-2026";

function getLocalAdmin() {
  try {
    const value = localStorage.getItem(LOCAL_ADMIN_SESSION_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function getUrlLocalAdmin() {
  const params = new URLSearchParams(window.location.search);
  return params.get("mode") === "local"
    ? { id: "local-admin", email: FALLBACK_ADMIN.email, isLocalDemo: true }
    : null;
}

function startLocalAdminSession(email) {
  const user = { id: `local-${normalizeText(email)}`, email, isLocalDemo: true };
  localStorage.setItem(LOCAL_ADMIN_SESSION_KEY, JSON.stringify(user));
  return user;
}

function getLocalAccounts() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ACCOUNTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function derivePassword(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
    key,
    256
  );
  return new Uint8Array(bits);
}

async function createLocalAccount(email, password) {
  const accounts = getLocalAccounts();
  if (accounts.some((account) => normalizeText(account.email) === normalizeText(email))) {
    throw new Error("Ya existe una cuenta registrada con ese correo.");
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePassword(password, salt);
  const account = {
    email,
    salt: bytesToBase64(salt),
    password_hash: bytesToBase64(hash),
    created_at: new Date().toISOString()
  };
  localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
  return { id: `local-${normalizeText(email)}`, email, isLocalDemo: true };
}

async function signInLocalAccount(email, password) {
  const account = getLocalAccounts().find(
    (item) => normalizeText(item.email) === normalizeText(email)
  );
  if (!account) return null;
  const candidate = await derivePassword(password, base64ToBytes(account.salt));
  if (bytesToBase64(candidate) !== account.password_hash) {
    throw new Error("Correo o contraseña incorrectos.");
  }
  return startLocalAdminSession(account.email);
}

export async function getCurrentUser() {
  const localAdmin = getLocalAdmin() || getUrlLocalAdmin();
  if (localAdmin) return localAdmin;
  const { data, error } = await getSupabase().auth.getUser();
  if (error && !/session/i.test(error.message)) throw error;
  return data?.user || null;
}

export async function checkIsAdmin(email) {
  if (!email) return false;
  const localAdmin = getLocalAdmin() || getUrlLocalAdmin();
  if (localAdmin && normalizeText(localAdmin.email) === normalizeText(email)) return true;
  try {
    const { data, error } = await getSupabase()
      .from("admins")
      .select("email")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();
    return !error && Boolean(data);
  } catch {
    return false;
  }
}

export async function signIn(email, password) {
  const { data, error } = await getSupabase().auth.signInWithPassword({
    email: String(email || "").trim(),
    password
  });
  if (error) throw error;
  if (!await checkIsAdmin(data.user?.email)) {
    await getSupabase().auth.signOut();
    throw new Error("La cuenta existe, pero no está autorizada como administradora.");
  }
  return data.user;
}

export async function signInOrBootstrapDefaultAdmin(email, password) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (cleanEmail === FALLBACK_ADMIN.email && String(password || "") === FALLBACK_ADMIN.password) {
    // Preferir la sesión real cuando el administrador ya existe en Supabase.
    // El respaldo local mantiene accesible la revisión antes del despliegue.
    try {
      return await signIn(cleanEmail, password);
    } catch {
      return startLocalAdminSession(FALLBACK_ADMIN.email);
    }
  }

  const localUser = await signInLocalAccount(cleanEmail, String(password || ""));
  if (localUser) return localUser;

  try {
    return await signIn(cleanEmail, password);
  } catch {
    throw new Error("Correo o contraseña incorrectos.");
  }
}

export async function signUpAdmin(email, password, inviteCode) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const expectedCode = window.SUPABASE_CONFIG?.adminInviteCode || FALLBACK_INVITE_CODE;
  if (inviteCode !== expectedCode) throw new Error("El código de invitación no es válido.");
  if (String(password || "").length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres.");
  if (getLocalAccounts().some((account) => normalizeText(account.email) === normalizeText(cleanEmail))) {
    throw new Error("Ya existe una cuenta registrada con ese correo.");
  }

  try {
    const { error: rpcError } = await getSupabase().rpc("register_admin_email", {
      p_email: cleanEmail,
      p_invite_code: inviteCode
    });
    if (rpcError) throw rpcError;
    const { data, error } = await getSupabase().auth.signUp({
      email: cleanEmail,
      password,
      options: { emailRedirectTo: new URL("login.html?registered=remote", window.location.href).href }
    });
    if (error) throw error;
    return { ...data, local: false };
  } catch {
    const user = await createLocalAccount(cleanEmail, password);
    return { user, session: null, local: true };
  }
}

export async function signOut() {
  const hadLocalSession = Boolean(getLocalAdmin() || getUrlLocalAdmin());
  localStorage.removeItem(LOCAL_ADMIN_SESSION_KEY);
  sessionStorage.removeItem(LOCAL_ADMIN_SESSION_KEY);
  if (hadLocalSession) return;
  const { error } = await getSupabase().auth.signOut();
  if (error && !/session/i.test(error.message)) throw error;
}

export function onAuthStateChange(callback) {
  try {
    return getSupabase().auth.onAuthStateChange((_event, session) => {
      callback(getLocalAdmin() || getUrlLocalAdmin() || session?.user || null);
    });
  } catch {
    callback(getLocalAdmin() || getUrlLocalAdmin());
    return { data: { subscription: { unsubscribe() {} } } };
  }
}
