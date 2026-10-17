import { MapPin } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import BusinessCard from '../../components/BusinessCard';
import SaveButton from '../../components/SaveButton';
import SectionHeader from '../../components/SectionHeader';
import HorizontalScroller from '../../components/HorizontalScroller';
import Price from '../../components/Price';
import Rating from '../../components/Rating';
import GallerySection from './GallerySection';

// Fake data in contract shape (no mock adapter imports).
const PRODUCT = {
  id: 'd2-prod-1', name: 'Chocolate Chunk Cookies (box of 6)', price: 350, imageUrl: null,
  categorySlug: 'desserts', availableToday: true, businessId: 'biz-1', businessSlug: 'the-cookie-lab',
  businessName: 'The Cookie Lab', businessLogoUrl: null, businessRating: 4.5, locality: 'Bandra West',
  distanceM: 1200, createdAt: '2026-09-01T10:00:00Z',
};
const PRODUCTS = [
  PRODUCT,
  { ...PRODUCT, id: 'd2-prod-2', name: 'Rose & Cardamom Laddoo', price: 1250, availableToday: false, distanceM: 2400 },
  { ...PRODUCT, id: 'd2-prod-3', name: 'Crochet Daisy Bag', price: 12499, businessName: 'Loop & Purl', distanceM: null },
];
const BUSINESS = {
  id: 'd2-biz-1', slug: 'the-cookie-lab', name: 'The Cookie Lab', categorySlug: 'desserts', categoryName: 'Desserts',
  logoUrl: null, bannerUrl: null, locality: 'Bandra West', city: 'Mumbai', distanceM: 1200, rating: 4.8,
  reviewCount: 124, availableToday: true, deliveryAvailable: true, pickupAvailable: false, approvedAt: '2026-09-01T10:00:00Z',
};

/** /dev/ui (D2): section header, product row + grid with save overlay, business card, price and rating. */
export default function GalleryCards() {
  return (
    <GallerySection id="d2-cards" title="D2 · Cards" description="Names ink, price plum 800 (stronger), coral star, save heart overlay">
      <SectionHeader
        title="Popular near you"
        subtitle="Based on your location"
        icon={<MapPin size={20} strokeWidth={1.75} />}
        viewAllTo="/search"
      />
      <HorizontalScroller className="py-1">
        {PRODUCTS.map((p) => (
          <ProductCard key={p.id} product={p} variant="row" action={<SaveButton kind="product" id={p.id} overlay />} />
        ))}
      </HorizontalScroller>
      <div className="grid grid-cols-2 gap-3 px-screen">
        {PRODUCTS.slice(0, 2).map((p) => (
          <ProductCard key={p.id} product={p} action={<SaveButton kind="product" id={p.id} overlay />} />
        ))}
      </div>
      <div className="px-screen">
        <BusinessCard business={BUSINESS} action={<SaveButton kind="business" id={BUSINESS.id} />} />
      </div>
      <div className="flex items-end gap-4 px-screen">
        <Price value={350} size="sm" />
        <Price value={1250} />
        <Price value={9999} size="lg" />
        <Rating rating={4.8} reviewCount={124} />
      </div>
    </GallerySection>
  );
}
