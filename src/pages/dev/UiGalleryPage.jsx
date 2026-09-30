import { useState } from 'react';
import {
  ShoppingBag, Info, Heart,
} from 'lucide-react';

// ui/ components
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Chip from '../../components/ui/Chip';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Switch from '../../components/ui/Switch';
import Tabs from '../../components/ui/Tabs';
import Sheet from '../../components/ui/Sheet';
import Dialog from '../../components/ui/Dialog';
import Skeleton from '../../components/ui/Skeleton';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import Avatar from '../../components/ui/Avatar';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder';

// Shared components
import Logo from '../../components/brand/Logo';
import Price from '../../components/Price';
import Rating from '../../components/Rating';
import Distance from '../../components/Distance';
import ProductCard from '../../components/ProductCard';
import BusinessCard from '../../components/BusinessCard';
import SectionHeader from '../../components/SectionHeader';
import HorizontalScroller from '../../components/HorizontalScroller';
import CategoryChips from '../../components/CategoryChips';

// ─── Fake data (no mock adapter imports) ────────────────────────────────────

/** @type {import('../../services/contract').ProductSummary} */
const FAKE_PRODUCT = {
  id: 'prod-1',
  name: 'Chocolate Chunk Cookies',
  price: 350,
  imageUrl: null,
  categorySlug: 'desserts',
  availableToday: true,
  businessId: 'biz-1',
  businessSlug: 'the-cookie-lab',
  businessName: 'The Cookie Lab',
  businessLogoUrl: null,
  businessRating: 4.5,
  locality: 'Bandra West',
  distanceM: 1200,
  createdAt: '2026-09-01T10:00:00Z',
};

/** @type {import('../../services/contract').ProductSummary} */
const FAKE_PRODUCT_2 = {
  ...FAKE_PRODUCT,
  id: 'prod-2',
  name: 'Rose & Cardamom Laddoo — Handmade with love',
  price: 180,
  availableToday: false,
  distanceM: null,
};

/** @type {import('../../services/contract').BusinessSummary} */
const FAKE_BUSINESS = {
  id: 'biz-1',
  slug: 'the-cookie-lab',
  name: 'The Cookie Lab',
  categorySlug: 'desserts',
  categoryName: 'Desserts',
  logoUrl: null,
  bannerUrl: null,
  locality: 'Bandra West',
  city: 'Mumbai',
  distanceM: 1200,
  rating: 4.5,
  reviewCount: 23,
  availableToday: true,
  deliveryAvailable: true,
  pickupAvailable: false,
  approvedAt: '2026-09-01T10:00:00Z',
};

const FAKE_CATEGORIES = [
  { slug: 'desserts', name: 'Desserts', parentSlug: null, sortOrder: 1 },
  { slug: 'handmade', name: 'Handmade', parentSlug: null, sortOrder: 2 },
  { slug: 'jewellery', name: 'Jewellery', parentSlug: null, sortOrder: 3 },
  { slug: 'fashion', name: 'Fashion', parentSlug: null, sortOrder: 4 },
];

// ─── Section helpers ─────────────────────────────────────────────────────────

function Section({ id, title, description, children }) {
  return (
    <section id={id} className="flex flex-col gap-4 py-6 border-b border-border">
      <div className="px-screen">
        <h2 className="font-heading font-bold text-primary text-xl">{title}</h2>
        {description && (
          <p className="font-body text-xs text-muted mt-1">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function UiGalleryPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [switchOn, setSwitchOn] = useState(false);
  const [chipActive, setChipActive] = useState(false);
  const [tabValue, setTabValue] = useState('all');
  const [catFilter, setCatFilter] = useState(null);
  const [inputVal, setInputVal] = useState('');

  const TAB_ITEMS = [
    { value: 'all', label: 'All' },
    { value: 'products', label: 'Products' },
    { value: 'businesses', label: 'Businesses' },
  ];

  return (
    <div className="min-h-screen bg-bg font-body">
      <PageHeader title="UI Gallery" fallbackTo="/" />

      <div className="px-screen py-3 bg-lavender/60 border-b border-border text-xs text-body flex items-center justify-between">
        <span>
          <strong>UI Kit Component Catalog:</strong> Interactive preview of all reusable components, states, and loading placeholders.
        </span>
      </div>

      {/* ── Buttons ── */}
      <Section id="buttons" title="Button">
        <div className="flex flex-wrap gap-3 px-screen">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
        <div className="flex flex-wrap gap-3 px-screen">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
        <div className="flex flex-wrap gap-3 px-screen">
          <Button loading>Loading…</Button>
          <Button disabled>Disabled</Button>
          <Button href="https://example.com" target="_blank">External link</Button>
          <Button to="/">Router link</Button>
        </div>
      </Section>

      {/* ── IconButton ── */}
      <Section id="icon-button" title="IconButton">
        <div className="flex gap-3 px-screen">
          <IconButton label="Save product">
            <Heart size={20} strokeWidth={1.75} />
          </IconButton>
          <IconButton label="Info">
            <Info size={20} strokeWidth={1.75} />
          </IconButton>
        </div>
      </Section>

      {/* ── Badge ── */}
      <Section id="badges" title="Badge">
        <div className="flex flex-wrap gap-3 px-screen">
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="success">Available</Badge>
          <Badge tone="warning">Low stock</Badge>
          <Badge tone="plum">Featured</Badge>
        </div>
      </Section>

      {/* ── Chip ── */}
      <Section id="chips" title="Chip">
        <div className="flex gap-3 px-screen flex-wrap">
          <Chip active={chipActive} onToggle={() => setChipActive((p) => !p)}>
            {chipActive ? 'Active' : 'Inactive'}
          </Chip>
          <Chip active>Pinned active</Chip>
          <Chip>Inactive</Chip>
        </div>
      </Section>

      {/* ── Tabs ── */}
      <Section id="tabs" title="Tabs">
        <Tabs value={tabValue} onChange={setTabValue} items={TAB_ITEMS} />
        <p className="px-screen text-muted text-sm font-body">
          Selected tab: <strong>{tabValue}</strong>
        </p>
      </Section>

      {/* ── Card ── */}
      <Section id="card" title="Card">
        <div className="px-screen flex flex-col gap-3">
          <Card>Default card (padded)</Card>
          <Card bordered>Bordered card</Card>
          <Card lg>Large radius card</Card>
          <Card padded={false} className="p-6 text-sm text-muted">
            Custom padding card
          </Card>
        </div>
      </Section>

      {/* ── Form inputs ── */}
      <Section id="inputs" title="Input / Textarea / Select / Switch">
        <div className="px-screen flex flex-col gap-4">
          <Input
            id="gallery-input"
            label="Business name"
            hint="2–80 characters"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="e.g. The Cookie Lab"
          />
          <Input
            id="gallery-input-error"
            label="Phone number"
            error="Must be a 10-digit Indian mobile"
            value=""
            readOnly
          />
          <Textarea
            id="gallery-textarea"
            label="Description"
            hint="Up to 2000 characters"
            placeholder="Tell customers about your business…"
            rows={3}
          />
          <Select id="gallery-select" label="Category">
            <option value="">Select category</option>
            <option value="desserts">Desserts</option>
            <option value="handmade">Handmade</option>
          </Select>
          <Switch
            id="gallery-switch"
            checked={switchOn}
            onChange={setSwitchOn}
            label="Available today"
          />
        </div>
      </Section>

      {/* ── Avatar ── */}
      <Section id="avatar" title="Avatar">
        <div className="flex items-center gap-4 px-screen">
          <Avatar src={null} name="Deepika Sharma" size={48} />
          <Avatar src={null} name="T" size={40} />
          <Avatar src={null} name="" size={36} />
        </div>
      </Section>

      {/* ── Skeleton ── */}
      <Section
        id="skeleton"
        title="Skeleton"
        description="Pulsing placeholders used during data fetching (<Skeleton variant='rect|circle|text' />)"
      >
        <div className="px-screen flex flex-col gap-3">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            Rectangular placeholder
          </span>
          <Skeleton variant="rect" className="h-20" />
          <span className="text-xs font-semibold text-muted uppercase tracking-wider mt-2">
            Circle & Text lines placeholder
          </span>
          <div className="flex gap-3 items-center">
            <Skeleton variant="circle" size="lg" />
            <Skeleton variant="text" lines={3} className="flex-1" />
          </div>
        </div>
      </Section>

      {/* ── Spinner ── */}
      <Section
        id="spinner"
        title="Spinner"
        description="Animated loading spinners for buttons and progress indicators (<Spinner size={...} />)"
      >
        <div className="flex items-center gap-6 px-screen">
          <div className="flex flex-col items-center gap-2">
            <Spinner size={20} />
            <span className="text-xs text-muted font-body">sm (20px)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size={32} />
            <span className="text-xs text-muted font-body">md (32px)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size={48} />
            <span className="text-xs text-muted font-body">lg (48px)</span>
          </div>
        </div>
      </Section>

      {/* ── EmptyState ── */}
      <Section
        id="empty-state"
        title="EmptyState"
        description="Placeholder view when lists or search results have 0 items"
      >
        <EmptyState
          icon={<ShoppingBag size={28} strokeWidth={1.5} />}
          title="No products yet"
          text="This business hasn't listed any products."
          action={{ label: 'Browse categories', onClick: () => {} }}
        />
      </Section>

      {/* ── ErrorState ── */}
      <Section
        id="error-state"
        title="ErrorState"
        description="Error feedback view with a retry callback button"
      >
        <ErrorState
          message="We couldn't load the products. Check your connection."
          onRetry={() => {}}
        />
      </Section>

      {/* ── ImagePlaceholder ── */}
      <Section id="image-placeholder" title="ImagePlaceholder">
        <div className="flex gap-3 px-screen">
          <ImagePlaceholder aspect="1/1" bg="lavender" className="w-24 rounded-card" />
          <ImagePlaceholder aspect="4/3" bg="mint" className="w-24 rounded-card" />
          <ImagePlaceholder aspect="1/1" bg="blush" className="w-24 rounded-card" />
        </div>
      </Section>

      {/* ── Logo ── */}
      <Section id="logo" title="Logo">
        <div className="px-screen">
          <Logo />
        </div>
      </Section>

      {/* ── Price / Rating / Distance ── */}
      <Section id="display-atoms" title="Price · Rating · Distance">
        <div className="flex flex-wrap items-center gap-6 px-screen">
          <div className="flex flex-col gap-1">
            <Price value={350} size="sm" />
            <Price value={1250} size="md" />
            <Price value={9999} size="lg" />
          </div>
          <div className="flex flex-col gap-1">
            <Rating rating={4.5} reviewCount={23} />
            <Rating rating={0} reviewCount={0} />
          </div>
          <div className="flex flex-col gap-1">
            <Distance distanceM={800} />
            <Distance distanceM={2400} />
            <Distance distanceM={null} />
          </div>
        </div>
      </Section>

      {/* ── CategoryChips ── */}
      <Section id="category-chips" title="CategoryChips">
        <CategoryChips
          categories={FAKE_CATEGORIES}
          value={catFilter}
          onChange={setCatFilter}
        />
        <p className="px-screen text-muted text-sm font-body">
          Active: <strong>{catFilter ?? 'All'}</strong>
        </p>
      </Section>

      {/* ── SectionHeader ── */}
      <Section id="section-header" title="SectionHeader">
        <SectionHeader title="Popular near you" viewAllTo="/search" />
        <SectionHeader title="No link variant" />
      </Section>

      {/* ── HorizontalScroller ── */}
      <Section id="horizontal-scroller" title="HorizontalScroller">
        <HorizontalScroller>
          {[FAKE_PRODUCT, FAKE_PRODUCT_2, FAKE_PRODUCT, FAKE_PRODUCT_2].map((p, i) => (
            <ProductCard key={`${p.id}-${i}`} product={p} variant="row" />
          ))}
        </HorizontalScroller>
      </Section>

      {/* ── ProductCard ── */}
      <Section id="product-card" title="ProductCard">
        <div className="grid grid-cols-2 gap-3 px-screen">
          <ProductCard product={FAKE_PRODUCT} variant="grid" />
          <ProductCard product={FAKE_PRODUCT_2} variant="grid" />
        </div>
      </Section>

      {/* ── BusinessCard ── */}
      <Section id="business-card" title="BusinessCard">
        <div className="flex flex-col gap-3 px-screen">
          <BusinessCard business={FAKE_BUSINESS} />
          <BusinessCard business={{ ...FAKE_BUSINESS, distanceM: null, reviewCount: 0 }} />
        </div>
      </Section>

      {/* ── Sheet ── */}
      <Section id="sheet" title="Sheet">
        <div className="px-screen">
          <Button onClick={() => setSheetOpen(true)}>Open bottom sheet</Button>
        </div>
        <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
          <div className="px-4 pb-8 pt-2 flex flex-col gap-4">
            <h3 className="font-heading font-bold text-ink text-base">Sheet content</h3>
            <p className="font-body text-body text-sm">
              This is a bottom sheet using the native &lt;dialog&gt; element.
              Tap the backdrop or press Escape to close.
            </p>
            <Button onClick={() => setSheetOpen(false)}>Close</Button>
          </div>
        </Sheet>
      </Section>

      {/* ── Dialog ── */}
      <Section id="dialog" title="Dialog">
        <div className="px-screen">
          <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
        </div>
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Confirm action">
          <div className="px-4 pb-6 pt-2 flex flex-col gap-4">
            <p className="font-body text-body text-sm">
              This is a centred modal dialog. Tap the backdrop or Escape to close.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1" onClick={() => setDialogOpen(false)}>
                Confirm
              </Button>
            </div>
          </div>
        </Dialog>
      </Section>

      {/* Bottom spacer */}
      <div className="h-16" />
    </div>
  );
}
