import { useState } from 'react';
import { readJSON, writeJSON } from '../../lib/storage';
import { Clock } from 'lucide-react';
import CategoryShortcuts from '../home/CategoryShortcuts';

const STORAGE_KEY = 'tibu.recentSearches';

/**
 * @param {{
 *   onSelect: (q: string) => void
 * }} props
 */
export default function RecentSearches({ onSelect }) {
  const [searches, setSearches] = useState(() => readJSON(STORAGE_KEY, []));

  function handleClear() {
    writeJSON(STORAGE_KEY, []);
    setSearches([]);
  }

  return (
    <div className="flex flex-col gap-6 pt-4">
      {searches.length > 0 && (
        <section aria-labelledby="recent-searches-title" className="px-screen">
          <div className="flex items-center justify-between mb-3">
            <h2 id="recent-searches-title" className="font-heading font-bold text-ink">
              Recent searches
            </h2>
            <button
              type="button"
              onClick={handleClear}
              className="-m-1 inline-flex min-h-11 min-w-11 items-center justify-center text-sm font-body font-semibold text-primary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-btn"
            >
              Clear
            </button>
          </div>
          <ul className="flex flex-col">
            {searches.map((s, i) => (
              <li key={`${s}-${i}`} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => onSelect(s)}
                  className="w-full flex items-center gap-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-btn"
                >
                  <Clock size={18} className="text-muted flex-shrink-0" aria-hidden="true" />
                  <span className="font-body text-body flex-1 truncate">{s}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="browse-categories-title" className="flex flex-col gap-3">
        <h2 id="browse-categories-title" className="px-screen font-heading font-bold text-ink">
          Browse categories
        </h2>
        <CategoryShortcuts />
      </section>
    </div>
  );
}
