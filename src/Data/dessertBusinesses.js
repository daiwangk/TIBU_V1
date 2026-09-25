/* eslint-disable */
import dessertProducts from "./dessertProducts";

const dessertBusinesses = [
  {
    id: "sweet-crumbs",
    businessName: "Sweet Crumbs",
    businessEmoji: "🍰",
    category: "Desserts",
    rating: "4.9",
    businessReviews: "320",
    location: "Bandra, Mumbai",
    about: "Freshly baked brownies, cakes and desserts made with premium ingredients.",
    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: dessertProducts.filter(
      (product) => product.businessId === "sweet-crumbs"
    ),

    reels: [
      {
        business: "Sweet Crumbs",
        caption: "Fresh brownies baked today 🤎",
        emoji: "🍫",
      },
    ],

    reviews: [
      {
        name: "Ayesha",
        rating: "⭐⭐⭐⭐⭐",
        review: "Absolutely loved the brownies.",
      },
    ],
  },

  {
    id: "Whisk-Wonders",
    businessName: "Whisk Wonders",
    businessEmoji: "🧁",
    category: "Desserts",
    rating: "4.8",
    businessReviews: "184",
    location: "Bandra, Mumbai",
    about: "Home bakery specializing in soft cupcakes and celebration treats.",
    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: dessertProducts.filter(
      (product) => product.businessId === "Whisk-Wonders"
    ),

    reels: [
      {
        business: "Whisk Wonders",
        caption: "Fresh cupcakes every morning 🧁",
        emoji: "🧁",
      },
    ],

    reviews: [
      {
        name: "Sara",
        rating: "⭐⭐⭐⭐⭐",
        review: "Best cupcakes I've had.",
      },
    ],
  },

  {
    id: "Cocoa Corner",
    businessName: "Cocoa Corner",
    businessEmoji: "🍨",
    category: "Desserts",
    rating: "5.0",
    businessReviews: "91",
    location: "Bandra, Mumbai",
    about: "Premium handcrafted desserts and frozen treats.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: dessertProducts.filter(
      (product) => product.businessId === "Cocoa Corner"
    ),

    reels: [
      {
        business: "Cocoa Corner",
        caption: "Fresh frozen scoops 🍨",
        emoji: "🍨",
      },
    ],

    reviews: [
      {
        name: "Ali",
        rating: "⭐⭐⭐⭐⭐",
        review: "Amazing ice cream.",
      },
    ],
  },

  {
    id: "molten-delights",
    businessName: "Molten Delights",
    businessEmoji: "🍰",
    category: "Desserts",
    category: "Desserts",
    rating: "4.9",
    businessReviews: "142",
    location: "Bandra, Mumbai",

    about: "Warm lava cakes and rich chocolate desserts.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: dessertProducts.filter(
      (product) => product.businessId === "molten-delights"
    ),

    reels: [
      {
        business: "Molten Delights",
        caption: "Molten chocolate 😍",
        emoji: "🍰",
      },
    ],

    reviews: [
      {
        name: "Mohit",
        rating: "⭐⭐⭐⭐⭐",
        review: "Lava cake was incredible.",
      },
    ],
  },

  {
    id: "brownie-bliss",
    businessName: "Brownie Bliss",
    businessEmoji: "🍫",
    category: "Desserts",
    rating: "5.0",
    businessReviews: "240",
    location: "Bandra, Mumbai",

    about: "Brownie lovers' paradise with premium Belgian chocolate.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: dessertProducts.filter(
      (product) => product.businessId === "brownie-bliss"
    ),

    reels: [
      {
        business: "Brownie Bliss",
        caption: "Belgian brownies 🍫",
        emoji: "🍫",
      },
    ],

    reviews: [
      {
        name: "Nida",
        rating: "⭐⭐⭐⭐⭐",
        review: "Absolutely addictive.",
      },
    ],
  },

  {
    id: "berry-bakes",
    businessName: "Berry Bakes",
    businessEmoji: "🧁",
    category: "Desserts",
    rating: "4.8",
    businessReviews: "160",
    location: "Bandra, Mumbai",

    about: "Fresh strawberry desserts and cupcakes made daily.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: dessertProducts.filter(
      (product) => product.businessId === "berry-bakes"
    ),

    reels: [
      {
        business: "Berry Bakes",
        caption: "Berry cupcakes 🍓",
        emoji: "🧁",
      },
    ],

    reviews: [
      {
        name: "Fatima",
        rating: "⭐⭐⭐⭐",
        review: "Very soft cupcakes.",
      },
    ],
  },
];

export default dessertBusinesses;