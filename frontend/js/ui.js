(function () {
  const $ = (id) => document.getElementById(id);

  function banner(message, type = "info") {
    const element = $("banner");
    if (!element) return;
    element.textContent = message;
    element.className = `banner ${type}`;
    element.hidden = false;
  }

  function clearErrors(form) {
    form.querySelectorAll(".field-error").forEach((el) => {
      el.textContent = "";
    });
    const alert = form.querySelector(".banner");
    if (alert) {
      alert.hidden = true;
      alert.textContent = "";
    }
  }

  function fieldError(field, message) {
    const target = $(`err-${field}`);
    if (target) target.textContent = message;
  }

  function showServerErrors(errors) {
    if (!errors || typeof errors !== "object") return false;
    let shown = false;
    for (const [field, message] of Object.entries(errors)) {
      if (["email", "username", "password"].includes(field) && typeof message === "string") {
        fieldError(field, message);
        shown = true;
      }
    }
    return shown;
  }

  function setBusy(button, busy, text) {
    if (!button.dataset.originalHtml) button.dataset.originalHtml = button.innerHTML;
    button.disabled = busy;
    button.setAttribute("aria-busy", String(busy));
    if (busy) {
      button.innerHTML = `<span class="btn-label">${text || "Please wait…"}</span><span class="spinner" aria-hidden="true"></span>`;
    } else {
      button.innerHTML = button.dataset.originalHtml;
    }
  }

  document.querySelectorAll("[data-toggle='password']").forEach((button) => {
    button.addEventListener("click", () => {
      const input = $(button.dataset.toggle);
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.textContent = show ? "Hide" : "Show";
      button.setAttribute("aria-label", show ? "Hide password" : "Show password");
      button.setAttribute("aria-pressed", String(show));
    });
  });

  document.querySelectorAll("[data-current-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  window.UI = { $, banner, clearErrors, fieldError, showServerErrors, setBusy };
})();