const restaurants = [
{
name:"Prime Kitchen",
rating:"4.9",
time:"14 min",
badge:"Priority",
image:"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
},
{
name:"Ocean Flame",
rating:"4.8",
time:"18 min",
badge:"Trending",
image:"https://images.unsplash.com/photo-1552566626-52f8b828add9"
},
{
name:"Spice Terrace",
rating:"4.7",
time:"20 min",
badge:"Top Rated",
image:"https://images.unsplash.com/photo-1555396273-367ea4eb4db5"
}
];

const meals = [
{
name:"Jollof Deluxe",
price:"₦4,500",
image:"https://images.unsplash.com/photo-1544025162-d76694265947"
},
{
name:"Chicken Supreme",
price:"₦5,800",
image:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"
}
];

function createCard(item, containerId){
const container = document.getElementById(containerId);

container.innerHTML += `
<div class="card">
<div class="card-image" style="background-image:url('${item.image}')"></div>
<div class="card-body">
<div class="card-title">${item.name}</div>
<div class="card-meta">
⭐ ${item.rating || item.price} • ${item.time || ""}
</div>
${item.badge ? `<span class="badge">${item.badge}</span>` : ""}
</div>
</div>
`;
}

restaurants.forEach(r=>{
createCard(r,"priorityGrid");
createCard(r,"liveGrid");
});

meals.forEach(m=>{
createCard(m,"mealGrid");
});
