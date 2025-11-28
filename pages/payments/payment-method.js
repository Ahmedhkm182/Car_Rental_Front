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
    console.log("🔥 selectPaymentMethod called:", method);
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

  PaymentMethodPage.createReservation = function () {
    return window.Api.fetch("/Reservation/create", {
      method: "POST",
      body: {
        carId: Number(currentCarId),
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString()
      }
    });
  };


  PaymentMethodPage.initiateStripePayment = function () {
    console.log("🔥 Stripe Clicked!", currentCarId);

    if (!currentCarId) {
      alert("Car ID not found");
      return;
    }

    // 1) هات reservationId لو موجود
    var reservationId = PaymentMethodPage.getQueryParam("reservationId");

    console.log("reservationId:", reservationId);

    // 2) لو مفيش → اعمله Placeholder مؤقت (لحد ما تبني صفحة الحجز الفعلية)
    if (!reservationId) {
      reservationId = currentCarId; // مؤقت لحد ما يبدأ الحجز بجد
    }

    // 3) بنعمل payload
    var payload = {
      reservationId: Number(reservationId),
      successUrl: window.location.origin + "/pages/payments/payment-success.html",
      cancelUrl: window.location.origin + "/pages/payments/payment-cancel.html"
    };

    console.log("🚀 Sending payload:", payload);

    // 4) API call
    window.Api.fetch("/Payment/create-session", {
      method: "POST",
      body: payload
    })
      .then(function (res) {
        console.log("🔵 Stripe API Response:", res);

        if (!res || !res.checkoutUrl) {
          alert("Payment session failed");
          return;
        }

        console.log("Redirecting to:", res.checkoutUrl);

        // 5) Redirect to Stripe checkout URL
        window.location.href = res.checkoutUrl;
      })
      .catch(function (err) {
        console.error("❌ Stripe Error:", err);
        alert("Error creating payment session");
      });
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
