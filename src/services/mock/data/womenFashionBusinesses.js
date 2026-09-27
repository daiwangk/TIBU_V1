import womenFashionProducts from "./womenFashionProducts";
import womenFashionReels from "./womenFashionReels";

const womenFashionBusinesses = [
  {
    id: "style-studio",
    businessName: "Style Studio",
    businessEmoji: "👗",
    category: "Women's Fashion",
    rating: "4.9",
    businessReviews: "320",
    location: "Bandra, Mumbai",
    about: "Elegant kurtis, dresses and everyday women's fashion.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: womenFashionProducts.filter(
      (product) => product.businessId === "style-studio"
    ),

    reels: womenFashionReels.filter(
      (reel) => reel.businessId === "style-studio"
    ),

    reviews: [],
  },

  {
    id: "urban-diva",
    businessName: "Urban Diva",
    businessEmoji: "🌸",
    category: "Women's Fashion",
    rating: "4.8",
    businessReviews: "260",
    location: "Andheri, Mumbai",
    about: "Trendy western wear and casual outfits.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: womenFashionProducts.filter(
      (product) => product.businessId === "urban-diva"
    ),

    reels: womenFashionReels.filter(
      (reel) => reel.businessId === "urban-diva"
    ),

    reviews: [],
  },

  {
    id: "trend-studio",
    businessName: "Trend Studio",
    businessEmoji: "✨",
    category: "Women's Fashion",
    rating: "4.9",
    businessReviews: "210",
    location: "Juhu, Mumbai",
    about: "Modern co-ords and premium fashion collections.",

    delivery: "Seller Delivery Available",
    pickup: "Pickup Available",

    products: womenFashionProducts.filter(
      (product) => product.businessId === "trend-studio"
    ),

    reels: womenFashionReels.filter(
      (reel) => reel.businessId === "trend-studio"
    ),

    reviews: [],
  },
];

export default womenFashionBusinesses;