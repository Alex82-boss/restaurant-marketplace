import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  collection, query, where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser     = null;
let myRestaurant    = null;   // the restaurant doc this rep manages
let editingItemId   = null;   // null = adding new, string = editing existing

// ─── AUTH GUARD — only reps allowed ─────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  const userData = snap.data();

  if (userData?.role !== "rep") {
    // Customers go to marketplace, others go home
    window.location.href = "marketplace.html";
    return;
  }

  currentUser = { uid: user.uid, ...userData };

  document.getElementById("pageContent").style.display = "block";
  document.getElementById("repName").textContent =
    `${userData.name?.split(" ")[0] || "Rep"} 👋`;

  loadMyRestaurant();
});

// ─── Logout ──────────────────────────────────────────────────────────────────
window.logout = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};

// ─── Load the restaurant assigned to this rep ────────────────────────────────
// The restaurant doc must have a field: repId = user.uid
async function loadMyRestaurant() {
  try {
    const q = query(
      collection(db, "restaurants"),
      where("repId", "==", currentUser.uid)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      document.getElementById("noRestaurantMsg").style.display  = "block";
      document.getElementById("restaurantInfo").style.display   = "none";
      return;
    }

    const docSnap = snap.docs[0];
    myRestaurant = { id: docSnap.id, ...docSnap.data() };

    document.getElementById("noRestaurantMsg").style.display  = "none";
    document.getElementById("restaurantInfo").style.display   = "block";

    document.getElementById("dashRestaurantName").textContent = myRestaurant.name;
    document.getElementById("dashRestaurantMeta").textContent =
      `📍 ${myRestaurant.location || ""} · ${myRestaurant.region || ""} · ${myRestaurant.state || ""}`;

    loadMenu();
  } catch (err) {
    console.error("Error loading restaurant:", err);
  }
}

// ─── Load menu items for this restaurant ─────────────────────────────────────
async function loadMenu() {
  const list = document.getElementById("menuList");
  list.innerHTML = "<p class='loading-msg'>Loading menu...</p>";

  try {
    const q    = query(collection(db, "menus"), where("restaurantId", "==", myRestaurant.id));
    const snap = await getDocs(q);

    if (snap.empty) {
      list.innerHTML = `<p class="empty-msg">No menu items yet. Click "+ Add Item" to start.</p>`;
      return;
    }

    list.innerHTML = "";

    snap.forEach(docSnap => {
      const item = { id: docSnap.id, ...docSnap.data() };

      const row = document.createElement("div");
      row.className = "menu-row";
      row.innerHTML = `
        <div class="menu-row-info">
          ${item.image ? `<img class="menu-row-img" src="${item.image}" alt="${item.name}"/>` : `<div class="menu-row-img placeholder-img">🍽</div>`}
          <div>
            <p class="menu-row-name">${item.name}</p>
            <p class="menu-row-meta">${item.category || "Uncategorized"} ${item.description ? "· " + item.description : ""}</p>
          </div>
        </div>
        <div class="menu-row-actions">
          <span class="menu-row-price">₦${Number(item.price).toLocaleString()}</span>
          <button class="ghost-btn small-btn" onclick="openEditItem('${item.id}')">Edit</button>
          <button class="danger-btn small-btn" onclick="deleteItem('${item.id}')">Delete</button>
        </div>
      `;

      list.appendChild(row);
    });

  } catch (err) {
    list.innerHTML = `<p class="error-msg">Failed to load menu.</p>`;
    console.error(err);
  }
}

// ─── Open Add Item form ───────────────────────────────────────────────────────
window.openAddItem = () => {
  editingItemId = null;

  document.getElementById("itemFormTitle").textContent = "Add Menu Item";
  document.getElementById("itemName").value        = "";
  document.getElementById("itemDescription").value = "";
  document.getElementById("itemPrice").value       = "";
  document.getElementById("itemCategory").value    = "";
  document.getElementById("itemImage").value       = "";
  document.getElementById("itemFormError").textContent   = "";
  document.getElementById("itemFormSuccess").textContent = "";

  showPanel("itemForm");
};

// ─── Open Edit Item form ──────────────────────────────────────────────────────
window.openEditItem = async (itemId) => {
  editingItemId = itemId;

  const snap = await getDoc(doc(db, "menus", itemId));
  const item = snap.data();

  document.getElementById("itemFormTitle").textContent = "Edit Menu Item";
  document.getElementById("itemName").value        = item.name        || "";
  document.getElementById("itemDescription").value = item.description || "";
  document.getElementById("itemPrice").value       = item.price       || "";
  document.getElementById("itemCategory").value    = item.category    || "";
  document.getElementById("itemImage").value       = item.image       || "";
  document.getElementById("itemFormError").textContent   = "";
  document.getElementById("itemFormSuccess").textContent = "";

  showPanel("itemForm");
};

// ─── Save Item (add or update) ────────────────────────────────────────────────
window.saveItem = async () => {
  const name        = document.getElementById("itemName").value.trim();
  const description = document.getElementById("itemDescription").value.trim();
  const price       = parseFloat(document.getElementById("itemPrice").value);
  const category    = document.getElementById("itemCategory").value.trim();
  const image       = document.getElementById("itemImage").value.trim();
  const errEl       = document.getElementById("itemFormError");
  const successEl   = document.getElementById("itemFormSuccess");

  errEl.textContent     = "";
  successEl.textContent = "";

  if (!name) { errEl.textContent = "Item name is required."; return; }
  if (!price || isNaN(price)) { errEl.textContent = "Enter a valid price."; return; }

  const data = {
    name, description, price, category, image,
    restaurantId: myRestaurant.id,
    updatedAt: new Date().toISOString()
  };

  try {
    if (editingItemId) {
      await updateDoc(doc(db, "menus", editingItemId), data);
      successEl.textContent = "Item updated successfully!";
    } else {
      data.createdAt = new Date().toISOString();
      await addDoc(collection(db, "menus"), data);
      successEl.textContent = "Item added successfully!";
    }

    loadMenu();
    setTimeout(() => closeItemForm(), 1200);
  } catch (err) {
    errEl.textContent = "Failed to save. Please try again.";
    console.error(err);
  }
};

// ─── Delete Item ──────────────────────────────────────────────────────────────
window.deleteItem = async (itemId) => {
  if (!confirm("Delete this menu item? This cannot be undone.")) return;

  try {
    await deleteDoc(doc(db, "menus", itemId));
    loadMenu();
  } catch (err) {
    alert("Failed to delete item.");
    console.error(err);
  }
};

// ─── Edit Restaurant Info form ────────────────────────────────────────────────
window.openEditRestaurant = () => {
  document.getElementById("editName").value         = myRestaurant.name         || "";
  document.getElementById("editLocation").value     = myRestaurant.location     || "";
  document.getElementById("editRegion").value       = myRestaurant.region       || "";
  document.getElementById("editState").value        = myRestaurant.state        || "";
  document.getElementById("editDeliveryTime").value = myRestaurant.deliveryTime || "";
  document.getElementById("editImage").value        = myRestaurant.image        || "";
  document.getElementById("restaurantFormError").textContent   = "";
  document.getElementById("restaurantFormSuccess").textContent = "";

  showPanel("restaurantForm");
};

window.saveRestaurantInfo = async () => {
  const errEl     = document.getElementById("restaurantFormError");
  const successEl = document.getElementById("restaurantFormSuccess");

  errEl.textContent     = "";
  successEl.textContent = "";

  const name         = document.getElementById("editName").value.trim();
  const location     = document.getElementById("editLocation").value.trim();
  const region       = document.getElementById("editRegion").value.trim();
  const state        = document.getElementById("editState").value.trim();
  const deliveryTime = document.getElementById("editDeliveryTime").value.trim();
  const image        = document.getElementById("editImage").value.trim();

  if (!name) { errEl.textContent = "Restaurant name is required."; return; }

  try {
    await updateDoc(doc(db, "restaurants", myRestaurant.id), {
      name, location, region, state, deliveryTime, image,
      updatedAt: new Date().toISOString()
    });

    // Update local reference
    myRestaurant = { ...myRestaurant, name, location, region, state, deliveryTime, image };
    document.getElementById("dashRestaurantName").textContent = name;
    document.getElementById("dashRestaurantMeta").textContent =
      `📍 ${location} · ${region} · ${state}`;

    successEl.textContent = "Restaurant info updated!";
    setTimeout(() => closeRestaurantForm(), 1200);
  } catch (err) {
    errEl.textContent = "Failed to save. Please try again.";
    console.error(err);
  }
};

// ─── Panel helpers ────────────────────────────────────────────────────────────
function showPanel(id) {
  ["itemForm", "restaurantForm", "hintCard"].forEach(p => {
    document.getElementById(p).style.display = p === id ? "block" : "none";
  });
}

window.closeItemForm       = () => showPanel("hintCard");
window.closeRestaurantForm = () => showPanel("hintCard");
