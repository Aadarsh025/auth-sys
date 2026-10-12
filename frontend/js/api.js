(function () {
  "use strict";

  const API_BASE_URL =
    window.location.port === "5500"
      ? "http://localhost:5000/api"
      : "/api";

  async function request(endpoint, options = {}) {
    const { body, headers = {}, ...rest } = options;
    let response;

    try {
      response = await fetch(
        `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`,
        {
          ...rest,
          credentials: "include",
          headers: {
            Accept: "application/json",
            ...(body !== undefined
              ? { "Content-Type": "application/json" }
              : {}),
            ...headers,
          },
          ...(body !== undefined ? { body } : {}),
        }
      );
    } catch (cause) {
      const error = new Error(
        "Unable to connect to Gatehouse. Check that the backend is running."
      );
      error.cause = cause;
      throw error;
    }

    const contentType = response.headers.get("content-type") || "";
    let data = null;

    if (contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        throw new Error("The server returned invalid JSON.");
      }
    } else {
      const text = await response.text();

      if (!response.ok) {
        const error = new Error(
          `Request failed (${response.status}). Check the API URL and route.`
        );
        error.status = response.status;
        throw error;
      }

      if (text.trim()) {
        throw new Error("The server returned an unexpected response format.");
      }
    }

    if (!response.ok) {
      const error = new Error(
        data?.message || "Request failed. Please try again."
      );
      error.status = response.status;
      error.errors = data?.errors || null;
      error.data = data;
      throw error;
    }

    return data;
  }

  window.Api = Object.freeze({
    register(payload) {
      return request("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    login(payload) {
      return request("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    me() {
      return request("/auth/me");
    },

    dashboard() {
      return request("/dashboard");
    },

    logout() {
      return request("/auth/logout", { method: "POST" });
    },
  });
})();