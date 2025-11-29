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
      UI && UI.showToast ? UI.showToast("Car ID not found", "error") : alert("Car ID not found");
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
        UI && UI.showToast ? UI.showToast("Unknown payment method", "error") : alert("Unknown payment method");
    }
  };

  // Create reservation (returns the API response)
  PaymentMethodPage.createReservation = function () {

    // 1) اقرأ قيم الحقول
    var start = document.getElementById("pickupDate").value;
    var end = document.getElementById("returnDate").value;

    // 2) Validations
    if (!start || !end) {
      UI.showToast("Please select pickup and return dates", "error");
      return Promise.reject("Missing dates");
    }

    if (new Date(end) <= new Date(start)) {
      UI.showToast("Return date must be after pickup date", "error");
      return Promise.reject("Invalid dates");
    }

    // 3) ابعت للباك
    return window.Api.fetch("/Reservation/create", {
      method: "POST",
      body: {
        carId: Number(currentCarId),
        startDate: start,
        endDate: end
      }
    });
  };




  // get current user's reservations (used to find the created reservation id if create doesn't return it)
  PaymentMethodPage.getMyReservations = function () {
    return window.Api.fetch("/Reservation/my", { method: "GET" });
  };

  // helper to extract id from possible shapes
  function extractIdFromReservation(obj) {
    if (!obj) return null;
    if (obj.id) return obj.id;
    if (obj.reservationId) return obj.reservationId;
    if (obj.reservationID) return obj.reservationID;
    if (obj.Id) return obj.Id;
    return null;
  }

  // try to find reservation for current car from /Reservation/my list
  PaymentMethodPage.findReservationForCar = function (list) {
    if (!Array.isArray(list)) return null;

    // normalize currentCarId to number/string
    var carIdNum = Number(currentCarId);
    for (var i = list.length - 1; i >= 0; i--) {
      var r = list[i];
      // possible fields: r.car?.id, r.carId, r.car?.id
      var rCarId = null;
      if (r.car && (r.car.id || r.carId)) rCarId = r.car.id || r.carId;
      if (!rCarId && (r.carId || r.CarId)) rCarId = r.carId || r.CarId;
      if (!rCarId && r.car && typeof r.car === "number") rCarId = r.car;

      // try numeric compare
      if (rCarId && Number(rCarId) === carIdNum) {
        var rid = extractIdFromReservation(r);
        if (rid) return rid;
      }
    }
    return null;
  };

  // Start stripe payment with a known reservationId
  PaymentMethodPage.startStripePayment = function (reservationId) {
    if (!reservationId) {
      UI && UI.showToast ? UI.showToast("Invalid reservation id", "error") : alert("Invalid reservation id");
      return;
    }

    var payload = {
      reservationId: Number(reservationId),
      successUrl: window.location.origin + "/pages/payments/payment-success.html",
      cancelUrl: window.location.origin + "/pages/payments/payment-cancel.html"
    };

    console.log("🚀 Sending payload:", payload);

    window.Api.fetch("/Payment/create-session", {
      method: "POST",
      body: payload
    })
      .then(function (res) {
        console.log("🔵 Stripe API Response:", res);

        if (!res || !res.checkoutUrl) {
          UI && UI.showToast ? UI.showToast("Payment session failed", "error") : alert("Payment session failed");
          return;
        }

        console.log("Redirecting to:", res.checkoutUrl);
        window.location.href = res.checkoutUrl;
      })
      .catch(function (err) {
        console.error("❌ Stripe Error:", err);
        UI && UI.showToast ? UI.showToast("Error creating payment session", "error") : alert("Error creating payment session");
      });
  };

  // Global
  var selectedStartDate = null;
  var selectedEndDate = null;

  // Format dates in English
  function formatDateEnglish(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  // Calculate days between two dates
 // ===============================
// PRICE CALCULATION AUTO UPDATE
// ===============================

function calculateDays(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    const diff = e - s;
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
}

function updatePrice() {
    const start = document.getElementById("pickupDate").value;
    const end = document.getElementById("returnDate").value;

    if (!start || !end) return;

    const days = calculateDays(start, end);
    const pricePerDay = Number(currentCar?.pricePerDay || 0);

    if (days <= 0) {
        document.getElementById("totalPrice").innerText = "$0.00";
        return;
    }

    const total = days * pricePerDay;
    document.getElementById("totalPrice").innerText = "$" + total.toFixed(2);
}





  PaymentMethodPage.initiateStripePayment = function () {
    console.log("🔥 Stripe Clicked!", currentCarId);

    if (!currentCarId) {
      UI && UI.showToast ? UI.showToast("Car ID not found", "error") : alert("Car ID not found");
      return;
    }

    // 1) get reservationId from URL if present
    var reservationId = PaymentMethodPage.getQueryParam("reservationId");
    console.log("reservationId (from url):", reservationId);

    // 2) if reservationId exists -> start payment directly
    if (reservationId) {
      PaymentMethodPage.startStripePayment(reservationId);
      return;
    }

    // 3) No reservationId -> create reservation then start payment
    console.log("⚠ No reservationId found → Creating reservation...");
    PaymentMethodPage.createReservation()
      .then(function (createRes) {
        // createRes might be a shape { reservationId: X } or { id: X } or just { Message: '...' }
        console.log("Create reservation response:", createRes);

        var createdId = null;
        if (createRes) {
          createdId = extractIdFromReservation(createRes);
        }

        if (createdId) {
          console.log("✅ Reservation created with ID (from create response):", createdId);
          PaymentMethodPage.startStripePayment(createdId);
          return;
        }

        // If API didn't return id directly, try to fetch /Reservation/my and find the reservation for this car
        return PaymentMethodPage.getMyReservations()
          .then(function (list) {
            console.log("Fetched my reservations:", list);
            var foundId = PaymentMethodPage.findReservationForCar(list);
            if (foundId) {
              console.log("✅ Found reservation id from /Reservation/my:", foundId);
              PaymentMethodPage.startStripePayment(foundId);
              return;
            }

            // nothing found -> show error
            UI && UI.showToast ? UI.showToast("Failed to find created reservation", "error") : alert("Failed to find created reservation");
          });
      })
      .catch(function (err) {
        console.error("Failed to create reservation:", err);
        UI && UI.showToast ? UI.showToast("Failed to create reservation", "error") : alert("Failed to create reservation");
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
      if (errorDiv && errorMessage) {
        errorDiv.classList.remove("hidden");
        errorMessage.textContent = "Car ID not provided in URL";
      } else {
        UI && UI.showToast ? UI.showToast("Car ID not provided in URL", "error") : alert("Car ID not provided in URL");
      }
      return;
    }

    // Load car information
    PaymentMethodPage.loadCarInfo(currentCarId);
    // Listen for date changes
    document.getElementById("pickupDate").addEventListener("change", updatePrice);
document.getElementById("returnDate").addEventListener("change", updatePrice);

  };

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize on DOM load
  document.addEventListener("DOMContentLoaded", PaymentMethodPage.init);
})(window);
