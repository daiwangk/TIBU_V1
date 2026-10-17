import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import Tabs from '../../components/ui/Tabs';
import IconButton from '../../components/ui/IconButton';
import LocationChip from '../../components/LocationChip';
import SearchField from '../../components/SearchField';

/**
 * Sticky Search header: back, search pill (with clear + filters), location chip and result tabs.
 * Presentational only — SearchPage owns the query state, URL params and every handler.
 *
 * @param {{
 *   value: string,
 *   onValueChange: (value: string) => void,
 *   onEnter: () => void,
 *   onClear: () => void,
 *   onBack: () => void,
 *   onOpenFilters: () => void,
 *   filterCount: number,
 *   tabs?: { value: string, onChange: (value: string) => void, items: Array<{ value: string, label: string }> },
 * }} props
 */
export default function SearchHeader({ value, onValueChange, onEnter, onClear, onBack, onOpenFilters, filterCount, tabs }) {
  return (
    <header className="sticky top-0 z-30 flex flex-col border-b border-border bg-bg/95 px-screen pt-4 pb-2 backdrop-blur-[14px]">
      <h1 className="sr-only">Search</h1>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <IconButton label="Go back" onClick={onBack} className="-ml-2">
            <ArrowLeft size={20} strokeWidth={1.75} aria-hidden="true" />
          </IconButton>

          <SearchField
            className="flex-1"
            label="Search products and businesses"
            autoFocus
            enterKeyHint="search"
            placeholder="Search cakes, crochet, candles…"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onEnter(); }}
            onClear={onClear}
            trailing={
              <button
                type="button"
                onClick={onOpenFilters}
                aria-label="Open filters"
                className="relative flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <SlidersHorizontal size={20} strokeWidth={1.75} aria-hidden="true" />
                {filterCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-fg">
                    {filterCount}
                  </span>
                )}
              </button>
            }
          />
        </div>

        <div className="-mt-1 flex">
          <LocationChip />
        </div>

        {tabs && <Tabs value={tabs.value} onChange={tabs.onChange} items={tabs.items} />}
      </div>
    </header>
  );
}
