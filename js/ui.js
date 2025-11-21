/* js/ui.js */
(function (window) {
  window.UI = window.UI || {};

  // Mount a modern responsive navbar using Tailwind classes
  window.UI.mountNavbar = function () {
    document.documentElement.setAttribute("data-theme", "dark");

    document.addEventListener("DOMContentLoaded", function () {
      var root = document.getElementById("nav-root");
      if (!root) return;
      var isAdmin = (window.Auth && window.Auth.isAdmin && window.Auth.isAdmin());
      var token = (window.Auth && window.Auth.getToken) ? window.Auth.getToken() : null;

      var html = `
      <header class="site-nav fixed w-full z-30 bg-white/60 backdrop-blur-sm border-b border-gray-100 dark:bg-[#031225]/60 dark:border-gray-800">
        <div class="container-max mx-auto px-4">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-4">
              <a href="/index.html" class="flex items-center gap-3">
                <img src="/assets/logo.svg" alt="CarRent" class="h-8 w-auto" />
                <span class="font-semibold text-lg">CarRent</span>
              </a>
              <nav class="hidden md:flex items-center gap-3">
                <a href="/cars.html" class="text-sm text-slate-700 dark:text-slate-200 hover:text-teal-600">Cars</a>
                <a href="/reservations.html" class="text-sm text-slate-700 dark:text-slate-200 hover:text-teal-600">Reservations</a>
                <a href="/notifications.html" class="text-sm text-slate-700 dark:text-slate-200 hover:text-teal-600">Notifications</a>
                ${isAdmin ? `<a href="/dashboard.html" class="text-sm text-slate-700 dark:text-slate-200 hover:text-teal-600">Admin</a>` : ''}
              </nav>
            </div>
            <div class="flex items-center gap-3">
             
              <a href="/notifications.html" class="relative inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800">
                <span aria-hidden>🔔</span>
                <span id="notif-count" class="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full px-1 hidden">0</span>
              </a>
              <div id="auth-area"></div>
              <button id="mobile-menu-toggle" class="md:hidden p-2">☰</button>
            </div>
          </div>
        </div>
        <div id="mobile-menu" class="md:hidden border-t border-gray-100 dark:border-gray-800 hidden">
          <div class="px-4 py-3 space-y-2">
            <a href="/cars.html" class="block">Cars</a>
            <a href="/reservations.html" class="block">Reservations</a>
            <a href="/notifications.html" class="block">Notifications</a>
            ${isAdmin ? `<a href="/dashboard.html" class="block">Admin</a>` : ''}
          </div>
        </div>
      </header>`;

      root.innerHTML = html;

      var authArea = document.getElementById("auth-area");
      if (!token) {
        authArea.innerHTML = '<a href="/login.html" class="text-sm text-slate-700 dark:text-slate-200">Login</a>';
      } else {
        authArea.innerHTML = '<button id="logout-btn" class="text-sm text-slate-700 dark:text-slate-200">Logout</button>';
        var btn = document.getElementById("logout-btn");
        btn.addEventListener("click", function () { if (window.Auth && window.Auth.clearToken) window.Auth.clearToken(); window.location.href = "/login.html"; });
      }

     
      var mobileToggle = document.getElementById("mobile-menu-toggle");
      var mobileMenu = document.getElementById("mobile-menu");
      mobileToggle.addEventListener("click", function () { if (mobileMenu.classList.contains('hidden')) mobileMenu.classList.remove('hidden'); else mobileMenu.classList.add('hidden'); });

      window.UI.refreshNotifCount();
    });
  };

  window.UI.refreshNotifCount = function () {
    if (!window.Notifications || !window.Notifications.fetchNotifications) return;
    window.Notifications.fetchNotifications().then(function (items) {
      var count = 0; if (items && items.length) { for (var i = 0; i < items.length; i++) { if (!items[i].read) count++; } }
      var badge = document.getElementById("notif-count"); if (!badge) return; if (count > 0) { badge.classList.remove('hidden'); badge.innerText = String(count); } else { badge.classList.add('hidden'); }
    }).catch(function () {});
  };

})(window);
