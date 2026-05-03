import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection, getDocs, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ─── AUTH GUARD ──────────────────────────────────────────────────────────────
// Marketplace is only visible to logged-in customers.
// Reps are redirected to their dashboard.
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  const userData = snap.data();

  // Reps should not be on the marketplace
  if (userData?.role === "rep") {
    window.location.href = "dashboard.html";
    return;
  }

  // Show page now that auth is confirmed
  document.getElementById("pageContent").style.display = "block";

  // Show user's name in nav
  const nameEl = document.getElementById("navUserName");
  if (nameEl) nameEl.textContent = `Hi, ${userData?.name?.split(" ")[0] || "there"} 👋`;

  loadRestaurants();
});

// ─── Sign Out ────────────────────────────────────────────────────────────────
window.logout = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};

// ─── Load Restaurants from Firestore ────────────────────────────────────────
let allRestaurants = [];

async function loadRestaurants() {
  const grid = document.getElementById("restaurantGrid");

  try {
    const snapshot = await getDocs(collection(db, "restaurants"));

    if (snapshot.empty) {
      grid.innerHTML = `<p class="empty-msg">No restaurants available yet.</p>`;
      return;
    }

    allRestaurants = [];
    snapshot.forEach(docSnap => {
      allRestaurants.push({ id: docSnap.id, ...docSnap.data() });
    });

    buildRegionFilters(allRestaurants);
    renderRestaurants(allRestaurants);

  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p class="error-msg">Failed to load restaurants. Please refresh.</p>`;
  }
}

// ─── Build region filter chips ───────────────────────────────────────────────
function buildRegionFilters(list) {
  const regions = [...new Set(list.map(r => r.region).filter(Boolean))];
  const container = document.getElementById("regionFilters");

  regions.forEach(region => {
    const btn = document.createElement("button");
    btn.className = "filter-chip";
    btn.textContent = region;
    btn.onclick = () => filterByRegion(region, btn);
    container.appendChild(btn);
  });
}

// ─── Filter by region ────────────────────────────────────────────────────────
window.filterByRegion = (region, btn) => {
  document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");

  const filtered = region === "all"
    ? allRestaurants
    : allRestaurants.filter(r => r.region === region);

  // Reapply any existing search term on top
  const query = document.getElementById("searchInput")?.value.toLowerCase() || "";
  renderRestaurants(query ? filtered.filter(r => matchesSearch(r, query)) : filtered);
};

// ─── Search filter ───────────────────────────────────────────────────────────
window.filterRestaurants = () => {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const activeRegion = document.querySelector(".filter-chip.active")?.textContent;

  let list = activeRegion && activeRegion !== "All"
    ? allRestaurants.filter(r => r.region === activeRegion)
    : allRestaurants;

  renderRestaurants(query ? list.filter(r => matchesSearch(r, query)) : list);
};

function matchesSearch(r, query) {
  return (
    r.name?.toLowerCase().includes(query) ||
    r.region?.toLowerCase().includes(query) ||
    r.state?.toLowerCase().includes(query) ||
    r.location?.toLowerCase().includes(query)
  );
}

// ─── Render restaurant cards ─────────────────────────────────────────────────
function renderRestaurants(list) {
  const grid = document.getElementById("restaurantGrid");
  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = `<p class="empty-msg">No restaurants match your search.</p>`;
    return;
  }

  list.forEach(r => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-image" style="background-image:url('${r.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600"}')">
        <span class="card-region">${r.region || "Local"}</span>
      </div>
      <div class="card-body">
        <h3>${r.name}</h3>
        <p class="card-meta">📍 ${r.location || r.state || ""}</p>
        <p class="card-meta">${r.rating ? `⭐ ${r.rating}` : ""} ${r.deliveryTime ? `• ${r.deliveryTime} min` : ""}</p>
        <button class="view-btn">View Menu →</button>
      </div>
    `;

    card.querySelector(".view-btn").addEventListener("click", () => {
      localStorage.setItem("restaurantId",   r.id);
      localStorage.setItem("restaurantName", r.name);
      window.location.href = "restaurant.html";
    });

    grid.appendChild(card);
  });
}
