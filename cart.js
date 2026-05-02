// FIX: cart.js is now a proper module — no more mixed script type issues
// addToCart and checkout are exposed on window so restaurant.js can call them

let cart = JSON.parse(localStorage.getItem("cart")) || [];

window.addToCart = (name, price) => {
  // Check if item already exists — increment quantity instead of duplicating
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  showAddedFeedback();
};

window.removeFromCart = (index) => {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
};

function renderCart() {
  const div = document.getElementById("cart");
  if (!div) return;

  div.innerHTML = "";

  if (cart.length === 0) {
    div.innerHTML = `<p class="empty-cart">Your cart is empty.</p>`;
    updateCheckoutBtn(0);
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    const lineTotal = item.price * (item.qty || 1);
    total += lineTotal;

    div.innerHTML += `
      <div class="cart-item">
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-qty">x${item.qty || 1}</span>
        </div>
        <div class="cart-item-right">
          <span class="cart-item-price">₦${Number(lineTotal).toLocaleString()}</span>
          <button class="remove-btn" onclick="removeFromCart(${index})">✕</button>
        </div>
      </div>
    `;
  });

  div.innerHTML += `
    <div class="cart-total">
      <span>Total</span>
      <span>₦${Number(total).toLocaleString()}</span>
    </div>
  `;

  updateCheckoutBtn(total);
}

function updateCheckoutBtn(total) {
  const btn = document.getElementById("checkoutBtn");
  if (!btn) return;
  btn.textContent = total > 0
    ? `Checkout — ₦${Number(total).toLocaleString()}`
    : "Proceed to Checkout";
  btn.disabled = total === 0;
}

function showAddedFeedback() {
  // Brief visual pulse on the cart section
  const cartSection = document.querySelector(".cart-section");
  if (!cartSection) return;
  cartSection.classList.add("pulse");
  setTimeout(() => cartSection.classList.remove("pulse"), 400);
}

window.checkout = () => {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  // TODO: Integrate with a payment provider (e.g. Paystack, Flutterwave)
  alert("Proceeding to payment...");
  // Optionally clear cart after checkout:
  // cart = [];
  // localStorage.removeItem("cart");
  // renderCart();
};

// Render cart on page load
renderCart();
