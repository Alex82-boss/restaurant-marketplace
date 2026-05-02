import { db } from "./firebase.js";
import { collection, query, where, getDocs }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const restaurantId = localStorage.getItem("restaurantId");
const restaurantName = localStorage.getItem("restaurantName");
const menuDiv = document.getElementById("menu");

// FIX: Guard against direct navigation with no restaurantId
if (!restaurantId) {
  alert("No restaurant selected. Redirecting to home.");
  window.location.href = "index.html";
}

// Set the restaurant name in the header
const nameEl = document.getElementById("restaurantName");
if (nameEl && restaurantName) nameEl.textContent = restaurantName;

async function loadMenu() {
  try {
    const q = query(
      collection(db, "menus"),
      where("restaurantId", "==", restaurantId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      menuDiv.innerHTML = `<p class="empty-msg">No menu items available yet.</p>`;
      return;
    }

    menuDiv.innerHTML = "";

    snapshot.forEach(doc => {
      const item = doc.data();

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${item.name}</h3>
        <p class="item-desc">${item.description || ""}</p>
        <div class="card-footer">
          <span class="item-price">₦${Number(item.price).toLocaleString()}</span>
          <button class="add-btn">+ Add</button>
        </div>
      `;

      // FIX: Use addEventListener — no more inline onclick needing global scope
      card.querySelector(".add-btn").addEventListener("click", () => {
        // addToCart is exported from cart.js and called directly
        window.addToCart(item.name, item.price);
      });

      menuDiv.appendChild(card);
    });

  } catch (err) {
    console.error("Failed to load menu:", err);
    menuDiv.innerHTML = `<p class="error-msg">Failed to load menu. Please try again.</p>`;
  }
}

loadMenu();
