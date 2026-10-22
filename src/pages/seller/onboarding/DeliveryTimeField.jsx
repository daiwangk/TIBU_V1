import { useState } from 'react';
import Chip from '../../../components/ui/Chip';
import Input from '../../../components/ui/Input';
import { DELIVERY_TIME_PRESETS } from './onboardingSchemas';

/**
 * "Usual delivery time": preset chips plus "Other" with a free-text input (max 40). Empty = not stated.
 *
 * @param {{ id: string, value: string, onChange: (next: string) => void }} props
 */
export default function DeliveryTimeField({ id, value, onChange }) {
  const [other, setOther] = useState(() => value !== '' && !DELIVERY_TIME_PRESETS.includes(value));
  const labelId = `${id}-label`;

  function togglePreset(preset) {
    setOther(false);
    onChange(value === preset ? '' : preset);
  }

  function toggleOther() {
    if (other) {
      setOther(false);
      onChange('');
    } else {
      setOther(true);
      if (DELIVERY_TIME_PRESETS.includes(value)) onChange('');
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p id={labelId} className="font-body text-sm font-semibold text-ink">Usual delivery time</p>
      <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
        {DELIVERY_TIME_PRESETS.map((preset) => (
          <Chip key={preset} active={!other && value === preset} onToggle={() => togglePreset(preset)}>
            {preset}
          </Chip>
        ))}
        <Chip active={other} onToggle={toggleOther}>Other</Chip>
      </div>
      {other && (
        <Input
          id={`${id}-other`}
          label="Other delivery time"
          placeholder="e.g. 4 days"
          maxLength={40}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
