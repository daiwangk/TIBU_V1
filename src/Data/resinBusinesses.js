import resinProducts from "./resinProducts";
import resinReels from "./resinReels";

const resinBusinesses = [
  {
    id: "blue-wave-resin",
    businessName: "Blue Wave Resin",
    businessEmoji: "🌊",
    category: "Resin Art",
    rating: "4.9",
    businessReviews: "320",
    location: "Bandra, Mumbai",
    about: "Handcrafted ocean-inspired resin décor and serving trays.",
    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: resinProducts.filter(
      (product) => product.businessId === "blue-wave-resin"
    ),

    reels: resinReels.filter(
      (reel) => reel.businessId === "blue-wave-resin"
    ),

    reviews: [
      {
        name: "Ayesha",
        rating: "⭐⭐⭐⭐⭐",
        review: "Looks exactly like the ocean.",
      },
      {
        name: "Rohan",
        rating: "⭐⭐⭐⭐⭐",
        review: "Excellent quality.",
      },
    ],
  },

  {
    id: "petal-pour-studio",
    businessName: "Petal Pour Studio",
    businessEmoji: "🌸",
    category: "Resin Art",
    rating: "4.8",
    businessReviews: "210",
    location: "Andheri, Mumbai",
    about: "Pressed flower resin creations.",
    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: resinProducts.filter(
      (product) => product.businessId === "petal-pour-studio"
    ),

    reels: resinReels.filter(
      (reel) => reel.businessId === "petal-pour-studio"
    ),

    reviews: [
      {
        name: "Sara",
        rating: "⭐⭐⭐⭐⭐",
        review: "Beautiful craftsmanship.",
      },
    ],
  },

  {
    id: "crystal-crafts",
    businessName: "Crystal Crafts",
    businessEmoji: "✨",
    category: "Resin Art",
    rating: "5.0",
    businessReviews: "180",
    location: "Juhu, Mumbai",
    about: "Elegant handmade resin accessories.",
    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: resinProducts.filter(
      (product) => product.businessId === "crystal-crafts"
    ),

    reels: resinReels.filter(
      (reel) => reel.businessId === "crystal-crafts"
    ),

    reviews: [
      {
        name: "Mira",
        rating: "⭐⭐⭐⭐⭐",
        review: "Very premium finish.",
      },
    ],
  },

  {
    id: "shine-studio",
    businessName: "Shine Studio",
    businessEmoji: "💎",
    category: "Resin Art",
    rating: "4.9",
    businessReviews: "165",
    location: "Khar, Mumbai",
    about: "Custom resin phone accessories.",
    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: resinProducts.filter(
      (product) => product.businessId === "shine-studio"
    ),

    reels: resinReels.filter(
      (reel) => reel.businessId === "shine-studio"
    ),

    reviews: [
      {
        name: "Kabir",
        rating: "⭐⭐⭐⭐⭐",
        review: "Loved the custom design.",
      },
    ],
  },

  {
    id: "artify-resin",
    businessName: "Artify Resin",
    businessEmoji: "🧡",
    category: "Resin Art",
    rating: "5.0",
    businessReviews: "195",
    location: "Santacruz, Mumbai",
    about: "Creative resin bookmarks and décor.",
    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: resinProducts.filter(
      (product) => product.businessId === "artify-resin"
    ),

    reels: resinReels.filter(
      (reel) => reel.businessId === "artify-resin"
    ),

    reviews: [
      {
        name: "Priya",
        rating: "⭐⭐⭐⭐⭐",
        review: "Unique designs.",
      },
    ],
  },

  {
    id: "coastal-creations",
    businessName: "Coastal Creations",
    businessEmoji: "🌊",
    category: "Resin Art",
    rating: "4.8",
    businessReviews: "170",
    location: "Bandra, Mumbai",
    about: "Luxury ocean resin décor.",
    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: resinProducts.filter(
      (product) => product.businessId === "coastal-creations"
    ),

    reels: resinReels.filter(
      (reel) => reel.businessId === "coastal-creations"
    ),

    reviews: [
      {
        name: "Neha",
        rating: "⭐⭐⭐⭐⭐",
        review: "Absolutely gorgeous.",
      },
    ],
  },
];

export default resinBusinesses;