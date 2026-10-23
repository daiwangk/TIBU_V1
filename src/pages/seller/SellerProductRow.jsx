import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder';
import Switch from '../../components/ui/Switch';
import { shouldToast, userMessage } from '../../lib/errors';
import { formatPrice } from '../../lib/format';
import { useSaveProduct, useSetAvailableToday } from '../../queries/seller';
import { productWithActive } from './product/productModel';
import { SWITCH_ROW } from './switchRow';

/**
 * One product on /seller/products: cover photo, name, price, Edit, and the Available today and Active
 * switches (an inactive product stays in this list but disappears for customers).
 *
 * @param {{ product: import('../../services/contract.js').MyProduct, business: import('../../services/contract.js').MyBusiness }} props
 */
export default function SellerProductRow({ product, business }) {
  const setAvailable = useSetAvailableToday();
  const saveProduct = useSaveProduct();
  const cover = product.images[0]?.url;
  const onError = (err) => {
    if (!shouldToast(err)) toast.error(userMessage(err));
  };
  // Show the new value straight away while the save and refresh are in flight.
  const availableToday = setAvailable.isPending ? setAvailable.variables.value : product.availableToday;
  const isActive = saveProduct.isPending ? saveProduct.variables.isActive : product.isActive;
  // Both writes touch the same product row (Active saves every field), so never run them at once.
  const busy = setAvailable.isPending || saveProduct.isPending;

  return (
    <li className="flex flex-col rounded-card border border-border bg-surface">
      <div className="flex items-center gap-3 p-3">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-card">
          {cover ? <img src={cover} alt={product.name} className="h-full w-full object-cover" /> : <ImagePlaceholder aspect="1/1" className="h-full" />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate font-body text-sm font-semibold text-ink">{product.name}</p>
          <p className="font-body text-sm text-body">{formatPrice(product.price)}</p>
          {!cover && <p className="font-body text-xs text-error">Needs a photo</p>}
        </div>
        <Button to={`/seller/products/${product.id}`} variant="secondary" aria-label={`Edit ${product.name}`}>
          Edit
        </Button>
      </div>
      <div className="flex flex-col border-t border-border px-4 py-1">
        <Switch
          id={`today-${product.id}`}
          className={SWITCH_ROW}
          label="Available today"
          checked={availableToday}
          disabled={busy}
          onChange={(value) => setAvailable.mutate({ kind: 'product', id: product.id, value }, { onError })}
        />
        <Switch
          id={`active-${product.id}`}
          className={SWITCH_ROW}
          label="Shown to customers"
          checked={isActive}
          disabled={busy}
          onChange={(value) => saveProduct.mutate(productWithActive(product, business, value), { onError })}
        />
      </div>
    </li>
  );
}
