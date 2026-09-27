import menFashionProducts from "./menFashionProducts";

const menFashionBusinesses = [
  {
    id: "urban-mens-wear",
    businessName: "Urban Men's Wear",
    businessEmoji: "👔",
    category: "Men's Fashion",
    rating: "4.9",
    businessReviews: "320",
    location: "Bandra, Mumbai",
    about: "Premium men's shirts, t-shirts and everyday fashion.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: menFashionProducts.filter(
      (product) => product.businessId === "urban-mens-wear"
    ),

    reels: [
      {
        business: "Urban Men's Wear",
        caption: "Everyday essentials for men 👔",
        emoji: "👔",
      },
      {
        business: "Urban Men's Wear",
        caption: "Oversized tees now available 👕",
        emoji: "👕",
      },
    ],

    reviews: [
      {
        name: "Ayaan",
        rating: "⭐⭐⭐⭐⭐",
        review: "Great quality shirts.",
      },
      {
        name: "Rahul",
        rating: "⭐⭐⭐⭐⭐",
        review: "Perfect fit and fabric.",
      },
    ],
  },

  {
    id: "denim-house",
    businessName: "Denim House",
    businessEmoji: "👖",
    category: "Men's Fashion",
    rating: "4.8",
    businessReviews: "210",
    location: "Andheri, Mumbai",
    about: "Jeans, hoodies and premium denim collection.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: menFashionProducts.filter(
      (product) => product.businessId === "denim-house"
    ),

    reels: [
      {
        business: "Denim House",
        caption: "Fresh denim collection 👖",
        emoji: "👖",
      },
      {
        business: "Denim House",
        caption: "Premium hoodies this season 🧥",
        emoji: "🧥",
      },
    ],

    reviews: [
      {
        name: "Kabir",
        rating: "⭐⭐⭐⭐⭐",
        review: "Amazing denim quality.",
      },
      {
        name: "Faizan",
        rating: "⭐⭐⭐⭐",
        review: "Very comfortable hoodie.",
      },
    ],
  },

  {
    id: "street-style",
    businessName: "Street Style",
    businessEmoji: "🧢",
    category: "Men's Fashion",
    rating: "5.0",
    businessReviews: "170",
    location: "Juhu, Mumbai",
    about: "Modern streetwear and oversized fashion.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: menFashionProducts.filter(
      (product) => product.businessId === "street-style"
    ),

    reels: [
      {
        business: "Street Style",
        caption: "Streetwear fits 😎",
        emoji: "🧢",
      },
      {
        business: "Street Style",
        caption: "Cargo pants in stock 👖",
        emoji: "👖",
      },
    ],

    reviews: [
      {
        name: "Arjun",
        rating: "⭐⭐⭐⭐⭐",
        review: "Love the oversized fit.",
      },
      {
        name: "Zaid",
        rating: "⭐⭐⭐⭐⭐",
        review: "Great collection.",
      },
    ],
  },
];

export default menFashionBusinesses;