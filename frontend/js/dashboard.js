(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const banner = $("dashboard-banner");

  const logoutButtons = [
    $("logout"),
    $("sidebar-logout"),
  ].filter(Boolean);

  let isLoggingOut = false;

  function showError(message) {
    if (!banner) return;

    banner.textContent = message;
    banner.className = "banner error";
    banner.hidden = false;
  }

  function setText(id, value) {
    const element = $(id);

    if (element) {
      element.textContent = value;
    }
  }

  function populateProfile(user) {
    const username = user.username || "User";
    const email = user.email || "Email unavailable";
    const initial = username.charAt(0).toUpperCase();

    setText("welcome", `Welcome back, ${username}.`);
    setText("nav-username", username);
    setText("account-name", username);

    setText("profile-username", username);
    setText("profile-email", email);

    setText("detail-username", username);
    setText("detail-email", email);

    setText("avatar", initial);
    setText("profile-avatar", initial);
  }

  async function loadDashboard() {
    try {
      const response = await Api.dashboard();

      if (!response || !response.user) {
        throw new Error(
          "The server did not return your account information."
        );
      }

      populateProfile(response.user);
    } catch (error) {
      if (error.status === 401) {
        window.location.replace("/login.html?expired=1");
        return;
      }

      showError(
        error.message ||
        "Unable to load your account. Please refresh the page."
      );
    }
  }

  async function logout() {
    if (isLoggingOut) return;

    isLoggingOut = true;

    logoutButtons.forEach((button) => {
      button.disabled = true;
      button.setAttribute("aria-busy", "true");

      button.dataset.originalText = button.textContent;
      button.textContent = "Signing out…";
    });

    try {
      await Api.logout();

      window.location.replace("/login.html?loggedout=1");
    } catch (error) {
      if (error.status === 401) {
        window.location.replace("/login.html?expired=1");
        return;
      }

      showError(
        error.message ||
        "Unable to sign out. Please try again."
      );

      isLoggingOut = false;

      logoutButtons.forEach((button) => {
        button.disabled = false;
        button.removeAttribute("aria-busy");

        button.textContent =
          button.dataset.originalText || "Sign out";
      });
    }
  }

  logoutButtons.forEach((button) => {
    button.addEventListener("click", logout);
  });

  loadDashboard();
})();
