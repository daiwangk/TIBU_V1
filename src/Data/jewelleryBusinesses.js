import jewelleryProducts from "./jewelleryProducts";

const jewelleryBusinesses = [
  {
    id: "pearl-bloom",
    businessName: "Pearl Bloom",
    businessEmoji: "💍",
    category: "Jewellery",
    rating: "4.9",
    businessReviews: "180",
    location: "Bandra, Mumbai",
    about: "Elegant handcrafted jewellery designed for everyday and festive wear.",
    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: jewelleryProducts.filter(
      (product) => product.businessId === "pearl-bloom"
    ),

    reels: [
      {
        business: "Pearl Bloom",
        caption: "Elegant pearl earrings ✨",
        emoji: "💍",
      },
      {
        business: "Pearl Bloom",
        caption: "Minimal jewellery collection 🤍",
        emoji: "✨",
      },
    ],

    reviews: [
      {
        name: "Ayesha",
        rating: "⭐⭐⭐⭐⭐",
        review: "Beautiful quality and elegant finish.",
      },
      {
        name: "Neha",
        rating: "⭐⭐⭐⭐⭐",
        review: "Looks premium.",
      },
    ],
  },

  {
    id: "golden-aura",
    businessName: "Golden Aura",
    businessEmoji: "✨",
    category: "Jewellery",
    rating: "4.8",
    businessReviews: "240",
    location: "Andheri, Mumbai",
    about: "Modern gold plated jewellery.",
    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: jewelleryProducts.filter(
      (product) => product.businessId === "golden-aura"
    ),

    reels: [
      {
        business: "Golden Aura",
        caption: "Gold plated bracelets ✨",
        emoji: "✨",
      },
    ],

    reviews: [
      {
        name: "Sara",
        rating: "⭐⭐⭐⭐⭐",
        review: "Absolutely loved it.",
      },
    ],
  },

  {
    id: "jewels-by-sara",
    businessName: "Jewels by Sara",
    businessEmoji: "📿",
    category: "Jewellery",
    rating: "4.9",
    businessReviews: "210",
    location: "Juhu, Mumbai",
    about: "Handcrafted necklaces and bridal jewellery.",
    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: jewelleryProducts.filter(
      (product) => product.businessId === "jewels-by-sara"
    ),

    reels: [
      {
        business: "Jewels by Sara",
        caption: "Bridal necklace collection 👑",
        emoji: "👑",
      },
    ],

    reviews: [
      {
        name: "Riya",
        rating: "⭐⭐⭐⭐⭐",
        review: "Perfect for weddings.",
      },
    ],
  },
];

export default jewelleryBusinesses;