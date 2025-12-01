/* shared/api.js - API utility module */
(function (window) {
  window.Api = window.Api || {};

  // ================================
  //  CONFIG
  // ================================
  window.Api.BASE_API_URL = "https://localhost:44385/api";
  window.Api.TOKEN_KEY = "jwt_token";

  // ================================
  //  TOKEN HANDLING
  // ================================
  window.Api.getToken = function () {
    try { return localStorage.getItem(window.Api.TOKEN_KEY); }
    catch { return null; }
  };

  window.Api.setToken = function (token) {
    try { localStorage.setItem(window.Api.TOKEN_KEY, token); }
    catch { }
  };

  window.Api.clearToken = function () {
    try { localStorage.removeItem(window.Api.TOKEN_KEY); }
    catch { }
  };

  window.Api.handleUnauthorized = function () {
    window.Api.clearToken();
    window.location.href = "/pages/login/login.html";
  };

  // ================================
  //  PARSE ERROR RESPONSE
  // ================================
  function parseErrorResponse(status, text) {
    let data = null;

    try { data = text ? JSON.parse(text) : null; }
    catch { data = text; }

    // ASP.NET validation errors
    if (data && data.errors) {
      let messages = [];

      for (let key in data.errors) {
        messages.push(`${key}: ${data.errors[key].join(", ")}`);
      }

      return {
        status: status,
        message: messages.join("\n"),
        raw: data
      };
    }

    return {
      status: status,
      message: data?.message || text || "Request failed",
      raw: data
    };
  }

  // ================================
  //  NORMAL JSON FETCH
  // ================================
  window.Api.fetch = function (path, options) {
    options = options || {};
    let method = options.method || "GET";
    let headers = options.headers || {};
    let body = options.body;

    let url = window.Api.BASE_API_URL + (path.startsWith("/") ? path : "/" + path);
    let token = window.Api.getToken();

    if (token) headers["Authorization"] = "Bearer " + token;

    if (body && !(body instanceof FormData) && typeof body === "object") {
      body = JSON.stringify(body);
      headers["Content-Type"] = "application/json";
    }

    return fetch(url, { method, headers, body })
      .catch(err => {
        return Promise.reject({
          status: 0,
          message: "Failed to fetch: " + err.message,
          originalError: err
        });
      })
      .then(async res => {
        let text = await res.text();

        // Unauthorized
        if (res.status === 401) {
          window.Api.handleUnauthorized();
          return Promise.reject({ status: 401, message: "Unauthorized" });
        }

        // Normal error
        if (!res.ok) {
          return Promise.reject(parseErrorResponse(res.status, text));
        }

        // Success
        try { return text ? JSON.parse(text) : {}; }
        catch { return { raw: text }; }
      });
  };

  // ================================
  //  FORMDATA FETCH (FILE UPLOAD)
  // ================================
  window.Api.sendFormData = function (path, method, formData) {
    let url = window.Api.BASE_API_URL + (path.startsWith("/") ? path : "/" + path);
    let token = window.Api.getToken();
    let headers = {};

    if (token) headers["Authorization"] = "Bearer " + token;

    return fetch(url, { method, headers, body: formData })
      .catch(err => {
        return Promise.reject({
          status: 0,
          message: "Failed to fetch: " + err.message,
          originalError: err
        });
      })
      .then(async res => {
        let text = await res.text();

        if (res.status === 401) {
          window.Api.handleUnauthorized();
          return Promise.reject({ status: 401, message: "Unauthorized" });
        }

        if (!res.ok) {
          return Promise.reject(parseErrorResponse(res.status, text));
        }

        try { return text ? JSON.parse(text) : {}; }
        catch { return { raw: text }; }
      });
  };

})(window);
