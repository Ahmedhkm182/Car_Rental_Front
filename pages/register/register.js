/* pages/register/register.js */
(function (window) {
  window.RegisterPage = window.RegisterPage || {};

  window.RegisterPage.init = function () {
    var form = document.getElementById("register-form");
    var errorEl = document.getElementById("auth-error");

    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var fullName = form.querySelector('input[name="fullName"]').value.trim();
      var email = form.querySelector('input[name="email"]').value.trim();
      var password = form.querySelector('input[name="password"]').value;

      // Validation
      if (!fullName || !email || !password) {
        showError("Please fill in all fields");
        return;
      }

      if (fullName.length < 2) {
        showError("Full name must be at least 2 characters");
        return;
      }

      if (!isValidEmail(email)) {
        showError("Please enter a valid email address");
        return;
      }

      if (password.length < 6) {
        showError("Password must be at least 6 characters");
        return;
      }

      // Disable button during submission
      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.innerText;
      submitBtn.disabled = true;
      submitBtn.innerText = "Creating account...";

      window.Auth.register(fullName, email, password)
        .then(function () {
          window.location.href = "/pages/login/login.html";
        })
        .catch(function (err) {
          let msg = "Registration failed. Please try again.";

          // لو API رجّع Message مباشرة
          if (err && err.Message) {
            msg = err.Message;
          }
          // Errors array
          else if (err && err.Errors && err.Errors.length > 0) {
            msg = err.Errors[0];
          }
          // خاص بـ ModelState Errors
          else if (err && err.errors) {
            const firstKey = Object.keys(err.errors)[0];
            msg = err.errors[firstKey][0];
          }

          showError(msg);

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
  document.addEventListener("DOMContentLoaded", window.RegisterPage.init);
})(window);
