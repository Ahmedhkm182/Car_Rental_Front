/* shared/api.js - API utility module */
(function (window) {
  window.Api = window.Api || {};
  window.Api.BASE_API_URL = "https://localhost:44385/api";
  window.Api.TOKEN_KEY = "jwt_token";

  window.Api.getToken = function () {
    try {
      return localStorage.getItem(window.Api.TOKEN_KEY);
    } catch (e) {
      return null;
    }
  };

  window.Api.setToken = function (token) {
    try {
      localStorage.setItem(window.Api.TOKEN_KEY, token);
    } catch (e) {}
  };

  window.Api.clearToken = function () {
    try {
      localStorage.removeItem(window.Api.TOKEN_KEY);
    } catch (e) {}
  };

  window.Api.handleUnauthorized = function () {
    window.Api.clearToken();
    window.location.href = "/pages/login/login.html";
  };

  window.Api.fetch = function (path, options) {
    options = options || {};
    var method = options.method || "GET";
    var headers = options.headers || {};
    var body = options.body;

    var url = window.Api.BASE_API_URL + (path.charAt(0) === "/" ? path : ("/" + path));
    var token = window.Api.getToken();

    if (token) {
      headers["Authorization"] = "Bearer " + token;
    }

    if (body && !(body instanceof FormData) && typeof body === "object") {
      body = JSON.stringify(body);
      headers["Content-Type"] = "application/json";
    }

    var fetchOptions = { method: method, headers: headers, body: body };

    return fetch(url, fetchOptions).catch(function (err) {
      console.error("Fetch error for " + url, err);
      return Promise.reject({
        status: 0,
        message: "Failed to fetch: " + err.message + ". Check if backend is running at " + window.Api.BASE_API_URL,
        originalError: err
      });
    }).then(function (res) {
      if (res.status === 401) {
        window.Api.handleUnauthorized();
        return Promise.reject({ status: 401, message: "Unauthorized" });
      }
      if (!res.ok) {
        return res.text().then(function (text) {
          return Promise.reject({
            status: res.status,
            message: text || "HTTP " + res.status + " error",
            response: text
          });
        });
      }
      return res.text().then(function (text) {
        if (!text) return null;
        try {
          return JSON.parse(text);
        } catch (e) {
          return text;
        }
      });
    });
  };

  window.Api.sendFormData = function (path, method, formData) {
    var url = window.Api.BASE_API_URL + (path.charAt(0) === "/" ? path : ("/" + path));
    var token = window.Api.getToken();
    var headers = {};

    if (token) {
      headers["Authorization"] = "Bearer " + token;
    }

    var fetchOptions = { method: method, headers: headers, body: formData };

    return fetch(url, fetchOptions).catch(function (err) {
      console.error("Fetch error for " + url, err);
      return Promise.reject({
        status: 0,
        message: "Failed to fetch: " + err.message + ". Check if backend is running at " + window.Api.BASE_API_URL,
        originalError: err
      });
    }).then(function (res) {
      if (res.status === 401) {
        window.Api.handleUnauthorized();
        return Promise.reject({ status: 401, message: "Unauthorized" });
      }
      if (!res.ok) {
        return res.text().then(function (text) {
          return Promise.reject({
            status: res.status,
            message: text || "HTTP " + res.status + " error",
            response: text
          });
        });
      }
      return res.text().then(function (text) {
        if (!text) return null;
        try {
          return JSON.parse(text);
        } catch (e) {
          return text;
        }
      });
    });
  };
})(window);
