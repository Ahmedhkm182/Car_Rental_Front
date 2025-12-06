(function (window) {
  window.ReservationsPage = window.ReservationsPage || {};

  var reservationsList = null;

  ReservationsPage.getMyReservations = function () {
    return window.Api.fetch("/Reservation/my", { method: "GET" });
  };

  ReservationsPage.getAllReservations = function () {
    return window.Api.fetch("/Reservation/all", { method: "GET" });
  };

  ReservationsPage.cancelReservation = function (id) {
    return window.Api.fetch("/Reservation/" + encodeURIComponent(id), {
      method: "DELETE"
    });
  };

  ReservationsPage.renderReservations = function (items, isAdmin) {
    var container = document.getElementById("reservations-list");
    if (!container) return;

    container.innerHTML = "";

    if (!items || items.length === 0) {
      container.innerHTML = `
        <div class="empty-box">
          <p>No reservations found.</p>
        </div>`;
      return;
    }

    items.forEach(function (r) {
      var carImg = r.car?.imageUrl
        ? r.car.imageUrl
        : "/assets/car-placeholder.svg";

      var card = document.createElement("div");
      card.className = "reservation-card";

      card.innerHTML = `
        <div class="reservation-image" style="background-image:url('${carImg}')"></div>
        <div class="reservation-body">
         <h3>${r.carMake} ${r.carModel}</h3>
<p><strong>Customer:</strong> ${r.userFullName}</p>

          <p><strong>Pickup:</strong> ${r.startDate.split("T")[0]}</p>
          <p><strong>Return:</strong> ${r.endDate.split("T")[0]}</p>
          <p><strong>Status:</strong> <span class="status ${r.status.toLowerCase()}">${r.status}</span></p>
          <p><strong>Total:</strong> $${Number(r.totalPrice || 0).toFixed(2)}</p>

          <div class="reservation-actions">
           <button class="btn btn-danger btn-sm" onclick="window.ReservationsPage.onCancel(${r.id})">
  Cancel
</button>

          </div>
        </div>
      `;

      container.appendChild(card);
    });
  };

  ReservationsPage.onCancel = function (id) {
    UI.confirm("Are you sure you want to cancel this reservation?")
      .then((ok) => {
        if (!ok) return;

        ReservationsPage.cancelReservation(id)
          .then((res) => {
            console.log("Cancel Response:", res);
            UI.showToast("Reservation cancelled", "success");
            ReservationsPage.load();   // ✔ الصحيح
          })
          .catch((err) => {
            console.error("Cancel Error:", err);
            UI.showToast("Failed to cancel reservation", "error");
          });
      });
  };


  ReservationsPage.load = function () {
    var container = document.getElementById("reservations-list");
    container.innerHTML = `<div class="loading-spinner"></div>`;

    var isAdmin = window.Auth.isAdmin && window.Auth.isAdmin();

    var apiCall = isAdmin
      ? ReservationsPage.getAllReservations()
      : ReservationsPage.getMyReservations();

    apiCall
      .then(function (items) {
        ReservationsPage.renderReservations(items || [], isAdmin);
      })
      .catch(function () {
        container.innerHTML = `<p class="error-text">Failed to load reservations</p>`;
      });
  };

  document.addEventListener("DOMContentLoaded", ReservationsPage.load);
})(window);
