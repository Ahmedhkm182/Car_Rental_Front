/* pages/notifications/notifications.js */
(function (window) {
  window.NotificationsPage = window.NotificationsPage || {};

  var pollInterval = null;
  const POLL_MS = 10000;

  /* ================================
     📌 API FUNCTIONS
  ================================= */

  NotificationsPage.fetchNotifications = function () {
    return window.Api.fetch("/Notification/my", { method: "GET" });
  };

  NotificationsPage.markRead = function (id) {
    return window.Api.fetch("/Notification/mark-read/" + encodeURIComponent(id), {
      method: "PUT"
    });
  };

  NotificationsPage.markAllRead = function () {
    return window.Api.fetch("/Notification/mark-all-read", {
      method: "PUT"
    });
  };
  NotificationsPage.fetchPreferences = function () {
    return window.Api.fetch("/Notification/preferences", { method: "GET" });
  };

  NotificationsPage.updatePreferences = function (prefs) {
    return window.Api.fetch("/Notification/preferences", {
      method: "PUT",
      body: prefs
    });
  };


  /* ================================
     📌 RENDER FUNCTIONS
  ================================= */

  NotificationsPage.renderNotifications = function (notifications) {
    console.log("🎨 Rendering Notifications...", notifications);
    var container = document.getElementById("notifications-list");
    console.log("📦 Render Container:", container);
    if (!container) {
      console.log("❌ Container NOT FOUND — STOPPING RENDER");
      return;
    }

    container.innerHTML = "";

    if (!notifications || notifications.length === 0) {
      container.innerHTML = `
        <div class="notif-empty">
          <div class="notif-empty-icon">📭</div>
          <p class="notif-empty-text">No notifications yet</p>
        </div>
      `;
      return;
    }

    notifications.forEach(function (notif) {
      var item = document.createElement("div");
      item.className = "notif-item " + (notif.read ? "read" : "unread");

      var createdAt = notif.createdAt
        ? new Date(notif.createdAt).toLocaleString()
        : "Just now";

      var html = `
        <div class="notif-content">
          <div class="notif-title-text">${escapeHtml(notif.title || "Notification")}</div>
          <div class="notif-message">${escapeHtml(notif.message || "")}</div>
          <div class="notif-time">${createdAt}</div>
        </div>

        <div class="notif-actions">
          <span class="notif-status ${notif.read ? "read" : "unread"}">
            ${notif.read ? "Read" : "Unread"}
          </span>

          ${!notif.read
          ? `<button class="btn btn-primary btn-sm"
                    onclick="window.NotificationsPage.markAsRead('${notif.id}')">
                    Mark Read
                 </button>`
          : ""
        }
        </div>
      `;

      item.innerHTML = html;
      container.appendChild(item);
    });
  };

  /* ================================
     📌 MARK AS READ (single)
  ================================= */

  NotificationsPage.markAsRead = function (id) {
    NotificationsPage.markRead(id)
      .then(function () {

        // Toast message
        if (window.UI && UI.showToast)
          UI.showToast("Notification marked as read", "success");

        // Reload notifications visually
        return NotificationsPage.loadNotifications();
      })
      .then(function () {

        // Update navbar badge
        NotificationsPage.updateNotificationBadge();
      })
      .catch(function (err) {
        console.error("Mark read error:", err);

        if (window.UI && UI.showToast)
          UI.showToast("Failed to mark notification as read", "error");
      });
  };

  /* ================================
     📌 LOAD NOTIFICATIONS
  ================================= */

  NotificationsPage.loadNotifications = function () {
    var container = document.getElementById("notifications-list");
    if (!container) return;

    container.innerHTML = `<div class="loading-spinner"></div>`;

    NotificationsPage.fetchNotifications()
      .then(function (notifications) {
        console.log("📩 API Returned Notifications:", notifications);

        var container = document.getElementById("notifications-list");
        console.log("🧩 Container Found:", container);

        NotificationsPage.renderNotifications(notifications || []);
      })

      .catch(function () {
        container.innerHTML = `<p style="color:#ef4444;">Failed to load notifications</p>`;
      });
  };

  /* ================================
     📌 UPDATE NAVBAR BADGE
  ================================= */

  NotificationsPage.updateNotificationBadge = function () {
    NotificationsPage.fetchNotifications()
      .then(function (notifications) {
        if (!window.Navbar || !window.Navbar.updateNotificationBadge) return;

        var unread = notifications.filter(n => !n.read).length;
        window.Navbar.updateNotificationBadge(unread);
      })
      .catch(function () { });
  };

  /* ================================
     📌 MARK ALL READ
  ================================= */

  NotificationsPage.handleMarkAll = function () {
    var btn = document.getElementById("mark-all-btn");
    if (!btn) return;

    btn.disabled = true;
    var oldText = btn.innerText;
    btn.innerText = "Marking...";

    NotificationsPage.markAllRead()
      .then(function () {
        if (window.UI && UI.showToast)
          UI.showToast("All notifications marked as read", "success");

        return NotificationsPage.loadNotifications();
      })
      .then(function () {
        NotificationsPage.updateNotificationBadge();
        btn.disabled = false;
        btn.innerText = oldText;
      })
      .catch(function () {
        if (window.UI && UI.showToast)
          UI.showToast("Failed to mark all as read", "error");

        btn.disabled = false;
        btn.innerText = oldText;
      });
  };


  /* ================================
     📌 POLLING (auto refresh)
  ================================= */

  NotificationsPage.startPolling = function () {
    NotificationsPage.stopPolling();
    pollInterval = setInterval(function () {
      NotificationsPage.loadNotifications();
      NotificationsPage.updateNotificationBadge();
    }, POLL_MS);
  };

  NotificationsPage.stopPolling = function () {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  };

  function waitForNavbarReady(callback) {
    const badge = document.getElementById("notif-badge");
    if (badge) {
      callback(); // navbar جاهز
    } else {
      // لسه متحملش → استنى ورجع تاني
      setTimeout(() => waitForNavbarReady(callback), 30);
    }
  }

  NotificationsPage.loadPreferences = function () {
    NotificationsPage.fetchPreferences()
      .then(function (prefs) {
        console.log("Loaded Prefs:", prefs);

        document.getElementById("pref-created").checked = prefs.emailOnReservationCreated;
        document.getElementById("pref-updated").checked = prefs.emailOnReservationUpdated;
        document.getElementById("pref-payment-success").checked = prefs.emailOnPaymentSuccess;
        document.getElementById("pref-payment-failed").checked = prefs.emailOnPaymentFailed;
      })
      .catch(function () {
        UI.showToast("Failed to load preferences", "error");
      });
  };

  /* ================================
  📌 INIT
 ================================= */
  NotificationsPage.init = function () {


    // 🛑 التحقق من تسجيل الدخول
    if (!window.Auth || !window.Auth.isAuthenticated || !window.Auth.isAuthenticated()) {
      window.location.href = "/pages/login/login.html";
      return;
    }

    NotificationsPage.loadPreferences();

    // 🟢 تحميل الإشعارات
    NotificationsPage.loadNotifications();
    NotificationsPage.updateNotificationBadge();

    // 🟢 زر Mark All Read
    var markAllBtn = document.getElementById("mark-all-btn");
    if (markAllBtn) {
      markAllBtn.addEventListener("click", NotificationsPage.handleMarkAll);
    }

    // 🟢 تشغيل الـ polling كل 10 ثواني
    NotificationsPage.startPolling();

    console.log("🚀 NotificationsPage.init START");

    console.log("🔍 Checking notif-badge:", document.getElementById("notif-badge"));
    console.log("🔍 Checking notifications-list:", document.getElementById("notifications-list"));


    var saveBtn = document.getElementById("save-prefs-btn");

    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        var prefs = {
          emailOnReservationCreated: document.getElementById("pref-created").checked,
          emailOnReservationUpdated: document.getElementById("pref-updated").checked,
          emailOnPaymentSuccess: document.getElementById("pref-payment-success").checked,
          emailOnPaymentFailed: document.getElementById("pref-payment-failed").checked
        };

        NotificationsPage.updatePreferences(prefs)
          .then(function () {
            UI.showToast("Preferences updated successfully", "success");
          })
          .catch(function () {
            UI.showToast("Failed to update preferences", "error");
          });
      });
    }

  };


  /* ================================ */

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /* ================================ */

  window.addEventListener("beforeunload", NotificationsPage.stopPolling);
  if (window.__NOTIF_INIT__) return;
  window.__NOTIF_INIT__ = true;

  // document.addEventListener("DOMContentLoaded", NotificationsPage.init);
  window.addEventListener("load", function () {
    NotificationsPage.init();
  });

})(window);
