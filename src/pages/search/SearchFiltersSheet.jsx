import { useState } from 'react';
import Sheet from '../../components/ui/Sheet';
import Button from '../../components/ui/Button';
import ErrorState from '../../components/ui/ErrorState';
import Select from '../../components/ui/Select';
import Switch from '../../components/ui/Switch';
import { useCategories } from '../../queries/catalog';
import { useSearchOrigin } from '../../stores/location';

const PRICE_RANGES = [
  { value: '', label: 'Any' },
  { value: '0-500', label: 'Under ₹500' },
  { value: '500-1000', label: '₹500–₹1,000' },
  { value: '1000-', label: 'Above ₹1,000' }
];

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   tab: 'products' | 'businesses',
 *   filters: { category: string, availableToday: boolean, sort: string, price: string },
 *   onChange: (filters: { category: string, availableToday: boolean, sort: string, price: string }) => void
 * }} props
 */
export default function SearchFiltersSheet({ open, onClose, tab, filters, onChange }) {
  const {
    data: categories = [],
    isPending: isCategoriesPending,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useCategories();
  const origin = useSearchOrigin();

  const [localCategory, setLocalCategory] = useState(filters.category);
  const [localAvailableToday, setLocalAvailableToday] = useState(filters.availableToday);
  const [localSort, setLocalSort] = useState(filters.sort);
  const [localPrice, setLocalPrice] = useState(filters.price);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setLocalCategory(filters.category);
      setLocalAvailableToday(filters.availableToday);
      setLocalSort(filters.sort);
      setLocalPrice(filters.price);
    }
  }

  // Group categories into parent-child for the Select dropdown
  const topLevel = categories.filter(c => !c.parentSlug).sort((a, b) => a.sortOrder - b.sortOrder);
  const options = [];
  topLevel.forEach(cat => {
    options.push({ value: cat.slug, label: cat.name });
    const children = categories.filter(c => c.parentSlug === cat.slug).sort((a, b) => a.sortOrder - b.sortOrder);
    children.forEach(child => {
      options.push({ value: child.slug, label: `\u00A0\u00A0\u00A0\u00A0${child.name}` });
    });
  });

  function handleSubmit(e) {
    e.preventDefault();
    onChange({
      category: localCategory,
      availableToday: localAvailableToday,
      sort: localSort,
      price: tab === 'products' ? localPrice : ''
    });
    onClose();
  }

  function handleReset() {
    setLocalCategory('');
    setLocalAvailableToday(false);
    setLocalSort('');
    setLocalPrice('');
    onChange({ category: '', availableToday: false, sort: '', price: '' });
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex h-full flex-col bg-surface sm:mx-auto sm:max-w-[480px]">
        <div className="flex items-center justify-between border-b border-border px-screen py-4">
          <h2 className="font-heading text-lg font-bold text-ink">Filters</h2>
          <Button variant="ghost" onClick={handleReset} className="h-auto p-1 text-sm font-semibold text-primary">
            Reset
          </Button>
        </div>

        {isCategoriesPending ? (
          <div aria-busy="true" className="flex flex-1 flex-col gap-6 px-screen py-6">
            <span className="block h-10 w-full rounded-btn bg-border motion-safe:animate-pulse" />
            <span className="block h-11 w-full rounded-btn bg-border motion-safe:animate-pulse" />
            <span className="block h-10 w-full rounded-btn bg-border motion-safe:animate-pulse" />
          </div>
        ) : isCategoriesError ? (
          <ErrorState message="We couldn't load filter categories." onRetry={() => refetchCategories()} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-screen py-6">
              <form id="filters-form" onSubmit={handleSubmit} className="flex flex-col gap-8">
                <Select
                  id="category"
                  name="category"
                  label="Category"
                  value={localCategory}
                  onChange={e => setLocalCategory(e.target.value)}
                >
                  <option value="">All categories</option>
                  {options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>

                <div className="flex min-h-11 items-center">
                  <Switch
                    id="availableToday"
                    name="availableToday"
                    label="Available today"
                    checked={localAvailableToday}
                    onChange={setLocalAvailableToday}
                  />
                </div>

                <Select
                  id="sort"
                  name="sort"
                  label="Sort by"
                  value={localSort}
                  onChange={e => setLocalSort(e.target.value)}
                >
                  <option value="">Newest</option>
                  {origin ? (
                    <option value="distance">Nearest</option>
                  ) : (
                    <option value="distance" disabled>Nearest (Set your location)</option>
                  )}
                  {tab === 'businesses' && <option value="rating">Top rated</option>}
                  {tab === 'products' && (
                    <>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </>
                  )}
                </Select>

                {tab === 'products' && (
                  <Select
                    id="price"
                    name="price"
                    label="Price range"
                    value={localPrice}
                    onChange={e => setLocalPrice(e.target.value)}
                  >
                    {PRICE_RANGES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </Select>
                )}
              </form>
            </div>

            <div className="border-t border-border p-screen">
              <Button type="submit" form="filters-form" className="w-full">
                Apply filters
              </Button>
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
}
