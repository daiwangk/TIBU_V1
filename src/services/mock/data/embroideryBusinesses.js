import embroideryProducts from "./embroideryProducts";

const embroideryBusinesses = [
  {
    id: "needle-knot",
    businessName: "Needle & Knot",
    businessEmoji: "🧵",
    category: "Embroidery",
    rating: "4.9",
    businessReviews: "320",
    location: "Bandra, Mumbai",

    about:
      "Beautiful handcrafted embroidery hoops and personalised embroidery made with premium threads.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: embroideryProducts.filter(
      (p) => p.businessId === "needle-knot"
    ),

    reels: [
      {
        business: "Needle & Knot",
        caption: "Fresh floral embroidery 🌸",
        emoji: "🌸",
      },
    ],

    reviews: [
      {
        name: "Ayesha",
        rating: "⭐⭐⭐⭐⭐",
        review: "Amazing embroidery quality.",
      },
    ],
  },

  {
    id: "stitch-stories",
    businessName: "Stitch Stories",
    businessEmoji: "🪡",
    category: "Embroidery",
    rating: "4.8",
    businessReviews: "240",
    location: "Andheri, Mumbai",

    about:
      "Personalised embroidery hoops and custom handmade gifts.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: embroideryProducts.filter(
      (p) => p.businessId === "stitch-stories"
    ),

    reels: [
      {
        business: "Stitch Stories",
        caption: "Custom name embroidery ✨",
        emoji: "🪡",
      },
    ],

    reviews: [
      {
        name: "Sara",
        rating: "⭐⭐⭐⭐⭐",
        review: "Loved my custom hoop.",
      },
    ],
  },

  {
    id: "thread-bloom",
    businessName: "Thread Bloom",
    businessEmoji: "🧵",
    category: "Embroidery",
    rating: "5.0",
    businessReviews: "180",
    location: "Juhu, Mumbai",

    about:
      "Handmade embroidered tote bags and lifestyle accessories.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: embroideryProducts.filter(
      (p) => p.businessId === "thread-bloom"
    ),

    reels: [
      {
        business: "Thread Bloom",
        caption: "Embroidered tote bags 👜",
        emoji: "👜",
      },
    ],

    reviews: [
      {
        name: "Fatima",
        rating: "⭐⭐⭐⭐⭐",
        review: "Beautiful craftsmanship.",
      },
    ],
  },

  {
    id: "thread-and-bloom",
    businessName: "Thread & Bloom",
    businessEmoji: "🪡",
    category: "Embroidery",
    rating: "4.9",
    businessReviews: "150",
    location: "Bandra, Mumbai",

    about:
      "Modern embroidered apparel and personalised clothing.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: embroideryProducts.filter(
      (p) => p.businessId === "thread-and-bloom"
    ),

    reels: [
      {
        business: "Thread & Bloom",
        caption: "Custom embroidered tees 👕",
        emoji: "👕",
      },
    ],

    reviews: [
      {
        name: "Zoya",
        rating: "⭐⭐⭐⭐⭐",
        review: "Excellent finishing.",
      },
    ],
  },

  {
    id: "tiny-threads-studio",
    businessName: "Tiny Threads Studio",
    businessEmoji: "🧵",
    category: "Embroidery",
    rating: "5.0",
    businessReviews: "200",
    location: "Santacruz, Mumbai",

    about:
      "Personalised nursery embroidery and baby keepsakes.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: embroideryProducts.filter(
      (p) => p.businessId === "tiny-threads-studio"
    ),

    reels: [
      {
        business: "Tiny Threads Studio",
        caption: "Baby name frames 👶",
        emoji: "🖼️",
      },
    ],

    reviews: [
      {
        name: "Nadia",
        rating: "⭐⭐⭐⭐⭐",
        review: "Perfect baby gift.",
      },
    ],
  },

  {
    id: "cozy-stitches",
    businessName: "Cozy Stitches",
    businessEmoji: "🌸",
    category: "Embroidery",
    rating: "4.8",
    businessReviews: "175",
    location: "Versova, Mumbai",

    about:
      "Handcrafted embroidered home décor made with love.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: embroideryProducts.filter(
      (p) => p.businessId === "cozy-stitches"
    ),

    reels: [
      {
        business: "Cozy Stitches",
        caption: "Beautiful cushion covers 🌸",
        emoji: "🛋️",
      },
    ],

    reviews: [
      {
        name: "Hina",
        rating: "⭐⭐⭐⭐",
        review: "Looks beautiful in my home.",
      },
    ],
  },
];

export default embroideryBusinesses;