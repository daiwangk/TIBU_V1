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

import { MOCK_USER_LOCATION } from '../../utils/distance';
import { getCategoryRecord, mapBusinessCategory, mapProductPage } from './taxonomy';

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  const num = parseInt(String(priceStr).replace(/[^0-9]/g, ''), 10);
  return Number.isNaN(num) ? 0 : num;
};

const parseRating = (ratingStr) => {
  if (!ratingStr) return 0;
  if (String(ratingStr).includes('⭐')) {
    return (String(ratingStr).match(/⭐/g) || []).length;
  }
  const num = parseFloat(ratingStr);
  return Number.isNaN(num) ? 0 : num;
};

const parseReviews = (reviewsStr) => {
  if (!reviewsStr) return 0;
  const num = parseInt(String(reviewsStr).replace(/[^0-9]/g, ''), 10);
  return Number.isNaN(num) ? 0 : num;
};

/** Deterministic ±0.05° offset from a string hash of the slug. */
function offsetFromSlug(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i += 1) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  const latSign = h & 1 ? 1 : -1;
  const lngSign = h & 2 ? 1 : -1;
  const latMag = ((h >>> 2) % 1000) / 1000;
  const lngMag = ((h >>> 12) % 1000) / 1000;
  return {
    lat: MOCK_USER_LOCATION.lat + latSign * latMag * 0.05,
    lng: MOCK_USER_LOCATION.lng + lngSign * lngMag * 0.05,
  };
}

const BASE_DATE = Date.UTC(2026, 8, 1); // 2026-09-01

function isoDaysBefore(index) {
  return new Date(BASE_DATE - index * 24 * 60 * 60 * 1000).toISOString();
}

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

/** @type {Map<string, object>} */
const businessMap = new Map();
/** @type {object[]} */
export const businesses = [];

rawBusinesses.forEach((b, index) => {
  const normId = (b.id || slugify(b.businessName)).toLowerCase();
  if (businessMap.has(normId)) return;

  const categorySlug = mapBusinessCategory(b.category);
  const cat = getCategoryRecord(categorySlug);
  const { lat, lng } = offsetFromSlug(normId);

  const nb = {
    id: normId,
    slug: normId,
    name: b.businessName,
    categorySlug,
    categoryName: cat ? cat.name : categorySlug,
    logoUrl: null,
    bannerUrl: null,
    locality: b.location ? b.location.split(',')[0].trim() : 'Mumbai',
    city: 'Mumbai',
    addressText: b.location || 'Mumbai',
    description: b.about || '',
    lat,
    lng,
    distanceM: null,
    rating: parseRating(b.rating),
    reviewCount: parseReviews(b.businessReviews),
    deliveryAvailable: !!(b.delivery && String(b.delivery).toLowerCase().includes('delivery available')),
    pickupAvailable: !!(b.pickup && String(b.pickup).toLowerCase().includes('pickup available')),
    availableToday: false,
    approvedAt: isoDaysBefore(index),
    images: [],
    videos: [],
  };

  businessMap.set(normId, nb);
  businesses.push(nb);
});

/** @type {Map<string, object>} */
const productMap = new Map();
/** @type {object[]} */
export const products = [];

rawProducts.forEach((p, index) => {
  const bId = (p.businessId || slugify(p.seller || p.businessName)).toLowerCase();
  const b = businessMap.get(bId) || businessMap.get(slugify(p.businessName));
  const finalBid = b ? b.id : bId;

  const pId = `${finalBid}-${slugify(p.name)}`;
  if (productMap.has(pId)) return;

  const categorySlug = mapProductPage(p.page);
  const biz = businessMap.get(finalBid);

  const np = {
    id: pId,
    name: p.name,
    price: parsePrice(p.price),
    imageUrl: null,
    categorySlug,
    availableToday: !!p.availableToday,
    businessId: finalBid,
    businessSlug: biz ? biz.slug : finalBid,
    businessName: biz ? biz.name : p.businessName || p.seller || '',
    businessLogoUrl: null,
    businessRating: biz ? biz.rating : parseRating(p.rating),
    locality: biz ? biz.locality : p.location ? p.location.split(',')[0].trim() : 'Mumbai',
    distanceM: null,
    createdAt: isoDaysBefore(index),
    description: p.about || '',
    images: [],
    details: [],
    // internal for distance when near is set
    _lat: biz ? biz.lat : MOCK_USER_LOCATION.lat,
    _lng: biz ? biz.lng : MOCK_USER_LOCATION.lng,
  };

  if (np.availableToday && biz) {
    biz.availableToday = true;
  }

  productMap.set(pId, np);
  products.push(np);
});

/** @type {object[]} */
export const reviews = [];
let reviewIdCounter = 1;

rawBusinesses.forEach((b, index) => {
  const bId = (b.id || slugify(b.businessName)).toLowerCase();
  const finalBid = businessMap.has(bId)
    ? bId
    : businessMap.has(slugify(b.businessName))
      ? slugify(b.businessName)
      : bId;

  if (!Array.isArray(b.reviews)) return;

  b.reviews.forEach((rev, revIndex) => {
    const iso = isoDaysBefore(index + revIndex);
    reviews.push({
      id: `rev-${reviewIdCounter}`,
      businessId: finalBid,
      reviewerName: rev.name || 'Anonymous',
      rating: parseRating(rev.rating),
      body: rev.review || '',
      createdAt: iso,
      updatedAt: iso,
      isMine: false,
    });
    reviewIdCounter += 1;
  });
});
