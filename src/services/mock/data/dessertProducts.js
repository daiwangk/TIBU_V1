const dessertProducts = [
 {
  name: "Fudgy Brownie Box",
  businessId: "sweet-crumbs",
  seller: "Sweet Crumbs",
  rating: "4.9",
  distance: "1.2 km",
  price: "₹99",
  emoji: "🍫",

  about:
    "Rich, fudgy chocolate brownies baked fresh daily with premium cocoa for the perfect indulgent treat.",

  location: "Bandra, Mumbai",

  delivery: "Seller Delivery Available",

  pickup: "Pickup Available",

  businessReviews: "320 Reviews",

  businessEmoji: "🍰",

  businessName: "Sweet Crumbs",

  color1: "#8B5A3C",
  color2: "#EBC7A8",

  availableToday: true,

  page: "desserts"
 
},
{
  name: "Vanilla Cupcakes",
  businessId: "Whisk-Wonders",
  seller: "Whisk Wonders",
  rating: "4.8",
  distance: "2 km",
  price: "₹149",
  emoji: "🧁",

  about:
    "Soft, freshly baked cupcakes topped with creamy frosting, available in a variety of delightful flavors.",

  location: "Bandra, Mumbai",

  delivery: "Seller Delivery Available",

  pickup: "Pickup Available",

  businessReviews: "320 Reviews",

  businessEmoji: "🧁",

  businessName: "Whisk Wonders",

  color1: "#F49AC2",
  color2: "#FFE7F0",
 availableToday: false,
  page: "desserts"
},
{
  name: "Frozen Scoops",
  businessId: "Cocoa Corner",
  seller: "Cocoa Corner",
  rating: "5.0",
  distance: "900 m",
  price: "₹79",
  emoji: "🍨",

  about:
    "Creamy handcrafted ice cream made with premium ingredients, offering rich flavors in every scoop.",

  location: "Bandra, Mumbai",

  delivery: "Seller Delivery Available",

  pickup: "Pickup Available",

  businessReviews: "320 Reviews",

  businessEmoji: "🍨",

  businessName: "Cocoa Corner",

  color1: "#8DD8FF",
  color2: "#EAF9FF",
availableToday: true,
  page: "desserts"
},
{
  name: "Chocolate Lava Cake",
  businessId: "molten-delights",
  seller: "Molten Delights",
  price: "₹199",
  rating: "4.9",
  distance: "1.8 km",
  emoji: "🍰",

  about:
    "Warm chocolate lava cake with a rich molten center, baked fresh for an irresistible dessert experience.",

  location: "Bandra, Mumbai",

  delivery: "Seller Delivery Available",

  pickup: "Pickup Available",

  businessReviews: "320 Reviews",

  businessEmoji: "🍰",

  businessName: "Molten Delights",

  color1: "#C56A52",
  color2: "#F6D7C5",
 availableToday: false,
  page: "desserts"
},
{
  name: "Belgian Brownies",
  businessId: "brownie-bliss",
  seller: "Brownie Bliss",
  price: "₹249",
  rating: "5.0",
  distance: "2.4 km",
  emoji: "🍫",

  about:
    "Decadent Belgian chocolate brownies with a rich, fudgy texture and premium cocoa flavor.",

  location: "Bandra, Mumbai",

  delivery: "Seller Delivery Available",

  pickup: "Pickup Available",

  businessReviews: "320 Reviews",

  businessEmoji: "🍫",

  businessName: "Brownie Bliss",

  color1: "#8E4D6D",
  color2: "#EAB38E",
availableToday: true,
  page: "desserts"
},
{
  name: "Strawberry Cupcakes",
  businessId: "berry-bakes",
  seller: "Berry Bakes",
  price: "₹149",
  rating: "4.8",
  distance: "3 km",
  emoji: "🧁",

  about:
    "Fluffy strawberry cupcakes topped with smooth buttercream frosting, perfect for every sweet craving.",

  location: "Bandra, Mumbai",

  delivery: "Seller Delivery Available",

  pickup: "Pickup Available",

  businessReviews: "320 Reviews",

  businessEmoji: "🧁",

  businessName: "Berry Bakes",

  color1: "#FFABC9",
  color2: "#FFE8F2",
 availableToday: false,
  page: "desserts"
},
];
dessertProducts.forEach((product) => {
  product.products = dessertProducts;
});
export default dessertProducts;
