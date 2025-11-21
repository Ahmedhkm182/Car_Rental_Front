/* js/api.js */
(function (window) {
  window.Api = window.Api || {};
  window.Api.BASE_API_URL = "https://localhost:44385/api";
  window.Api.TOKEN_KEY = "jwt_token";
  window.Api.getToken = function () { try { return localStorage.getItem(window.Api.TOKEN_KEY); } catch (e) { return null; } };
  window.Api.setToken = function (token) { try { localStorage.setItem(window.Api.TOKEN_KEY, token); } catch (e) {} };
  window.Api.clearToken = function () { try { localStorage.removeItem(window.Api.TOKEN_KEY); } catch (e) {} };
  window.Api.handleUnauthorized = function () { window.Api.clearToken(); window.location.href = "/login.html"; };
  window.Api.fetch = function (path, options) {
    options = options || {}; var method = options.method || "GET"; var headers = options.headers || {}; var body = options.body;
    var url = window.Api.BASE_API_URL + (path.charAt(0) === "/" ? path : ("/" + path));
    var token = window.Api.getToken(); if (token) { headers["Authorization"] = "Bearer " + token; }
    if (body && !(body instanceof FormData) && typeof body === "object") { body = JSON.stringify(body); headers["Content-Type"] = "application/json"; }
    var fetchOptions = { method: method, headers: headers, body: body };
    return fetch(url, fetchOptions).then(function (res) {
      if (res.status === 401) { window.Api.handleUnauthorized(); return Promise.reject({ status: 401, message: "Unauthorized" }); }
      return res.text().then(function (text) { if (!text) return null; try { return JSON.parse(text); } catch (e) { return text; } });
    });
  };
})(window);
