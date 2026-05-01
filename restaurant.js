import { db } from "./firebase.js";
import { collection, query, where, getDocs } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const restaurantId = localStorage.getItem("restaurantId");
const menuDiv = document.getElementById("menu");

const q = query(collection(db, "menus"), where("restaurantId", "==", restaurantId));
const snapshot = await getDocs(q);

snapshot.forEach(doc => {
  const item = doc.data();

  menuDiv.innerHTML += `
    <div class="card">
      <h3>${item.name}</h3>
      <p>₦${item.price}</p>
      <button onclick="addToCart('${item.name}', ${item.price})">
        Add to Cart
      </button>
    </div>
  `;
});