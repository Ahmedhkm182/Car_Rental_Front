/* shared/auth.js - Authentication utility module */
(function (window) {
  window.Auth = window.Auth || {};
  var ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
  var TOKEN_KEY = "jwt_token";

  window.Auth.setToken = function (token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) { }
    if (window.Api && window.Api.setToken) window.Api.setToken(token);
  };

  window.Auth.getToken = function () {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      return null;
    }
  };

  window.Auth.clearToken = function () {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) { }
    if (window.Api && window.Api.clearToken) window.Api.clearToken();
  };

  window.Auth.decodeJwt = function (token) {
    if (!token) return null;
    try {
      var parts = token.split(".");
      if (parts.length < 2) return null;
      var payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      var json = decodeURIComponent(escape(window.atob(payload)));
      return JSON.parse(json);
    } catch (e) {
      console.error("Failed to decode JWT", e);
      return null;
    }
  };

  window.Auth.isAdmin = function () {
    var user = window.Auth.getCurrentUser();
    if (!user) return false;
    var role = user[ROLE_CLAIM] || user.role || user.roles;
    if (Array.isArray(role)) return role.indexOf("Admin") !== -1;
    return role === "Admin";
  };

  window.Auth.login = function (email, password) {
    var body = { email: email, password: password };
    return window.Api.fetch("/Auth/login", { method: "POST", body: body }).then(function (res) {
      var token = (res && (res.token || res.accessToken || (res.data && res.data.token))) || null;
      if (!token) {
        if (typeof res === "string" && res.length > 10) token = res;
      }
      if (!token) {
        return Promise.reject(new Error("Login response did not provide a token. Response: " + JSON.stringify(res)));
      }
      window.Auth.setToken(token);
      return { token: token, raw: res };
    }).catch(function (err) {
      // Re-throw with detailed message
      if (err.message) {
        throw err;
      }
      throw new Error("Login failed: " + JSON.stringify(err));
    });
  };

  window.Auth.register = function (fullName, email, password) {
    return window.Api.fetch("/Auth/register", {
      method: "POST",
      body: {
        fullName: fullName,
        email: email,
        password: password
      }
    });
  };


  window.Auth.getCurrentUser = function () {
    var token = window.Auth.getToken();
    if (!token) return null;
    return window.Auth.decodeJwt(token);
  };

  window.Auth.isAuthenticated = function () {
    return window.Auth.getToken() !== null;
  };

  window.Auth.redirectIfNotAuthenticated = function () {
    if (!window.Auth.isAuthenticated()) {
      window.location.href = "/pages/login/login.html";
    }
  };

  window.Auth.redirectIfNotAdmin = function () {
    if (!window.Auth.isAdmin()) {
      window.location.href = "/index.html";
    }
  };
})(window);
