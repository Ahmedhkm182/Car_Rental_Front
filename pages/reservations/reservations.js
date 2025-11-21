/* pages/reservations/reservations.js */
(function (window) {
  window.ReservationsPage = window.ReservationsPage || {};

  // API Functions
  ReservationsPage.getMyReservations = function () {
    return window.Api.fetch("/Reservation/my", { method: "GET" });
  };

  ReservationsPage.cancelReservation = function (id) {
    return window.Api.fetch("/Reservation/" + encodeURIComponent(id), { method: "DELETE" });
  };

  // Render Functions
  ReservationsPage.renderReservations = function (reservations) {
    var container = document.getElementById("reservations-list");
    if (!container) return;

    container.innerHTML = "";

    if (!reservations || reservations.length === 0) {
      container.innerHTML = `
        <div class="no-reservations">
          <div class="no-reservations-icon">📅</div>
          <p class="no-reservations-text">You have no reservations yet</p>
          <a href="/pages/cars/cars.html">Browse Cars</a>
        </div>
      `;
      return;
    }

    reservations.forEach(function (reservation) {
      var card = document.createElement("div");
      card.className = "reservation-card";

      var startDate = formatDate(reservation.startDate);
      var endDate = formatDate(reservation.endDate);
      var statusClass = (reservation.status || "").toLowerCase();

      var html = `
        <div class="reservation-header">
          <div class="reservation-car">${escapeHtml((reservation.car && reservation.car.make || "") + " " + (reservation.car && reservation.car.model || ""))}</div>
          <span class="reservation-status ${statusClass}">${reservation.status || "Unknown"}</span>
        </div>

        <div class="reservation-details">
          <div class="reservation-detail-row">
            <span class="reservation-detail-label">Pickup Date:</span>
            <span class="reservation-detail-value">${startDate}</span>
          </div>
          <div class="reservation-detail-row">
            <span class="reservation-detail-label">Return Date:</span>
            <span class="reservation-detail-value">${endDate}</span>
          </div>
          <div class="reservation-detail-row">
            <span class="reservation-detail-label">Location:</span>
            <span class="reservation-detail-value">${escapeHtml(reservation.pickupLocation || "N/A")}</span>
          </div>
        </div>

        <div class="reservation-price">$${Number(reservation.totalPrice || 0).toFixed(2)}</div>

        <div class="reservation-actions">
          ${reservation.status === "Active" ? `<button class="btn btn-danger btn-sm" onclick="window.ReservationsPage.cancelReservationPrompt('${reservation.id}')">Cancel</button>` : ""}
          <button class="btn btn-secondary btn-sm" onclick="window.ReservationsPage.viewDetails('${reservation.id}')">Details</button>
        </div>
      `;

      card.innerHTML = html;
      container.appendChild(card);
    });
  };

  ReservationsPage.cancelReservationPrompt = function (id) {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;

    var btn = event.target;
    btn.disabled = true;
    var originalText = btn.innerText;
    btn.innerText = "Cancelling...";

    ReservationsPage.cancelReservation(id)
      .then(function () {
        ReservationsPage.loadReservations();
      })
      .catch(function (err) {
        alert(err.message || "Failed to cancel reservation");
        btn.disabled = false;
        btn.innerText = originalText;
      });
  };

  ReservationsPage.viewDetails = function (id) {
    alert("Reservation ID: " + id);
  };

  ReservationsPage.loadReservations = function () {
    var container = document.getElementById("reservations-list");
    if (!container) return;

    container.innerHTML = '<div class="loading-spinner"></div>';

    ReservationsPage.getMyReservations()
      .then(function (reservations) {
        ReservationsPage.renderReservations(reservations || []);
      })
      .catch(function (err) {
        container.innerHTML = '<div class="no-reservations"><p style="color: #ef4444;">Failed to load reservations</p></div>';
      });
  };

  ReservationsPage.init = function () {
    // Check authentication
    if (!window.Auth || !window.Auth.isAuthenticated || !window.Auth.isAuthenticated()) {
      window.location.href = "/pages/login/login.html";
      return;
    }

    ReservationsPage.loadReservations();
  };

  function formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
      var date = new Date(dateString);
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch (e) {
      return dateString;
    }
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize on DOM load
  document.addEventListener("DOMContentLoaded", ReservationsPage.init);
})(window);
