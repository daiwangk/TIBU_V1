import { useId, useState } from 'react';
import { MapPin } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { userMessage } from '../../../lib/errors';
import { getBrowserLocation, MUMBAI_AREAS, nearestArea, roundCoord } from '../../../lib/geo';

const SAVED = '__saved';
/** A location further than this from every listed area is not in Mumbai, so the seller picks an area. */
const MAX_AREA_METERS = 30_000;

/**
 * The shop's area: "Use my current location" (asks the browser only on tap) or one of MUMBAI_AREAS.
 * Coordinates are rounded to 3 decimals (D38); a GPS fix is named after the nearest listed area.
 *
 * @param {{
 *   value: { locality: string, lat: number|null, lng: number|null },
 *   onChange: (next: { locality: string, lat: number|null, lng: number|null }) => void,
 *   error?: string,
 * }} props
 */
export default function LocationField({ value, onChange, error }) {
  const id = useId();
  const [locating, setLocating] = useState(false);
  const [usedGps, setUsedGps] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const isArea = MUMBAI_AREAS.some((a) => a.name === value.locality);
  const selected = value.locality === '' ? '' : isArea ? value.locality : SAVED;

  async function useCurrentLocation() {
    setLocating(true);
    setGpsError(null);
    try {
      const point = await getBrowserLocation();
      const area = nearestArea(point, MUMBAI_AREAS, MAX_AREA_METERS);
      if (!area) {
        setGpsError("We couldn't match your location to a Mumbai area. Pick your area below.");
        return;
      }
      onChange({ locality: area.name, lat: roundCoord(point.lat), lng: roundCoord(point.lng) });
      setUsedGps(true);
    } catch (err) {
      setGpsError(err?.code === 'validation' && err.message ? err.message : userMessage(err));
    } finally {
      setLocating(false);
    }
  }

  function handleArea(e) {
    const area = MUMBAI_AREAS.find((a) => a.name === e.target.value);
    setGpsError(null);
    setUsedGps(false);
    if (area) onChange({ locality: area.name, lat: area.lat, lng: area.lng });
  }

  return (
    <div className="flex flex-col gap-3">
      <Button type="button" variant="secondary" size="lg" className="w-full" loading={locating} onClick={useCurrentLocation}>
        <MapPin size={18} aria-hidden="true" />
        Use my current location
      </Button>
      {usedGps && !gpsError && (
        <p role="status" className="font-body text-sm text-body">Using your current location, near {value.locality}.</p>
      )}
      <Select
        id={id}
        label="Or pick your area"
        value={selected}
        onChange={handleArea}
        disabled={locating}
        error={gpsError ?? error}
      >
        <option value="">Choose an area</option>
        {selected === SAVED && <option value={SAVED}>{value.locality}</option>}
        {MUMBAI_AREAS.map((a) => (
          <option key={a.name} value={a.name}>{a.name}</option>
        ))}
      </Select>
    </div>
  );
}
