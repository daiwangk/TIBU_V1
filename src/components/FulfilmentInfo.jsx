import { Clock, Store, Truck } from 'lucide-react';
import Badge from './ui/Badge';

/**
 * How a product or business can reach the customer (SOW Rev2).
 * Shows only what is available; says so plainly when nothing is stated.
 *
 * @param {{
 *   deliveryAvailable: boolean,
 *   pickupAvailable: boolean,
 *   deliveryTime?: string|null,
 *   className?: string,
 * }} props
 */
export default function FulfilmentInfo({
  deliveryAvailable,
  pickupAvailable,
  deliveryTime = null,
  className = '',
}) {
  if (!deliveryAvailable && !pickupAvailable) {
    return (
      <p className={`font-body text-sm text-muted ${className}`}>Ask the seller about delivery</p>
    );
  }

  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`} aria-label="Delivery and pick-up">
      {deliveryAvailable && (
        <li>
          <Badge tone="success" className="gap-1 px-2.5 py-1">
            <Truck size={12} aria-hidden="true" />
            Delivery
          </Badge>
        </li>
      )}
      {pickupAvailable && (
        <li>
          <Badge tone="neutral" className="gap-1 px-2.5 py-1">
            <Store size={12} aria-hidden="true" />
            Pick-up
          </Badge>
        </li>
      )}
      {deliveryAvailable && deliveryTime && (
        <li>
          <Badge tone="warning" className="gap-1 px-2.5 py-1">
            <Clock size={12} aria-hidden="true" />
            Delivers in {deliveryTime}
          </Badge>
        </li>
      )}
    </ul>
  );
}
