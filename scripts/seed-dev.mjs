#!/usr/bin/env node
/**
 * scripts/seed-dev.mjs — Idempotent dev seed for tibu-dev
 * Run: node --env-file=.env.seed scripts/seed-dev.mjs
 *
 * Creates 12 sellers, 2 customers, 12 businesses (10 approved, 1 pending,
 * 1 rejected), ~45 products with images, contacts, reviews and optional videos.
 *
 * Safe to re-run: upserts businesses by slug, deletes and recreates child rows
 * belonging to seed slugs/emails only. Does not touch non-seed data.
 */

import { createClient } from '@supabase/supabase-js';

/* ═══════════════════════════════════════════════════════════════════
   1. SAFETY GATE
   ═══════════════════════════════════════════════════════════════════ */

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_ALLOWED_REF } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SEED_ALLOWED_REF) {
  console.error(
    '❌ Missing required env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_ALLOWED_REF).\n' +
    '   Copy .env.seed.example → .env.seed and fill in the dev project values.',
  );
  process.exit(1);
}

if (!SUPABASE_URL.includes(SEED_ALLOWED_REF)) {
  console.error(
    `❌ Safety: SUPABASE_URL does not contain SEED_ALLOWED_REF ("${SEED_ALLOWED_REF}").\n` +
    '   This guard prevents accidentally seeding production. Check .env.seed.',
  );
  process.exit(1);
}

// Never print the service-role key
console.log(`\n🌱 Target: ${SUPABASE_URL}\n`);

/* ═══════════════════════════════════════════════════════════════════
   2. SUPABASE CLIENT (service-role, bypasses RLS)
   ═══════════════════════════════════════════════════════════════════ */

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/* ═══════════════════════════════════════════════════════════════════
   3. CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */

const PASSWORD = 'Test@12345';

/** ~10 Mumbai localities for business lat/lng */
const AREAS = [
  { name: 'Andheri West',   lat: 19.1364, lng: 72.8296 },
  { name: 'Bandra West',    lat: 19.0596, lng: 72.8295 },
  { name: 'Juhu',           lat: 19.1075, lng: 72.8263 },
  { name: 'Powai',          lat: 19.1176, lng: 72.9060 },
  { name: 'Malad West',     lat: 19.1874, lng: 72.8484 },
  { name: 'Borivali West',  lat: 19.2288, lng: 72.8544 },
  { name: 'Versova',        lat: 19.1320, lng: 72.8172 },
  { name: 'Khar West',      lat: 19.0726, lng: 72.8362 },
  { name: 'Santacruz West', lat: 19.0830, lng: 72.8410 },
  { name: 'Goregaon West',  lat: 19.1663, lng: 72.8491 },
];

const SELLERS = [
  { email: 'seller1@tibu.test',  name: 'Priya Sharma' },
  { email: 'seller2@tibu.test',  name: 'Amit Patel' },
  { email: 'seller3@tibu.test',  name: 'Neha Gupta' },
  { email: 'seller4@tibu.test',  name: 'Rahul Verma' },
  { email: 'seller5@tibu.test',  name: 'Sneha Desai' },
  { email: 'seller6@tibu.test',  name: 'Vikram Joshi' },
  { email: 'seller7@tibu.test',  name: 'Meera Iyer' },
  { email: 'seller8@tibu.test',  name: 'Arjun Singh' },
  { email: 'seller9@tibu.test',  name: 'Kavita Rao' },
  { email: 'seller10@tibu.test', name: 'Rohit Mehta' },
  { email: 'seller11@tibu.test', name: 'Anita Kulkarni' },
  { email: 'seller12@tibu.test', name: 'Sanjay Nair' },
];

const CUSTOMERS = [
  { email: 'customer1@tibu.test', name: 'Riya Kapoor' },
  { email: 'customer2@tibu.test', name: 'Ishaan Malhotra' },
];

const now = Date.now();
const DAY = 86_400_000;

/** approved_at dates spread over the last 30 days (index 0 = most recent) */
const approvedAt = (i) => new Date(now - i * 3 * DAY).toISOString();
const submittedAt = (i) => new Date(now - i * 3 * DAY - DAY).toISOString();

/*
 * 12 businesses covering every leaf category at least once:
 *   desserts, food, crochet, embroidery, resin-art, candles,
 *   womens-fashion, mens-fashion, jewellery, gifts
 *
 * Each entry embeds its products (name, price_paise, description,
 * details jsonb, optional available_today) and reviews (customer
 * index, rating, body). Max 2 reviews per business (unique constraint).
 */
const BUSINESSES = [
  // ── 1 · Desserts ──────────────────────────────────────────────
  {
    seller: 0, slug: 'mithai-and-more', name: 'Mithai & More',
    category: 'desserts', area: 0, instagram: 'mithai.and.more',
    desc: 'Freshly made Indian and fusion desserts. Traditional mithai meets modern baking, crafted with love from our home kitchen in Andheri.',
    status: 'approved', approvedAt: approvedAt(0), submittedAt: submittedAt(0),
    delivery: true, pickup: true,
    products: [
      { name: 'Chocolate Truffle Cake', price: 55000, desc: 'Rich Belgian chocolate layered cake with ganache frosting', details: { weight: '500g', serves: '4-6' } },
      { name: 'Belgian Cookie Box', price: 45000, desc: 'Assorted butter cookies in a gift-ready tin box', details: { weight: '300g', pieces: '24', shelf_life: '10 days' } },
      { name: 'Mango Cheesecake Jar', price: 35000, desc: 'No-bake Alphonso mango cheesecake in a glass jar', details: { weight: '250g', shelf_life: '3 days' }, today: true },
      { name: 'Almond Brownies Pack', price: 30000, desc: 'Fudgy brownies loaded with roasted California almonds', details: { weight: '400g', pieces: '6' } },
    ],
    reviews: [
      { c: 0, rating: 5, body: 'Amazing cakes! The chocolate truffle was absolutely divine.' },
      { c: 1, rating: 4, body: 'Really good brownies, our whole family loved the box.' },
    ],
  },

  // ── 2 · Home Food ─────────────────────────────────────────────
  {
    seller: 1, slug: 'ammas-kitchen', name: "Amma's Kitchen",
    category: 'food', area: 1, instagram: 'ammas.kitchen.bom',
    desc: 'Authentic South Indian home-cooked meals delivered with warmth. Every dish made from scratch using family recipes passed down three generations.',
    status: 'approved', approvedAt: approvedAt(1), submittedAt: submittedAt(1),
    delivery: true, pickup: false,
    products: [
      { name: 'Chicken Biryani Box', price: 35000, desc: 'Hyderabadi-style dum biryani with raita and mirchi ka salan', details: { serves: '2', spice_level: 'Medium', diet: 'Non-veg' } },
      { name: 'Paneer Tikka Meal', price: 25000, desc: 'Tandoori paneer tikka with mint chutney and rumali roti', details: { serves: '1', diet: 'Vegetarian' } },
      { name: 'Dal Makhani Thali', price: 22000, desc: 'Slow-cooked black lentils with jeera rice, roti and salad', details: { serves: '1', diet: 'Vegetarian', spice_level: 'Mild' }, today: true },
    ],
    reviews: [
      { c: 0, rating: 4, body: "The biryani reminded me of my grandmother's cooking. So flavourful!" },
      { c: 1, rating: 5, body: 'Best home food in Bandra. The dal makhani is to die for.' },
    ],
  },

  // ── 3 · Crochet ───────────────────────────────────────────────
  {
    seller: 2, slug: 'knotty-tales', name: 'Knotty Tales',
    category: 'crochet', area: 2, instagram: 'knotty.tales',
    desc: 'Handmade crochet toys, accessories and home decor. Each piece is crafted with premium cotton yarn and lots of patience.',
    status: 'approved', approvedAt: approvedAt(2), submittedAt: submittedAt(2),
    delivery: true, pickup: true,
    products: [
      { name: 'Crochet Teddy Bear', price: 85000, desc: 'Adorable 12-inch amigurumi teddy in your choice of colour', details: { material: '100% cotton yarn', height: '30 cm', wash: 'Gentle hand wash' } },
      { name: 'Amigurumi Keychain Set', price: 25000, desc: 'Set of 3 tiny crochet animal keychains — bunny, cat and frog', details: { material: 'Cotton yarn', pieces: '3', height: '5 cm each' } },
      { name: 'Baby Beanie Cap', price: 45000, desc: 'Soft pastel beanie for newborns with a cute pom-pom on top', details: { material: 'Organic cotton', size: '0-6 months', wash: 'Machine washable' }, today: true },
      { name: 'Cotton Coasters Set', price: 35000, desc: 'Set of 6 boho-style round coasters in earthy tones', details: { material: 'Cotton', pieces: '6', diameter: '10 cm' } },
    ],
    reviews: [
      { c: 0, rating: 5, body: 'The teddy bear is gorgeous! Perfect gift for my niece.' },
    ],
  },

  // ── 4 · Embroidery ────────────────────────────────────────────
  {
    seller: 3, slug: 'sutra-threads', name: 'Sutra Threads',
    category: 'embroidery', area: 3, instagram: 'sutra.threads',
    desc: 'Exquisite hand-embroidered textiles blending traditional Indian techniques with contemporary design. Each piece takes days of careful needlework.',
    status: 'approved', approvedAt: approvedAt(3), submittedAt: submittedAt(3),
    delivery: true, pickup: false,
    products: [
      { name: 'Chikankari Kurta Fabric', price: 120000, desc: 'Hand-embroidered Lucknowi chikankari on pure cotton, unstitched', details: { fabric: 'Cotton', length: '2.5 m', technique: 'Chikankari' } },
      { name: 'Zardozi Clutch Purse', price: 95000, desc: 'Evening clutch with intricate zardozi metalwork on velvet', details: { material: 'Velvet + metallic thread', dimensions: '22 × 12 cm' } },
      { name: 'Phulkari Dupatta', price: 80000, desc: 'Vibrant Punjabi phulkari embroidery on georgette dupatta', details: { fabric: 'Georgette', size: '2.4 m × 1 m', technique: 'Phulkari' } },
    ],
    reviews: [
      { c: 0, rating: 4, body: 'Beautiful craftsmanship. The chikankari work is very delicate.' },
      { c: 1, rating: 3, body: 'Good quality but delivery took a bit longer than expected.' },
    ],
  },

  // ── 5 · Resin Art ─────────────────────────────────────────────
  {
    seller: 4, slug: 'resin-raga', name: 'Resin Raga',
    category: 'resin-art', area: 4, instagram: 'resin.raga',
    desc: 'Unique resin art pieces for your home. Ocean-inspired trays, floral coasters and statement wall clocks — all poured by hand in Malad.',
    status: 'approved', approvedAt: approvedAt(4), submittedAt: submittedAt(4),
    delivery: true, pickup: true,
    products: [
      { name: 'Resin Coaster Set', price: 65000, desc: 'Set of 4 ocean-themed epoxy coasters with real shell fragments', details: { material: 'Epoxy resin', pieces: '4', diameter: '10 cm' } },
      { name: 'Ocean Wave Serving Tray', price: 120000, desc: 'Large wooden tray with a hand-poured ocean-wave resin art design', details: { material: 'Mango wood + epoxy resin', dimensions: '40 × 25 cm', weight: '1.2 kg' }, today: true },
      { name: 'Pressed Flower Bookmark', price: 25000, desc: 'Real pressed wildflowers preserved in crystal-clear resin', details: { material: 'Resin + dried flowers', dimensions: '15 × 5 cm' } },
      { name: 'Geode Wall Clock', price: 250000, desc: 'Statement geode-style wall clock with gold leaf accents', details: { material: 'Resin + gold leaf', diameter: '30 cm', weight: '800g' } },
    ],
    reviews: [
      { c: 0, rating: 5, body: 'The ocean tray is a showstopper. Gets compliments from every guest!' },
      { c: 1, rating: 4, body: 'Lovely coasters. The colours are even prettier in person.' },
    ],
  },

  // ── 6 · Candles ───────────────────────────────────────────────
  {
    seller: 5, slug: 'jyoti-candles', name: 'Jyoti Candles',
    category: 'candles', area: 5, instagram: 'jyoti.candles',
    desc: 'Hand-poured soy wax candles with premium fragrances and essential oils. Clean-burning, eco-friendly and beautifully packaged.',
    status: 'approved', approvedAt: approvedAt(5), submittedAt: submittedAt(5),
    delivery: true, pickup: true,
    products: [
      { name: 'Lavender Soy Candle', price: 45000, desc: 'Calming French lavender in a reusable glass jar', details: { wax: 'Soy', burn_time: '40 hours', weight: '200g', fragrance: 'Lavender' } },
      { name: 'Rose Garden Jar Candle', price: 55000, desc: 'Romantic Kannauj rose attar blended with vanilla', details: { wax: 'Soy + coconut', burn_time: '45 hours', weight: '250g' } },
      { name: 'Cinnamon Pillar Set', price: 75000, desc: 'Set of 3 rustic pillar candles with warm cinnamon scent', details: { wax: 'Soy', pieces: '3', burn_time: '60 hours total' }, today: true },
      { name: 'Diwali Gift Box', price: 120000, desc: 'Festive set with 4 tealights, 1 jar candle and a brass holder', details: { pieces: '6', wax: 'Soy', occasion: 'Diwali' } },
      { name: 'Mogra Tealight Pack', price: 25000, desc: 'Pack of 12 mogra-scented soy tealights, perfect for daily pooja', details: { pieces: '12', wax: 'Soy', burn_time: '4 hours each' } },
    ],
    reviews: [
      { c: 0, rating: 3, body: 'Nice fragrance but the candle burned a bit unevenly on one side.' },
    ],
  },

  // ── 7 · Women's Fashion ───────────────────────────────────────
  {
    seller: 6, slug: 'rang-wardrobe', name: 'Rang Wardrobe',
    category: 'womens-fashion', area: 6, instagram: 'rang.wardrobe',
    desc: 'Handcrafted Indian-wear using hand-block prints and handloom fabrics. Sustainable fashion that celebrates Indian textile heritage.',
    status: 'approved', approvedAt: approvedAt(6), submittedAt: submittedAt(6),
    delivery: true, pickup: false,
    products: [
      { name: 'Block Print Kurta', price: 150000, desc: 'Jaipur hand-block printed A-line kurta in indigo and white', details: { fabric: 'Pure cotton', sizes: 'S / M / L / XL', wash: 'Hand wash separately' } },
      { name: 'Handloom Cotton Saree', price: 250000, desc: 'Handwoven cotton saree from Bengal with contrast pallu', details: { fabric: 'Handloom cotton', length: '6.3 m with blouse piece', weave: 'Jamdani' } },
      { name: 'Ikat Palazzo Set', price: 180000, desc: 'Co-ord set with a short kurta and wide-leg ikat palazzos', details: { fabric: 'Cotton', sizes: 'S / M / L', technique: 'Ikat' }, today: true },
    ],
    reviews: [
      { c: 0, rating: 5, body: 'The block print kurta is stunning. So comfortable for Mumbai weather!' },
      { c: 1, rating: 5, body: 'Absolutely love the saree. The weave quality is exceptional.' },
    ],
  },

  // ── 8 · Men's Fashion ─────────────────────────────────────────
  {
    seller: 7, slug: 'dapper-desi', name: 'Dapper Desi',
    category: 'mens-fashion', area: 7, instagram: 'dapper.desi',
    desc: "Modern Indian menswear with a desi soul. Khadi shirts, linen kurtas and Nehru jackets — for the man who wears his roots with pride.",
    status: 'approved', approvedAt: approvedAt(7), submittedAt: submittedAt(7),
    delivery: true, pickup: true,
    products: [
      { name: 'Khadi Mandarin Shirt', price: 180000, desc: 'Handspun khadi shirt with a Mandarin collar, perfect for brunch', details: { fabric: 'Khadi cotton', sizes: 'S / M / L / XL', wash: 'Machine wash cold' } },
      { name: 'Linen Kurta Pajama Set', price: 250000, desc: 'Relaxed-fit linen kurta with matching pajama in earthy olive', details: { fabric: 'Pure linen', sizes: 'M / L / XL', colour: 'Olive' } },
      { name: 'Block Print Nehru Jacket', price: 350000, desc: 'Hand-block printed Nehru jacket in navy — layer over a kurta or shirt', details: { fabric: 'Cotton silk blend', sizes: 'M / L / XL' } },
      { name: 'Cotton Joggers', price: 120000, desc: 'Comfortable everyday joggers with elasticated waist and cuff', details: { fabric: 'Organic cotton', sizes: 'M / L / XL', colour: 'Charcoal' }, today: true },
    ],
    reviews: [
      { c: 0, rating: 4, body: 'The khadi shirt fits really well. Great quality fabric.' },
      { c: 1, rating: 4, body: 'Loved the Nehru jacket. Wore it to a wedding, got so many compliments.' },
    ],
  },

  // ── 9 · Jewellery ─────────────────────────────────────────────
  {
    seller: 8, slug: 'trinket-box', name: 'Trinket Box',
    category: 'jewellery', area: 8, instagram: 'the.trinket.box',
    desc: 'Artisanal Indian jewellery — temple necklaces, oxidized jhumkas and kundan pieces. Everyday elegance, handcrafted in Mumbai.',
    status: 'approved', approvedAt: approvedAt(8), submittedAt: submittedAt(8),
    delivery: true, pickup: true,
    products: [
      { name: 'Temple Necklace Set', price: 180000, desc: 'Gold-plated temple-style necklace with matching jhumka earrings', details: { material: 'Brass + gold plating', weight: '45g', includes: 'Necklace + earrings' } },
      { name: 'Oxidized Silver Jhumkas', price: 65000, desc: 'Statement jhumka earrings with intricate oxidized silver finish', details: { material: 'Silver-plated brass', weight: '18g', length: '6 cm' } },
      { name: 'Kundan Bracelet', price: 95000, desc: 'Elegant kundan bracelet with meenakari work on the reverse', details: { material: 'Kundan + enamel', diameter: '6.5 cm' }, today: true },
      { name: 'Pearl Nose Pin', price: 35000, desc: 'Delicate freshwater pearl nose pin with a screw-back fitting', details: { material: 'Sterling silver + pearl', size: '3 mm pearl' } },
      { name: 'Brass Anklet Pair', price: 55000, desc: 'Handmade brass anklets with tiny ghungroo bells', details: { material: 'Brass', length: '25 cm', weight: '30g per piece' } },
    ],
    reviews: [
      { c: 0, rating: 5, body: 'The temple necklace is gorgeous. Looks way more expensive than it is.' },
    ],
  },

  // ── 10 · Gifts ────────────────────────────────────────────────
  {
    seller: 9, slug: 'gift-gully', name: 'Gift Gully',
    category: 'gifts', area: 9, instagram: 'gift.gully',
    desc: 'Thoughtful, personalised gifts for every occasion. Custom mugs, hand-bound journals and curated hampers that make every moment special.',
    status: 'approved', approvedAt: approvedAt(9), submittedAt: submittedAt(9),
    delivery: true, pickup: false,
    products: [
      { name: 'Personalised Name Mug', price: 45000, desc: 'Ceramic mug with hand-lettered name in watercolour florals', details: { material: 'Ceramic', capacity: '350 ml', personalisation: 'Name up to 12 chars' } },
      { name: 'Wooden Desk Organizer', price: 85000, desc: 'Minimalist sheesham wood desk organiser with 3 compartments', details: { material: 'Sheesham wood', dimensions: '25 × 15 × 10 cm' } },
      { name: 'Photo Memory Book', price: 120000, desc: 'Hand-bound kraft-paper scrapbook with 40 pages for photos and notes', details: { material: 'Kraft paper + jute binding', pages: '40', size: '25 × 20 cm' }, today: true },
    ],
    reviews: [
      { c: 0, rating: 4, body: 'Ordered a personalised mug — lovely lettering and packed really well.' },
      { c: 1, rating: 5, body: "The memory book was perfect for my friend's birthday. Such a special gift." },
    ],
  },

  // ── 11 · Desserts (PENDING) ───────────────────────────────────
  {
    seller: 10, slug: 'sugar-and-spice', name: 'Sugar & Spice',
    category: 'desserts', area: 0, areaOffset: { lat: 0.005, lng: -0.003 },
    instagram: 'sugar.n.spice.mum',
    desc: 'Classic Indian sweets with a twist. Gulab jamun, kaju katli and fusion desserts — all made fresh to order from our Andheri kitchen.',
    status: 'pending', submittedAt: new Date(now - 1 * DAY).toISOString(),
    delivery: false, pickup: true,
    products: [
      { name: 'Gulab Jamun Box', price: 30000, desc: 'Box of 12 soft gulab jamun soaked in rose-cardamom syrup', details: { weight: '500g', pieces: '12', shelf_life: '5 days' } },
      { name: 'Kaju Katli Tin', price: 60000, desc: 'Premium kaju katli in a reusable brass tin', details: { weight: '250g', shelf_life: '7 days' } },
      { name: 'Rasgulla Pack', price: 25000, desc: 'Pack of 8 spongy Bengali rasgullas in light sugar syrup', details: { pieces: '8', weight: '400g' } },
    ],
    reviews: [],
  },

  // ── 12 · Home Food (REJECTED) ─────────────────────────────────
  {
    seller: 11, slug: 'roti-republic', name: 'Roti Republic',
    category: 'food', area: 1, areaOffset: { lat: -0.004, lng: 0.003 },
    instagram: 'roti.republic',
    desc: 'North Indian comfort food delivered to your door. Butter chicken, chole bhature and more — just like maa ke haath ka khaana.',
    status: 'rejected', submittedAt: new Date(now - 5 * DAY).toISOString(),
    rejectionReason: 'Product photos do not meet quality guidelines. Please upload clear, well-lit images of your dishes and resubmit.',
    delivery: true, pickup: false,
    products: [
      { name: 'Butter Chicken Bowl', price: 32000, desc: 'Creamy tomato-butter gravy with tender chicken pieces, served with rice', details: { serves: '1', diet: 'Non-veg', spice_level: 'Medium' } },
      { name: 'Chole Bhature Combo', price: 22000, desc: 'Spicy chole with 2 fluffy bhature and achar', details: { serves: '1', diet: 'Vegetarian' } },
      { name: 'Rajma Chawal Box', price: 18000, desc: 'Punjabi rajma with steamed basmati rice', details: { serves: '1', diet: 'Vegetarian', spice_level: 'Mild' } },
      { name: 'Veg Thali', price: 20000, desc: 'Complete meal with 2 sabzi, dal, rice, roti, raita and papad', details: { serves: '1', diet: 'Vegetarian', items: '7' } },
    ],
    reviews: [],
  },
];

/** Review bodies used by customer2 (c:1) when only customer1 has a review */
// (not needed — reviews are defined inline above)

/* ═══════════════════════════════════════════════════════════════════
   4. HELPERS
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Paginate through ALL auth users (no email filter available).
 * Returns the full list so ensureUser can match by email locally.
 */
async function fetchAllAuthUsers() {
  const all = [];
  let page = 1;
  while (true) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`listUsers page ${page}: ${error.message}`);
    all.push(...data.users);
    if (data.users.length < 1000) break;
    page++;
  }
  return all;
}

/**
 * Create a user or, if they already exist, find them in `existingUsers`
 * and reset their password + metadata for idempotency.
 */
async function ensureUser(email, metadata, existingUsers) {
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (data?.user) {
    console.log(`  ✅ Created ${email}`);
    return data.user;
  }

  // Creation failed (likely "already registered") — find by email
  const existing = existingUsers.find((u) => u.email === email);
  if (!existing) {
    throw new Error(`Cannot create or find ${email}: ${error?.message}`);
  }

  // Reset password & metadata so the seed state is deterministic
  const { error: updErr } = await sb.auth.admin.updateUserById(existing.id, {
    password: PASSWORD,
    email_confirm: true,
    user_metadata: metadata,
  });
  if (updErr) throw new Error(`updateUser ${email}: ${updErr.message}`);

  console.log(`  ♻️  Existing ${email} — reset password & metadata`);
  return existing;
}

/** Throw on Supabase error, otherwise return data. */
function ok(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

/* ═══════════════════════════════════════════════════════════════════
   5. MAIN
   ═══════════════════════════════════════════════════════════════════ */

async function main() {
  // ── Category map ────────────────────────────────────────────────
  console.log('📂 Fetching categories…');
  const cats = ok(
    await sb.from('categories').select('id, slug'),
    'Fetch categories',
  );
  if (cats.length === 0) {
    throw new Error('No categories found — run migrations first (20260925000006_seed_categories.sql).');
  }
  /** @type {Record<string, number>} slug → id */
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
  console.log(`   ${cats.length} categories loaded\n`);

  // ── Auth users ──────────────────────────────────────────────────
  console.log('👤 Ensuring auth users…');
  const allAuthUsers = await fetchAllAuthUsers();

  const sellerUsers = [];
  for (const s of SELLERS) {
    const u = await ensureUser(s.email, { full_name: s.name, signup_as: 'seller' }, allAuthUsers);
    sellerUsers.push(u);
  }

  const customerUsers = [];
  for (const c of CUSTOMERS) {
    const u = await ensureUser(c.email, { full_name: c.name, signup_as: 'customer' }, allAuthUsers);
    customerUsers.push(u);
  }
  console.log();

  // ── Customer1 home location ─────────────────────────────────────
  console.log('🏠 Setting customer1 home location (Andheri West)…');
  ok(
    await sb.from('profiles').update({
      home_locality: 'Andheri West',
      home_lat: 19.1364,
      home_lng: 72.8296,
    }).eq('id', customerUsers[0].id),
    'Update customer1 profile',
  );

  // ── Verify seller roles ─────────────────────────────────────────
  console.log('🔍 Verifying seller profiles have role = seller…');
  const sellerIds = sellerUsers.map((u) => u.id);
  const sellerProfiles = ok(
    await sb.from('profiles').select('id, role').in('id', sellerIds),
    'Fetch seller profiles',
  );

  let rolesFixed = 0;
  for (const sp of sellerProfiles) {
    if (sp.role !== 'seller') {
      ok(
        await sb.from('profiles').update({ role: 'seller' }).eq('id', sp.id),
        `Fix role for ${sp.id}`,
      );
      rolesFixed++;
    }
  }
  console.log(
    rolesFixed > 0
      ? `   ⚠️  Fixed ${rolesFixed} seller profile(s) with wrong role`
      : '   ✅ All 12 sellers confirmed role = seller',
  );
  console.log();

  // ── Upsert businesses ───────────────────────────────────────────
  console.log('🏪 Upserting businesses…');
  const businessIds = [];

  for (const biz of BUSINESSES) {
    const area = AREAS[biz.area];
    const off = biz.areaOffset || { lat: 0, lng: 0 };
    const catId = catMap[biz.category];
    if (!catId) throw new Error(`Category "${biz.category}" not found. Check migrations.`);

    const row = {
      owner_id: sellerUsers[biz.seller].id,
      slug: biz.slug,
      name: biz.name,
      category_id: catId,
      description: biz.desc,
      logo_url: `https://picsum.photos/seed/${biz.slug}-logo/400/400`,
      banner_url: `https://picsum.photos/seed/${biz.slug}-banner/1200/675`,
      instagram_handle: biz.instagram,
      address_text: `Near ${area.name} Station, ${area.name}`,
      locality: area.name,
      city: 'Mumbai',
      lat: area.lat + off.lat,   // trigger populates geography column
      lng: area.lng + off.lng,
      delivery_available: biz.delivery ?? false,
      pickup_available: biz.pickup ?? true,
      status: biz.status,
      submitted_at: biz.submittedAt ?? null,
      approved_at: biz.approvedAt ?? null,
      rejection_reason: biz.rejectionReason ?? null,
    };

    const [inserted] = ok(
      await sb.from('businesses').upsert(row, { onConflict: 'slug' }).select('id'),
      `Upsert "${biz.slug}"`,
    );
    businessIds.push(inserted.id);

    const icon = biz.status === 'approved' ? '✅' : biz.status === 'pending' ? '⏳' : '❌';
    console.log(`   ${icon} ${biz.name} (${biz.slug})`);
  }
  console.log();

  // ── Upsert business_contacts ────────────────────────────────────
  console.log('📞 Upserting business contacts…');
  for (let i = 0; i < BUSINESSES.length; i++) {
    const phone = `90000000${String(i + 1).padStart(2, '0')}`;
    ok(
      await sb.from('business_contacts').upsert(
        { business_id: businessIds[i], phone, whatsapp: phone },
        { onConflict: 'business_id' },
      ),
      `Contact ${i + 1}`,
    );
  }
  console.log(`   ✅ ${BUSINESSES.length} contacts\n`);

  // ── Delete child rows for seed businesses (re-run cleanup) ──────
  console.log('🗑️  Cleaning seed child rows…');

  // Reviews first (no FK children)
  ok(await sb.from('reviews').delete().in('business_id', businessIds), 'Delete reviews');
  // Videos
  ok(await sb.from('business_videos').delete().in('business_id', businessIds), 'Delete videos');
  // Products (cascades to product_images via ON DELETE CASCADE)
  ok(await sb.from('products').delete().in('business_id', businessIds), 'Delete products');

  console.log('   ✅ Cleaned\n');

  // ── Create products + product_images ────────────────────────────
  console.log('📦 Creating products & images…');
  let totalProducts = 0;
  let totalImages = 0;

  for (let bi = 0; bi < BUSINESSES.length; bi++) {
    const biz = BUSINESSES[bi];
    for (let pi = 0; pi < biz.products.length; pi++) {
      const p = biz.products[pi];

      const [product] = ok(
        await sb.from('products').insert({
          business_id: businessIds[bi],
          name: p.name,
          price_paise: p.price,
          description: p.desc,
          details: p.details,
          available_today: p.today ?? false,
          is_active: true,
          sort_order: pi,
        }).select('id'),
        `Product "${p.name}"`,
      );
      totalProducts++;

      // 1–3 images per product (first gets 3, second gets 2, rest get 1)
      const numImages = pi === 0 ? 3 : pi === 1 ? 2 : 1;
      const images = Array.from({ length: numImages }, (_, ii) => {
        const seed = `${biz.slug}-p${pi}-${ii}`;
        return {
          product_id: product.id,
          storage_path: `seed/${biz.slug}/p${pi}-${ii}.jpg`,
          url: `https://picsum.photos/seed/${seed}/600/600`,
          sort_order: ii,
        };
      });
      ok(await sb.from('product_images').insert(images), `Images for "${p.name}"`);
      totalImages += numImages;
    }
  }
  console.log(`   ✅ ${totalProducts} products, ${totalImages} images\n`);

  // ── Business videos (optional, from REELS env var) ──────────────
  let totalVideos = 0;
  const reelsStr = process.env.REELS;
  if (reelsStr) {
    console.log('🎬 Seeding business videos…');
    const urls = reelsStr.split(',').map((u) => u.trim()).filter(Boolean);
    const videoBizIndexes = [0, 1, 2]; // first 3 approved businesses

    for (let i = 0; i < Math.min(urls.length, 3); i++) {
      const url = urls[i];
      const match = url.match(/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/);
      if (!match) {
        console.warn(`   ⚠️  Cannot parse shortcode from: ${url}`);
        continue;
      }
      ok(
        await sb.from('business_videos').insert({
          business_id: businessIds[videoBizIndexes[i]],
          instagram_url: url,
          shortcode: match[1],
          caption: 'Check out our latest creation! 🎉',
          sort_order: 0,
        }),
        `Video for ${BUSINESSES[videoBizIndexes[i]].slug}`,
      );
      totalVideos++;
    }
    console.log(`   ✅ ${totalVideos} videos\n`);
  } else {
    console.log('🎬 REELS env var not set — skipping business_videos.');
    console.log('   Set REELS=url1,url2,url3 in .env.seed to seed reel videos.\n');
  }

  // ── Reviews (approved businesses only, max 2 per biz) ───────────
  console.log('⭐ Creating reviews…');
  let totalReviews = 0;
  const customerIds = customerUsers.map((u) => u.id);

  for (let bi = 0; bi < BUSINESSES.length; bi++) {
    const biz = BUSINESSES[bi];
    if (!biz.reviews || biz.reviews.length === 0) continue;

    for (const r of biz.reviews) {
      ok(
        await sb.from('reviews').insert({
          business_id: businessIds[bi],
          user_id: customerIds[r.c],
          rating: r.rating,
          body: r.body,
        }),
        `Review for "${biz.name}"`,
      );
      totalReviews++;
    }
  }
  console.log(`   ✅ ${totalReviews} reviews (triggers recompute business ratings)\n`);

  // ── Verify ratings ──────────────────────────────────────────────
  console.log('🔍 Verifying business ratings…');
  const ratedBiz = ok(
    await sb.from('businesses')
      .select('slug, rating_avg, rating_count')
      .in('id', businessIds)
      .gt('rating_count', 0)
      .order('slug'),
    'Fetch ratings',
  );
  for (const b of ratedBiz) {
    console.log(`   ${b.slug}: ${b.rating_avg}★ (${b.rating_count} reviews)`);
  }
  console.log();

  // ── Summary (seed rows only) ────────────────────────────────────
  console.log('📊 Seed summary (seed rows only)');
  console.log('┌──────────────────────┬───────┐');
  console.log('│ Table                │ Count │');
  console.log('├──────────────────────┼───────┤');
  const summary = [
    ['auth.users',          SELLERS.length + CUSTOMERS.length],
    ['profiles (verified)', SELLERS.length + CUSTOMERS.length],
    ['businesses',          BUSINESSES.length],
    ['business_contacts',   BUSINESSES.length],
    ['products',            totalProducts],
    ['product_images',      totalImages],
    ['business_videos',     totalVideos],
    ['reviews',             totalReviews],
  ];
  for (const [table, count] of summary) {
    console.log(`│ ${table.padEnd(20)} │ ${String(count).padStart(5)} │`);
  }
  console.log('└──────────────────────┴───────┘');
  console.log('\n✅ Seed complete.\n');
}

/* ═══════════════════════════════════════════════════════════════════
   6. RUN
   ═══════════════════════════════════════════════════════════════════ */

main().catch((err) => {
  console.error('\n💥 Seed failed:', err.message);
  process.exit(1);
});
