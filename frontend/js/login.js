(function () {
  const { $, banner, clearErrors, fieldError, showServerErrors, setBusy } = UI;
  const form = $("login-form");
  const emailInput = $("email");
  const passwordInput = $("password");
  const button = $("submit");
  let submitting = false;

  $("current-year").textContent = new Date().getFullYear();

  Api.me().then(() => window.location.replace("dashboard.html")).catch(() => {});

  const params = new URLSearchParams(location.search);
  if (params.has("registered")) banner("Account created. Sign in to continue.", "success");
  if (params.has("loggedout")) banner("You have been signed out.", "info");
  if (params.has("expired")) banner("Your session expired. Please sign in again.", "info");

  form.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => clearErrors(form));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;
    clearErrors(form);

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let valid = true;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      fieldError("email", "Enter a valid email address.");
      valid = false;
    }
    if (!password || password.length > 128) {
      fieldError("password", "Enter your password.");
      valid = false;
    }
    if (!valid) return;

    submitting = true;
    setBusy(button, true, "Signing in…");
    try {
      await Api.login({ email, password });
      window.location.assign("dashboard.html");
    } catch (error) {
      const handled = showServerErrors(error.errors);
      if (!handled) banner(error.message || "Unable to sign in. Please try again.", "error");
      passwordInput.value = "";
      passwordInput.focus();
    } finally {
      submitting = false;
      setBusy(button, false);
    }
  });
})();