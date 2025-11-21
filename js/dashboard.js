/* js/dashboard.js (Chart.js integration) */
(function (window) {
  window.Dashboard = window.Dashboard || {};
  window.Dashboard.getGeneralStats = function () { return window.Api.fetch("/Report/general-stats", { method: "GET" }); };
  window.Dashboard.getTopCars = function (take) { take = take || 5; return window.Api.fetch("/Report/top-cars?take=" + encodeURIComponent(take), { method: "GET" }); };
  window.Dashboard.getDailyRevenue = function (days) { days = days || 7; return window.Api.fetch("/Report/daily-revenue?days=" + encodeURIComponent(days), { method: "GET" }); };
  window.Dashboard.getMonthlyRevenue = function (months) { months = months || 12; return window.Api.fetch("/Report/monthly-revenue?months=" + encodeURIComponent(months), { method: "GET" }); };
  window.Dashboard.initAdminPage = function () {
    document.addEventListener("DOMContentLoaded", function () {
      var revenueEl = document.getElementById("stat-revenue");
      var reservationsEl = document.getElementById("stat-reservations");
      var carsEl = document.getElementById("stat-cars");
      var usersEl = document.getElementById("stat-users");
      var topEl = document.getElementById("top-cars");
      var dailyEl = document.getElementById("daily-data");
      var monthlyEl = document.getElementById("monthly-data");
      if (!(window.Auth && window.Auth.isAdmin && window.Auth.isAdmin())) {
        document.getElementById("admin-content").innerHTML = '<p class="text-rose-600">Access denied. Admins only.</p>';
        return;
      }
      window.Dashboard.getGeneralStats().then(function (s) {
        if (revenueEl) revenueEl.innerText = "$" + (s && (s.totalRevenue != null ? s.totalRevenue : (s.revenue != null ? s.revenue : 0)));
        if (reservationsEl) reservationsEl.innerText = (s && (s.activeReservations != null ? s.activeReservations : (s.totalReservations != null ? s.totalReservations : 0)));
        if (carsEl) carsEl.innerText = (s && (s.totalCars != null ? s.totalCars : 0));
        if (usersEl) usersEl.innerText = (s && (s.totalUsers != null ? s.totalUsers : 0));
      }).catch(function () {
        if (revenueEl) revenueEl.innerText = "Error";
      });
      window.Dashboard.getTopCars(6).then(function (items) {
        topEl.innerHTML = "";
        if (!items || !items.length) { topEl.innerHTML = '<p class="text-slate-600 dark:text-slate-400">No data</p>'; return; }
        var table = document.createElement("table"); table.className = "w-full text-sm";
        var thead = document.createElement("thead"); thead.innerHTML = "<tr><th class='text-left pb-2 border-b'>Car</th><th class='pb-2 border-b'>Rented</th><th class='text-right pb-2 border-b'>Revenue</th></tr>";
        table.appendChild(thead);
        var tbody = document.createElement("tbody");
        for (var i = 0; i < items.length; i++) {
          var row = document.createElement("tr");
          var make = items[i].make || items[i].brand || "";
          var model = items[i].model || items[i].name || "";
          var rented = items[i].rentalCount || items[i].rentCount || items[i].count || 0;
          var rev = items[i].revenue != null ? Number(items[i].revenue).toFixed(2) : "0.00";
          row.innerHTML = "<td class='py-2'>" + make + " " + model + "</td><td class='text-center'>" + rented + "</td><td class='text-right'>$" + rev + "</td>";
          tbody.appendChild(row);
        }
        table.appendChild(tbody);
        topEl.appendChild(table);
      }).catch(function () { topEl.innerHTML = '<p class="text-rose-600">Failed to load top cars.</p>'; });
      function renderChartCanvas(container, id) {
        container.innerHTML = '<canvas id=\"' + id + '\" height=\"240\"></canvas>';
        return container.querySelector('canvas');
      }
      window.Dashboard.getDailyRevenue(7).then(function (d) {
        dailyEl.innerHTML = "";
        if (!d) { dailyEl.innerHTML = "<p class='text-slate-600 dark:text-slate-400'>No daily revenue data.</p>"; return; }
        var labels = [];
        var data = [];
        if (Array.isArray(d)) {
          d.forEach(function (it) { labels.push(it.date || it.day || it.label || ""); data.push(Number(it.revenue ?? it.total ?? it.amount ?? 0)); });
        } else if (d.labels && d.data) {
          labels = d.labels; data = d.data;
        }
        var canvas = renderChartCanvas(dailyEl, 'chart-daily');
        if (window.Chart) {
          new Chart(canvas.getContext('2d'), { type: 'bar', data: { labels: labels, datasets: [{ label: 'Revenue', data: data, backgroundColor: 'rgba(79,70,229,0.85)' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
        } else {
          var ul = document.createElement('ul'); ul.className = 'space-y-2';
          for (var i=0;i<labels.length;i++){ var li=document.createElement('li'); li.className='text-sm flex justify-between'; li.innerHTML='<span>'+labels[i]+'</span><span class="font-semibold text-indigo-600">$'+(data[i]||0)+'</span>'; ul.appendChild(li); }
          dailyEl.appendChild(ul);
        }
      }).catch(function () { dailyEl.innerHTML = "<p class='text-rose-600'>Failed to load daily revenue.</p>"; });
      window.Dashboard.getMonthlyRevenue(12).then(function (m) {
        monthlyEl.innerHTML = "";
        if (!m) { monthlyEl.innerHTML = "<p class='text-slate-600 dark:text-slate-400'>No monthly data.</p>"; return; }
        var labels = [], data = [];
        if (Array.isArray(m)) {
          m.forEach(function(it){ labels.push(it.month || it.label || it.date || ""); data.push(Number(it.revenue ?? it.total ?? it.amount ?? 0)); });
        } else if (m.labels && m.data) { labels = m.labels; data = m.data; }
        var canvas = renderChartCanvas(monthlyEl, 'chart-monthly');
        if (window.Chart) {
          new Chart(canvas.getContext('2d'), { type: 'line', data: { labels: labels, datasets: [{ label: 'Monthly Revenue', data: data, borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,0.12)', fill: true }] }, options: { responsive: true, maintainAspectRatio: false } });
        } else {
          var ul2 = document.createElement('ul'); ul2.className = 'space-y-2';
          for (var j=0;j<labels.length;j++){ var li=document.createElement('li'); li.className='text-sm flex justify-between'; li.innerHTML='<span>'+labels[j]+'</span><span class="font-semibold text-indigo-600">$'+(data[j]||0)+'</span>'; ul2.appendChild(li); }
          monthlyEl.appendChild(ul2);
        }
      }).catch(function () { monthlyEl.innerHTML = "<p class='text-rose-600'>Failed to load monthly revenue.</p>"; });
    });
  };
})(window);
