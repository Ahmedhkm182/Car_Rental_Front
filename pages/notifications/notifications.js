/* pages/notifications/notifications.js */
(function (window) {
  window.NotificationsPage = window.NotificationsPage || {};

  var pollInterval = null;
  const POLL_MS = 10000;

  // API Functions
  NotificationsPage.fetchNotifications = function () {
    return window.Api.fetch("/Notification/my", { method: "GET" });
  };

  NotificationsPage.markRead = function (id) {
    return window.Api.fetch("/Notification/mark-read/" + encodeURIComponent(id), { method: "PUT" });
  };

  NotificationsPage.markAllRead = function () {
    return window.Api.fetch("/Notification/mark-all-read", { method: "PUT" });
  };

  // Render Functions
  NotificationsPage.renderNotifications = function (notifications) {
    var container = document.getElementById("notifications-list");
    if (!container) return;

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

      var createdAt = notif.createdAt ? new Date(notif.createdAt).toLocaleString() : "Just now";

      var html = `
        <div class="notif-content">
          <div class="notif-title-text">${escapeHtml(notif.title || "Notification")}</div>
          <div class="notif-message">${escapeHtml(notif.message || "")}</div>
          <div class="notif-time">${createdAt}</div>
        </div>
        <div class="notif-actions">
          <span class="notif-status ${notif.read ? "read" : "unread"}">${notif.read ? "Read" : "Unread"}</span>
          ${!notif.read ? `<button class="btn btn-primary btn-sm" onclick="window.NotificationsPage.markAsRead('${notif.id}')">Mark Read</button>` : ""}
        </div>
      `;

      item.innerHTML = html;
      container.appendChild(item);
    });
  };

  NotificationsPage.markAsRead = function (id) {
    NotificationsPage.markRead(id)
      .then(function () {
        NotificationsPage.loadNotifications();
        NotificationsPage.updateNotificationBadge();
      })
      .catch(function (err) {
        alert("Failed to mark notification as read");
      });
  };

  NotificationsPage.loadNotifications = function () {
    var container = document.getElementById("notifications-list");
    if (!container) return;

    container.innerHTML = '<div class="loading-spinner"></div>';

    NotificationsPage.fetchNotifications()
      .then(function (notifications) {
        NotificationsPage.renderNotifications(notifications || []);
      })
      .catch(function (err) {
        container.innerHTML = '<div class="notif-empty"><p style="color: #ef4444;">Failed to load notifications</p></div>';
      });
  };

  NotificationsPage.updateNotificationBadge = function () {
    NotificationsPage.fetchNotifications()
      .then(function (notifications) {
        if (!window.Navbar || !window.Navbar.updateNotificationBadge) return;
        var unreadCount = 0;
        if (notifications && Array.isArray(notifications)) {
          notifications.forEach(function (n) {
            if (!n.read) unreadCount++;
          });
        }
        window.Navbar.updateNotificationBadge(unreadCount);
      })
      .catch(function () {});
  };

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

  NotificationsPage.init = function () {
    // Check authentication
    if (!window.Auth || !window.Auth.isAuthenticated || !window.Auth.isAuthenticated()) {
      window.location.href = "/pages/login/login.html";
      return;
    }

    // Load notifications
    NotificationsPage.loadNotifications();
    NotificationsPage.updateNotificationBadge();

    // Mark all as read button
    var markAllBtn = document.getElementById("mark-all-btn");
    if (markAllBtn) {
      markAllBtn.addEventListener("click", function () {
        markAllBtn.disabled = true;
        var originalText = markAllBtn.innerText;
        markAllBtn.innerText = "Marking...";

        NotificationsPage.markAllRead()
          .then(function () {
            NotificationsPage.loadNotifications();
            NotificationsPage.updateNotificationBadge();
            markAllBtn.disabled = false;
            markAllBtn.innerText = originalText;
          })
          .catch(function () {
            alert("Failed to mark all as read");
            markAllBtn.disabled = false;
            markAllBtn.innerText = originalText;
          });
      });
    }

    // Start polling
    NotificationsPage.startPolling();
  };

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Cleanup on page unload
  window.addEventListener("beforeunload", function () {
    NotificationsPage.stopPolling();
  });

  // Initialize on DOM load
  document.addEventListener("DOMContentLoaded", NotificationsPage.init);
})(window);
