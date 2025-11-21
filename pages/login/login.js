/* pages/login/login.js */
(function (window) {
  window.LoginPage = window.LoginPage || {};

  window.LoginPage.init = function () {
    var form = document.getElementById("login-form");
    var errorEl = document.getElementById("auth-error");

    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var email = form.querySelector('input[name="email"]').value.trim();
      var password = form.querySelector('input[name="password"]').value;

      if (!email || !password) {
        showError("Please fill in all fields");
        return;
      }

      if (!isValidEmail(email)) {
        showError("Please enter a valid email address");
        return;
      }

      // Disable button during submission
      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.innerText;
      submitBtn.disabled = true;
      submitBtn.innerText = "Signing in...";

      window.Auth.login(email, password)
        .then(function () {
          window.location.href = "/index.html";
        })
        .catch(function (err) {
          var errorMessage = "Login failed. Please try again.";
          if (err && err.message) {
            errorMessage = err.message;
          } else if (err && typeof err === "string") {
            errorMessage = err;
          }
          showError(errorMessage);
          submitBtn.disabled = false;
          submitBtn.innerText = originalText;
        });
    });

    function showError(message) {
      if (errorEl) {
        errorEl.innerText = message;
        errorEl.classList.remove("hidden");
      } else {
        alert(message);
      }
    }

    function isValidEmail(email) {
      var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    }
  };

  // Initialize on DOM load
  document.addEventListener("DOMContentLoaded", window.LoginPage.init);
})(window);
