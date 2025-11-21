/* shared/payments.js - Payment utility module */
(function (window) {
  window.Payments = window.Payments || {};
  
  var BASE_API = "https://localhost:44385/api";

  /**
   * Create a payment session for a reservation
   * @param {string} reservationId - The reservation ID
   * @returns {Promise} - Redirects to checkout URL on success
   */
  window.Payments.createPaymentSession = function (reservationId) {
    if (!reservationId) {
      return Promise.reject({
        status: 400,
        message: "Reservation ID is required"
      });
    }

    var successUrl = window.location.origin + "/pages/payments/payment-success.html?reservationId=" + encodeURIComponent(reservationId);
    var cancelUrl = window.location.origin + "/pages/payments/payment-failed.html?reservationId=" + encodeURIComponent(reservationId);

    var body = {
      reservationId: reservationId,
      successUrl: successUrl,
      cancelUrl: cancelUrl
    };

    return window.Api.fetch("/Payment/create-session", {
      method: "POST",
      body: body
    }).then(function (response) {
      if (!response || !response.checkoutUrl) {
        return Promise.reject({
          status: 500,
          message: "Invalid response from payment service"
        });
      }

      // Redirect to checkout
      window.location.href = response.checkoutUrl;
      return response;
    }).catch(function (err) {
      console.error("Failed to create payment session:", err);
      return Promise.reject({
        status: err.status || 500,
        message: err.message || "Failed to create payment session"
      });
    });
  };

  /**
   * Verify the payment status of a reservation
   * @param {string} reservationId - The reservation ID
   * @returns {Promise} - Returns payment verification state
   */
  window.Payments.verifyReservationPayment = function (reservationId) {
    if (!reservationId) {
      return Promise.reject({
        status: 400,
        message: "Reservation ID is required"
      });
    }

    return window.Api.fetch("/Payment/verify?reservationId=" + encodeURIComponent(reservationId), {
      method: "GET"
    }).then(function (response) {
      return response;
    }).catch(function (err) {
      console.error("Failed to verify payment:", err);
      return Promise.reject({
        status: err.status || 500,
        message: err.message || "Failed to verify payment status"
      });
    });
  };

})(window);
