/* js/notifications.js */
(function (window) {
  window.Notifications = window.Notifications || {};
  var POLL_MS = 10000; var pollHandle = null;
  window.Notifications.fetchNotifications = function () { return window.Api.fetch("/Notification/my", { method: "GET" }); };
  window.Notifications.markRead = function (id) { return window.Api.fetch("/Notification/mark-read/" + encodeURIComponent(id), { method: "PUT" }); };
  window.Notifications.markAllRead = function () { return window.Api.fetch("/Notification/mark-all-read", { method: "PUT" }); };
  window.Notifications.startPolling = function (onUpdate) { if (pollHandle) window.Notifications.stopPolling(); function tick() { window.Notifications.fetchNotifications().then(function (items) { try { if (typeof onUpdate === "function") onUpdate(items || []); } catch (e) {} }).catch(function () {}); } tick(); pollHandle = setInterval(tick, POLL_MS); };
  window.Notifications.stopPolling = function () { if (pollHandle) { clearInterval(pollHandle); pollHandle = null; } };
})(window);
