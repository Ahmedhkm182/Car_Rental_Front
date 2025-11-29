/* pages/cars/cars.js */
(function (window) {
  window.CarsPage = window.CarsPage || {};

  var currentCarId = null;
  var allCars = [];

  // API Functions
  CarsPage.getAllCars = function () {
    return window.Api.fetch("/Car/all", { method: "GET" });
  };

  CarsPage.filterCars = function (filterDto) {
    return window.Api.fetch("/Car/filter", { method: "POST", body: filterDto });
  };

  CarsPage.getCarById = function (id) {
    return window.Api.fetch("/Car/" + encodeURIComponent(id), { method: "GET" });
  };

  CarsPage.addCar = function (formData) {
    return window.Api.sendFormData("/Car/add", "POST", formData);
  };

  CarsPage.updateCar = function (id, formData) {
    return window.Api.sendFormData("/Car/update", "PUT", formData);
  };

  CarsPage.deleteCar = function (id) {
    return window.Api.fetch("/Car/delete/" + encodeURIComponent(id), { method: "DELETE" });
  };


  // Render Functions
  CarsPage.renderCars = function (cars) {
    var container = document.getElementById("cars-list");
    if (!container) return;

    container.innerHTML = "";

    if (!cars || cars.length === 0) {
      container.innerHTML = '<div class="no-cars"><div class="no-cars-icon">🚗</div><p>No cars found</p></div>';
      return;
    }

    var isAdmin = window.Auth && window.Auth.isAdmin && window.Auth.isAdmin();

    cars.forEach(function (car) {
      var card = document.createElement("div");
      card.className = "car-card";

      // Process image URL safely
      var image = car.imageUrl;

      // لو مفيش صورة خالص — حط placeholder
      if (!image || image.trim() === "") {
        image = "/assets/car-placeholder.svg";
      }

      // لو السيرفر رجّع لينك Relavtive زى /images/cars/xxx  
      // نحوله Full URL حسب الدومين
      if (image.startsWith("/")) {
        image = window.location.origin + image;
      }


      var statusClass = (car.status || "").toLowerCase().replace(" ", "-");

      var html = `
        <div class="car-image" style="background-image: url('${image}'); background-size: cover; background-position: center;">
          ${!image ? '🚗' : ''}
        </div>
        <div class="car-body">
          <h3 class="car-title">${escapeHtml((car.make || "") + " " + (car.model || ""))}</h3>
          <p class="car-meta">${car.year || "N/A"} • ${car.licensePlate || ""}</p>
          <div class="car-specs">
            <div>Seats: ${car.seats || "N/A"}</div>
            <div>Transmission: ${car.transmission || "N/A"}</div>
            <div>Fuel Type: ${car.fuelType || "N/A"}</div>
          </div>
          <div class="car-price">$${Number(car.pricePerDay || 0).toFixed(2)}/day</div>
          <span class="car-status ${statusClass}">${car.status || "Unknown"}</span>
          <div class="car-actions">
            ${car.status === "Available" ? `<button class="btn btn-reserve" onclick="window.CarsPage.reserveCar('${car.id}')">Reserve Now</button>` : `<button class="btn" disabled style="background: #d1d5db;">Not Available</button>`}
            ${isAdmin ? `<button class="btn btn-secondary btn-sm" onclick="window.CarsPage.openEditModal('${car.id}')">Edit</button>` : ""}
          </div>
        </div>
      `;

      card.innerHTML = html;
      container.appendChild(card);
    });
  };

  CarsPage.openEditModal = function (carId) {
    currentCarId = carId;
    var modal = document.getElementById("car-modal");
    var modalTitle = document.getElementById("modal-title");
    var deleteBtn = document.getElementById("delete-car-btn");

    modalTitle.innerText = "Edit Car";
    deleteBtn.classList.remove("hidden");

    var car = allCars.find(function (c) { return c.id === carId; });
    if (car) {
      document.getElementById("modal-make").value = car.make || "";
      document.getElementById("modal-model").value = car.model || "";
      document.getElementById("modal-year").value = car.year || "";
      document.getElementById("modal-status").value = car.status || "Available";
      document.getElementById("modal-price").value = car.pricePerDay || "";

      // Reset file input
      document.getElementById("modal-image-file").value = "";

      // Show current image preview if exists
      var previewDiv = document.getElementById("image-preview");
      var previewImg = document.getElementById("preview-img");
      if (car.imageUrl) {
        previewImg.src = car.imageUrl;
        previewDiv.classList.remove("hidden");
      } else {
        previewDiv.classList.add("hidden");
      }
    }

    modal.classList.add("open");
  };

  CarsPage.openCreateModal = function () {
    currentCarId = null;
    var modal = document.getElementById("car-modal");
    var modalTitle = document.getElementById("modal-title");
    var deleteBtn = document.getElementById("delete-car-btn");
    var form = document.getElementById("car-form");

    modalTitle.innerText = "Add New Car";
    deleteBtn.classList.add("hidden");
    form.reset();

    // Hide preview
    document.getElementById("image-preview").classList.add("hidden");

    modal.classList.add("open");
  };

  CarsPage.clearImagePreview = function () {
    document.getElementById("modal-image-file").value = "";
    document.getElementById("image-preview").classList.add("hidden");
  };

  CarsPage.saveCar = function () {
    var form = document.getElementById("car-form");
    var formData = new FormData();

    var make = document.getElementById("modal-make").value;
    var model = document.getElementById("modal-model").value;
    var year = document.getElementById("modal-year").value;
    var status = document.getElementById("modal-status").value;
    var pricePerDay = document.getElementById("modal-price").value;
    var imageFile = document.getElementById("modal-image-file").files[0];

    if (!make || !model || !year || !pricePerDay) {
      alert("Please fill in all required fields");
      return;
    }

    // Build FormData
    formData.append("Make", make);
    formData.append("Model", model);
    formData.append("Year", parseInt(year, 10));
    formData.append("Status", status);
    formData.append("PricePerDay", parseFloat(pricePerDay));

    if (imageFile) {
      formData.append("Image", imageFile);
    }

    if (currentCarId) {
      // Edit mode
      formData.append("Id", currentCarId);
      var currentCar = allCars.find(function (c) { return c.id === currentCarId; });
      if (currentCar && currentCar.imageUrl) {
        formData.append("OldImageUrl", currentCar.imageUrl);
      }
    }

    var saveBtn = document.getElementById("save-car-btn");
    saveBtn.disabled = true;
    var originalText = saveBtn.innerText;
    saveBtn.innerText = "Saving...";

    var promise = currentCarId
      ? CarsPage.updateCar(currentCarId, formData)
      : CarsPage.addCar(formData);

    promise
      .then(function () {
        document.getElementById("car-modal").classList.remove("open");
        CarsPage.loadCars();
        saveBtn.disabled = false;
        saveBtn.innerText = originalText;
      })
      .catch(function (err) {
        alert(err.message || "Failed to save car");
        saveBtn.disabled = false;
        saveBtn.innerText = originalText;
      });
  };

  CarsPage.deleteCarConfirm = function () {
    if (!currentCarId) return;
    if (!confirm("Are you sure you want to delete this car?")) return;

    var deleteBtn = document.getElementById("delete-car-btn");
    deleteBtn.disabled = true;
    var originalText = deleteBtn.innerText;
    deleteBtn.innerText = "Deleting...";

    CarsPage.deleteCar(currentCarId)
      .then(function () {
        document.getElementById("car-modal").classList.remove("open");
        CarsPage.loadCars();
        deleteBtn.disabled = false;
        deleteBtn.innerText = originalText;
      })
      .catch(function (err) {
        alert(err.message || "Failed to delete car");
        deleteBtn.disabled = false;
        deleteBtn.innerText = originalText;
      });
  };

  CarsPage.reserveCar = function (carId) {
    if (!carId) {
      alert("Car ID not found");
      return;
    }

    // Redirect to payment page with car ID
    window.location.href = "/pages/payments/payment-method.html?carId=" + encodeURIComponent(carId);
  };

  CarsPage.loadCars = function () {
    var container = document.getElementById("cars-list");
    if (!container) return;

    container.innerHTML = '<div class="loading-spinner"></div>';

    CarsPage.getAllCars()
      .then(function (cars) {
        allCars = cars || [];
        CarsPage.renderCars(allCars);
      })
      .catch(function (err) {
        container.innerHTML = '<div class="no-cars"><p style="color: #ef4444;">Failed to load cars</p></div>';
      });
  };

  CarsPage.init = function () {
    // Check authentication
    if (!window.Auth || !window.Auth.isAuthenticated || !window.Auth.isAuthenticated()) {
      window.location.href = "/pages/login/login.html";
      return;
    }

    var isAdmin = window.Auth.isAdmin && window.Auth.isAdmin();

    // Show admin actions if admin
    if (isAdmin) {
      var adminActions = document.getElementById("admin-actions");
      if (adminActions) {
        adminActions.classList.remove("hidden");
      }
    }

    // Load cars on init
    CarsPage.loadCars();

    // Filter form
    var filterForm = document.getElementById("filter-form");
    if (filterForm) {
      filterForm.addEventListener("submit", function (e) {
        e.preventDefault();

        var filterDto = {
          make: document.getElementById("make").value || null,
          model: document.getElementById("model").value || null,
          year: document.getElementById("year").value ? parseInt(document.getElementById("year").value, 10) : null,
          minPrice: document.getElementById("minPrice").value ? parseFloat(document.getElementById("minPrice").value) : null,
          maxPrice: document.getElementById("maxPrice").value ? parseFloat(document.getElementById("maxPrice").value) : null,
          status: document.getElementById("status").value || null
        };

        var container = document.getElementById("cars-list");
        container.innerHTML = '<div class="loading-spinner"></div>';

        CarsPage.filterCars(filterDto)
          .then(function (cars) {
            allCars = cars || [];
            CarsPage.renderCars(allCars);
          })
          .catch(function () {
            container.innerHTML = '<div class="no-cars"><p style="color: #ef4444;">Filter failed</p></div>';
          });
      });
    }

    // Add car button
    var addCarBtn = document.getElementById("add-car-btn");
    if (addCarBtn) {
      addCarBtn.addEventListener("click", CarsPage.openCreateModal);
    }

    // Save car button
    var saveBtn = document.getElementById("save-car-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", CarsPage.saveCar);
    }

    // Delete car button
    var deleteBtn = document.getElementById("delete-car-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", function () {
        CarsPage.deleteCarConfirm();
      });
    }

    // Image file input change event
    var imageFileInput = document.getElementById("modal-image-file");
    if (imageFileInput) {
      imageFileInput.addEventListener("change", function (e) {
        var file = e.target.files[0];
        if (file) {
          var reader = new FileReader();
          reader.onload = function (event) {
            var previewDiv = document.getElementById("image-preview");
            var previewImg = document.getElementById("preview-img");
            previewImg.src = event.target.result;
            previewDiv.classList.remove("hidden");
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Modal close button
    var modal = document.getElementById("car-modal");
    if (modal) {
      modal.addEventListener("click", function (e) {
        if (e.target === modal) {
          modal.classList.remove("open");
        }
      });
    }
  };

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize on DOM load
  document.addEventListener("DOMContentLoaded", CarsPage.init);
})(window);
