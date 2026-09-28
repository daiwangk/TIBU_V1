import candleBusinesses from './data/candleBusinesses';
import crochetBusinesses from './data/crochetBusinesses';
import dessertBusinesses from './data/dessertBusinesses';
import embroideryBusinesses from './data/embroideryBusinesses';
import giftBusinesses from './data/giftsBusinesses';
import jewelleryBusinesses from './data/jewelleryBusinesses';
import menFashionBusinesses from './data/menFashionBusinesses';
import resinBusinesses from './data/resinBusinesses';
import womenFashionBusinesses from './data/womenFashionBusinesses';

import candleProducts from './data/candleProducts';
import crochetProducts from './data/crochetProducts';
import dessertProducts from './data/dessertProducts';
import embroideryProducts from './data/embroideryProducts';
import giftsProducts from './data/giftsProducts';
import jewelleryProducts from './data/jewelleryProducts';
import menFashionProducts from './data/menFashionProducts';
import resinProducts from './data/resinProducts';
import womenFashionProducts from './data/womenFashionProducts';

import candleReels from './data/candleReels';
import crochetReels from './data/crochetReels';
import dessertReels from './data/dessertReels';
import embroideryReels from './data/embroideryReels';
import giftsReels from './data/giftsReels';
import jewelleryReels from './data/jewelleryReels';
import menFashionReels from './data/menFashionReels';
import resinReels from './data/resinReels';
import womenFashionReels from './data/womenFashionReels';

import { MOCK_USER_LOCATION } from '../../utils/distance';

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  // "₹899" -> 899
  const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 0 : num;
};

const parseRating = (ratingStr) => {
  if (!ratingStr) return 0;
  if (ratingStr.includes('⭐')) {
    return (ratingStr.match(/⭐/g) || []).length;
  }
  const num = parseFloat(ratingStr);
  return isNaN(num) ? 0 : num;
};

const parseReviews = (reviewsStr) => {
  if (!reviewsStr) return 0;
  // "320 Reviews" -> 320
  const num = parseInt(reviewsStr.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 0 : num;
};

// Spread all raw arrays
const rawBusinesses = [
  ...candleBusinesses,
  ...crochetBusinesses,
  ...dessertBusinesses,
  ...embroideryBusinesses,
  ...giftBusinesses,
  ...jewelleryBusinesses,
  ...menFashionBusinesses,
  ...resinBusinesses,
  ...womenFashionBusinesses,
];

const rawProducts = [
  ...candleProducts,
  ...crochetProducts,
  ...dessertProducts,
  ...embroideryProducts,
  ...giftsProducts,
  ...jewelleryProducts,
  ...menFashionProducts,
  ...resinProducts,
  ...womenFashionProducts,
];

const rawReels = [
  ...candleReels,
  ...crochetReels,
  ...dessertReels,
  ...embroideryReels,
  ...giftsReels,
  ...jewelleryReels,
  ...menFashionReels,
  ...resinReels,
  ...womenFashionReels,
];

// Deduplicate businesses by normalized id
const businessMap = new Map();
export const normalizedBusinesses = [];

rawBusinesses.forEach((b) => {
  const normId = (b.id || slugify(b.businessName)).toLowerCase();
  if (businessMap.has(normId)) return;
  
  // Create mock lat/lng around Mumbai
  const latOffset = (Math.random() - 0.5) * 0.1;
  const lngOffset = (Math.random() - 0.5) * 0.1;

  const nb = {
    id: normId,
    name: b.businessName,
    category: (b.category || '').toLowerCase().replace(' ', '-'),
    logoUrl: b.businessEmoji, // fallback
    bannerUrl: undefined,
    description: b.about || '',
    locality: b.location ? b.location.split(',')[0] : 'Mumbai',
    city: 'Mumbai',
    lat: MOCK_USER_LOCATION.lat + latOffset,
    lng: MOCK_USER_LOCATION.lng + lngOffset,
    phone: '9876543210', // placeholder required
    whatsapp: '9876543210',
    instagram: 'tibu_business',
    rating: parseRating(b.rating),
    reviewCount: parseReviews(b.businessReviews),
    deliveryAvailable: !!(b.delivery && b.delivery.toLowerCase().includes('delivery available')),
    pickupAvailable: !!(b.pickup && b.pickup.toLowerCase().includes('pickup available')),
    availableToday: false, // Computed from products later
    createdAt: new Date().toISOString(),
    reels: [], // populated later
  };
  
  businessMap.set(normId, nb);
  normalizedBusinesses.push(nb);
});

// Deduplicate products
const productMap = new Map();
export const normalizedProducts = [];

rawProducts.forEach((p) => {
  const bId = (p.businessId || slugify(p.seller || p.businessName)).toLowerCase();
  // Try to find the actual normalized business ID to ensure linkage
  const b = businessMap.get(bId) || businessMap.get(slugify(p.businessName));
  const finalBid = b ? b.id : bId;
  
  const pId = `${finalBid}-${slugify(p.name)}`;
  if (productMap.has(pId)) return;

  const np = {
    id: pId,
    businessId: finalBid,
    name: p.name,
    price: parsePrice(p.price),
    images: [p.emoji], // fallback
    description: p.about || '',
    category: p.page || '',
    stockStatus: 'in_stock',
    size: undefined,
    deliverable: !!(p.delivery && p.delivery.toLowerCase().includes('delivery available')),
    deliveryEstimate: '2-3 days',
    availableToday: !!p.availableToday,
    rating: parseRating(p.rating),
    reviewCount: parseReviews(p.businessReviews),
    createdAt: new Date().toISOString(),
    // Keep old properties for backward compatibility during transition if needed
    color1: p.color1,
    color2: p.color2,
    emoji: p.emoji,
  };
  
  // If product is available today, mark business availableToday
  if (np.availableToday && b) {
    b.availableToday = true;
  }

  productMap.set(pId, np);
  normalizedProducts.push(np);
});

export const normalizedReels = [];
// Process reels
rawReels.forEach((r, idx) => {
  const bId = (r.businessId || slugify(r.business)).toLowerCase();
  const b = businessMap.get(bId);
  const finalBid = b ? b.id : bId;

  const nr = {
    id: `reel-${idx}`,
    businessId: finalBid,
    caption: r.caption || '',
    emoji: r.emoji,
    color: r.color,
  };
  normalizedReels.push(nr);
  
  if (b) {
    b.reels.push(nr);
  }
});

// Extract mock reviews from businesses
export const mockReviews = [];
let reviewIdCounter = 1;
rawBusinesses.forEach((b) => {
  const bId = (b.id || slugify(b.businessName)).toLowerCase();
  const finalBid = businessMap.has(bId) ? bId : businessMap.has(slugify(b.businessName)) ? slugify(b.businessName) : bId;

  if (Array.isArray(b.reviews)) {
    b.reviews.forEach((rev) => {
      mockReviews.push({
        id: `rev-${reviewIdCounter++}`,
        businessId: finalBid,
        productId: null,
        authorName: rev.name || 'Anonymous',
        rating: parseRating(rev.rating),
        text: rev.review || '',
        createdAt: new Date().toISOString(),
      });
    });
  }
});
