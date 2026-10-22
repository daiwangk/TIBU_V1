import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import ImagePlaceholder from '../../../components/ui/ImagePlaceholder';
import { formatPrice } from '../../../lib/format';

/**
 * One product in the seller's list: cover photo, name, price in ₹, status badges and an Edit button.
 *
 * @param {{ product: import('../../../services/contract.js').MyProduct, onEdit: () => void }} props
 */
export default function ProductRow({ product, onEdit }) {
  const cover = product.images[0]?.url;
  return (
    <li className="flex items-center gap-3 rounded-card border border-border bg-surface p-3">
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-card">
        {cover ? (
          <img src={cover} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <ImagePlaceholder aspect="1/1" className="h-full" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate font-body text-sm font-semibold text-ink">{product.name}</p>
        <p className="font-body text-sm text-body">{formatPrice(product.price)}</p>
        <div className="flex flex-wrap gap-1">
          {!cover && <Badge tone="warning">Needs a photo</Badge>}
          {!product.isActive && <Badge>Hidden</Badge>}
        </div>
      </div>
      <Button type="button" variant="secondary" onClick={onEdit} aria-label={`Edit ${product.name}`}>
        Edit
      </Button>
    </li>
  );
}
