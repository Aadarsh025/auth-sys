(function () {
  const { $, banner, clearErrors, fieldError, showServerErrors, setBusy } = UI;
  const form = $("register-form");
  const usernameInput = $("username");
  const emailInput = $("email");
  const passwordInput = $("password");
  const button = $("submit");
  let submitting = false;

  $("current-year").textContent = new Date().getFullYear();

  form.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => clearErrors(form));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;
    clearErrors(form);

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let valid = true;

    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) {
      fieldError("username", "Use 3–30 letters, numbers, dots, underscores or hyphens.");
      valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      fieldError("email", "Enter a valid email address.");
      valid = false;
    }
    if (password.length < 10 || password.length > 128) {
      fieldError("password", "Use a password between 10 and 128 characters.");
      valid = false;
    }
    if (!valid) return;

    submitting = true;
    setBusy(button, true, "Creating account…");
    try {
      await Api.register({ username, email, password });
      window.location.assign("login.html?registered=1");
    } catch (error) {
      const handled = showServerErrors(error.errors);
      if (!handled) banner(error.message || "Unable to create your account.", "error");
    } finally {
      submitting = false;
      setBusy(button, false);
    }
  });
})();