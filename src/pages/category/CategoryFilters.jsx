import Chip from '../../components/ui/Chip';
import Select from '../../components/ui/Select';
import { useSearchOrigin } from '../../stores/location';

/** Sort options per tab. */
const PRODUCT_SORTS = [
  { value: 'distance', label: 'Nearest' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const BUSINESS_SORTS = [
  { value: 'distance', label: 'Nearest' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top Rated' },
];

/** Price range options (products only). */
const PRICE_RANGES = [
  { value: '', label: 'Any price' },
  { value: 'u500', label: 'Under ₹500' },
  { value: '500-1000', label: '₹500–₹1,000' },
  { value: 'a1000', label: 'Above ₹1,000' },
];

/**
 * Filters row: tab toggle, sub-category chips, sort, today, price range.
 *
 * @param {{
 *   tab: 'products' | 'businesses',
 *   onTabChange: (tab: 'products'|'businesses') => void,
 *   children: Array<{ slug: string, name: string }>,
 *   sub: string | null,
 *   onSubChange: (slug: string | null) => void,
 *   sort: string,
 *   onSortChange: (sort: string) => void,
 *   today: boolean,
 *   onTodayChange: (v: boolean) => void,
 *   price: string,
 *   onPriceChange: (v: string) => void,
 * }} props
 */
export default function CategoryFilters({
  tab,
  onTabChange,
  children,
  sub,
  onSubChange,
  sort,
  onSortChange,
  today,
  onTodayChange,
  price,
  onPriceChange,
}) {
  const origin = useSearchOrigin();
  const hasOrigin = origin != null;
  const sorts = tab === 'products' ? PRODUCT_SORTS : BUSINESS_SORTS;

  return (
    <div className="flex flex-col gap-0 border-b border-border sticky top-[52px] z-10 bg-bg">
      {/* Tab toggle */}
      <div className="flex gap-2 px-screen py-2" role="tablist" aria-label="View products or businesses">
        <Chip
          active={tab === 'products'}
          onToggle={() => onTabChange('products')}
          role="tab"
          aria-selected={tab === 'products'}
          id="tab-products"
        >
          Products
        </Chip>
        <Chip
          active={tab === 'businesses'}
          onToggle={() => onTabChange('businesses')}
          role="tab"
          aria-selected={tab === 'businesses'}
          id="tab-businesses"
        >
          Businesses
        </Chip>
      </div>

      {/* Sub-category chips (only when children exist) */}
      {children.length > 0 && (
        <div
          className="flex gap-2 overflow-x-auto no-scrollbar px-screen pb-2"
          role="group"
          aria-label="Filter by sub-category"
        >
          <Chip active={sub === null} onToggle={() => onSubChange(null)}>
            All
          </Chip>
          {children.map((cat) => (
            <Chip
              key={cat.slug}
              active={sub === cat.slug}
              onToggle={() => onSubChange(sub === cat.slug ? null : cat.slug)}
            >
              {cat.name}
            </Chip>
          ))}
        </div>
      )}

      {/* Filters row: today chip + sort + price */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-screen pb-2">
        {/* Available today */}
        <Chip
          active={today}
          onToggle={() => onTodayChange(!today)}
          className="flex-shrink-0"
        >
          Today
        </Chip>

        {/* Sort */}
        <div className="flex-shrink-0 min-w-[140px]">
          <Select
            id="category-sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            disabled={!hasOrigin && sort === 'distance'}
            hint={!hasOrigin ? 'Set your location for Nearest' : undefined}
            aria-label="Sort by"
          >
            {sorts.map((s) => (
              <option
                key={s.value}
                value={s.value}
                disabled={s.value === 'distance' && !hasOrigin}
              >
                {s.label}
                {s.value === 'distance' && !hasOrigin ? ' (set location)' : ''}
              </option>
            ))}
          </Select>
        </div>

        {/* Price range (products only) */}
        {tab === 'products' && (
          <div className="flex-shrink-0 min-w-[130px]">
            <Select
              id="category-price"
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              aria-label="Price range"
            >
              {PRICE_RANGES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
