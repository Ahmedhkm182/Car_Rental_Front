/* pages/payments/payment-failed.js */
(function (window) {
  window.PaymentFailedPage = window.PaymentFailedPage || {};

  PaymentFailedPage.getQueryParam = function (param) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  PaymentFailedPage.init = function () {
    // Check authentication
    if (!window.Auth || !window.Auth.isAuthenticated || !window.Auth.isAuthenticated()) {
      window.location.href = "/pages/login/login.html";
      return;
    }

    var reservationId = PaymentFailedPage.getQueryParam("reservationId");
    var error = PaymentFailedPage.getQueryParam("error");

    if (!reservationId) {
      var errorRow = document.getElementById("error-row");
      var errorMessage = document.getElementById("error-message");
      errorRow.style.display = "flex";
      errorMessage.textContent = "Reservation ID not provided in URL";
      return;
    }

    // Display reservation ID
    document.getElementById("reservation-id").textContent = reservationId;

    // Display error if provided
    if (error) {
      var errorRow = document.getElementById("error-row");
      var errorMessage = document.getElementById("error-message");
      errorRow.style.display = "flex";
      errorMessage.textContent = decodeURIComponent(error);
    }
  };

  PaymentFailedPage.retryPayment = function () {
    var reservationId = PaymentFailedPage.getQueryParam("reservationId");
    if (!reservationId) {
      alert("Reservation ID not found");
      return;
    }

    var btn = event.target;
    btn.disabled = true;
    var originalText = btn.innerText;
    btn.innerText = "Processing...";

    window.Payments.createPaymentSession(reservationId)
      .then(function () {
        // Redirect happens automatically in createPaymentSession
      })
      .catch(function (err) {
        console.error("Failed to retry payment:", err);
        alert(err.message || "Failed to initiate payment. Please try again.");
        btn.disabled = false;
        btn.innerText = originalText;
      });
  };

  // Initialize on DOM load
  document.addEventListener("DOMContentLoaded", PaymentFailedPage.init);
})(window);
