/* js/home.js - Home page functionality */
(function (window) {
  window.HomePage = window.HomePage || {};

  HomePage.getFeaturedCars = function () {
    return window.Api.fetch("/Car/all", { method: "GET" });
  };

  HomePage.renderFeaturedCars = function (cars) {
    var container = document.getElementById("featured-cars");
    if (!container) return;

    container.innerHTML = "";

    if (!cars || cars.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #6b7280;">No cars available</p>';
      return;
    }

    // Show first 6 cars
    var featured = cars.slice(0, 6);

    featured.forEach(function (car) {
      var card = document.createElement("div");
      card.className = "car-card-home";

      var html = `
        <div class="car-image-home">🚗</div>
        <div class="car-body-home">
          <h3 class="car-title-home">${escapeHtml((car.make || "") + " " + (car.model || ""))}</h3>
          <p style="color: #6b7280; font-size: 0.9rem; margin-bottom: 12px;">${car.year || ""}</p>
          <div class="car-price-home">$${Number(car.pricePerDay || 0).toFixed(2)}/day</div>
          <a href="/pages/cars/cars.html" class="btn btn-primary" style="display: block; text-align: center;">View Details</a>
        </div>
      `;

      card.innerHTML = html;
      container.appendChild(card);
    });
  };

  HomePage.init = function () {
    HomePage.getFeaturedCars()
      .then(function (cars) {
        HomePage.renderFeaturedCars(cars || []);
      })
      .catch(function () {
        var container = document.getElementById("featured-cars");
        if (container) {
          container.innerHTML = '<p style="text-align: center; color: #ef4444;">Failed to load cars</p>';
        }
      });
  };

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize on DOM load
  document.addEventListener("DOMContentLoaded", HomePage.init);
})(window);
