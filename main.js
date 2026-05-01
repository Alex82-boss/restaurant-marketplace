import { db } from "./firebase.js";
import { collection, getDocs } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const container = document.getElementById("restaurants");

const snapshot = await getDocs(collection(db, "restaurants"));

snapshot.forEach(doc => {
  const r = doc.data();

  container.innerHTML += `
    <div class="card" onclick="openRestaurant('${doc.id}')">
      <h3>${r.name}</h3>
      <p>${r.location}</p>
    </div>
  `;
});

window.openRestaurant = (id) => {
  localStorage.setItem("restaurantId", id);
  window.location.href = "restaurant.html";
};