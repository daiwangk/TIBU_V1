import Switch from '../../../components/ui/Switch';
import DeliveryTimeField from '../onboarding/DeliveryTimeField';
import { SWITCH_ROW } from '../switchRow';

const radioClass = 'flex min-h-11 cursor-pointer items-center gap-3 font-body text-sm text-ink';

/**
 * "Delivery for this product": the same as the shop (the default) or its own delivery / pick-up and
 * usual time. Presentational: `onChange(name, value)` writes into the form.
 *
 * @param {{
 *   id: string,
 *   mode: 'same' | 'custom',
 *   deliveryAvailable: boolean,
 *   pickupAvailable: boolean,
 *   deliveryTime: string,
 *   onChange: (name: 'deliveryMode' | 'deliveryAvailable' | 'pickupAvailable' | 'deliveryTime', value: unknown) => void,
 * }} props
 */
export default function ProductDeliveryField({ id, mode, deliveryAvailable, pickupAvailable, deliveryTime, onChange }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="font-body text-sm font-semibold text-ink">Delivery for this product</legend>
      <label className={radioClass}>
        <input type="radio" name={`${id}-mode`} className="h-5 w-5 accent-primary" checked={mode === 'same'} onChange={() => onChange('deliveryMode', 'same')} />
        Same as my shop
      </label>
      <label className={radioClass}>
        <input type="radio" name={`${id}-mode`} className="h-5 w-5 accent-primary" checked={mode === 'custom'} onChange={() => onChange('deliveryMode', 'custom')} />
        Different for this product
      </label>

      {mode === 'custom' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col rounded-card border border-border bg-surface px-4 py-1">
            <Switch
              id={`${id}-delivery`}
              className={SWITCH_ROW}
              label="Delivery"
              checked={deliveryAvailable}
              onChange={(checked) => onChange('deliveryAvailable', checked)}
            />
            <Switch
              id={`${id}-pickup`}
              className={SWITCH_ROW}
              label="Pick-up"
              checked={pickupAvailable}
              onChange={(checked) => onChange('pickupAvailable', checked)}
            />
          </div>
          {deliveryAvailable && (
            <div className="flex flex-col gap-1">
              <DeliveryTimeField id={`${id}-time`} value={deliveryTime} onChange={(next) => onChange('deliveryTime', next)} />
              <p className="font-body text-xs text-muted">Leave the time blank to use your shop&apos;s usual time.</p>
            </div>
          )}
        </div>
      )}
    </fieldset>
  );
}
