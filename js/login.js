import { signInOrBootstrapDefaultAdmin } from "./auth.js?v=20260722-v15";
import { redirectIfLoggedIn } from "./guards.js?v=20260722-v15";
import { setStatus, friendlyError, getQueryParam } from "./utils.js";
import { setBusy } from "./forms.js";
import { validateEmail, validateRequired } from "./validators.js";

const form = document.getElementById("login-form");
const status = document.getElementById("auth-status");
const showPassword = document.getElementById("show-password");

const registered = getQueryParam("registered");
if (registered) {
  setStatus(status, "Cuenta creada correctamente. Ya puedes iniciar sesión.", "success");
}

redirectIfLoggedIn();

showPassword?.addEventListener("change", () => {
  form.elements.password.type = showPassword.checked ? "text" : "password";
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  setBusy(submitButton, true, "Ingresando...");
  setStatus(status, "");
  try {
    const data = new FormData(form);
    const email = validateEmail(data.get("email"));
    const password = validateRequired(data.get("password"), "Contraseña");
    const user = await signInOrBootstrapDefaultAdmin(email, password);
    window.location.replace(user?.isLocalDemo ? "admin.html?mode=local" : "admin.html");
  } catch (error) {
    setStatus(status, friendlyError(error), "error");
  } finally {
    setBusy(submitButton, false);
  }
});
