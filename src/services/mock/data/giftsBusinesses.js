import giftsProducts from "./giftsProducts";

const giftBusinesses = [
  {
    id: "gift-studio",
    businessName: "Gift Studio",
    businessEmoji: "🎁",
    category: "Gifts",
    rating: "4.9",
    businessReviews: "320",
    location: "Bandra, Mumbai",
    about: "Curated gift hampers and baskets for every celebration.",
    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: giftsProducts.filter(
      (product) => product.businessId === "gift-studio"
    ),

    reels: [
      {
        business: "Gift Studio",
        caption: "Perfect birthday hampers 🎁",
        emoji: "🎁",
      },
    ],

    reviews: [
      {
        name: "Ayesha",
        rating: "⭐⭐⭐⭐⭐",
        review: "Beautiful packaging and quick delivery.",
      },
    ],
  },

  {
  id: "sweet-moments",
  businessName: "Sweet Moments",
  businessEmoji: "🍫",
  category: "Gifts",
  rating: "4.8",
  businessReviews: "210",
  location: "Andheri, Mumbai",
  about: "Premium chocolates and edible gifts.",

  delivery: "Seller Delivery Available",
  pickup: "Pickup Available",

  products: giftsProducts.filter(
    (product) => product.businessId === "sweet-moments"
  ),

  reels: [
    {
      business: "Sweet Moments",
      caption: "Luxury chocolate gift boxes 🍫",
      emoji: "🍫",
    },
  ],

  reviews: [
    {
      name: "Sara",
      rating: "⭐⭐⭐⭐⭐",
      review: "The chocolates were delicious and beautifully packed.",
    },
  ],
},

{
  id: "craft-studio",
  businessName: "Craft Studio",
  businessEmoji: "🖌️",
  category: "Gifts",
  rating: "4.9",
  businessReviews: "180",
  location: "Juhu, Mumbai",
  about: "Personalized gifts crafted with love.",

  delivery: "Seller Delivery Available",
  pickup: "Pickup Available",

  products: giftsProducts.filter(
    (product) => product.businessId === "craft-studio"
  ),

  reels: [
    {
      business: "Craft Studio",
      caption: "Personalized gifts made with love 🖌️",
      emoji: "🖌️",
    },
  ],

  reviews: [
    {
      name: "Aarav",
      rating: "⭐⭐⭐⭐⭐",
      review: "The personalized mug turned out exactly as I wanted.",
    },
  ],
},

{
  id: "bloom-house",
  businessName: "Bloom House",
  businessEmoji: "🌸",
  category: "Gifts",
  rating: "5.0",
  businessReviews: "145",
  location: "Khar, Mumbai",
  about: "Fresh flower bouquets and floral gifting.",

  delivery: "Seller Delivery Available",
  pickup: "Pickup Available",

  products: giftsProducts.filter(
    (product) => product.businessId === "bloom-house"
  ),

  reels: [
    {
      business: "Bloom House",
      caption: "Fresh flower bouquets 💐",
      emoji: "💐",
    },
  ],

  reviews: [
    {
      name: "Fatima",
      rating: "⭐⭐⭐⭐⭐",
      review: "The bouquet was fresh, elegant, and arrived on time.",
    },
  ],
},
];

export default giftBusinesses;