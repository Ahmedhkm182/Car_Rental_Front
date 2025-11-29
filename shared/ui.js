/* shared/ui.js - UI utility functions */
(function (window) {
  window.UI = window.UI || {};

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - 'success', 'error', 'warning', 'info' (default: 'info')
   * @param {number} duration - Duration in ms (default: 3000)
   */
  UI.toast = function (message, type, duration) {
    type = type || "info";
    duration = duration || 3000;

    var toast = document.createElement("div");
    toast.className = "toast toast-" + type;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${getBackground(type)};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 3000;
      max-width: 400px;
      animation: slideInRight 0.3s ease;
    `;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(function () {
      toast.style.animation = "slideOutRight 0.3s ease forwards";
      setTimeout(function () {
        document.body.removeChild(toast);
      }, 300);
    }, duration);

    function getBackground(t) {
      switch (t) {
        case "success": return "#10b981";
        case "error": return "#ef4444";
        case "warning": return "#f59e0b";
        default: return "#4f46e5";
      }
    }
  };

  /**
   * Show a loading spinner overlay
   * @param {string} message - Loading message (optional)
   * @returns {function} Function to hide the spinner
   */
  UI.showLoading = function (message) {
    var overlay = document.createElement("div");
    overlay.className = "loading-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 2500;
      backdrop-filter: blur(4px);
    `;

    var spinner = document.createElement("div");
    spinner.style.cssText = `
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;

    var text = document.createElement("p");
    text.style.cssText = `
      color: white;
      margin-top: 16px;
      font-size: 1rem;
      font-weight: 500;
    `;
    text.innerText = message || "Loading...";

    overlay.appendChild(spinner);
    if (message) overlay.appendChild(text);
    document.body.appendChild(overlay);

    return function () {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    };
  };

  /**
   * Confirm dialog
   * @param {string} message - Confirmation message
   * @param {function} onConfirm - Callback on confirm
   * @param {function} onCancel - Callback on cancel (optional)
   */
  UI.confirm = function (message, onConfirm, onCancel) {
    var overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2500;
    `;

    var dialog = document.createElement("div");
    dialog.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 32px;
      max-width: 400px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      animation: slideUp 0.3s ease;
    `;

    var title = document.createElement("h3");
    title.style.cssText = `
      margin: 0 0 12px 0;
      color: #1f2937;
      font-size: 1.25rem;
    `;
    title.innerText = "Confirm";

    var msg = document.createElement("p");
    msg.style.cssText = `
      color: #4b5563;
      margin: 0 0 24px 0;
      line-height: 1.6;
    `;
    msg.innerText = message;

    var buttons = document.createElement("div");
    buttons.style.cssText = `
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    `;

    var cancelBtn = document.createElement("button");
    cancelBtn.style.cssText = `
      padding: 10px 20px;
      background: #e5e7eb;
      color: #1f2937;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
    `;
    cancelBtn.innerText = "Cancel";
    cancelBtn.addEventListener("click", function () {
      document.body.removeChild(overlay);
      if (typeof onCancel === "function") onCancel();
    });

    var confirmBtn = document.createElement("button");
    confirmBtn.style.cssText = `
      padding: 10px 20px;
      background: #4f46e5;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
    `;
    confirmBtn.innerText = "Confirm";
    confirmBtn.addEventListener("click", function () {
      document.body.removeChild(overlay);
      if (typeof onConfirm === "function") onConfirm();
    });

    buttons.appendChild(cancelBtn);
    buttons.appendChild(confirmBtn);
    dialog.appendChild(title);
    dialog.appendChild(msg);
    dialog.appendChild(buttons);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
        if (typeof onCancel === "function") onCancel();
      }
    });
  };

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (default: USD)
   * @returns {string} Formatted string
   */
  UI.formatCurrency = function (amount, currency) {
    currency = currency || "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(amount);
  };

  /**
   * Format date
   * @param {string|Date} date - Date to format
   * @param {string} format - 'short', 'long', 'full' (default: 'short')
   * @returns {string} Formatted date
   */
  UI.formatDate = function (date, format) {
    format = format || "short";
    try {
      var d = typeof date === "string" ? new Date(date) : date;
      var options = {
        short: { year: "numeric", month: "short", day: "numeric" },
        long: { year: "numeric", month: "long", day: "numeric" },
        full: { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      };
      return d.toLocaleDateString("en-US", options[format] || options.short);
    } catch (e) {
      return "Invalid Date";
    }
  };

  /**
   * Debounce function
   * @param {function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {function} Debounced function
   */
  UI.debounce = function (func, wait) {
    var timeout;
    return function executedFunction() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        func.apply(context, args);
      }, wait);
    };
  };

  /**
   * Throttle function
   * @param {function} func - Function to throttle
   * @param {number} limit - Time limit in ms
   * @returns {function} Throttled function
   */
  UI.throttle = function (func, limit) {
    var inThrottle;
    return function () {
      var args = arguments;
      var context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function () {
          inThrottle = false;
        }, limit);
      }
    };
  };

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @param {function} callback - Callback after copy
   */
  UI.copyToClipboard = function (text, callback) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () {
        if (typeof callback === "function") callback();
      });
    } else {
      var textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      if (typeof callback === "function") callback();
    }
  };

  /**
   * Escape HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  UI.escapeHtml = function (text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  UI.isValidEmail = function (email) {
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid
   */
  UI.isValidUrl = function (url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  /**
   * Get query parameter
   * @param {string} name - Parameter name
   * @returns {string|null} Parameter value
   */
  UI.getQueryParam = function (name) {
    var url = new URL(window.location.href);
    return url.searchParams.get(name);
  };

  /**
   * Set page title
   * @param {string} title - New title
   */
  UI.setPageTitle = function (title) {
    document.title = title + " — CarRent";
  };

  /**
   * Scroll to top smoothly
   */
  UI.scrollToTop = function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  /**
   * Show scroll-to-top button on scroll
   */
  UI.initScrollToTop = function () {
    var btn = document.querySelector(".scroll-to-top");
    if (!btn) {
      btn = document.createElement("button");
      btn.className = "scroll-to-top";
      btn.innerHTML = "↑";
      btn.addEventListener("click", UI.scrollToTop);
      document.body.appendChild(btn);
    }

    window.addEventListener("scroll", UI.debounce(function () {
      if (window.scrollY > 300) {
        btn.classList.add("show");
      } else {
        btn.classList.remove("show");
      }
    }, 100));
  };

})(window);
window.UI = window.UI || {};

UI.showToast = function (msg, type = "success") {
  let toast = document.createElement("div");
  toast.className = "toast " + (type === "error" ? "error" : "");
  toast.innerText = msg;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 50);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

UI.confirm = function (message) {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className = "confirm-modal";

    modal.innerHTML = `
      <div class="confirm-box">
        <h3 style="margin-bottom:10px;">${message}</h3>
        <div class="confirm-btns">
          <button class="btn-cancel">Cancel</button>
          <button class="btn-confirm">Yes</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => modal.classList.add("show"), 20);

    modal.querySelector(".btn-cancel").onclick = () => {
      modal.classList.remove("show");
      setTimeout(() => modal.remove(), 200);
      resolve(false);
    };

    modal.querySelector(".btn-confirm").onclick = () => {
      modal.classList.remove("show");
      setTimeout(() => modal.remove(), 200);
      resolve(true);
    };
  });
};
