import crochetProducts from "./crochetProducts";

const crochetBusinesses = [
  {
    id: "crochet-by-sarah",

    businessName: "Crochet by Sarah",
    businessEmoji: "🧶",
    category: "Crochet",

    rating: "4.9",
    businessReviews: "320",

    location: "Bandra, Mumbai",

    about:
      "Beautiful handmade crochet flowers and gifts crafted with love.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: crochetProducts.filter(
      (p) => p.businessId === "crochet-by-sarah"
    ),

    reels: [
      {
        business: "Crochet by Sarah",
        caption: "Fresh handmade crochet flowers 🌷",
        emoji: "🌷",
      },
    ],

    reviews: [
      {
        name: "Ayesha",
        rating: "⭐⭐⭐⭐⭐",
        review: "Amazing craftsmanship.",
      },
    ],
  },

  {
    id: "yarn-haven",

    businessName: "Yarn Haven",
    businessEmoji: "🧸",
    category: "Crochet",

    rating: "4.8",
    businessReviews: "210",

    location: "Andheri",

    about:
      "Cute handmade crochet plushies for every age.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: crochetProducts.filter(
      (p) => p.businessId === "yarn-haven"
    ),

    reels: [
      {
        business: "Yarn Haven",
        caption: "Cute plushies handmade 🧸",
        emoji: "🧸",
      },
    ],

    reviews: [
      {
        name: "Rohan",
        rating: "⭐⭐⭐⭐⭐",
        review: "Soft and adorable.",
      },
    ],
  },

  {
    id: "loop-knot",

    businessName: "Loop & Knot",
    businessEmoji: "👜",
    category: "Crochet",

    rating: "5.0",
    businessReviews: "170",

    location: "Juhu",

    about:
      "Stylish crochet bags handmade for everyday use.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: crochetProducts.filter(
      (p) => p.businessId === "loop-knot"
    ),

    reels: [
      {
        business: "Loop & Knot",
        caption: "Crochet bags ready 👜",
        emoji: "👜",
      },
    ],

    reviews: [
      {
        name: "Fatima",
        rating: "⭐⭐⭐⭐⭐",
        review: "Loved the quality.",
      },
    ],
  },

  {
    id: "forever-blooms",

    businessName: "Forever Blooms",
    businessEmoji: "💐",
category: "Crochet",
    rating: "4.9",
    businessReviews: "180",

    location: "Bandra",

    about:
      "Everlasting crochet flower bouquets for gifting.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: crochetProducts.filter(
      (p) => p.businessId === "forever-blooms"
    ),

    reels: [
      {
        business: "Forever Blooms",
        caption: "Bouquets that never fade 💐",
        emoji: "💐",
      },
    ],

    reviews: [
      {
        name: "Sara",
        rating: "⭐⭐⭐⭐⭐",
        review: "Perfect gift idea.",
      },
    ],
  },

  {
    id: "yarn-tales",

    businessName: "Yarn Tales",
    businessEmoji: "📖",
category: "Crochet",
    rating: "5.0",
    businessReviews: "145",

    location: "Santacruz",

    about:
      "Handmade crochet bookmarks and reading accessories.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: crochetProducts.filter(
      (p) => p.businessId === "yarn-tales"
    ),

    reels: [
      {
        business: "Yarn Tales",
        caption: "Bookmarks for book lovers 📖",
        emoji: "📖",
      },
    ],

    reviews: [
      {
        name: "Nina",
        rating: "⭐⭐⭐⭐⭐",
        review: "Beautiful detailing.",
      },
    ],
  },

  {
    id: "cozy-loops",

    businessName: "Cozy Loops",
    businessEmoji: "🧣",
category: "Crochet",
    rating: "4.8",
    businessReviews: "260",

    location: "Powai",

    about:
      "Warm crochet scarves and winter accessories.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: crochetProducts.filter(
      (p) => p.businessId === "cozy-loops"
    ),

    reels: [
      {
        business: "Cozy Loops",
        caption: "Winter crochet collection 🧣",
        emoji: "🧣",
      },
    ],

    reviews: [
      {
        name: "Ali",
        rating: "⭐⭐⭐⭐⭐",
        review: "Very cozy and soft.",
      },
    ],
  },
];

export default crochetBusinesses;