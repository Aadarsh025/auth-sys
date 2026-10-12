(function () {
  const status = document.getElementById("entry-status");
  let redirected = false;

  function redirect(path) {
    if (redirected) return;
    redirected = true;
    window.location.replace(path);
  }

  const fallback = window.setTimeout(() => {
    if (!redirected) {
      if (status) status.textContent = "The session check is taking too long. Opening sign in…";
      redirect("/login.html");
    }
  }, 10000);

  Api.me()
    .then(() => {
      if (redirected) return;
      window.clearTimeout(fallback);
      if (status) status.textContent = "Session verified. Opening your dashboard…";
      redirect("/dashboard.html");
    })
    .catch(() => {
      if (redirected) return;
      window.clearTimeout(fallback);
      redirect("/login.html");
    });
})();