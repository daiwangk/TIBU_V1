import { useId, useState } from 'react';
import Select from '../../components/ui/Select';
import { getBrowserLocation, MUMBAI_AREAS } from '../../lib/geo';
import { userMessage } from '../../lib/errors';
import { CURRENT_LOCATION, CURRENT_LOCATION_LABEL, roundCoord } from './profileForm';

const SAVED = '__saved';

/**
 * Home area: one of MUMBAI_AREAS, or "Use current location" (asks the browser, only on this choice).
 *
 * @param {{
 *   value: { locality: string, lat: number|null, lng: number|null },
 *   onChange: (next: { locality: string, lat: number|null, lng: number|null }) => void,
 * }} props
 */
export default function HomeAreaField({ value, onChange }) {
  const id = useId();
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const isArea = MUMBAI_AREAS.some((a) => a.name === value.locality);
  const selected = value.locality === '' ? '' : isArea ? value.locality : SAVED;

  async function handleChange(e) {
    const choice = e.target.value;
    setGpsError(null);
    if (choice === '') {
      onChange({ locality: '', lat: null, lng: null });
    } else if (choice === CURRENT_LOCATION) {
      setLocating(true);
      try {
        const { lat, lng } = await getBrowserLocation();
        onChange({ locality: CURRENT_LOCATION_LABEL, lat: roundCoord(lat), lng: roundCoord(lng) });
      } catch (err) {
        setGpsError(err?.message && err.code === 'validation' ? err.message : userMessage(err));
      } finally {
        setLocating(false);
      }
    } else {
      const area = MUMBAI_AREAS.find((a) => a.name === choice);
      if (area) onChange({ locality: area.name, lat: area.lat, lng: area.lng });
    }
  }

  return (
    <Select
      id={id}
      label="Home area"
      hint={locating ? 'Finding your location…' : 'Used to show businesses near you.'}
      error={gpsError ?? undefined}
      value={locating ? CURRENT_LOCATION : selected}
      onChange={handleChange}
      disabled={locating}
      className="[&_select]:text-base"
    >
      <option value="">Not set</option>
      {selected === SAVED && <option value={SAVED}>{value.locality}</option>}
      {MUMBAI_AREAS.map((a) => (
        <option key={a.name} value={a.name}>{a.name}</option>
      ))}
      <option value={CURRENT_LOCATION}>Use current location</option>
    </Select>
  );
}
