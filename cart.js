let cart = JSON.parse(localStorage.getItem("cart")) || [];

window.addToCart = (name, price) => {
  cart.push({ name, price });
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
};

function renderCart() {
  const div = document.getElementById("cart");
  div.innerHTML = "";

  let total = 0;

  cart.forEach(item => {
    total += item.price;
    div.innerHTML += `<p>${item.name} - ₦${item.price}</p>`;
  });

  div.innerHTML += `<h3>Total: ₦${total}</h3>`;
}

window.checkout = () => {
  alert("Proceeding to payment...");
};

renderCart();