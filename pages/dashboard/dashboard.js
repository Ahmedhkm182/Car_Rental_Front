/* pages/dashboard/dashboard.js */
(function (window) {
  window.DashboardPage = window.DashboardPage || {};

  // API Functions
  DashboardPage.getGeneralStats = function () {
    return window.Api.fetch("/Report/general-stats", { method: "GET" });
  };

  DashboardPage.getTopCars = function (take) {
    take = take || 5;
    return window.Api.fetch("/Report/top-cars?take=" + encodeURIComponent(take), { method: "GET" });
  };

  DashboardPage.getDailyRevenue = function (days) {
    days = days || 7;
    return window.Api.fetch("/Report/daily-revenue?days=" + encodeURIComponent(days), { method: "GET" });
  };

  DashboardPage.getMonthlyRevenue = function (months) {
    months = months || 12;
    return window.Api.fetch("/Report/monthly-revenue?months=" + encodeURIComponent(months), { method: "GET" });
  };

  // Load stats
  DashboardPage.loadStats = function () {
    var revenueEl = document.getElementById("stat-revenue");
    var reservationsEl = document.getElementById("stat-reservations");
    var carsEl = document.getElementById("stat-cars");
    var usersEl = document.getElementById("stat-users");

    DashboardPage.getGeneralStats()
      .then(function (stats) {
        if (revenueEl) revenueEl.innerText = "$" + (stats && (stats.totalRevenue != null ? stats.totalRevenue : (stats.revenue != null ? stats.revenue : 0)));
        if (reservationsEl) reservationsEl.innerText = (stats && (stats.activeReservations != null ? stats.activeReservations : (stats.totalReservations != null ? stats.totalReservations : 0)));
        if (carsEl) carsEl.innerText = (stats && (stats.totalCars != null ? stats.totalCars : 0));
        if (usersEl) usersEl.innerText = (stats && (stats.totalUsers != null ? stats.totalUsers : 0));
      })
      .catch(function () {
        if (revenueEl) revenueEl.innerText = "Error";
      });
  };

  // Load top cars table
  DashboardPage.loadTopCars = function () {
    var topEl = document.getElementById("top-cars");
    if (!topEl) return;

    DashboardPage.getTopCars(6)
      .then(function (items) {
        topEl.innerHTML = "";

        if (!items || !items.length) {
          topEl.innerHTML = '<p style="color: #6b7280;">No data available</p>';
          return;
        }

        var table = document.createElement("table");
        var thead = document.createElement("thead");
        thead.innerHTML = "<tr><th>Car</th><th>Times Rented</th><th>Revenue</th></tr>";
        table.appendChild(thead);

        var tbody = document.createElement("tbody");
        items.forEach(function (car) {
          var row = document.createElement("tr");
          var make = car.make || car.brand || "";
          var model = car.model || car.name || "";
          var rented = car.rentalCount || car.rentCount || car.count || 0;
          var rev = car.revenue != null ? Number(car.revenue).toFixed(2) : "0.00";
          row.innerHTML = "<td>" + escapeHtml(make + " " + model) + "</td><td>" + rented + "</td><td>$" + rev + "</td>";
          tbody.appendChild(row);
        });

        table.appendChild(tbody);
        topEl.appendChild(table);
      })
      .catch(function () {
        topEl.innerHTML = '<p style="color: #ef4444;">Failed to load top cars</p>';
      });
  };

  // Load daily revenue chart
  DashboardPage.loadDailyRevenue = function () {
    var dailyEl = document.getElementById("daily-data");
    if (!dailyEl) return;

    DashboardPage.getDailyRevenue(7)
      .then(function (data) {
        dailyEl.innerHTML = "";

        if (!data) {
          dailyEl.innerHTML = "<p style='color: #6b7280;'>No daily revenue data</p>";
          return;
        }

        var labels = [];
        var values = [];

        if (Array.isArray(data)) {
          data.forEach(function (item) {
            labels.push(item.date || item.day || item.label || "");
            values.push(Number(item.revenue ?? item.total ?? item.amount ?? 0));
          });
        } else if (data.labels && data.data) {
          labels = data.labels;
          values = data.data;
        }

        if (window.Chart && labels.length > 0) {
          var canvas = document.createElement("canvas");
          dailyEl.appendChild(canvas);

          new Chart(canvas, {
            type: "bar",
            data: {
              labels: labels,
              datasets: [
                {
                  label: "Daily Revenue",
                  data: values,
                  backgroundColor: "rgba(79, 70, 229, 0.8)",
                  borderColor: "rgba(79, 70, 229, 1)",
                  borderWidth: 1,
                  borderRadius: 8
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: { display: true, position: "top" },
                title: { display: false }
              },
              scales: {
                y: { beginAtZero: true, ticks: { callback: function (value) { return "$" + value; } } }
              }
            }
          });
        } else {
          renderFallbackChart(dailyEl, labels, values);
        }
      })
      .catch(function () {
        dailyEl.innerHTML = "<p style='color: #ef4444;'>Failed to load daily revenue</p>";
      });
  };

  // Load monthly revenue chart
  DashboardPage.loadMonthlyRevenue = function () {
    var monthlyEl = document.getElementById("monthly-data");
    if (!monthlyEl) return;

    DashboardPage.getMonthlyRevenue(12)
      .then(function (data) {
        monthlyEl.innerHTML = "";

        if (!data) {
          monthlyEl.innerHTML = "<p style='color: #6b7280;'>No monthly revenue data</p>";
          return;
        }

        var labels = [];
        var values = [];

        if (Array.isArray(data)) {
          data.forEach(function (item) {
            labels.push(item.month || item.label || item.date || "");
            values.push(Number(item.revenue ?? item.total ?? item.amount ?? 0));
          });
        } else if (data.labels && data.data) {
          labels = data.labels;
          values = data.data;
        }

        if (window.Chart && labels.length > 0) {
          var canvas = document.createElement("canvas");
          monthlyEl.appendChild(canvas);

          new Chart(canvas, {
            type: "line",
            data: {
              labels: labels,
              datasets: [
                {
                  label: "Monthly Revenue",
                  data: values,
                  borderColor: "#4f46e5",
                  backgroundColor: "rgba(79, 70, 229, 0.1)",
                  borderWidth: 2,
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: "#4f46e5",
                  pointBorderColor: "white",
                  pointBorderWidth: 2,
                  pointRadius: 5
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: { display: true, position: "top" },
                title: { display: false }
              },
              scales: {
                y: { beginAtZero: true, ticks: { callback: function (value) { return "$" + value; } } }
              }
            }
          });
        } else {
          renderFallbackChart(monthlyEl, labels, values);
        }
      })
      .catch(function () {
        monthlyEl.innerHTML = "<p style='color: #ef4444;'>Failed to load monthly revenue</p>";
      });
  };

  function renderFallbackChart(container, labels, values) {
    var list = document.createElement("ul");
    list.style.listStyle = "none";
    list.style.padding = "0";

    labels.forEach(function (label, i) {
      var li = document.createElement("li");
      li.style.padding = "12px 0";
      li.style.borderBottom = "1px solid #e5e7eb";
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.innerHTML = "<span>" + escapeHtml(label) + "</span><span style='font-weight: 700; color: #4f46e5;'>$" + (values[i] || 0).toFixed(2) + "</span>";
      list.appendChild(li);
    });

    container.appendChild(list);
  }

  DashboardPage.init = function () {
    // Check admin access
    if (!window.Auth || !window.Auth.isAdmin || !window.Auth.isAdmin()) {
      document.body.innerHTML = '<div style="padding: 40px; text-align: center; color: #ef4444;"><h1>Access Denied</h1><p>This page is for administrators only.</p><a href="/" style="color: #4f46e5;">Back to Home</a></div>';
      return;
    }

    DashboardPage.loadStats();
    DashboardPage.loadTopCars();
    DashboardPage.loadDailyRevenue();
    DashboardPage.loadMonthlyRevenue();
  };

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize on DOM load
  document.addEventListener("DOMContentLoaded", DashboardPage.init);
})(window);
