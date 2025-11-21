/* shared/navbar.js - Navbar component */
(function (window) {
  window.Navbar = window.Navbar || {};

  window.Navbar.getCurrentPage = function () {
    var path = window.location.pathname;
    if (path.includes("login")) return "login";
    if (path.includes("register")) return "register";
    if (path.includes("cars")) return "cars";
    if (path.includes("dashboard")) return "dashboard";
    if (path.includes("reservations")) return "reservations";
    if (path.includes("notifications")) return "notifications";
    return "home";
  };

  window.Navbar.mount = function (containerId) {
    containerId = containerId || "navbar-root";
    var container = document.getElementById(containerId);
    if (!container) return;

    var isAuthenticated = window.Auth && window.Auth.isAuthenticated && window.Auth.isAuthenticated();
    var isAdmin = window.Auth && window.Auth.isAdmin && window.Auth.isAdmin();
    var currentPage = window.Navbar.getCurrentPage();

    var navHtml = `
      <nav class="navbar-container">
        <div class="navbar-content">
          <!-- Logo -->
          <div class="navbar-brand">
            <a href="/" class="navbar-logo">
              <span class="logo-text">CarRent</span>
            </a>
          </div>

          <!-- Desktop Menu -->
          <ul class="navbar-menu desktop-only">
            <li><a href="/" class="nav-link ${currentPage === "home" ? "active" : ""}">Home</a></li>
            <li><a href="/pages/cars/cars.html" class="nav-link ${currentPage === "cars" ? "active" : ""}">Cars</a></li>
            ${isAuthenticated ? `<li><a href="/pages/reservations/reservations.html" class="nav-link ${currentPage === "reservations" ? "active" : ""}">Reservations</a></li>` : ""}
            ${isAuthenticated ? `<li><a href="/pages/notifications/notifications.html" class="nav-link ${currentPage === "notifications" ? "active" : ""}">Notifications</a></li>` : ""}
            ${isAdmin ? `<li><a href="/pages/dashboard/dashboard.html" class="nav-link ${currentPage === "dashboard" ? "active" : ""}">Admin</a></li>` : ""}
          </ul>

          <!-- Right Section -->
          <div class="navbar-right">
            ${isAuthenticated ? `
              <a href="/pages/notifications/notifications.html" class="notif-icon">
                🔔
                <span id="notif-badge" class="notif-badge hidden">0</span>
              </a>
              <button id="logout-btn" class="nav-link logout-btn">Logout</button>
            ` : `
              <a href="/pages/login/login.html" class="nav-link">Login</a>
            `}
            <button id="mobile-toggle" class="mobile-toggle">☰</button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <ul id="mobile-menu" class="mobile-menu hidden">
          <li><a href="/" class="nav-link ${currentPage === "home" ? "active" : ""}">Home</a></li>
          <li><a href="/pages/cars/cars.html" class="nav-link ${currentPage === "cars" ? "active" : ""}">Cars</a></li>
          ${isAuthenticated ? `<li><a href="/pages/reservations/reservations.html" class="nav-link ${currentPage === "reservations" ? "active" : ""}">Reservations</a></li>` : ""}
          ${isAuthenticated ? `<li><a href="/pages/notifications/notifications.html" class="nav-link ${currentPage === "notifications" ? "active" : ""}">Notifications</a></li>` : ""}
          ${isAdmin ? `<li><a href="/pages/dashboard/dashboard.html" class="nav-link ${currentPage === "dashboard" ? "active" : ""}">Admin</a></li>` : ""}
        </ul>
      </nav>
    `;

    container.innerHTML = navHtml;

    // Mobile toggle
    var mobileToggle = document.getElementById("mobile-toggle");
    var mobileMenu = document.getElementById("mobile-menu");
    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener("click", function () {
        mobileMenu.classList.toggle("hidden");
      });
    }

    // Logout button
    var logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        if (window.Auth && window.Auth.clearToken) {
          window.Auth.clearToken();
        }
        window.location.href = "/pages/login/login.html";
      });
    }
  };

  window.Navbar.updateNotificationBadge = function (count) {
    var badge = document.getElementById("notif-badge");
    if (!badge) return;
    if (count > 0) {
      badge.innerText = String(count);
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  };

  // Auto-mount on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", function () {
    window.Navbar.mount("navbar-root");
  });
})(window);
