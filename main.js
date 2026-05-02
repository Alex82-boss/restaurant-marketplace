import { db } from "./firebase.js";
import { collection, getDocs }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const container = document.getElementById("restaurants");

// Store all restaurants so we can filter without re-fetching
let allRestaurants = [];

async function loadRestaurants() {
  try {
    const snapshot = await getDocs(collection(db, "restaurants"));

    if (snapshot.empty) {
      container.innerHTML = `<p class="empty-msg">No restaurants found.</p>`;
      return;
    }

    snapshot.forEach(doc => {
      const r = doc.data();
      allRestaurants.push({ id: doc.id, ...r });
    });

    renderRestaurants(allRestaurants);

  } catch (err) {
    console.error("Failed to load restaurants:", err);
    container.innerHTML = `<p class="error-msg">Failed to load restaurants. Please try again.</p>`;
  }
}

function renderRestaurants(list) {
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<p class="empty-msg">No restaurants match your search.</p>`;
    return;
  }

  list.forEach(r => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-badge">${r.region || r.state || "Local"}</div>
      <h3>${r.name}</h3>
      <p class="card-location">📍 ${r.location}</p>
      <span class="card-arrow">View Menu →</span>
    `;

    // FIX: Use addEventListener instead of fragile inline onclick
    card.addEventListener("click", () => openRestaurant(r.id, r.name));
    container.appendChild(card);
  });
}

function openRestaurant(id, name) {
  // FIX: Clear previous restaurant's cart when switching restaurants
  const previousId = localStorage.getItem("restaurantId");
  if (previousId !== id) {
    localStorage.removeItem("cart");
  }

  localStorage.setItem("restaurantId", id);
  localStorage.setItem("restaurantName", name || "Restaurant");
  window.location.href = "restaurant.html";
}

// FIX: Expose filter function to global scope for inline oninput in HTML
window.filterRestaurants = () => {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = allRestaurants.filter(r =>
    r.name?.toLowerCase().includes(query) ||
    r.location?.toLowerCase().includes(query) ||
    r.region?.toLowerCase().includes(query) ||
    r.state?.toLowerCase().includes(query)
  );
  renderRestaurants(filtered);
};

loadRestaurants();
