import candleProducts from "./candleProducts";

const candleBusinesses = [
  {
    id: "aura-candles",
    businessName: "Aura Candles",
    businessEmoji: "🕯️",
    category: "Candles",
    rating: "4.9",
    businessReviews: "320",
    location: "Bandra, Mumbai",
    about: "Hand-poured scented candles made with premium soy wax.",
    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",
    products: candleProducts.filter(
      (product) => product.businessId === "aura-candles"
    ),
    reels: [
      {
        business: "Aura Candles",
        caption: "Fresh vanilla soy candles 🕯️",
        emoji: "🕯️",
      },
    ],
    reviews: [
      {
        name: "Ayesha",
        rating: "⭐⭐⭐⭐⭐",
        review: "Amazing fragrance.",
      },
    ],
  },

  {
    id: "lavish-glow",
    businessName: "Lavish Glow",
    businessEmoji: "💜",
    category: "Candles",
    rating: "4.8",
    businessReviews: "210",
    location: "Andheri, Mumbai",
    about: "Luxury scented candles for every mood.",
    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",
    products: candleProducts.filter(
      (product) => product.businessId === "lavish-glow"
    ),
    reels: [
  {
    business: "Lavish Glow",
    caption: "Lavender candles poured today 💜",
    emoji: "💜",
  },
  {
    business: "Lavish Glow",
    caption: "Relaxing evening candle setup ✨",
    emoji: "🕯️",
  },
],

reviews: [
  {
    name: "Zara",
    rating: "⭐⭐⭐⭐⭐",
    review: "Smells amazing for hours.",
  },
  {
    name: "Nikhil",
    rating: "⭐⭐⭐⭐⭐",
    review: "Beautiful packaging.",
  },
],
},

  {
    id: "petal-flame",
    businessName: "Petal Flame",
    businessEmoji: "🌹",
    category: "Candles",
    rating: "5.0",
    businessReviews: "145",
    location: "Juhu, Mumbai",
    about: "Beautiful floral aroma candles.",
    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",
    products: candleProducts.filter(
      (product) => product.businessId === "petal-flame"
    ),
    reels: [
  {
    business: "Petal Flame",
    caption: "Fresh rose aroma candles 🌹",
    emoji: "🌹",
  },
  {
    business: "Petal Flame",
    caption: "Perfect gift for every occasion 🎁",
    emoji: "🎁",
  },
],

reviews: [
  {
    name: "Sara",
    rating: "⭐⭐⭐⭐⭐",
    review: "The rose fragrance is beautiful.",
  },
  {
    name: "Arjun",
    rating: "⭐⭐⭐⭐",
    review: "Looks premium.",
  },
],
  },

  {
    id: "roast-glow",
    businessName: "Roast & Glow",
    businessEmoji: "☕",
    category: "Candles",
    rating: "4.9",
    businessReviews: "180",
    location: "Bandra, Mumbai",
    about: "Coffee-inspired handcrafted candles.",
    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",
    products: candleProducts.filter(
      (product) => product.businessId === "roast-glow"
    ),
    reels: [
  {
    business: "Roast & Glow",
    caption: "Coffee lovers, this one's for you ☕",
    emoji: "☕",
  },
  {
    business: "Roast & Glow",
    caption: "Fresh coffee candle pouring 🤎",
    emoji: "🕯️",
  },
],

reviews: [
  {
    name: "Faizan",
    rating: "⭐⭐⭐⭐⭐",
    review: "Smells exactly like fresh coffee.",
  },
  {
    name: "Riya",
    rating: "⭐⭐⭐⭐⭐",
    review: "Perfect for my workspace.",
  },
],
  },

  {
    id: "wax-haven",
    businessName: "Wax Haven",
    businessEmoji: "✨",
    category: "Candles",
    rating: "5.0",
    businessReviews: "160",
    location: "Khar, Mumbai",
    about: "Modern decorative candles.",
    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",
    products: candleProducts.filter(
      (product) => product.businessId === "wax-haven"
    ),
    reels: [
  {
    business: "Wax Haven",
    caption: "Trending bubble candles ✨",
    emoji: "✨",
  },
  {
    business: "Wax Haven",
    caption: "Modern home decor candles 🏠",
    emoji: "🕯️",
  },
],

reviews: [
  {
    name: "Kunal",
    rating: "⭐⭐⭐⭐⭐",
    review: "Looks beautiful on my shelf.",
  },
  {
    name: "Mira",
    rating: "⭐⭐⭐⭐",
    review: "Unique designs.",
  },
],
  },

  {
    id: "cozy-wick",
    businessName: "Cozy Wick",
    businessEmoji: "❤️",
    category: "Candles",
    rating: "4.8",
    businessReviews: "170",
    location: "Santacruz, Mumbai",
    about: "Cute handmade gift candles.",
    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",
    products: candleProducts.filter(
      (product) => product.businessId === "cozy-wick"
    ),
    reels: [
  {
    business: "Cozy Wick",
    caption: "Cute heart candles ❤️",
    emoji: "❤️",
  },
  {
    business: "Cozy Wick",
    caption: "Gift-ready candle collection 🎁",
    emoji: "🎁",
  },
],

reviews: [
  {
    name: "Priya",
    rating: "⭐⭐⭐⭐⭐",
    review: "Perfect gift for my friend.",
  },
  {
    name: "Kabir",
    rating: "⭐⭐⭐⭐⭐",
    review: "Loved the quality.",
  },
],
  },
];

export default candleBusinesses;