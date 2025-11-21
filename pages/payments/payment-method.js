/* pages/payments/payment-method.js */
(function (window) {
  window.PaymentMethodPage = window.PaymentMethodPage || {};

  var currentCarId = null;
  var currentCar = null;

  PaymentMethodPage.getQueryParam = function (param) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  PaymentMethodPage.getCarDetails = function (carId) {
    return window.Api.fetch("/Car/" + encodeURIComponent(carId), { method: "GET" });
  };

  PaymentMethodPage.loadCarInfo = function (carId) {
    var carInfoDiv = document.getElementById("car-info");
    if (!carInfoDiv) return;

    PaymentMethodPage.getCarDetails(carId)
      .then(function (car) {
        currentCar = car;
        var html = `
          <div class="car-details">
            <div class="car-detail-item">
              <span class="car-detail-label">Car:</span>
              <span class="car-detail-value">${escapeHtml((car.make || "") + " " + (car.model || ""))}</span>
            </div>
            <div class="car-detail-item">
              <span class="car-detail-label">Year:</span>
              <span class="car-detail-value">${car.year || "N/A"}</span>
            </div>
            <div class="car-detail-item">
              <span class="car-detail-label">License Plate:</span>
              <span class="car-detail-value">${car.licensePlate || "N/A"}</span>
            </div>
            <div class="car-detail-item">
              <span class="car-detail-label">Status:</span>
              <span class="car-detail-value">${car.status || "N/A"}</span>
            </div>
            <div class="car-price-section">
              <span class="car-price-label">Price Per Day:</span>
              <span class="car-price-value">$${Number(car.pricePerDay || 0).toFixed(2)}</span>
            </div>
          </div>
        `;
        carInfoDiv.innerHTML = html;
      })
      .catch(function (err) {
        console.error("Failed to load car details:", err);
        carInfoDiv.innerHTML = '<div style="color: #ef4444;">Failed to load car details</div>';
      });
  };

  PaymentMethodPage.selectPaymentMethod = function (method) {
    if (!currentCarId) {
      alert("Car ID not found");
      return;
    }

    // Handle different payment methods
    switch (method) {
      case 'credit-card':
        // Redirect to credit card form
        window.location.href = "/pages/payments/payment-credit-card.html?carId=" + encodeURIComponent(currentCarId);
        break;

      case 'stripe':
        // Create a reservation first, then initiate payment
        PaymentMethodPage.initiateStripePayment();
        break;

      case 'bank-transfer':
        // Redirect to bank transfer instructions
        window.location.href = "/pages/payments/payment-bank-transfer.html?carId=" + encodeURIComponent(currentCarId);
        break;

      default:
        alert("Unknown payment method");
    }
  };

  PaymentMethodPage.initiateStripePayment = function () {
    if (!currentCarId) {
      alert("Car ID not found");
      return;
    }

    // For now, redirect to a reservation page to create the reservation first
    // Then proceed with payment
    var redirectUrl = "/pages/reservations/reservations.html?carId=" + encodeURIComponent(currentCarId) + "&fromPayment=true";
    window.location.href = redirectUrl;
  };

  PaymentMethodPage.init = function () {
    // Check authentication
    if (!window.Auth || !window.Auth.isAuthenticated || !window.Auth.isAuthenticated()) {
      window.location.href = "/pages/login/login.html";
      return;
    }

    currentCarId = PaymentMethodPage.getQueryParam("carId");
    if (!currentCarId) {
      var errorDiv = document.getElementById("payment-error");
      var errorMessage = document.getElementById("error-message");
      errorDiv.classList.remove("hidden");
      errorMessage.textContent = "Car ID not provided in URL";
      return;
    }

    // Load car information
    PaymentMethodPage.loadCarInfo(currentCarId);
  };

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize on DOM load
  document.addEventListener("DOMContentLoaded", PaymentMethodPage.init);
})(window);
