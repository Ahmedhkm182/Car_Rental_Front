/* pages/payments/payment-success.js */
(function (window) {
  window.PaymentSuccessPage = window.PaymentSuccessPage || {};

  PaymentSuccessPage.getQueryParam = function (param) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  // NEW: verify using session_id
  PaymentSuccessPage.verifySession = function (sessionId) {
    return window.Api.fetch("/payment/session/" + encodeURIComponent(sessionId), {
      method: "GET"
    });
  };

  PaymentSuccessPage.updateUI = function (data) {
    var reservationIdLabel = document.getElementById("reservation-id");
    var statusLabel = document.getElementById("payment-status");
    var errorDiv = document.getElementById("payment-error");
    var errorMessage = document.getElementById("error-message");
    var card = document.querySelector(".payment-card");
    var icon = document.querySelector(".payment-status-icon");
    var title = document.querySelector(".payment-title");
    var subtitle = document.querySelector(".payment-subtitle");

    reservationIdLabel.textContent = data.reservationId;

    if (data.status === "Paid" || data.status === "Completed") {
      card.classList.add("payment-status-success");
      icon.className = "payment-status-icon success-icon";
      title.textContent = "Payment Successful!";
      subtitle.textContent = "Your reservation has been confirmed";
      title.style.color = "#10b981";
      statusLabel.textContent = "Completed";
      statusLabel.className = "detail-value success";
      errorDiv.classList.add("hidden");
    }
    else if (data.status === "Pending") {
      card.classList.add("payment-status-pending");
      icon.className = "payment-status-icon pending-icon";
      title.textContent = "Payment Processing";
      subtitle.textContent = "Please wait, processing payment...";
      statusLabel.textContent = "Pending";
      statusLabel.className = "detail-value pending";
    }
    else {
      card.classList.add("payment-status-failed");
      icon.className = "payment-status-icon failed-icon";
      title.textContent = "Payment Failed";
      subtitle.textContent = "Your payment could not be completed";
      title.style.color = "#ef4444";
      statusLabel.textContent = "Failed";
      statusLabel.className = "detail-value failed";
      errorDiv.classList.remove("hidden");
      errorMessage.textContent = data.message || "Payment failed";
    }
  };

  PaymentSuccessPage.init = function () {
    // require login
    if (!window.Auth || !window.Auth.isAuthenticated || !window.Auth.isAuthenticated()) {
      window.location.href = "/pages/login/login.html";
      return;
    }

    var sessionId = PaymentSuccessPage.getQueryParam("session_id");

    if (!sessionId) {
      var errorDiv = document.getElementById("payment-error");
      var errorMessage = document.getElementById("error-message");
      errorDiv.classList.remove("hidden");
      errorMessage.textContent = "Missing session_id in URL";
      return;
    }

    PaymentSuccessPage.verifySession(sessionId)
      .then(function (response) {
        PaymentSuccessPage.updateUI(response);
      })
      .catch(function (err) {
        console.error("Payment verification failed:", err);

        var errorDiv = document.getElementById("payment-error");
        var errorMessage = document.getElementById("error-message");
        errorDiv.classList.remove("hidden");
        errorMessage.textContent = "Failed to verify payment";
      });
  };

  document.addEventListener("DOMContentLoaded", PaymentSuccessPage.init);

})(window);
