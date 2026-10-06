import { useState } from 'react';
import { Check, LocateFixed } from 'lucide-react';
import Sheet from './ui/Sheet';
import Button from './ui/Button';
import Input from './ui/Input';
import { useLocationStore } from '../stores/location';
import { filterAreas, MUMBAI_AREAS } from '../lib/geo';
import { userMessage } from '../lib/errors';

/**
 * Sheet body — mounted only while open, so the search text and any error reset on every open.
 * @param {{ onClose: () => void, notice?: string }} props
 */
function AreaPickerContent({ onClose, notice = '' }) {
  const label = useLocationStore((s) => s.label);
  const hasLocation = useLocationStore((s) => s.lat != null);
  const requestGps = useLocationStore((s) => s.requestGps);
  const setArea = useLocationStore((s) => s.setArea);
  const clear = useLocationStore((s) => s.clear);

  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(notice);

  const areas = filterAreas(MUMBAI_AREAS, query);

  async function handleGps() {
    setError('');
    setLocating(true);
    try {
      await requestGps();
      onClose();
    } catch (e) {
      setError(userMessage(e));
    } finally {
      setLocating(false);
    }
  }

  function handleArea(name) {
    setArea(name);
    onClose();
  }

  function handleClear() {
    clear();
    onClose();
  }

  return (
    <div className="flex flex-col gap-4 px-screen pb-6 pt-2">
      <h2 className="font-heading text-lg font-bold text-ink">Choose your location</h2>

      <div className="flex flex-col gap-2">
        <Button variant="secondary" loading={locating} onClick={handleGps} className="w-full">
          {!locating && <LocateFixed size={18} strokeWidth={1.75} aria-hidden="true" />}
          Use my current location
        </Button>
        {error && (
          <p role="alert" className="font-body text-sm text-ink">
            {/[.!?]$/.test(error) ? error : `${error}.`} You can pick your area below instead.
          </p>
        )}
      </div>

      <Input
        id="area-search"
        type="search"
        label="Or choose an area"
        placeholder="Search areas"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {areas.length === 0 ? (
        <p className="font-body text-sm text-muted">No areas match “{query.trim()}”.</p>
      ) : (
        <ul className="flex flex-col">
          {areas.map((area) => {
            const selected = area.name === label;
            return (
              <li key={area.name}>
                <button
                  type="button"
                  onClick={() => handleArea(area.name)}
                  aria-current={selected ? 'true' : undefined}
                  className="flex min-h-11 w-full items-center justify-between gap-2 rounded-btn px-2 text-left font-body text-sm text-ink hover:bg-lavender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className={selected ? 'font-semibold' : ''}>{area.name}</span>
                  {selected && <Check size={18} strokeWidth={2} aria-hidden="true" className="text-primary" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {hasLocation && (
        <Button variant="ghost" onClick={handleClear} className="w-full">
          Clear location
        </Button>
      )}
    </div>
  );
}

/**
 * Location picker: "Use my current location" + a filterable list of Mumbai areas + "Clear location".
 * Failures from GPS stay inline so the area list keeps working.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   notice?: string,
 * }} props `notice` pre-fills the inline message (e.g. after a GPS failure elsewhere).
 */
export default function AreaPickerSheet({ open, onClose, notice }) {
  return (
    <Sheet open={open} onClose={onClose} label="Choose your location">
      {open && <AreaPickerContent onClose={onClose} notice={notice} />}
    </Sheet>
  );
}
