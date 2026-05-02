const restaurants = [
  {
    name: "Prime Kitchen",
    location: "Lagos",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
  },
  {
    name: "Ocean Flame",
    location: "Abuja",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9"
  },
  {
    name: "Spice Terrace",
    location: "Port Harcourt",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5"
  }
];

const meals = [
  {
    name: "Jollof Deluxe",
    price: "₦4,500",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947"
  },
  {
    name: "Chicken Supreme",
    price: "₦5,800",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"
  }
];

function renderRestaurants() {
  const container = document.getElementById("restaurants");

  restaurants.forEach(r => {
    container.innerHTML += `
      <div class="card">
        <div class="card-image" style="background-image:url('${r.image}')"></div>
        <div class="card-body">
          <h3>${r.name}</h3>
          <div class="meta">${r.location}</div>
        </div>
      </div>
    `;
  });
}

function renderMeals() {
  const container = document.getElementById("menus");

  meals.forEach(m => {
    container.innerHTML += `
      <div class="card">
        <div class="card-image" style="background-image:url('${m.image}')"></div>
        <div class="card-body">
          <h3>${m.name}</h3>
          <div class="meta">${m.price}</div>
        </div>
      </div>
    `;
  });
}

renderRestaurants();
renderMeals();
