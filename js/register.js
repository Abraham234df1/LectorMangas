import { signUpAdmin } from "./auth.js?v=20260722-v15";
import { redirectIfLoggedIn } from "./guards.js?v=20260722-v15";
import { setStatus, friendlyError } from "./utils.js";
import { setBusy } from "./forms.js";
import { validateEmail, validatePassword, validatePasswordsMatch, validateRequired } from "./validators.js";

const form = document.getElementById("register-form");
const status = document.getElementById("auth-status");
const showPasswords = document.getElementById("show-passwords");

redirectIfLoggedIn();

showPasswords?.addEventListener("change", () => {
  form.querySelectorAll('input[name="password"], input[name="confirmPassword"]').forEach((input) => {
    input.type = showPasswords.checked ? "text" : "password";
  });
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  setBusy(submitButton, true, "Creando cuenta...");
  setStatus(status, "");
  try {
    const data = new FormData(form);
    const email = validateEmail(data.get("email"));
    const password = validatePassword(data.get("password"));
    validatePasswordsMatch(password, data.get("confirmPassword"));
    const inviteCode = validateRequired(data.get("inviteCode"), "Código de invitación");
    const result = await signUpAdmin(email, password, inviteCode);

    if (!result.local && !result.session) {
      setStatus(status, "Cuenta creada en Supabase. Revisa tu correo para confirmarla.", "success");
      form.reset();
      return;
    }

    window.location.replace("login.html?registered=local");
  } catch (error) {
    setStatus(status, friendlyError(error), "error");
  } finally {
    setBusy(submitButton, false);
  }
});
