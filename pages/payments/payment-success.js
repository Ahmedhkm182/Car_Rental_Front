/* pages/payments/payment-success.js */
(function (window) {
  window.PaymentSuccessPage = window.PaymentSuccessPage || {};

  PaymentSuccessPage.getQueryParam = function (param) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  PaymentSuccessPage.verifyPayment = function (reservationId) {
    var detailsDiv = document.getElementById("payment-details");
    var statusDiv = document.getElementById("payment-status");
    var errorDiv = document.getElementById("payment-error");
    var errorMessage = document.getElementById("error-message");
    var statusMessage = document.getElementById("status-message");

    // Update reservation ID display
    document.getElementById("reservation-id").textContent = reservationId;

    window.Payments.verifyReservationPayment(reservationId)
      .then(function (response) {
        // Handle different payment states
        if (response.status === "completed" || response.status === "Completed") {
          PaymentSuccessPage.showSuccessState(response);
        } else if (response.status === "pending" || response.status === "Pending") {
          PaymentSuccessPage.showPendingState(response);
        } else if (response.status === "failed" || response.status === "Failed") {
          PaymentSuccessPage.showFailedState(response);
        } else {
          // Unknown status
          statusDiv.textContent = response.status || "Unknown";
          statusDiv.className = "detail-value";
        }
      })
      .catch(function (err) {
        console.error("Verification error:", err);
        errorDiv.classList.remove("hidden");
        errorMessage.textContent = err.message || "Failed to verify payment status";
        statusMessage.textContent = "Unable to verify payment status";
      });
  };

  PaymentSuccessPage.showSuccessState = function (response) {
    var card = document.querySelector(".payment-card");
    var icon = document.querySelector(".payment-status-icon");
    var title = document.querySelector(".payment-title");
    var subtitle = document.querySelector(".payment-subtitle");
    var statusDiv = document.getElementById("payment-status");
    var errorDiv = document.getElementById("payment-error");

    // Update UI for success
    card.classList.add("payment-status-success");
    icon.className = "payment-status-icon success-icon";
    title.textContent = "Payment Successful!";
    title.style.color = "#10b981";
    subtitle.textContent = "Your reservation has been confirmed";
    statusDiv.textContent = "Completed";
    statusDiv.className = "detail-value success";
    errorDiv.classList.add("hidden");
  };

  PaymentSuccessPage.showPendingState = function (response) {
    var card = document.querySelector(".payment-card");
    var icon = document.querySelector(".payment-status-icon");
    var title = document.querySelector(".payment-title");
    var subtitle = document.querySelector(".payment-subtitle");
    var statusDiv = document.getElementById("payment-status");

    // Update UI for pending
    card.classList.add("payment-status-pending");
    icon.className = "payment-status-icon pending-icon";
    icon.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    `;
    title.textContent = "Payment Processing";
    title.style.color = "#3b82f6";
    subtitle.textContent = "Your payment is being processed. This may take a few minutes.";
    statusDiv.textContent = "Pending";
    statusDiv.className = "detail-value pending";
  };

  PaymentSuccessPage.showFailedState = function (response) {
    var card = document.querySelector(".payment-card");
    var icon = document.querySelector(".payment-status-icon");
    var title = document.querySelector(".payment-title");
    var subtitle = document.querySelector(".payment-subtitle");
    var statusDiv = document.getElementById("payment-status");
    var errorDiv = document.getElementById("payment-error");
    var errorMessage = document.getElementById("error-message");

    // Update UI for failed
    card.classList.add("payment-status-failed");
    icon.className = "payment-status-icon failed-icon";
    title.textContent = "Payment Failed";
    title.style.color = "#ef4444";
    subtitle.textContent = "We couldn't complete your payment";
    statusDiv.textContent = "Failed";
    statusDiv.className = "detail-value failed";
    errorDiv.classList.remove("hidden");
    errorMessage.textContent = response.message || "Payment processing failed. Please try again.";
  };

  PaymentSuccessPage.init = function () {
    // Check authentication
    if (!window.Auth || !window.Auth.isAuthenticated || !window.Auth.isAuthenticated()) {
      window.location.href = "/pages/login/login.html";
      return;
    }

    var reservationId = PaymentSuccessPage.getQueryParam("reservationId");
    if (!reservationId) {
      var errorDiv = document.getElementById("payment-error");
      var errorMessage = document.getElementById("error-message");
      errorDiv.classList.remove("hidden");
      errorMessage.textContent = "Reservation ID not provided in URL";
      return;
    }

    PaymentSuccessPage.verifyPayment(reservationId);
  };

  // Initialize on DOM load
  document.addEventListener("DOMContentLoaded", PaymentSuccessPage.init);
})(window);
