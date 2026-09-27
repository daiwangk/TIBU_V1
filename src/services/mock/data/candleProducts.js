const candleProducts = [
  {
    name: "Vanilla Soy Candle",
    businessId: "aura-candles",
    seller: "Aura Candles",
    price: "₹99",
    rating: "4.9",
    distance: "1.2 km",
    emoji: "🕯️",

    about:
      "Hand-poured soy wax candle with a calming vanilla fragrance and long burn time.",

    location: "Bandra, Mumbai",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    businessReviews: "320 Reviews",
    businessEmoji: "🕯️",
    businessName: "Aura Candles",

    color1: "#D18C5B",
    color2: "#F8E2C7",
availableToday: false,
    page: "candles",
  },

  {
    name: "Lavender Jar Candle",
    businessId: "lavish-glow",
    seller: "Lavish Glow",
    price: "₹149",
    rating: "4.8",
    distance: "2 km",
    emoji: "💜",

    about:
      "Relaxing lavender-scented jar candle made with natural soy wax for a clean and soothing burn.",

    location: "Bandra, Mumbai",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    businessReviews: "320 Reviews",
    businessEmoji: "🕯️",
    businessName: "Lavish Glow",

    color1: "#F49AC2",
    color2: "#FFE7F0",
availableToday: true,

    page: "candles",
  },

  {
    name: "Rose Aroma Candle",
    businessId: "petal-flame",
    seller: "Petal Flame",
    price: "₹79",
    rating: "5.0",
    distance: "900 m",
    emoji: "🌹",

    about:
      "Elegant rose-scented candle with a delicate floral fragrance, perfect for gifting and relaxation.",

    location: "Bandra, Mumbai",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    businessReviews: "320 Reviews",
    businessEmoji: "🌹",
    businessName: "Petal Flame",

    color1: "#8DD8FF",
    color2: "#EAF9FF",
availableToday: false,
    page: "candles",
  },

  {
    name: "Coffee Scent Candle",
    businessId: "roast-glow",
    seller: "Roast & Glow",
    price: "₹199",
    rating: "4.9",
    distance: "1.8 km",
    emoji: "☕",

    about:
      "Rich coffee-scented candle that fills your space with the warm aroma of freshly brewed coffee.",

    location: "Bandra, Mumbai",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    businessReviews: "320 Reviews",
    businessEmoji: "☕",
    businessName: "Roast & Glow",

    color1: "#C56A52",
    color2: "#F6D7C5",
availableToday: true,

    page: "candles",
  },

  {
    name: "Bubble Candle",
    businessId: "wax-haven",
    seller: "Wax Haven",
    price: "₹249",
    rating: "5.0",
    distance: "2.4 km",
    emoji: "🫧",

    about:
      "Modern bubble-shaped decorative candle handcrafted to add elegance to any room or workspace.",

    location: "Bandra, Mumbai",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    businessReviews: "320 Reviews",
    businessEmoji: "✨",
    businessName: "Wax Haven",

    color1: "#8E4D6D",
    color2: "#EAB38E",
availableToday: false,
    page: "candles",
  },

  {
    name: "Heart Candle",
    businessId: "cozy-wick",
    seller: "Cozy Wick",
    price: "₹149",
    rating: "4.8",
    distance: "3 km",
    emoji: "❤️",

    about:
      "Heart-shaped scented candle handcrafted with premium wax, making it a thoughtful gift for loved ones.",

    location: "Bandra, Mumbai",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    businessReviews: "320 Reviews",
    businessEmoji: "❤️",
    businessName: "Cozy Wick",

    color1: "#FFABC9",
    color2: "#FFE8F2",
availableToday: true,

    page: "candles",
  },
];
candleProducts.forEach((product) => {
  product.products = candleProducts;
});

export default candleProducts;