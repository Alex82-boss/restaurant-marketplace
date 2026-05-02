const map = L.map('map').setView([6.5244, 3.3792], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: ''
}).addTo(map);

const restaurants = [
  {
    name: "Prime Kitchen",
    lat: 6.5244,
    lng: 3.3792
  },
  {
    name: "Ocean Flame",
    lat: 6.5350,
    lng: 3.3500
  },
  {
    name: "Spice Terrace",
    lat: 6.5100,
    lng: 3.3900
  }
];

restaurants.forEach(r => {
  const marker = L.marker([r.lat, r.lng]).addTo(map);

  marker.bindPopup(`
    <b>${r.name}</b><br>
    <button onclick="openRestaurant('${r.name}')">
      Open
    </button>
  `);
});

function openRestaurant(name){
  alert("Opening " + name + " page");
}

document.getElementById("search").addEventListener("input", e => {
  const value = e.target.value.toLowerCase();

  const found = restaurants.find(r =>
    r.name.toLowerCase().includes(value)
  );

  if(found){
    map.setView([found.lat, found.lng], 15);
  }
});
