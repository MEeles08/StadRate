var displayError = document.getElementById('card-errors');
function errorHandler(err) {
  changeLoadingState(false);
  displayError.textContent = err;
}
var orderData = {
  items: [{ id: "stadRate-registration-fee" }],
  currency: "usd"
};

// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
var stripe = Stripe('pk_test_51Hpc6HF6oV1CHJ4Y9m0aofVWN1DRMgLwagBAnWVubybYHAX3CprOfHTNBw57XAllyWIpT5FRNFxN3Qij7solW4SQ00a4TzoRuR');
var elements = stripe.elements();

// Set up Stripe.js and Elements to use in checkout form
var style = {
  base: {
    color: "#32325d",
  }
};

var card = elements.create("card", { style: style });
card.mount("#card-element");

card.addEventListener('change', function(event) {
  if (event.error) {
    errorHandler(event.error.message);
  } else {
    errorHandler('');
  }
});

var form = document.getElementById('payment-form');

form.addEventListener('submit', function(ev) {
  ev.preventDefault();

  changeLoadingState(true);
  
  stripe.createPaymentMethod("card", card)
        .then(function(result) {
          if (result.error) {
            errorHandler(result.error.message);
          } else {
            orderData.paymentMethodId = result.paymentMethod.id;

            return fetch("/pay", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(orderData)
            });
          }
        })
        .then(function(result) {
          return result.json();
        })
        .then(function(response) {
          if (response.error) {
            errorHandler(response.error);
          } else {
            changeLoadingState(false);
            // redirect to /stadiums with a query string
            // that invokes a success flash message
            window.location.href = '/stadiums?paid=true'
          }
        }).catch(function(err) {
          errorHandler(err.error);
        });
});

// Show a spinner on payment submission
function changeLoadingState(isLoading) {
    if (isLoading) {
        document.querySelector("button").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        document.querySelector("#button-text").classList.add("hidden");
    } else {
        document.querySelector("button").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        document.querySelector("#button-text").classList.remove("hidden");
    }
};





