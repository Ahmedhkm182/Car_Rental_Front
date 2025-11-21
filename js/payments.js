/* js/payments.js */
(function (window) {
  window.Payments = window.Payments || {};
  window.Payments.SUCCESS_URL = "http://localhost:5500/payment-success.html";
  window.Payments.CANCEL_URL = "http://localhost:5500/payment-failed.html";
  window.Payments.createPaymentSession = function (reservationId) { if (!reservationId) return Promise.reject(new Error("reservationId required")); var payload = { reservationId: reservationId, successUrl: window.Payments.SUCCESS_URL, cancelUrl: window.Payments.CANCEL_URL }; return window.Api.fetch("/Payment/create-session", { method: "POST", body: payload }).then(function (res) { var checkoutUrl = (res && (res.checkoutUrl || res.url || res.redirectUrl)); if (!checkoutUrl) { return Promise.reject(new Error("No checkoutUrl returned from server")); } window.location.href = checkoutUrl; return true; }); };
})(window);
