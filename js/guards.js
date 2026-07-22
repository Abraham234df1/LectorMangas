import { getCurrentUser, checkIsAdmin, onAuthStateChange } from "./auth.js?v=20260722-v15";

/**
 * Protege la página actual requiriendo sesión de administrador.
 * Si no está autenticado o no es administrador, redirige a login.html.
 */
export async function requireAdmin() {
  try {
    const user = await getCurrentUser();
    const authorized = user && await checkIsAdmin(user.email);
    if (!authorized) {
      window.location.replace("login.html");
      return null;
    }
    return user;
  } catch (error) {
    console.error("Guard error:", error);
    window.location.replace("login.html");
    return null;
  }
}

/**
 * Evita que un administrador ya logueado acceda a la página de login.
 * Si ya tiene sesión, redirige a admin.html.
 */
export async function redirectIfLoggedIn() {
  try {
    const user = await getCurrentUser();
    const authorized = user && await checkIsAdmin(user.email);
    if (authorized) {
      window.location.replace(user.isLocalDemo ? "admin.html?mode=local" : "admin.html");
    }
  } catch (error) {
    console.error("Guard error:", error);
  }
}

/**
 * Monitorea cambios de autenticación globales para redirigir si el usuario cierra sesión.
 */
export function setupAuthListener() {
  onAuthStateChange(async (user) => {
    const authorized = user && await checkIsAdmin(user.email);
    if (!authorized && !window.location.pathname.endsWith("login.html")) {
      window.location.replace("login.html");
    }
  });
}
